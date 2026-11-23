"""Application startup and server lifecycle."""
import socket
import sys
from http.server import ThreadingHTTPServer

from backend.core import config
from backend.features.database.service import init_db
from backend.http.handler import ADMSHandler

class QuietServer(ThreadingHTTPServer):
    """Ignore device/network disconnects such as broken pipes and Windows socket errors."""

    def handle_error(self, request, client_address):
        if isinstance(sys.exc_info()[1], (ConnectionError, TimeoutError)):
            return
        super().handle_error(request, client_address)

def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()

def main():
    init_db()
    ip = local_ip()
    print("=" * 50)
    print(" ADMS server is running")
    print(f" Dashboard      : http://{ip}:{config.PORT}/")
    print(f" Device settings: Server Address = {ip} , Port = {config.PORT}")
    print("=" * 50)
    try:
        QuietServer((config.HOST, config.PORT), ADMSHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
