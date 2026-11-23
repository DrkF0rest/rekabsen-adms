"""Database schema, migration, selection, and status services."""
import json
import sqlite3
import sys

import mysql.connector

from backend.core import config, database

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("rekabsen")

def init_db(backend=None, mysql_config=None, sqlite_file=None):
    backend = backend or config.DB_BACKEND
    if backend == "sqlite":
        sqlite_file = sqlite_file or config.DB_FILE
    with database.get_db(backend, mysql_config, sqlite_file) as c:
        if backend == "mysql":
            c.execute(
                """
                CREATE TABLE IF NOT EXISTS devices (
                    sn VARCHAR(191) PRIMARY KEY,
                    ip VARCHAR(45),
                    last_seen VARCHAR(19),
                    name VARCHAR(255)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            c.execute(
                """
                CREATE TABLE IF NOT EXISTS attlog (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    sn VARCHAR(191), pin VARCHAR(191), ts VARCHAR(32),
                    status VARCHAR(32), verify VARCHAR(32), workcode VARCHAR(191),
                    received_at VARCHAR(19),
                    UNIQUE KEY unique_attlog (sn, pin, ts),
                    KEY idx_attlog_daily_duplicate (pin, status, ts)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            c.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    sn VARCHAR(191), pin VARCHAR(191), name VARCHAR(255),
                    card VARCHAR(191), privilege VARCHAR(32),
                    PRIMARY KEY (sn, pin)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            c.execute(
                """
                CREATE TABLE IF NOT EXISTS app_auth (
                    id TINYINT PRIMARY KEY,
                    salt VARBINARY(16) NOT NULL,
                    password_hash VARBINARY(32) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
                """
            )
            attlog_indexes = {row["Key_name"] for row in c.execute("SHOW INDEX FROM attlog")}
            if "idx_attlog_daily_duplicate" not in attlog_indexes:
                c.execute(
                    "CREATE INDEX idx_attlog_daily_duplicate ON attlog (pin, status, ts)"
                )
            device_columns = {row["Field"] for row in c.execute("SHOW COLUMNS FROM devices")}
            if "name" not in device_columns:
                c.execute("ALTER TABLE devices ADD COLUMN name VARCHAR(255)")
            return

        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS devices (
                sn TEXT PRIMARY KEY,
                ip TEXT,
                last_seen TEXT,
                name TEXT
            );
            CREATE TABLE IF NOT EXISTS attlog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sn TEXT, pin TEXT, ts TEXT,
                status TEXT, verify TEXT, workcode TEXT,
                received_at TEXT,
                UNIQUE (sn, pin, ts)
            );
            CREATE INDEX IF NOT EXISTS idx_attlog_daily_duplicate
                ON attlog (pin, status, ts);
            CREATE TABLE IF NOT EXISTS users (
                sn TEXT, pin TEXT, name TEXT, card TEXT, privilege TEXT,
                PRIMARY KEY (sn, pin)
            );
            CREATE TABLE IF NOT EXISTS app_auth (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                salt BLOB NOT NULL,
                password_hash BLOB NOT NULL
            );
            """
        )
        device_columns = {row["name"] for row in c.execute("PRAGMA table_info(devices)")}
        if "name" not in device_columns:
            c.execute("ALTER TABLE devices ADD COLUMN name TEXT")

def save_db_settings(backend, mysql_config, sqlite_name):
    temporary_path = config.DB_CONFIG_FILE.with_suffix(".tmp")
    temporary_path.write_text(
        json.dumps({"backend": backend, "mysql": mysql_config, "sqlite_name": sqlite_name}),
        encoding="utf-8",
    )
    temporary_path.replace(config.DB_CONFIG_FILE)

def migrate_database(
    source_backend,
    target_backend,
    target_mysql_config=None,
    source_sqlite_file=None,
    target_sqlite_file=None,
):
    init_db(target_backend, target_mysql_config, sqlite_file=target_sqlite_file)
    with database.get_db(source_backend, sqlite_file=source_sqlite_file) as source, database.get_db(
        target_backend,
        target_mysql_config,
        sqlite_file=target_sqlite_file,
    ) as target:
        devices = source.execute("SELECT sn, ip, last_seen, name FROM devices").fetchall()
        users = source.execute(
            "SELECT sn, pin, name, card, privilege FROM users"
        ).fetchall()
        logs = source.execute(
            "SELECT sn, pin, ts, status, verify, workcode, received_at FROM attlog ORDER BY id"
        ).fetchall()
        auth = source.execute(
            "SELECT id, salt, password_hash FROM app_auth WHERE id=1"
        ).fetchone()

        if target_backend == "mysql":
            device_sql = (
                "INSERT INTO devices (sn, ip, last_seen, name) VALUES (?,?,?,?) "
                "ON DUPLICATE KEY UPDATE ip=VALUES(ip), last_seen=VALUES(last_seen), name=VALUES(name)"
            )
            user_sql = (
                "INSERT INTO users (sn, pin, name, card, privilege) VALUES (?,?,?,?,?) "
                "ON DUPLICATE KEY UPDATE name=VALUES(name), card=VALUES(card), privilege=VALUES(privilege)"
            )
            log_sql = (
                "INSERT IGNORE INTO attlog "
                "(sn, pin, ts, status, verify, workcode, received_at) VALUES (?,?,?,?,?,?,?)"
            )
            auth_sql = (
                "INSERT INTO app_auth (id, salt, password_hash) VALUES (?,?,?) "
                "ON DUPLICATE KEY UPDATE salt=VALUES(salt), password_hash=VALUES(password_hash)"
            )
        else:
            device_sql = "INSERT OR REPLACE INTO devices (sn, ip, last_seen, name) VALUES (?,?,?,?)"
            user_sql = (
                "INSERT OR REPLACE INTO users (sn, pin, name, card, privilege) VALUES (?,?,?,?,?)"
            )
            log_sql = (
                "INSERT OR IGNORE INTO attlog "
                "(sn, pin, ts, status, verify, workcode, received_at) VALUES (?,?,?,?,?,?,?)"
            )
            auth_sql = "INSERT OR REPLACE INTO app_auth (id, salt, password_hash) VALUES (?,?,?)"

        target.executemany(device_sql, [tuple(row[key] for key in row.keys()) for row in devices])
        target.executemany(user_sql, [tuple(row[key] for key in row.keys()) for row in users])
        target.executemany(log_sql, [tuple(row[key] for key in row.keys()) for row in logs])
        if auth:
            target.execute(auth_sql, (auth["id"], auth["salt"], auth["password_hash"]))

def normalize_mysql_config(payload, require_password=False):
    if not isinstance(payload, dict):
        raise ValueError("MySQL configuration is required.")

    host = payload.get("host")
    user = payload.get("user")
    database = payload.get("database")
    if not all(isinstance(value, str) and value.strip() for value in (host, user, database)):
        raise ValueError("MySQL host, database name, and username are required.")
    if len(host.strip()) > 253 or len(user.strip()) > 64 or len(database.strip()) > 64:
        raise ValueError(
            "MySQL host must be at most 253 characters; database name and username must be at most 64 characters."
        )

    try:
        port = int(payload.get("port"))
    except (TypeError, ValueError) as exc:
        raise ValueError("MySQL port must be a number between 1 and 65535.") from exc
    if not 1 <= port <= 65535:
        raise ValueError("MySQL port must be a number between 1 and 65535.")

    password = payload.get("password", "")
    if not isinstance(password, str):
        raise ValueError("MySQL password must be text.")
    if payload.get("clear_password") is True:
        password = ""
    elif password == "":
        if require_password:
            raise ValueError("Enter a MySQL password or select Use an empty password.")
        password = config.MYSQL_CONFIG["password"]

    return {
        "host": host.strip(),
        "port": port,
        "user": user.strip(),
        "password": password,
        "database": database.strip(),
    }

def switch_database(backend, transfer, mysql_config, sqlite_name=None):

    if backend not in ("sqlite", "mysql"):
        raise ValueError("Database must be SQLite or MySQL.")
    if transfer not in ("empty", "migrate"):
        raise ValueError("Choose an empty database or migrate data.")
    mysql_config = normalize_mysql_config(mysql_config, require_password=backend == "mysql")
    if sqlite_name is None:
        sqlite_name = config.SQLITE_DB_NAME
    sqlite_name = config.normalize_sqlite_name(sqlite_name)
    source_sqlite_file = config.DB_FILE
    target_sqlite_file = config.APP_DIR / f"{sqlite_name}.db"
    with config.db_lock:
        source_backend = config.DB_BACKEND
        if backend == "sqlite" and source_backend == "sqlite":
            if target_sqlite_file != source_sqlite_file and transfer == "migrate":
                migrate_database(
                    source_backend,
                    backend,
                    mysql_config,
                    source_sqlite_file,
                    target_sqlite_file,
                )
            else:
                init_db(backend, mysql_config, sqlite_file=target_sqlite_file)
        elif backend == source_backend:
            source_database = (
                config.MYSQL_CONFIG["host"],
                config.MYSQL_CONFIG["port"],
                config.MYSQL_CONFIG["database"],
            )
            target_database = (
                mysql_config["host"],
                mysql_config["port"],
                mysql_config["database"],
            )
            if backend == "mysql" and source_database != target_database and transfer == "migrate":
                migrate_database(source_backend, backend, mysql_config)
            else:
                init_db(backend, mysql_config)
        elif transfer == "migrate":
            migrate_database(
                source_backend,
                backend,
                mysql_config,
                source_sqlite_file,
                target_sqlite_file,
            )
        else:
            init_db(backend, mysql_config, sqlite_file=target_sqlite_file)
        if transfer == "empty":
            with database.get_db(source_backend, config.MYSQL_CONFIG, source_sqlite_file) as source:
                auth = source.execute(
                    "SELECT id, salt, password_hash FROM app_auth WHERE id=1"
                ).fetchone()
            if auth:
                auth_sql = (
                    "INSERT INTO app_auth (id, salt, password_hash) VALUES (?,?,?) "
                    "ON DUPLICATE KEY UPDATE salt=VALUES(salt), password_hash=VALUES(password_hash)"
                    if backend == "mysql"
                    else "INSERT OR REPLACE INTO app_auth (id, salt, password_hash) VALUES (?,?,?)"
                )
                with database.get_db(backend, mysql_config, target_sqlite_file) as target:
                    target.execute(auth_sql, (auth["id"], auth["salt"], auth["password_hash"]))
        save_db_settings(backend, mysql_config, sqlite_name)
        config.DB_BACKEND = backend
        config.MYSQL_CONFIG = mysql_config
        config.SQLITE_DB_NAME = sqlite_name
        config.DB_FILE = target_sqlite_file
    database.notify()
    database.notify_database_status(backend, None)
    return backend

def public_db_settings():
    return {
        "backend": config.DB_BACKEND,
        "sqlite_name": config.SQLITE_DB_NAME,
        "mysql": {
            "host": config.MYSQL_CONFIG["host"],
            "port": config.MYSQL_CONFIG["port"],
            "user": config.MYSQL_CONFIG["user"],
            "database": config.MYSQL_CONFIG["database"],
            "password_set": bool(config.MYSQL_CONFIG["password"]),
        },
    }

def database_connection_status():
    with config.db_lock:
        backend = config.DB_BACKEND
        mysql_config = config.MYSQL_CONFIG.copy()
        sqlite_file = config.DB_FILE
    try:
        with database.get_db(backend, mysql_config, sqlite_file) as connection:
            connection.execute("SELECT 1").fetchone()
    except (mysql.connector.Error, sqlite3.Error) as exc:
        database.notify_database_status(backend, False)
        logger.error(f"  -> Could not connect to {backend} database: {exc}")
        return {"backend": backend, "connected": False}
    database.notify_database_status(backend, True)
    return {"backend": backend, "connected": True}
