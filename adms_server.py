"""Compatibility entry point for the REKABSEN server."""
import sys

sys.dont_write_bytecode = True

from backend import compat as _compat
from backend.app import main
from backend.http.handler import ADMSHandler
from backend.app import QuietServer, local_ip

__all__ = sorted(
    {"ADMSHandler", "QuietServer", "local_ip", "main"} | set(_compat.legacy_names())
)

def __getattr__(name):
    return _compat.get_legacy_attribute(name)

def __dir__():
    return sorted(set(globals()) | set(_compat.legacy_names()))

if __name__ == "__main__":
    main()
