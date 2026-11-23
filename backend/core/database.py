"""Database connection adapters and shared event notifications."""
import sqlite3
import time

import mysql.connector

from backend.core import config

def notify():
    """Notify dashboard clients when attendance data changes."""
    with config.events:
        config.event_version += 1
        config.events.notify_all()

def notify_database_status(backend, connected):
    with config.events:
        if backend != config.DB_BACKEND or (
            config.database_health_state["backend"] == backend
            and config.database_health_state["connected"] == connected
        ):
            return
        config.database_health_state["backend"] = backend
        config.database_health_state["connected"] = connected
        config.database_event_version += 1
        config.events.notify_all()

class MySQLConnection:
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, args=()):
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(sql.replace("?", "%s"), args)
        except mysql.connector.Error as exc:
            if exc.errno in config.RETRYABLE_MYSQL_ERRORS:
                notify_database_status("mysql", False)
            raise
        return cursor

    def executescript(self, sql):
        for statement in sql.split(";"):
            if statement.strip():
                self.execute(statement)

    def executemany(self, sql, rows):
        try:
            cursor = self.connection.cursor()
            cursor.executemany(sql.replace("?", "%s"), rows)
        except mysql.connector.Error as exc:
            if exc.errno in config.RETRYABLE_MYSQL_ERRORS:
                notify_database_status("mysql", False)
            raise
        return cursor

    def __enter__(self):
        return self

    def __exit__(self, exc_type, *_):
        try:
            if exc_type is None:
                self.connection.commit()
            else:
                self.connection.rollback()
        except mysql.connector.Error as exc:
            if exc.errno in config.RETRYABLE_MYSQL_ERRORS:
                notify_database_status("mysql", False)
            raise
        finally:
            self.connection.close()

class SQLiteConnection:
    def __init__(self, connection):
        self.connection = connection

    def __getattr__(self, name):
        return getattr(self.connection, name)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, *_):
        try:
            if exc_type is None:
                self.connection.commit()
            else:
                self.connection.rollback()
        finally:
            self.connection.close()

def get_db(backend=None, mysql_config=None, sqlite_file=None):
    backend = backend or config.DB_BACKEND
    if backend == "sqlite":
        try:
            conn = sqlite3.connect(sqlite_file or config.DB_FILE, timeout=10)
        except sqlite3.Error:
            notify_database_status("sqlite", False)
            raise
        conn.row_factory = sqlite3.Row
        notify_database_status("sqlite", True)
        return SQLiteConnection(conn)

    mysql_settings = mysql_config or config.MYSQL_CONFIG
    for attempt in range(config.MYSQL_CONNECT_ATTEMPTS):
        try:
            connection = mysql.connector.connect(
                host=mysql_settings["host"],
                port=mysql_settings["port"],
                user=mysql_settings["user"],
                password=mysql_settings["password"],
                database=mysql_settings["database"],
                connection_timeout=5,
            )
            notify_database_status("mysql", True)
            return MySQLConnection(connection)
        except mysql.connector.Error as exc:
            notify_database_status("mysql", False)
            if exc.errno not in config.RETRYABLE_MYSQL_ERRORS or attempt == config.MYSQL_CONNECT_ATTEMPTS - 1:
                raise
            print(
                f"  -> MySQL connection lost; retrying "
                f"({attempt + 1}/{config.MYSQL_CONNECT_ATTEMPTS - 1})..."
            )
            time.sleep(config.MYSQL_RECONNECT_DELAY)
