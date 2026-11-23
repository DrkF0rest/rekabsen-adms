"""Attendance status and spreadsheet presentation constants."""
STATUS_LABELS = {"0": "Masuk", "1": "Pulang", "4": "Lembur Masuk", "5": "Lembur Keluar"}
EN_STATUS_LABELS = {
    "0": "Check In",
    "1": "Check Out",
    "4": "Overtime Check In",
    "5": "Overtime Check Out",
}
VERIFY_LABELS = {"1": "Fingerprint", "3": "Password"}
ID_VERIFY_LABELS = {"1": "Sidik Jari", "3": "Kata Sandi"}
XLSX_HEADERS = {
    "en": ["Time", "User ID", "Name", "Status", "Verification"],
    "id": ["Waktu", "User ID", "Nama", "Status", "Verifikasi"],
}
XLSX_TITLES = {"en": "Attendance Report by REKABSEN", "id": "Laporan Absensi by REKABSEN"}
XLSX_SHEET_NAMES = {"en": "Attendance", "id": "Absensi"}
XLSX_THEME_COLORS = {
    "lime": {"primary": "7FAE3A", "dark": "4A7A1C", "light": "D4E7A3"},
    "aqua": {"primary": "4A8FC4", "dark": "2F6592", "light": "A9CFE8"},
    "orange": {"primary": "E0963A", "dark": "A9611A", "light": "EFD49A"},
    "grape": {"primary": "9470C9", "dark": "62429A", "light": "D2BFE8"},
    "pink": {"primary": "D96A9A", "dark": "A63A68", "light": "EFC4D6"},
    "graphite": {"primary": "7F8993", "dark": "3F4953", "light": "D3D8DC"},
}
