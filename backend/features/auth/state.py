"""Authentication policy and in-memory state."""
import threading

PASSWORD_HASH_ITERATIONS = 600_000
PASSWORD_MIN_LENGTH = 8
SESSION_TTL = 12 * 60 * 60
AUTH_SESSIONS = {}
auth_sessions_lock = threading.Lock()
AUTH_FAILURES = {}
auth_failures_lock = threading.Lock()
