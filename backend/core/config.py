"""Application configuration and shared runtime state."""
import json
import os
import re
import threading
from pathlib import Path

HOST = "0.0.0.0"
PORT = 8080
APP_DIR = Path(__file__).resolve().parents[2]
DB_CONFIG_FILE = APP_DIR / "adms_config.json"
TIMEZONE = 7  # WIB
SHOW_LIMIT = 100
SHOW_LIMIT_OPTIONS = (10, 50, 100, 150, 500)

# Connection settings
MYSQL_CONNECT_ATTEMPTS = 3
MYSQL_RECONNECT_DELAY = 1
RETRYABLE_MYSQL_ERRORS = {2002, 2003, 2006, 2013, 2055}

def normalize_sqlite_name(name):
    if not isinstance(name, str):
        raise ValueError("SQLite filename must be text.")
    name = name.strip()
    if name.lower().endswith(".db"):
        name = name[:-3]
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}", name):
        raise ValueError("SQLite names may contain only letters, numbers, underscores, and hyphens.")
    return name

def load_db_settings():
    mysql_config = {
        "host": os.environ.get("ADMS_MYSQL_HOST", "127.0.0.1"),
        "port": int(os.environ.get("ADMS_MYSQL_PORT", "3306")),
        "user": os.environ.get("ADMS_MYSQL_USER", "root"),
        "password": os.environ.get("ADMS_MYSQL_PASSWORD", ""),
        "database": os.environ.get("ADMS_MYSQL_DATABASE", "rekabsen"),
    }
    sqlite_name = "rekabsen"
    if not DB_CONFIG_FILE.exists():
        return "sqlite", mysql_config, sqlite_name
    config = json.loads(DB_CONFIG_FILE.read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise ValueError("Database configuration must be a JSON object.")
    backend = config.get("backend", "sqlite")
    if backend not in ("sqlite", "mysql"):
        raise ValueError(f"Unknown database backend: {backend}")
    saved_mysql_config = config.get("mysql", {})
    if not isinstance(saved_mysql_config, dict):
        raise ValueError("MySQL configuration is invalid.")
    mysql_config.update(saved_mysql_config)
    sqlite_name = normalize_sqlite_name(config.get("sqlite_name", sqlite_name))
    return backend, mysql_config, sqlite_name

DB_BACKEND, MYSQL_CONFIG, SQLITE_DB_NAME = load_db_settings()
DB_FILE = APP_DIR / f"{SQLITE_DB_NAME}.db"

db_lock = threading.Lock()
events = threading.Condition()
event_version = 0
database_event_version = 0
database_health_state = {"backend": DB_BACKEND, "connected": None}
