"""HTTP API, device protocol, and frontend asset serving."""
import json
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from backend.core import config, database
from backend.features.auth.routes import AuthRoutes
from backend.features.attendance import constants
from backend.features.attendance.service import (
    build_attendance_xlsx, normalize_page, normalize_show_limit,
    query_dashboard_summary, query_logs, save_attlog,
)
from backend.features.database.service import (
    database_connection_status, public_db_settings, switch_database,
)
from backend.features.devices.service import now, save_operlog, touch_device
from backend.core.database import get_db

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("rekabsen")

class ADMSHandler(AuthRoutes, BaseHTTPRequestHandler):
    server_version = "ADMS/1.0"
    dashboard_dir = config.APP_DIR / "adms"
    dashboard_files = {
        "/": "index.html",
        "/adms": "index.html",
        "/adms/": "index.html",
        "/adms/index.html": "index.html",
        "/adms/shared/css/style.css": "shared/css/style.css",
        "/adms/shared/css/modern.css": "shared/css/modern.css",
        "/adms/shared/css/windows-95.css": "shared/css/windows-95.css",
        "/adms/shared/js/app.js": "shared/js/app.js",
        "/adms/shared/js/theme-init.js": "shared/js/theme-init.js",
        "/adms/features/auth/auth.js": "features/auth/auth.js",
        "/adms/features/auth/login.html": "features/auth/login.html",
        "/adms/style.css": "shared/css/style.css",
        "/adms/modern.css": "shared/css/modern.css",
        "/adms/app.js": "shared/js/app.js",
        "/adms/auth.js": "features/auth/auth.js",
        "/adms/theme-init.js": "shared/js/theme-init.js",
        "/adms/login.html": "features/auth/login.html",
    }

    def reply(self, text, code=200, ctype="text/plain", filename=None):
        if isinstance(text, bytes):
            data = text
            content_type = ctype
        else:
            data = text.encode("utf-8")
            content_type = f"{ctype}; charset=utf-8"
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Connection", "close")
        self.send_header("Cache-Control", "no-store")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(data)

    def read_body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(n).decode("utf-8", errors="replace") if n else ""

    def parse(self):
        u = urlparse(self.path)
        qs = {k: v[0] for k, v in parse_qs(u.query, keep_blank_values=True).items()}
        return u.path.rstrip("/") or "/", qs

    # -- GET
    def do_GET(self):
        path, qs = self.parse()
        sn = qs.get("SN", "")
        if sn and path.startswith("/iclock/"):
            touch_device(sn, self.client_address[0])

        if path == "/api/auth/status":
            self.reply_auth_json(
                {
                    "configured": self.auth_password_is_set(),
                    "authenticated": self.is_authenticated(),
                }
            )
            return
        if not path.startswith("/iclock/") and not self.is_authenticated():
            if path in {
                "/adms/shared/css/style.css",
                "/adms/shared/css/modern.css",
                "/adms/shared/css/windows-95.css",
                "/adms/shared/js/theme-init.js",
                "/adms/features/auth/auth.js",
                "/adms/style.css",
                "/adms/modern.css",
                "/adms/auth.js",
                "/adms/theme-init.js",
            }:
                self.serve_dashboard(path)
            elif path in self.dashboard_files:
                self.auth_page()
            else:
                self.reply_auth_json({"error": "Authentication is required."}, 401)
            return

        if path == "/iclock/cdata":
            # Device handshake and option settings
            self.reply(
                f"GET OPTION FROM: {sn}\n"
                "ErrorDelay=60\n"
                "Delay=30\n"
                "TransTimes=00:00;14:00\n"
                "TransInterval=1\n"
                "TransFlag=TransData AttLog\tOpLog\tAttPhoto\tEnrollUser\tChgUser\tEnrollFP\tChgFP\tUserPic\n"
                f"TimeZone={config.TIMEZONE}\n"
                "Realtime=1\n"
                "Encrypt=0\n"
            )
        elif path == "/iclock/getrequest":
            self.reply("OK")
        elif path == "/iclock/ping":
            self.reply("OK")
        elif path == "/api/logs":
            backend, sqlite_file = config.DB_BACKEND, config.DB_FILE
            with get_db(backend, sqlite_file=sqlite_file) as c:
                rows = c.execute("SELECT * FROM attlog ORDER BY ts DESC LIMIT 500").fetchall()
            self.reply(json.dumps([dict(r) for r in rows], indent=2), ctype="application/json")
        elif path == "/api/summary":
            summary = query_dashboard_summary(backend=config.DB_BACKEND, sqlite_file=config.DB_FILE)
            self.reply(json.dumps(summary), ctype="application/json")
        elif path == "/api/dashboard":
            backend, sqlite_file = config.DB_BACKEND, config.DB_FILE
            try:
                limit = normalize_show_limit(qs.get("limit"))
                page = normalize_page(qs.get("page"))
                rows, total = query_logs(
                    qs, limit=limit, backend=backend, sqlite_file=sqlite_file, page=page
                )
            except ValueError as exc:
                self.reply(json.dumps({"error": str(exc)}), 400, "application/json")
                return
            page_count = max(1, (total + limit - 1) // limit)
            page = min(page, page_count)
            with get_db(backend, sqlite_file=sqlite_file) as c:
                devices = c.execute("SELECT * FROM devices ORDER BY last_seen DESC").fetchall()
            payload = {
                "logs": [dict(row) for row in rows],
                "total": total,
                "page": page,
                "page_count": page_count,
                "devices": [dict(device) for device in devices],
            }
            self.reply(json.dumps(payload), ctype="application/json")
        elif path == "/api/database/status":
            self.reply(json.dumps(database_connection_status()), ctype="application/json")
        elif path == "/api/settings/database":
            self.reply(json.dumps(public_db_settings()), ctype="application/json")
        elif path == "/export.xlsx":
            theme = qs.get("theme", "lime")
            if theme not in constants.XLSX_THEME_COLORS:

                logger.error(f"  -> Unknown export theme: {theme}")
                self.reply(
                    json.dumps({"error": "Unknown export theme."}),
                    400,
                    "application/json",
                )
                return
            try:
                rows, _ = query_logs(
                    qs, sqlite_file=config.DB_FILE
                )  # Apply the dashboard's active filters and sort order.
            except ValueError as exc:
                logger.error(f"  -> Failed to export XLSX: {exc}")
                self.reply(json.dumps({"error": str(exc)}), 400, "application/json")
                return
            language = "id" if qs.get("lang") == "id" else "en"
            self.reply(
                build_attendance_xlsx(rows, language, theme),
                ctype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename="laporan-absensi.xlsx" if language == "id" else "attendance-report.xlsx",
            )
        elif path == "/events":
            self.stream_events()
        elif path in self.dashboard_files:
            self.serve_dashboard(path)
        else:
            self.reply("Not found", 404)

    # -- POST
    def do_POST(self):
        path, qs = self.parse()
        if path in (
            "/api/auth/setup",
            "/api/auth/login",
            "/api/auth/logout",
            "/api/auth/change-password",
        ):
            self.handle_auth_post(path)
            return
        if not path.startswith("/iclock/") and not self.is_authenticated():
            self.reply_auth_json({"error": "Authentication is required."}, 401)
            return

        sn = qs.get("SN", "")
        body = self.read_body()
        if sn and path.startswith("/iclock/"):
            touch_device(sn, self.client_address[0])

        if path == "/iclock/cdata":
            table = qs.get("table", "").upper()
            if table == "ATTLOG":
                n = save_attlog(sn, body)
                logger.info(f"  -> Received {n} attendance record(s) from {sn}")
                if n:
                    database.notify()
                self.reply(f"OK:{n}")
            elif table == "OPERLOG":
                n = save_operlog(sn, body)
                logger.info(f"  -> Received {n} user record(s) from {sn}")
                if n:
                    database.notify()
                self.reply(f"OK:{max(n, len(body.splitlines()))}")
            else:
                self.reply("OK")
        elif path == "/iclock/registry":
            self.reply("RegistryCode=ADMS0001")
        elif path == "/api/clear":
            with config.db_lock, get_db() as c:
                deleted = c.execute("DELETE FROM attlog").rowcount
                if config.DB_BACKEND == "sqlite":
                    c.execute("DELETE FROM sqlite_sequence WHERE name='attlog'")
                else:
                    c.execute("ALTER TABLE attlog AUTO_INCREMENT = 1")
            logger.info(f"  -> Cleared {deleted} attendance record(s) from the dashboard")
            database.notify()
            self.reply(json.dumps({"deleted": deleted}), ctype="application/json")
        elif path == "/api/devices/name":
            try:
                payload = json.loads(body)
            except json.JSONDecodeError:
                self.reply(
                    json.dumps({"error": "Request body must be valid JSON."}),
                    400,
                    "application/json",
                )
                return
            if (
                not isinstance(payload, dict)
                or not isinstance(payload.get("sn"), str)
                or not isinstance(payload.get("name"), str)
            ):
                self.reply(
                    json.dumps({"error": "The serial number and device name must be text."}),
                    400,
                    "application/json",
                )
                return

            device_sn = payload["sn"].strip()
            device_name = payload["name"].strip()
            if not device_sn or len(device_name) > 80:
                self.reply(
                    json.dumps(
                        {
                            "error": (
                                "Serial number is required and the device name must not "
                                "exceed 80 characters."
                            )
                        }
                    ),
                    400,
                    "application/json",
                )
                return

            with config.db_lock, get_db() as c:
                updated = c.execute(
                    "UPDATE devices SET name=? WHERE sn=?",
                    (device_name or None, device_sn),
                ).rowcount
            if not updated:
                self.reply(
                    json.dumps({"error": "Device not found."}), 404, "application/json"
                )
                return

            database.notify()
            self.reply(
                json.dumps({"sn": device_sn, "name": device_name or device_sn}),
                ctype="application/json",
            )
        elif path == "/api/settings/database":
            try:
                payload = json.loads(body)
                if not isinstance(payload, dict):
                    raise ValueError("Request body must be a JSON object.")
                backend = payload.get("backend")
                transfer = payload.get("transfer")
                switch_database(
                    backend,
                    transfer,
                    payload.get("mysql"),
                    payload.get("sqlite_name"),
                )
            except (json.JSONDecodeError, ValueError, RuntimeError) as exc:
                self.reply(json.dumps({"error": str(exc)}), 400, "application/json")
                return
            except Exception as exc:
                logger.error(f"  -> Failed to switch database: {exc}")
                self.reply(
                    json.dumps({"error": f"Failed to switch database: {exc}"}),
                    500,
                    "application/json",
                )
                return
            self.reply(json.dumps(public_db_settings()), ctype="application/json")
        elif path == "/api/users/name":
            self.reply("Not found", 404)
        else:
            self.reply("OK")

    # -- real-time stream (SSE)
    def stream_events(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        with config.events:
            last = config.event_version
            last_database = config.database_event_version
        try:
            self.wfile.write(b"retry: 3000\n\n")
            self.wfile.flush()
            while True:
                with config.events:
                    config.events.wait_for(
                        lambda: config.event_version != last or config.database_event_version != last_database,
                        timeout=15,
                    )
                    changed = config.event_version != last
                    database_changed = config.database_event_version != last_database
                    last = config.event_version
                    last_database = config.database_event_version
                    database_status = config.database_health_state.copy() if database_changed else None
                if not self.is_authenticated():
                    self.wfile.write(b"event: auth\ndata: expired\n\n")
                    self.wfile.flush()
                    return
                # Send a ping to keep the connection alive when there are no updates.
                if changed:
                    self.wfile.write(b"event: attlog\ndata: update\n\n")
                if database_changed:
                    payload = json.dumps(database_status).encode("utf-8")
                    self.wfile.write(b"event: database\ndata: " + payload + b"\n\n")
                if not changed and not database_changed:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def serve_dashboard(self, path):
        filename = self.dashboard_files[path]
        try:
            data = (self.dashboard_dir / filename).read_bytes()
        except FileNotFoundError:
            logger.error(f"  -> Dashboard file not found: {filename}")
            self.reply("Dashboard file not found", 404)
            return
        if filename == "index.html":
            for view_name, view_filename in (
                ("dashboard_view", "features/dashboard/view.html"),
                ("settings_view", "features/settings/view.html"),
                ("guide_view", "features/guide/view.html"),
            ):
                try:
                    view = (self.dashboard_dir / view_filename).read_bytes()
                except FileNotFoundError:
                    self.reply("Dashboard file not found", 404)
                    return
                data = data.replace(f"{{{{{view_name}}}}}".encode("ascii"), view)
            current_year = str(datetime.now().year).encode("ascii")
            data = data.replace(b"{{copyright_year}}", current_year)
        content_type = "text/css" if filename.endswith(".css") else (
            "application/javascript" if filename.endswith(".js") else "text/html"
        )
        self.reply(data.decode("utf-8"), ctype=content_type)
