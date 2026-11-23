"""Attendance queries, ingest helpers, and XLSX export generation."""
import io
import re
from datetime import datetime, timedelta, timezone

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

from backend.core import config
from backend.core.database import get_db
from backend.features.attendance import constants
from backend.features.devices.service import now

SORT_COLS = {
    "ts": "a.ts",
    "pin": "CAST(a.pin AS INTEGER)",
    "name": "u.name",
    "status": "a.status",
    "verify": "a.verify",
    "sn": "a.sn",
}

SEARCH_COLS = {
    "all": ["a.pin", "u.name", "a.sn", "a.ts"],
    "pin": ["a.pin"],
    "name": ["u.name"],
    "sn": ["a.sn"],
    "ts": ["a.ts"],
}

def query_logs(qs, limit=None, backend=None, sqlite_file=None, page=None):
    """Fetch attendance records using keyword, column, date, and sort filters."""
    backend = backend or config.DB_BACKEND
    sqlite_file = sqlite_file or config.DB_FILE
    q = (qs.get("q") or "").strip()
    date_filter = (qs.get("date") or "").strip()
    cols = SEARCH_COLS.get(qs.get("by", "all"), SEARCH_COLS["all"])
    sort_col = SORT_COLS.get(qs.get("sort", "ts"), SORT_COLS["ts"])
    if backend == "mysql" and sort_col == "CAST(a.pin AS INTEGER)":
        sort_col = "CAST(a.pin AS SIGNED)"
    if backend == "sqlite" and sort_col == "u.name":
        sort_col += " COLLATE NOCASE"
    order = "ASC" if qs.get("order") == "asc" else "DESC"

    base = "FROM attlog a LEFT JOIN users u ON u.sn=a.sn AND u.pin=a.pin"
    conditions, args = [], []
    if date_filter:
        try:
            parsed_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
        except ValueError as exc:
            raise ValueError("Date must use the YYYY-MM-DD format.") from exc
        if parsed_date.isoformat() != date_filter:
            raise ValueError("Date must use the YYYY-MM-DD format.")
        conditions.append("a.ts>=? AND a.ts<?")
        args.extend([date_filter, (parsed_date + timedelta(days=1)).isoformat()])
    if q:
        like = "%" + q.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%"
        conditions.append("(" + " OR ".join(f"{col} LIKE ? ESCAPE '!'" for col in cols) + ")")
        args.extend([like] * len(cols))
    where = " WHERE " + " AND ".join(conditions) if conditions else ""

    sql = (
        f"SELECT a.sn, a.pin, u.name, a.ts, a.status, a.verify {base}{where} "
        f"ORDER BY {sort_col} {order}, a.id {order}"
    )
    with get_db(backend, sqlite_file=sqlite_file) as connection:
        total = connection.execute(
            f"SELECT COUNT(*) AS total {base}{where}", args
        ).fetchone()["total"]
        if limit:
            limit = int(limit)
            if page is None:
                sql += f" LIMIT {limit}"
            else:
                page_count = max(1, (int(total) + limit - 1) // limit)
                page = min(max(1, int(page)), page_count)
                sql += f" LIMIT {limit} OFFSET {(page - 1) * limit}"
        rows = connection.execute(sql, args).fetchall()
    return rows, total

def query_dashboard_summary(backend=None, sqlite_file=None, now=None):
    """Fetch today's attendance totals and the recent daily attendance trend."""
    backend = backend or config.DB_BACKEND
    sqlite_file = sqlite_file or config.DB_FILE
    today = (now or (datetime.now(timezone.utc) + timedelta(hours=config.TIMEZONE))).date()
    today_text = today.isoformat()
    tomorrow_text = (today + timedelta(days=1)).isoformat()
    first_day = today - timedelta(days=6)
    status_counts = {status: 0 for status in constants.STATUS_LABELS}

    with get_db(backend, sqlite_file=sqlite_file) as connection:
        daily_rows = connection.execute(
            "SELECT SUBSTR(ts, 1, 10) AS date, COUNT(*) AS total FROM attlog "
            "WHERE ts>=? AND ts<? GROUP BY SUBSTR(ts, 1, 10)",
            (first_day.isoformat(), tomorrow_text),
        ).fetchall()
        totals = connection.execute(
            "SELECT COUNT(*) AS total FROM attlog WHERE ts>=? AND ts<?",
            (today_text, tomorrow_text),
        ).fetchone()
        users = connection.execute(
            "SELECT COUNT(*) AS total FROM ("
            "SELECT sn, pin FROM attlog WHERE ts>=? AND ts<? GROUP BY sn, pin"
            ") AS daily_users",
            (today_text, tomorrow_text),
        ).fetchone()
        status_rows = connection.execute(
            "SELECT status, COUNT(*) AS total FROM attlog "
            "WHERE ts>=? AND ts<? GROUP BY status",
            (today_text, tomorrow_text),
        ).fetchall()
        latest_rows = connection.execute(
            "SELECT a.sn, a.pin, u.name, a.ts, a.status, a.verify "
            "FROM attlog a LEFT JOIN users u ON u.sn=a.sn AND u.pin=a.pin "
            "WHERE a.ts>=? AND a.ts<? AND NOT EXISTS ("
            "SELECT 1 FROM attlog newer WHERE newer.sn=a.sn AND newer.pin=a.pin "
            "AND newer.ts>=? AND newer.ts<? "
            "AND (newer.ts>a.ts OR (newer.ts=a.ts AND newer.id>a.id))"
            ") ORDER BY a.ts DESC, a.id DESC LIMIT 3",
            (today_text, tomorrow_text, today_text, tomorrow_text),
        ).fetchall()

    for row in status_rows:
        status = str(row["status"] or "")
        status_counts[status] = int(row["total"])
    daily_totals = {str(row["date"]): int(row["total"]) for row in daily_rows}
    daily = [
        {
            "date": (first_day + timedelta(days=offset)).isoformat(),
            "total": daily_totals.get(
                (first_day + timedelta(days=offset)).isoformat(), 0
            ),
        }
        for offset in range(7)
    ]
    return {
        "date": today_text,
        "total": int(totals["total"]),
        "users": int(users["total"]),
        "status_counts": status_counts,
        "daily": daily,
        "latest": [dict(row) for row in latest_rows],
    }

def normalize_show_limit(value):
    if value is None:
        return config.SHOW_LIMIT
    try:
        limit = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("Rows must be 10, 50, 100, 150, or 500.") from exc
    if limit not in config.SHOW_LIMIT_OPTIONS:
        raise ValueError("Rows must be 10, 50, 100, 150, or 500.")
    return limit

def format_attendance_time(timestamp):
    timestamp = str(timestamp or "")
    time_match = re.search(
        r"(?:^|[T\s])(\d{2}:\d{2})",
        timestamp,
    )
    return time_match.group(1) if time_match else (timestamp or "-")

def build_attendance_xlsx(rows, language="en", theme="lime"):
    language = "id" if language == "id" else "en"
    if theme not in constants.XLSX_THEME_COLORS:
        raise ValueError("Unknown export theme.")

    status_labels = constants.STATUS_LABELS if language == "id" else constants.EN_STATUS_LABELS
    verification_labels = constants.ID_VERIFY_LABELS if language == "id" else constants.VERIFY_LABELS
    colors = constants.XLSX_THEME_COLORS[theme]
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = constants.XLSX_SHEET_NAMES[language]
    sheet.sheet_view.showGridLines = False
    sheet.freeze_panes = "A4"

    sheet.merge_cells("A1:E1")
    title = sheet["A1"]
    title.value = constants.XLSX_TITLES[language]
    title.font = Font(name="Aptos Display", size=18, bold=True, color="FFFFFF")
    title.fill = PatternFill("solid", fgColor=colors["dark"])
    title.alignment = Alignment(vertical="center")
    title.data_type = "s"
    sheet.row_dimensions[1].height = 34

    border = Side(style="thin", color=colors["light"])
    for column, heading in enumerate(constants.XLSX_HEADERS[language], start=1):
        cell = sheet.cell(row=3, column=column, value=heading)
        cell.font = Font(name="Aptos", bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor=colors["primary"])
        cell.alignment = Alignment(vertical="center")
        cell.border = Border(bottom=border)
        cell.data_type = "s"
    sheet.row_dimensions[3].height = 24

    for row_number, record in enumerate(rows, start=4):
        values = (
            format_attendance_time(record["ts"]),
            str(record["pin"] or "-"),
            str(record["name"] or "-"),
            str(status_labels.get(str(record["status"]), record["status"] or "-")),
            str(verification_labels.get(str(record["verify"]), record["verify"] or "-")),
        )
        fill_color = "F1F4EC" if row_number % 2 == 0 else "FFFFFF"
        for column, value in enumerate(values, start=1):
            cell = sheet.cell(row=row_number, column=column, value=value)
            cell.data_type = "s"
            cell.fill = PatternFill("solid", fgColor=fill_color)
            cell.border = Border(bottom=border)
            cell.alignment = Alignment(vertical="center")

    for column, width in enumerate((16, 16, 30, 24, 20), start=1):
        sheet.column_dimensions[chr(64 + column)].width = width
    sheet.auto_filter.ref = f"A3:E{max(3, sheet.max_row)}"
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    sheet.page_setup.fitToWidth = 1
    sheet.page_setup.fitToHeight = 0
    sheet.page_setup.orientation = "landscape"

    output = io.BytesIO()
    workbook.save(output)
    return output.getvalue()

def normalize_page(value):
    if value is None:
        return 1
    try:
        page = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("Page must be a positive integer.") from exc
    if page < 1:
        raise ValueError("Page must be a positive integer.")
    return page

def save_attlog(sn, body):
    count = 0
    with config.db_lock, get_db() as c:
        for line in body.splitlines():
            p = line.strip().split("\t")
            if len(p) < 2:
                continue
            p += [""] * (5 - len(p))
            if has_daily_attlog_duplicate(c, p[0], p[2], p[1]):
                continue
            insert = "INSERT IGNORE" if config.DB_BACKEND == "mysql" else "INSERT OR IGNORE"
            cur = c.execute(
                f"{insert} INTO attlog "
                "(sn, pin, ts, status, verify, workcode, received_at) VALUES (?,?,?,?,?,?,?)",
                (sn, p[0], p[1], p[2], p[3], p[4], now()),
            )
            count += 1 if cur.rowcount else 0
    return count

def has_daily_attlog_duplicate(connection, pin, status, timestamp):
    if not pin or not status or len(timestamp) < 10:
        return False
    try:
        event_date = datetime.strptime(timestamp[:10], "%Y-%m-%d").date()
    except ValueError:
        return False

    next_date = event_date + timedelta(days=1)
    return connection.execute(
        "SELECT 1 FROM attlog WHERE pin=? AND status=? AND ts>=? AND ts<? LIMIT 1",
        (pin, status, event_date.isoformat(), next_date.isoformat()),
    ).fetchone() is not None
