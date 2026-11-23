"""Legacy names exposed by the original adms_server module."""
from backend.core import config, database
from backend.features import attendance, devices
from backend.features.attendance import constants as attendance_constants
from backend.features.database import service as database_service
from backend.features.auth import state as auth_state
from backend.features.auth import routes as auth_routes
from backend.http import handler
from backend import app

_MODULES = (config, database, attendance_constants, attendance, database_service, devices, auth_state, auth_routes, handler, app)

def get_legacy_attribute(name):
    for module in _MODULES:
        if hasattr(module, name):
            return getattr(module, name)
    raise AttributeError(f"module 'adms_server' has no attribute {name!r}")

def legacy_names():
    return sorted({name for module in _MODULES for name in dir(module) if not name.startswith('_')})
