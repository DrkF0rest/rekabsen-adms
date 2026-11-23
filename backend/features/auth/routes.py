"""Authentication route mixin for the HTTP application."""
import hashlib
import hmac
import json
import secrets
import time
from http.cookies import SimpleCookie

from backend.core import config, database
from backend.features.auth import state as auth_state

class AuthRoutes:
        def session_token(self):
            cookie = SimpleCookie()
            try:
                cookie.load(self.headers.get("Cookie", ""))
            except Exception:
                return None
            morsel = cookie.get("adms_session")
            return morsel.value if morsel else None

        def is_authenticated(self):
            token = self.session_token()
            if not token:
                return False
            with auth_state.auth_sessions_lock:
                expires_at = auth_state.AUTH_SESSIONS.get(token)
                if expires_at is None:
                    return False
                if expires_at <= time.time():
                    del auth_state.AUTH_SESSIONS[token]
                    return False
                return True

        def auth_password_is_set(self):
            with database.get_db() as connection:
                return connection.execute("SELECT 1 FROM app_auth WHERE id=1").fetchone() is not None

        def auth_page(self):
            self.serve_dashboard("/adms/login.html")

        def auth_failure_allowed(self):
            now_ts = time.time()
            client = self.client_address[0]
            with auth_state.auth_failures_lock:
                attempts, started = auth_state.AUTH_FAILURES.get(client, (0, now_ts))
                if now_ts - started >= 300:
                    auth_state.AUTH_FAILURES[client] = (0, now_ts)
                    return True
                return attempts < 5

        def record_auth_failure(self):
            now_ts = time.time()
            client = self.client_address[0]
            with auth_state.auth_failures_lock:
                attempts, started = auth_state.AUTH_FAILURES.get(client, (0, now_ts))
                if now_ts - started >= 300:
                    attempts, started = 0, now_ts
                auth_state.AUTH_FAILURES[client] = (attempts + 1, started)

        def clear_auth_failures(self):
            with auth_state.auth_failures_lock:
                auth_state.AUTH_FAILURES.pop(self.client_address[0], None)

        def create_session(self):
            token = secrets.token_urlsafe(32)
            with auth_state.auth_sessions_lock:
                auth_state.AUTH_SESSIONS[token] = time.time() + auth_state.SESSION_TTL
            return token

        def reply_auth_json(self, payload, code=200, session_token=None, clear_session=False):
            data = json.dumps(payload).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Connection", "close")
            self.send_header("Cache-Control", "no-store")
            if session_token:
                self.send_header(
                    "Set-Cookie",
                    f"adms_session={session_token}; Max-Age={auth_state.SESSION_TTL}; Path=/; HttpOnly; SameSite=Strict",
                )
            elif clear_session:
                self.send_header(
                    "Set-Cookie",
                    "adms_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict",
                )
            self.end_headers()
            self.wfile.write(data)

        def handle_auth_post(self, path):
            if path == "/api/auth/logout":
                token = self.session_token()
                if token:
                    with auth_state.auth_sessions_lock:
                        auth_state.AUTH_SESSIONS.pop(token, None)
                self.reply_auth_json({"ok": True}, clear_session=True)
                return

            try:
                payload = json.loads(self.read_body())
                if not isinstance(payload, dict):
                    raise ValueError("Request body must be a JSON object.")
            except (json.JSONDecodeError, ValueError):
                self.reply_auth_json({"error": "Request body must be valid JSON."}, 400)
                return

            if path == "/api/auth/change-password":
                if not self.is_authenticated():
                    self.reply_auth_json({"error": "Authentication is required."}, 401)
                    return
                old_password = payload.get("old_password")
                new_password = payload.get("new_password")
                confirm_password = payload.get("confirm_password")
                if not all(
                    isinstance(value, str)
                    for value in (old_password, new_password, confirm_password)
                ):
                    self.reply_auth_json({"error": "All password fields are required."}, 400)
                    return
                if len(old_password) > 128 or len(new_password) > 128 or len(confirm_password) > 128:
                    self.reply_auth_json({"error": "Password must be at most 128 characters."}, 400)
                    return
                if len(new_password) < auth_state.PASSWORD_MIN_LENGTH:
                    self.reply_auth_json(
                        {"error": f"New password must be at least {auth_state.PASSWORD_MIN_LENGTH} characters."},
                        400,
                    )
                    return
                if new_password != confirm_password:
                    self.reply_auth_json(
                        {"error": "New password confirmation does not match."}, 400
                    )
                    return
                with config.db_lock, database.get_db() as connection:
                    auth = connection.execute(
                        "SELECT salt, password_hash FROM app_auth WHERE id=1"
                    ).fetchone()
                    if not auth:
                        self.reply_auth_json(
                            {"error": "The application password has not been set."}, 409
                        )
                        return
                    old_hash = hashlib.pbkdf2_hmac(
                        "sha256",
                        old_password.encode("utf-8"),
                        bytes(auth["salt"]),
                        auth_state.PASSWORD_HASH_ITERATIONS,
                    )
                    if not hmac.compare_digest(old_hash, bytes(auth["password_hash"])):
                        self.reply_auth_json(
                            {"error": "The current password is incorrect."}, 403
                        )
                        return
                    salt = secrets.token_bytes(16)
                    password_hash = hashlib.pbkdf2_hmac(
                        "sha256",
                        new_password.encode("utf-8"),
                        salt,
                        auth_state.PASSWORD_HASH_ITERATIONS,
                    )
                    connection.execute(
                        "UPDATE app_auth SET salt=?, password_hash=? WHERE id=1",
                        (salt, password_hash),
                    )
                current_token = self.session_token()
                with auth_state.auth_sessions_lock:
                    current_expiration = auth_state.AUTH_SESSIONS.get(current_token)
                    auth_state.AUTH_SESSIONS.clear()
                    if current_expiration and current_expiration > time.time():
                        auth_state.AUTH_SESSIONS[current_token] = current_expiration
                self.clear_auth_failures()
                self.reply_auth_json({"ok": True})
                return

            password = payload.get("password")
            if not isinstance(password, str):
                self.reply_auth_json({"error": "Password must be text."}, 400)
                return
            if len(password) > 128:
                self.reply_auth_json({"error": "Password must be at most 128 characters."}, 400)
                return

            if path == "/api/auth/setup":
                if len(password) < auth_state.PASSWORD_MIN_LENGTH or len(password) > 128:
                    self.reply_auth_json(
                        {
                            "error": (
                                f"Password must be between {auth_state.PASSWORD_MIN_LENGTH} and 128 characters."
                            )
                        },
                        400,
                    )
                    return
                salt = secrets.token_bytes(16)
                password_hash = hashlib.pbkdf2_hmac(
                    "sha256", password.encode("utf-8"), salt, auth_state.PASSWORD_HASH_ITERATIONS
                )
                with config.db_lock, database.get_db() as connection:
                    if connection.execute("SELECT 1 FROM app_auth WHERE id=1").fetchone():
                        self.reply_auth_json(
                            {"error": "The application password is already set."}, 409
                        )
                        return
                    connection.execute(
                        "INSERT INTO app_auth (id, salt, password_hash) VALUES (1, ?, ?)",
                        (salt, password_hash),
                    )
                self.clear_auth_failures()
                self.reply_auth_json({"ok": True}, session_token=self.create_session())
                return

            if path == "/api/auth/login":
                if not self.auth_failure_allowed():
                    self.reply_auth_json(
                        {"error": "Too many attempts. Try again in 5 minutes."}, 429
                    )
                    return
                with database.get_db() as connection:
                    auth = connection.execute(
                        "SELECT salt, password_hash FROM app_auth WHERE id=1"
                    ).fetchone()
                if not auth:
                    self.reply_auth_json(
                        {"error": "Password has not been set.", "setupRequired": True}, 409
                    )
                    return
                candidate = hashlib.pbkdf2_hmac(
                    "sha256",
                    password.encode("utf-8"),
                    bytes(auth["salt"]),
                    auth_state.PASSWORD_HASH_ITERATIONS,
                )
                if not hmac.compare_digest(candidate, bytes(auth["password_hash"])):
                    self.record_auth_failure()
                    self.reply_auth_json({"error": "Incorrect password."}, 401)
                    return
                self.clear_auth_failures()
                self.reply_auth_json({"ok": True}, session_token=self.create_session())
                return

            self.reply_auth_json({"error": "Not found"}, 404)
