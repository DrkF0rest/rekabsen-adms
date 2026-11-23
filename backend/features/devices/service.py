"""Device presence and device user-record services."""
from datetime import datetime

from backend.core import config, database

def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def touch_device(sn, ip):
    with config.db_lock, database.get_db() as c:
        if config.DB_BACKEND == "mysql":
            sql = (
                "INSERT INTO devices (sn, ip, last_seen) VALUES (?,?,?) "
                "ON DUPLICATE KEY UPDATE ip=VALUES(ip), last_seen=VALUES(last_seen)"
            )
        else:
            sql = (
                "INSERT INTO devices (sn, ip, last_seen) VALUES (?,?,?) "
                "ON CONFLICT(sn) DO UPDATE SET ip=excluded.ip, last_seen=excluded.last_seen"
            )
        c.execute(sql, (sn, ip, now()))

def save_operlog(sn, body):
    """Parse OPERLOG user records, such as USER PIN=1<TAB>Name=Alex<TAB>... ."""
    count = 0
    with config.db_lock, database.get_db() as c:
        for line in body.splitlines():
            line = line.strip()
            if not line.startswith("USER "):
                continue
            kv = {}
            for part in line[5:].split("\t"):
                if "=" in part:
                    k, v = part.split("=", 1)
                    kv[k.strip()] = v.strip()
            if "PIN" not in kv:
                continue
            if config.DB_BACKEND == "mysql":
                sql = (
                    "INSERT INTO users (sn, pin, name, card, privilege) VALUES (?,?,?,?,?) "
                    "ON DUPLICATE KEY UPDATE "
                    "name=IF(VALUES(name)<>'', VALUES(name), name), "
                    "card=VALUES(card), privilege=VALUES(privilege)"
                )
            else:
                sql = (
                    "INSERT INTO users (sn, pin, name, card, privilege) VALUES (?,?,?,?,?) "
                    "ON CONFLICT(sn, pin) DO UPDATE SET "
                    "name=CASE WHEN excluded.name<>'' THEN excluded.name ELSE users.name END, "
                    "card=excluded.card, privilege=excluded.privilege"
                )
            c.execute(
                sql,
                (sn, kv["PIN"], kv.get("Name", ""), kv.get("Card", ""), kv.get("Pri", "")),
            )
            count += 1
    return count
