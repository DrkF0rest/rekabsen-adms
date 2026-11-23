const elements = {
  connection: document.getElementById("connection"),
  changePassword: document.getElementById("change-password"),
  logout: document.getElementById("logout"),
  accountActions: document.getElementById("account-actions"),
  accountSettingsPanel: document.getElementById("account-settings-panel"),
  accountSettingsTarget: document.getElementById("account-settings-actions"),
  authNotice: document.getElementById("auth-notice"),
  devices: document.getElementById("devices"),
  deviceCount: document.getElementById("device-count"),
  logs: document.getElementById("logs"),
  logCount: document.getElementById("log-count"),
  error: document.getElementById("error"),
  filters: document.getElementById("filters"),
  search: document.getElementById("search"),
  searchBy: document.getElementById("search-by"),
  dateDisplay: document.getElementById("log-date"),
  dateInput: document.getElementById("date-picker-input"),
  datePickerButton: document.getElementById("date-picker-button"),
  heroDate: document.getElementById("hero-date"),
  sortHeaders: document.querySelectorAll(".sort-header"),
  pageSize: document.getElementById("page-size"),
  pagination: document.getElementById("attendance-pagination"),
  previousPage: document.getElementById("previous-page"),
  paginationPages: document.getElementById("pagination-pages"),
  nextPage: document.getElementById("next-page"),
  export: document.getElementById("export"),
  clearData: document.getElementById("clear-data"),
  summaryTotal: document.getElementById("summary-total"),
  summaryUsers: document.getElementById("summary-users"),
  summaryStatus: document.getElementById("summary-status"),
  attendanceChart: document.getElementById("attendance-chart"),
  latestAttendance: document.getElementById("latest-attendance"),
  summaryError: document.getElementById("summary-error"),
  deviceSettings: document.getElementById("device-settings"),
  settingsNotice: document.getElementById("settings-notice"),
  databaseSettings: document.getElementById("database-settings"),
  databaseBackend: document.getElementById("db-backend"),
  databaseTransfer: document.getElementById("db-transfer"),
  databaseName: document.getElementById("db-name"),
  databaseHost: document.getElementById("db-host"),
  databasePort: document.getElementById("db-port"),
  databaseUser: document.getElementById("db-user"),
  databasePassword: document.getElementById("db-password"),
  databaseClearPassword: document.getElementById("db-clear-password"),
  databaseNotice: document.getElementById("database-notice"),
  appearanceTheme: document.getElementById("appearance-theme"),
  appearanceStyle: document.getElementById("appearance-style"),
  appearanceLanguage: document.getElementById("appearance-language"),
  confirmationDialog: document.getElementById("app-modal"),
  confirmationTitle: document.getElementById("app-modal-title"),
  confirmationMessage: document.getElementById("app-modal-message"),
  confirmationCancel: document.getElementById("app-modal-cancel"),
  confirmationConfirm: document.getElementById("app-modal-confirm"),
  pageTitle: document.getElementById("page-title"),
  pageDescription: document.getElementById("page-description"),
  passwordModal: document.getElementById("password-modal"),
  passwordForm: document.getElementById("change-password-form"),
  oldPassword: document.getElementById("old-password"),
  newPassword: document.getElementById("new-password"),
  confirmNewPassword: document.getElementById("confirm-new-password"),
  passwordChangeError: document.getElementById("password-change-error"),
  cancelPasswordChange: document.getElementById("cancel-password-change"),
  savePasswordChange: document.getElementById("save-password-change"),
};

const accountActionsBreakpoint = window.matchMedia("(max-width: 1024px)");
function positionAccountActions(event = accountActionsBreakpoint) {
  const sidebar = document.querySelector(".sidebar");
  if (event.matches) {
    elements.accountSettingsTarget.append(elements.accountActions);
    elements.accountSettingsPanel.hidden = false;
  } else {
    sidebar.insertBefore(elements.accountActions, sidebar.querySelector(".sidebar-footer"));
    elements.accountSettingsPanel.hidden = true;
  }
}
positionAccountActions();
accountActionsBreakpoint.addEventListener("change", positionAccountActions);

const sidebarNav = document.querySelector(".sidebar-nav");
const navIndicator = document.createElement("span");
navIndicator.className = "nav-indicator";
navIndicator.setAttribute("aria-hidden", "true");
sidebarNav.append(navIndicator);
sidebarNav.classList.add("has-nav-indicator");

function updateNavIndicator() {
  if (document.documentElement.dataset.uiStyle !== "modern") return;
  const activeItem = sidebarNav.querySelector(".nav-item.active");
  if (!activeItem) return;

  const navBounds = sidebarNav.getBoundingClientRect();
  const itemBounds = activeItem.getBoundingClientRect();
  const x = itemBounds.left - navBounds.left - sidebarNav.clientLeft + sidebarNav.scrollLeft;
  const y = itemBounds.top - navBounds.top - sidebarNav.clientTop + sidebarNav.scrollTop;
  navIndicator.style.width = `${itemBounds.width}px`;
  navIndicator.style.height = `${itemBounds.height}px`;
  navIndicator.style.transform = `translate(${x}px, ${y}px)`;
}

updateNavIndicator();
window.addEventListener("resize", updateNavIndicator);

const TRANSLATIONS = Object.freeze({
  en: Object.freeze({
    "auth.logout": "Log out",
    "auth.changePassword": "Change password",
    "auth.accountSettings": "Account",
    "auth.accountDescription": "Manage your password and login session.",
    "auth.passwordDescription": "Verify your current password and enter a new password.",
    "auth.oldPassword": "Current password",
    "auth.newPassword": "New password (at least 8 characters)",
    "auth.confirmNewPassword": "Verify new password",
    "auth.savePassword": "Save password",
    "auth.passwordChanged": "Password changed successfully.",
    "auth.passwordMismatch": "The new passwords do not match.",
    "auth.passwordRequired": "Enter all password fields.",
    "auth.passwordLimit": "Passwords must be at most 128 characters.",
    "auth.passwordTooShort": "The new password must be at least 8 characters.",
    "auth.currentPasswordWrong": "The current password is incorrect.",
    "auth.passwordType": "Password must be text.",
    "auth.loginRequired": "Authentication is required.",
    "auth.passwordNotSet": "The application password has not been set.",
    "nav.main": "Main navigation",
    "nav.dashboard": "Dashboard",
    "nav.attendance": "Attendance Data",
    "nav.settings": "Settings",
    "nav.guide": "User Guide",
    "page.dashboard": "A summary of today's attendance activity and recent trends.",
    "page.attendance": "Browse, search, and export attendance records.",
    "page.settings": "Manage the database and names of connected devices.",
    "page.guide": "Instructions for connecting devices and managing attendance records.",
    "connection.checkingMysql": "Checking MySQL connection...",
    "connection.checkingDatabase": "Checking database connection...",
    "connection.mysqlDisconnected": "MySQL is disconnected",
    "connection.databaseDisconnected": "Database is disconnected",
    "connection.connected": "Connected",
    "connection.reconnecting": "Connection lost, reconnecting...",
    "dashboard.devices": "Devices",
    "dashboard.attendance": "Attendance Records",
    "dashboard.export": "Download XLSX",
    "dashboard.clearData": "Clear Data",
    "dashboard.footer": "The dashboard only displays data received by the ADMS server.",
    "attendance.footer": "Only attendance data received by the ADMS server is displayed.",
    "summary.section": "Attendance summary",
    "summary.total": "Attendance records today",
    "summary.users": "Users attended today",
    "summary.statusTitle": "Attendance by status today",
    "summary.statusDescription": "Records received today, grouped by status.",
    "summary.chartTitle": "Attendance trend",
    "summary.chartDescription": "Daily attendance records for the last 7 days.",
    "summary.chartPoint": "{date}: {total} records",
    "summary.latestTitle": "Latest attendance today",
    "summary.latestDescription": "Most recently received attendance record for today.",
    "summary.latestEmpty": "No attendance has been received today.",
    "summary.userId": "User ID",
    "summary.userColumn": "User",
    "summary.statusColumn": "Status",
    "summary.timeColumn": "Time",
    "errors.summaryLoad": "Unable to load attendance summary: {error}",
    "errors.summaryInvalid": "The attendance summary response is invalid.",
    "table.deviceName": "Device Name",
    "table.ipAddress": "IP Address",
    "table.lastSeen": "Last Seen",
    "table.time": "Time",
    "table.status": "Status",
    "table.verification": "Verification",
    "table.action": "Action",
    "sort.time": "Sort by time",
    "sort.userId": "Sort by user ID",
    "sort.name": "Sort by name",
    "sort.status": "Sort by status",
    "sort.verification": "Sort by verification",
    "filters.searchBy": "Search by",
    "filters.allColumns": "All columns",
    "filters.name": "Name",
    "filters.serialNumber": "Serial number",
    "filters.date": "Date",
    "filters.searchPlaceholder": "Search records",
    "filters.chooseDate": "Choose date",
    "filters.rowsPerTable": "Rows per table",
    "filters.rows": "{count} rows",
    "pagination.label": "Attendance pages",
    "pagination.previous": "Previous page",
    "pagination.next": "Next page",
    "pagination.page": "Page {page}",
    "devices.countOne": "1 device",
    "devices.countOther": "{count} devices",
    "devices.empty": "No devices are connected.",
    "devices.emptySettings": "No devices found. Names can be set after a device connects.",
    "devices.nameLabel": "Device name: {sn}",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.continue": "Continue",
    "common.httpError": "Server returned HTTP {status}",
    "errors.networkFailed": "The network request failed.",
    "logs.loading": "Loading records...",
    "logs.countOne": "1 record",
    "logs.countOther": "{count} records",
    "logs.countLimited": "Showing {shown} of {total} records",
    "logs.empty": "No matching attendance records.",
    "attendance.in": "Check In",
    "attendance.out": "Check Out",
    "attendance.overtimeIn": "Overtime Check In",
    "attendance.overtimeOut": "Overtime Check Out",
    "verification.fingerprint": "Fingerprint",
    "verification.password": "Password",
    "settings.database": "Database",
    "settings.databaseDescription": "Choose where ADMS data is stored.",
    "settings.activeDatabase": "Active Database",
    "settings.sqliteLocal": "SQLite (local)",
    "settings.databaseName": "Database Name",
    "settings.mysqlHost": "MySQL Host",
    "settings.mysqlPort": "MySQL Port",
    "settings.username": "Username",
    "settings.password": "Password",
    "settings.enterMysqlPassword": "Enter MySQL password",
    "settings.passwordMayBeEmpty": "MySQL password (may be empty)",
    "settings.useEmptyPassword": "Use an empty password",
    "settings.dataTransfer": "Data Transfer",
    "settings.migrateData": "Copy data from the active database",
    "settings.useEmptyDatabase": "Use the destination database without copying data",
    "settings.applyDatabase": "Apply Database",
    "settings.deviceNames": "Device Names",
    "settings.deviceNamesDescription": "Set a display name for each fingerprint device.",
    "settings.deviceNamesHelp": "Blank names use the serial number by default.",
    "settings.databaseChanged": "Active database is now: {backend}.",
    "settings.databaseChangeFailed": "Failed to switch database: {error}",
    "settings.databaseLoadFailed": "Unable to load database settings: {error}",
    "settings.deviceNameSaved": "Device name for {sn} saved.",
    "settings.deviceNameSaveFailed": "Failed to save device name: {error}",
    "settings.confirmDatabaseTitle": "Switch database to {backend}?",
    "settings.destinationSqlite": "Destination: {file} file in the application folder.",
    "settings.destinationMysql": "Destination: MySQL database \"{name}\".",
    "settings.transferMigrate": "Data from the active database will be copied. Existing destination data will be kept.",
    "settings.transferEmpty": "Data from the active database will not be copied. Existing destination data will be kept.",
    "settings.confirmApply": "Apply",
    "appearance.title": "Appearance",
    "appearance.description": "Customize the UI style, color theme, and language.",
    "appearance.colorTheme": "Color Theme",
    "appearance.style": "UI Style",
    "appearance.styleWeb20": "Web 2.0",
    "appearance.styleModern": "Modern Clean",
    "appearance.styleWindows95": "Windows 95 Classic",
    "appearance.language": "Language",
    "guide.title": "User Guide",
    "guide.description": "Quick steps to get REKABSEN up and running.",
    "guide.connectTitle": "Connect a device",
    "guide.connectDescription": "Start the REKABSEN server, then configure the server address and port 8080 on the fingerprint device. Make sure the device can reach the server computer over the network.",
    "guide.monitorTitle": "Monitor device connections",
    "guide.monitorDescription": "The Attendance Data menu shows each device's serial number, IP address, and last connection time. Attendance records appear as they are received.",
    "guide.searchTitle": "Search and export records",
    "guide.searchDescription": "Use search, sorting, and page controls below the table to find records. Download XLSX exports all records matching the active filters.",
    "guide.databaseTitle": "Configure the database",
    "guide.databaseDescription": "Open Settings to choose SQLite or MySQL Server. Enter the MySQL connection details if needed, then choose whether to copy data to the destination.",
    "guide.manageTitle": "Manage names and records",
    "guide.manageDescription": "In Settings, change the display name for each device. Clear Data removes attendance records but keeps device and user data.",
    "errors.dashboardLoad": "Unable to load dashboard data: {error}",
    "errors.settingsLoad": "Unable to load device settings: {error}",
    "errors.databaseStatusInvalid": "Invalid database status response",
    "errors.databaseStatusCheck": "Unable to check database connection:",
    "errors.databaseStatusEvent": "Unable to read database status update:",
    "errors.clearTitle": "Clear attendance records?",
    "errors.clearMessage": "Delete all attendance records? Device and user data will not be deleted.",
    "errors.clearConfirm": "Clear Data",
    "errors.clearFailed": "Failed to clear attendance records: {error}",
    "server.sqliteNameType": "SQLite filename must be text.",
    "server.sqliteNameFormat": "SQLite names may contain only letters, numbers, underscores, and hyphens.",
    "server.configFormat": "Database configuration must be a JSON object.",
    "server.mysqlConfig": "MySQL configuration is invalid.",
    "server.rowLimit": "Rows must be 10, 50, 100, 150, or 500.",
    "server.page": "Page must be a positive integer.",
    "server.mysqlRequired": "MySQL configuration is required.",
    "server.mysqlFieldsRequired": "MySQL host, database name, and username are required.",
    "server.mysqlLengths": "MySQL host must be at most 253 characters; database name and username must be at most 64 characters.",
    "server.mysqlPort": "MySQL port must be a number between 1 and 65535.",
    "server.dateFormat": "Date must use the YYYY-MM-DD format.",
    "server.mysqlPasswordType": "MySQL password must be text.",
    "server.mysqlPasswordRequired": "Enter a MySQL password or select Use an empty password.",
    "server.databaseBackend": "Database must be SQLite or MySQL.",
    "server.databaseTransfer": "Choose either an empty database or data migration.",
    "server.jsonBody": "Request body must be valid JSON.",
    "server.deviceNameFields": "The serial number and device name must be text.",
    "server.deviceNameLength": "Serial number is required and the device name must not exceed 80 characters.",
    "server.deviceNotFound": "Device not found.",
    "server.jsonObject": "Request body must be a JSON object.",
  }),
  id: Object.freeze({
    "auth.logout": "Keluar",
    "auth.changePassword": "Ubah password",
    "auth.accountSettings": "Akun",
    "auth.accountDescription": "Kelola password dan sesi login.",
    "auth.passwordDescription": "Verifikasi password lama, lalu masukkan password baru.",
    "auth.oldPassword": "Password lama",
    "auth.newPassword": "Password baru (minimal 8 karakter)",
    "auth.confirmNewPassword": "Verifikasi password baru",
    "auth.savePassword": "Simpan password",
    "auth.passwordChanged": "Password berhasil diubah.",
    "auth.passwordMismatch": "Verifikasi password baru tidak cocok.",
    "auth.passwordRequired": "Semua field password wajib diisi.",
    "auth.passwordLimit": "Password maksimal 128 karakter.",
    "auth.passwordTooShort": "Password baru minimal 8 karakter.",
    "auth.currentPasswordWrong": "Password lama salah.",
    "auth.passwordType": "Password wajib berupa teks.",
    "auth.loginRequired": "Login diperlukan.",
    "auth.passwordNotSet": "Password aplikasi belum dibuat.",
    "nav.main": "Navigasi utama",
    "nav.dashboard": "Dashboard",
    "nav.attendance": "Data Absensi",
    "nav.settings": "Pengaturan",
    "nav.guide": "Panduan Penggunaan",
    "page.dashboard": "Ringkasan absensi hari ini dan tren terbaru.",
    "page.attendance": "Lihat, cari, dan ekspor data absensi.",
    "page.settings": "Kelola database dan nama perangkat yang terhubung.",
    "page.guide": "Petunjuk menghubungkan perangkat dan mengelola data absensi.",
    "connection.checkingMysql": "Memeriksa koneksi MySQL...",
    "connection.checkingDatabase": "Memeriksa koneksi database...",
    "connection.mysqlDisconnected": "MySQL tidak terhubung",
    "connection.databaseDisconnected": "Database tidak terhubung",
    "connection.connected": "Terhubung",
    "connection.reconnecting": "Koneksi terputus, mencoba kembali...",
    "dashboard.devices": "Perangkat",
    "dashboard.attendance": "Data Absensi",
    "dashboard.export": "Unduh XLSX",
    "dashboard.clearData": "Bersihkan Data",
    "dashboard.footer": "Dashboard hanya menampilkan data yang diterima server ADMS.",
    "attendance.footer": "Hanya data absensi yang diterima server ADMS yang ditampilkan.",
    "summary.section": "Ringkasan absensi",
    "summary.total": "Jumlah data absensi hari ini",
    "summary.users": "Jumlah pengguna yang absen hari ini",
    "summary.statusTitle": "Absensi berdasarkan status hari ini",
    "summary.statusDescription": "Data absensi yang diterima hari ini, dikelompokkan berdasarkan status.",
    "summary.chartTitle": "Tren absensi",
    "summary.chartDescription": "Jumlah data absensi per hari selama 7 hari terakhir.",
    "summary.chartPoint": "{date}: {total} data",
    "summary.latestTitle": "Absensi terbaru hari ini",
    "summary.latestDescription": "Data absensi terakhir yang diterima hari ini.",
    "summary.latestEmpty": "Belum ada data absensi yang diterima hari ini.",
    "summary.userId": "User ID",
    "summary.userColumn": "Pengguna",
    "summary.statusColumn": "Status",
    "summary.timeColumn": "Waktu",
    "errors.summaryLoad": "Gagal memuat ringkasan absensi: {error}",
    "errors.summaryInvalid": "Respons ringkasan absensi tidak valid.",
    "table.deviceName": "Nama Perangkat",
    "table.ipAddress": "Alamat IP",
    "table.lastSeen": "Terakhir Terlihat",
    "table.time": "Waktu",
    "table.status": "Status",
    "table.verification": "Verifikasi",
    "table.action": "Aksi",
    "sort.time": "Urutkan berdasarkan waktu",
    "sort.userId": "Urutkan berdasarkan User ID",
    "sort.name": "Urutkan berdasarkan nama",
    "sort.status": "Urutkan berdasarkan status",
    "sort.verification": "Urutkan berdasarkan verifikasi",
    "filters.searchBy": "Cari berdasarkan",
    "filters.allColumns": "Semua kolom",
    "filters.name": "Nama",
    "filters.serialNumber": "Serial number",
    "filters.date": "Tanggal",
    "filters.searchPlaceholder": "Cari data",
    "filters.chooseDate": "Pilih tanggal",
    "filters.rowsPerTable": "Jumlah data per tabel",
    "filters.rows": "{count} data",
    "pagination.label": "Halaman data absensi",
    "pagination.previous": "Halaman sebelumnya",
    "pagination.next": "Halaman berikutnya",
    "pagination.page": "Halaman {page}",
    "devices.countOne": "1 perangkat",
    "devices.countOther": "{count} perangkat",
    "devices.empty": "Belum ada perangkat yang terhubung.",
    "devices.emptySettings": "Belum ada perangkat. Nama dapat diatur setelah perangkat terhubung.",
    "devices.nameLabel": "Nama perangkat: {sn}",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.continue": "Lanjutkan",
    "common.httpError": "Server mengembalikan HTTP {status}",
    "errors.networkFailed": "Permintaan jaringan gagal.",
    "logs.loading": "Memuat data...",
    "logs.countOne": "1 data",
    "logs.countOther": "{count} data",
    "logs.countLimited": "Menampilkan {shown} dari {total} data",
    "logs.empty": "Tidak ada data absensi yang cocok.",
    "attendance.in": "Masuk",
    "attendance.out": "Pulang",
    "attendance.overtimeIn": "Lembur Masuk",
    "attendance.overtimeOut": "Lembur Keluar",
    "verification.fingerprint": "Sidik Jari",
    "verification.password": "Kata Sandi",
    "settings.database": "Database",
    "settings.databaseDescription": "Pilih tempat penyimpanan data ADMS.",
    "settings.activeDatabase": "Database Aktif",
    "settings.sqliteLocal": "SQLite (lokal)",
    "settings.databaseName": "Nama Database",
    "settings.mysqlHost": "Host MySQL",
    "settings.mysqlPort": "Port MySQL",
    "settings.username": "Username",
    "settings.password": "Password",
    "settings.enterMysqlPassword": "Masukkan password MySQL",
    "settings.passwordMayBeEmpty": "Password MySQL (boleh kosong)",
    "settings.useEmptyPassword": "Gunakan password kosong",
    "settings.dataTransfer": "Pengaturan Transfer Data",
    "settings.migrateData": "Salin data dari database aktif",
    "settings.useEmptyDatabase": "Gunakan database tujuan tanpa menyalin data",
    "settings.applyDatabase": "Terapkan Database",
    "settings.deviceNames": "Nama Perangkat",
    "settings.deviceNamesDescription": "Atur nama yang ditampilkan untuk setiap mesin fingerprint.",
    "settings.deviceNamesHelp": "Nama kosong akan menggunakan Serial Number sebagai nama default.",
    "settings.databaseChanged": "Database aktif sekarang: {backend}.",
    "settings.databaseChangeFailed": "Gagal mengganti database: {error}",
    "settings.databaseLoadFailed": "Gagal memuat pengaturan database: {error}",
    "settings.deviceNameSaved": "Nama perangkat {sn} berhasil disimpan.",
    "settings.deviceNameSaveFailed": "Gagal menyimpan nama perangkat: {error}",
    "settings.confirmDatabaseTitle": "Ganti database ke {backend}?",
    "settings.destinationSqlite": "Tujuan: file {file} di folder aplikasi.",
    "settings.destinationMysql": "Tujuan: database MySQL \"{name}\".",
    "settings.transferMigrate": "Data dari database aktif akan disalin. Data yang sudah ada di tujuan tetap ada.",
    "settings.transferEmpty": "Data dari database aktif tidak disalin. Data yang sudah ada di tujuan tetap ada.",
    "settings.confirmApply": "Terapkan",
    "appearance.title": "Tampilan",
    "appearance.description": "Atur gaya antarmuka, tema warna, dan bahasa REKABSEN.",
    "appearance.colorTheme": "Tema Warna",
    "appearance.style": "Gaya Antarmuka",
    "appearance.styleWeb20": "Web 2.0",
    "appearance.styleModern": "Modern Clean",
    "appearance.styleWindows95": "Windows 95 Klasik",
    "appearance.language": "Bahasa",
    "guide.title": "Panduan Penggunaan",
    "guide.description": "Langkah singkat untuk menjalankan REKABSEN.",
    "guide.connectTitle": "Hubungkan perangkat",
    "guide.connectDescription": "Jalankan server REKABSEN, lalu atur alamat server dan port 8080 pada perangkat fingerprint. Pastikan perangkat dapat menjangkau komputer server melalui jaringan.",
    "guide.monitorTitle": "Pantau koneksi perangkat",
    "guide.monitorDescription": "Menu Data Absensi menampilkan serial number, alamat IP, dan waktu terakhir perangkat terhubung. Data absensi muncul saat diterima.",
    "guide.searchTitle": "Cari dan ekspor data",
    "guide.searchDescription": "Gunakan pencarian, pengurutan, dan kontrol halaman di bawah tabel untuk menemukan data. Unduh XLSX mengekspor seluruh data yang sesuai dengan filter aktif.",
    "guide.databaseTitle": "Atur database",
    "guide.databaseDescription": "Buka Pengaturan untuk memilih SQLite atau MySQL Server. Isi detail koneksi MySQL bila diperlukan, lalu tentukan apakah data akan disalin ke database tujuan.",
    "guide.manageTitle": "Kelola nama dan data",
    "guide.manageDescription": "Di Pengaturan, ubah nama perangkat. Bersihkan Data menghapus seluruh absensi, tetapi tidak menghapus data perangkat dan pengguna.",
    "errors.dashboardLoad": "Gagal memuat data dashboard: {error}",
    "errors.settingsLoad": "Gagal memuat pengaturan perangkat: {error}",
    "errors.databaseStatusInvalid": "Respons status database tidak valid",
    "errors.databaseStatusCheck": "Gagal memeriksa koneksi database:",
    "errors.databaseStatusEvent": "Gagal membaca pembaruan status database:",
    "errors.clearTitle": "Bersihkan data absensi?",
    "errors.clearMessage": "Hapus semua data absensi? Data perangkat dan pengguna tidak akan dihapus.",
    "errors.clearConfirm": "Bersihkan Data",
    "errors.clearFailed": "Gagal membersihkan data absensi: {error}",
    "server.sqliteNameType": "Nama file SQLite wajib berupa teks.",
    "server.sqliteNameFormat": "Nama SQLite hanya boleh berisi huruf, angka, garis bawah, dan tanda hubung.",
    "server.configFormat": "File konfigurasi database harus berupa objek JSON.",
    "server.mysqlConfig": "Konfigurasi MySQL tidak valid.",
    "server.rowLimit": "Jumlah data harus 10, 50, 100, 150, atau 500.",
    "server.page": "Halaman wajib berupa bilangan bulat positif.",
    "server.mysqlRequired": "Konfigurasi MySQL wajib diisi.",
    "server.mysqlFieldsRequired": "Host, nama database, dan user MySQL wajib diisi.",
    "server.mysqlLengths": "Host maksimal 253 karakter; nama database dan user maksimal 64 karakter.",
    "server.mysqlPort": "Port MySQL harus berupa angka antara 1 dan 65535.",
    "server.dateFormat": "Tanggal harus menggunakan format YYYY-MM-DD.",
    "server.mysqlPasswordType": "Password MySQL harus berupa teks.",
    "server.mysqlPasswordRequired": "Password MySQL wajib diisi atau pilih Gunakan password kosong.",
    "server.databaseBackend": "Database harus SQLite atau MySQL.",
    "server.databaseTransfer": "Pilih database kosong atau migrasi data.",
    "server.jsonBody": "Body harus berupa JSON yang valid.",
    "server.deviceNameFields": "Field sn dan name wajib berupa teks.",
    "server.deviceNameLength": "Serial number wajib diisi dan nama maksimal 80 karakter.",
    "server.deviceNotFound": "Perangkat tidak ditemukan.",
    "server.jsonObject": "Body harus berupa objek JSON.",
  }),
});

const STATUS_LABELS = Object.freeze({
  "0": "attendance.in",
  "1": "attendance.out",
  "4": "attendance.overtimeIn",
  "5": "attendance.overtimeOut",
});
const VERIFY_LABELS = Object.freeze({
  "1": "verification.fingerprint",
  "3": "verification.password",
});
const APPEARANCE_THEMES = Object.freeze(["aqua", "lime", "orange", "grape", "pink", "graphite"]);
const UI_STYLES = Object.freeze(["web20", "modern", "windows-95"]);
const LANGUAGES = Object.freeze(["en", "id"]);
const PAGE_SIZE_OPTIONS = Object.freeze([10, 50, 100, 150, 500]);
const SORT_COLUMNS = Object.freeze(["ts", "pin", "name", "status", "verify"]);
const SERVER_ERROR_TRANSLATIONS = Object.freeze({
  "SQLite filename must be text.": "server.sqliteNameType",
  "SQLite names may contain only letters, numbers, underscores, and hyphens.": "server.sqliteNameFormat",
  "Database configuration must be a JSON object.": "server.configFormat",
  "MySQL configuration is invalid.": "server.mysqlConfig",
  "Rows must be 10, 50, 100, 150, or 500.": "server.rowLimit",
  "Page must be a positive integer.": "server.page",
  "Date must use the YYYY-MM-DD format.": "server.dateFormat",
  "MySQL configuration is required.": "server.mysqlRequired",
  "MySQL host, database name, and username are required.": "server.mysqlFieldsRequired",
  "MySQL host must be at most 253 characters; database name and username must be at most 64 characters.": "server.mysqlLengths",
  "MySQL port must be a number between 1 and 65535.": "server.mysqlPort",
  "MySQL password must be text.": "server.mysqlPasswordType",
  "Enter a MySQL password or select Use an empty password.": "server.mysqlPasswordRequired",
  "Database must be SQLite or MySQL.": "server.databaseBackend",
  "Choose an empty database or migrate data.": "server.databaseTransfer",
  "Request body must be valid JSON.": "server.jsonBody",
  "The serial number and device name must be text.": "server.deviceNameFields",
  "Serial number is required and the device name must not exceed 80 characters.": "server.deviceNameLength",
  "Device not found.": "server.deviceNotFound",
  "Request body must be a JSON object.": "server.jsonObject",
  "Authentication is required.": "auth.loginRequired",
  "Password must be text.": "auth.passwordType",
  "All password fields are required.": "auth.passwordRequired",
  "Password must be at most 128 characters.": "auth.passwordLimit",
  "New password must be at least 8 characters.": "auth.passwordTooShort",
  "New password confirmation does not match.": "auth.passwordMismatch",
  "The current password is incorrect.": "auth.currentPasswordWrong",
  "The application password has not been set.": "auth.passwordNotSet",
});
const storedTheme = localStorage.getItem("rekabsen-theme");
const storedUiStyle = localStorage.getItem("rekabsen-ui-style");
const storedLanguage = localStorage.getItem("rekabsen-language");
const storedPageSize = Number(localStorage.getItem("rekabsen-page-size"));
let savedSqliteName = "rekabsen";
let savedMysqlDatabase = "rekabsen";
let databaseNameBackend = "sqlite";
let resolveConfirmation = null;
let eventStreamConnected = false;
let dashboardRequestId = 0;
let databaseStatus = { backend: null, connected: null };
let databaseStatusRequestId = 0;
let databaseStatusChecking = false;
let activeLanguage = LANGUAGES.includes(storedLanguage) ? storedLanguage : "en";
let sortBy = "ts";
let sortOrder = "desc";
let currentPage = 1;
let currentDevices = [];
let currentLogs = [];
let currentLogTotal = 0;
let dashboardDataLoaded = false;
let summaryData = null;
let summaryErrorState = null;
let settingsNoticeState = null;
let databaseNoticeState = null;
let dashboardErrorState = null;

const initialTheme = APPEARANCE_THEMES.includes(storedTheme)
  ? storedTheme
  : (storedTheme === "blue" || storedTheme === "cyan" ? "aqua" : "lime");
const initialUiStyle = UI_STYLES.includes(storedUiStyle) ? storedUiStyle : "web20";
document.documentElement.dataset.theme = initialTheme;
document.documentElement.dataset.uiStyle = initialUiStyle;
elements.appearanceTheme.querySelectorAll('input[name="appearance-theme"]').forEach((input) => {
  input.checked = input.value === initialTheme;
});
elements.appearanceStyle.value = initialUiStyle;
elements.appearanceLanguage.value = activeLanguage;
elements.pageSize.value = PAGE_SIZE_OPTIONS.includes(storedPageSize)
  ? String(storedPageSize)
  : "100";
function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

let dashboardDate = localDateValue();
elements.dateInput.value = dashboardDate;

function updateDateDisplay() {
  const date = new Date(`${dashboardDate}T00:00:00`);
  elements.dateDisplay.dateTime = dashboardDate;
  elements.dateDisplay.textContent = new Intl.DateTimeFormat(
    activeLanguage === "id" ? "id-ID" : "en-US",
    { month: "2-digit", day: "2-digit", year: "numeric" },
  ).format(date);
}

function t(key, values = {}) {
  const template = TRANSLATIONS[activeLanguage][key] || TRANSLATIONS.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  ));
}

function localizeError(error) {
  const message = error && error.message ? error.message : String(error);
  const httpStatus = message.match(/^(?:Server returned|Server mengembalikan) HTTP (\d+)$/);
  if (httpStatus) return t("common.httpError", { status: httpStatus[1] });
  if (message === "Failed to fetch") return t("errors.networkFailed");
  const key = SERVER_ERROR_TRANSLATIONS[message];
  return key ? t(key) : message;
}

function noticeText(state) {
  const values = { ...state.values };
  if (state.isError && Object.prototype.hasOwnProperty.call(values, "error")) {
    values.error = localizeError(values.error);
  }
  return t(state.key, values);
}

function dashboardErrorText(state) {
  return t(state.key, { error: localizeError(state.error) });
}

function updatePageHeader(viewId) {
  const settingsOpen = viewId === "settings-view";
  const guideOpen = viewId === "guide-view";
  const attendanceOpen = viewId === "attendance-view";
  elements.heroDate.hidden = settingsOpen || guideOpen;
  elements.pageTitle.textContent = settingsOpen
    ? t("nav.settings")
    : guideOpen
      ? t("nav.guide")
      : attendanceOpen
        ? t("nav.attendance")
        : t("nav.dashboard");
  elements.pageDescription.textContent = settingsOpen
    ? t("page.settings")
    : guideOpen
      ? t("page.guide")
      : attendanceOpen
        ? t("page.attendance")
        : t("page.dashboard");
  updateHeroDate();
}

function updateHeroDate() {
  elements.heroDate.textContent = new Intl.DateTimeFormat(
    activeLanguage === "id" ? "id-ID" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  ).format(new Date());
}

function applyLanguage(language) {
  activeLanguage = LANGUAGES.includes(language) ? language : "en";
  document.documentElement.lang = activeLanguage;
  elements.appearanceLanguage.value = activeLanguage;
  updateDateDisplay();
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });

  const themeNames = activeLanguage === "id"
    ? { aqua: "Aqua", lime: "Lime", orange: "Oranye", grape: "Anggur", pink: "Pink", graphite: "Grafit" }
    : { aqua: "Aqua", lime: "Lime", orange: "Orange", grape: "Grape", pink: "Pink", graphite: "Graphite" };
  elements.appearanceTheme.querySelectorAll("[data-theme-name]").forEach((element) => {
    element.textContent = themeNames[element.dataset.themeName];
  });
  [...elements.pageSize.options].forEach((option) => {
    option.textContent = t("filters.rows", { count: option.value });
  });

  const currentView = document.querySelector(".page-view:not([hidden])");
  updatePageHeader(currentView ? currentView.id : "dashboard-view");
  updateConnectionStatus();
  if (dashboardDataLoaded) {
    renderDevices(currentDevices);
    renderLogs(currentLogs, currentLogTotal, currentPage);
  } else {
    elements.deviceCount.textContent = t("devices.countOther", { count: 0 });
    elements.logCount.textContent = t("logs.loading");
  }
  if (summaryData) renderSummary(summaryData);
  if (summaryErrorState) {
    elements.summaryError.textContent = t("errors.summaryLoad", {
      error: localizeError(summaryErrorState),
    });
  }
  if (dashboardErrorState) {
    elements.error.textContent = dashboardErrorText(dashboardErrorState);
  }
  if (settingsNoticeState) {
    elements.settingsNotice.textContent = noticeText(settingsNoticeState);
  }
  if (databaseNoticeState) {
    elements.databaseNotice.textContent = noticeText(databaseNoticeState);
  }
  updateSortHeaders();
  elements.databasePassword.placeholder = elements.databaseClearPassword.checked
    ? t("settings.passwordMayBeEmpty")
    : t("settings.enterMysqlPassword");
  updateNavIndicator();
}

applyLanguage(activeLanguage);

function queryParams() {
  return new URLSearchParams({
    q: elements.search.value.trim(),
    by: elements.searchBy.value,
    date: dashboardDate,
    lang: activeLanguage,
    sort: sortBy,
    order: sortOrder,
    limit: elements.pageSize.value,
    page: String(currentPage),
  });
}

function updateExportLink() {
  const params = queryParams();
  params.set("theme", document.documentElement.dataset.theme);
  elements.export.href = `/export.xlsx?${params}`;
}

updateExportLink();

function updateSortHeaders() {
  elements.sortHeaders.forEach((button) => {
    const active = button.dataset.sort === sortBy;
    const header = button.closest("th");
    const indicator = button.querySelector(".sort-indicator");
    header.setAttribute(
      "aria-sort",
      active ? (sortOrder === "asc" ? "ascending" : "descending") : "none",
    );
    indicator.textContent = active ? (sortOrder === "asc" ? "▲" : "▼") : "";
  });
}

function displayLabel(value, labels) {
  if (value === null || value === undefined || value === "") return "-";
  const rawValue = String(value);
  return labels[rawValue] ? t(labels[rawValue]) : rawValue;
}

function formatAttendanceTime(timestamp) {
  const value = String(timestamp || "");
  const match = value.match(/(?:^|[T\s])(\d{2}:\d{2})/);
  return match ? match[1] : value;
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || "-";
  row.appendChild(cell);
}

function showEmpty(tbody, columns, message) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = columns;
  cell.className = "empty";
  cell.textContent = message;
  row.appendChild(cell);
  tbody.replaceChildren(row);
}

function renderDevices(devices) {
  currentDevices = devices;
  const countKey = devices.length === 1 ? "devices.countOne" : "devices.countOther";
  elements.deviceCount.textContent = t(countKey, { count: devices.length });
  renderDeviceSettings(devices);
  if (!devices.length) {
    showEmpty(elements.devices, 3, t("devices.empty"));
    return;
  }
  const rows = document.createDocumentFragment();
  devices.forEach((device) => {
    const row = document.createElement("tr");
    addCell(row, device.name || device.sn);
    addCell(row, device.ip);
    addCell(row, device.last_seen);
    rows.appendChild(row);
  });
  elements.devices.replaceChildren(rows);
}

function renderDeviceSettings(devices) {
  const editedNames = new Map(
    [...elements.deviceSettings.querySelectorAll("input[data-sn]")]
      .map((input) => [input.dataset.sn, input.value]),
  );
  if (!devices.length) {
    showEmpty(elements.deviceSettings, 3, t("devices.emptySettings"));
    return;
  }

  const rows = document.createDocumentFragment();
  devices.forEach((device) => {
    const row = document.createElement("tr");
    addCell(row, device.sn);

    const nameCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 80;
    input.className = "device-name-input";
    input.dataset.sn = device.sn;
    input.setAttribute("aria-label", t("devices.nameLabel", { sn: device.sn }));
    input.value = editedNames.has(device.sn) ? editedNames.get(device.sn) : (device.name || device.sn);
    nameCell.appendChild(input);
    row.appendChild(nameCell);

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.dataset.saveSn = device.sn;
    button.textContent = t("common.save");
    actionCell.appendChild(button);
    row.appendChild(actionCell);
    rows.appendChild(row);
  });
  elements.deviceSettings.replaceChildren(rows);
}

function renderLogs(logs, total, page = currentPage) {
  currentLogs = logs;
  currentLogTotal = total;
  currentPage = page;
  renderPagination(total, page);
  const totalKey = total === 1 ? "logs.countOne" : "logs.countOther";
  elements.logCount.textContent = total > logs.length
    ? t("logs.countLimited", { shown: logs.length, total })
    : t(totalKey, { count: total });
  if (!logs.length) {
    showEmpty(elements.logs, 5, t("logs.empty"));
    return;
  }
  const rows = document.createDocumentFragment();
  logs.forEach((log) => {
    const row = document.createElement("tr");
    addCell(row, formatAttendanceTime(log.ts));
    addCell(row, log.pin);
    addCell(row, log.name);
    addCell(row, displayLabel(log.status, STATUS_LABELS));
    addCell(row, displayLabel(log.verify, VERIFY_LABELS));
    rows.appendChild(row);
  });
  elements.logs.replaceChildren(rows);
}

function renderPagination(total, page) {
  const pageSize = Number(elements.pageSize.value);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  currentPage = Math.max(1, Math.min(page, pageCount));
  elements.pagination.hidden = pageCount <= 1;
  elements.previousPage.disabled = currentPage <= 1;
  elements.nextPage.disabled = currentPage >= pageCount;
  elements.paginationPages.replaceChildren();

  const pages = [];
  if (pageCount <= 7) {
    for (let number = 1; number <= pageCount; number += 1) pages.push(number);
  } else {
    const firstVisible = Math.max(2, currentPage - 1);
    const lastVisible = Math.min(pageCount - 1, currentPage + 1);
    pages.push(1);
    if (firstVisible > 2) pages.push(null);
    for (let number = firstVisible; number <= lastVisible; number += 1) pages.push(number);
    if (lastVisible < pageCount - 1) pages.push(null);
    pages.push(pageCount);
  }

  pages.forEach((number) => {
    if (number === null) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "page-ellipsis";
      ellipsis.textContent = "…";
      elements.paginationPages.appendChild(ellipsis);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-number";
    button.dataset.page = String(number);
    button.textContent = String(number);
    button.setAttribute("aria-label", t("pagination.page", { page: number }));
    if (number === currentPage) button.setAttribute("aria-current", "page");
    elements.paginationPages.appendChild(button);
  });
}

function renderSummary(summary) {
  const locale = activeLanguage === "id" ? "id-ID" : "en-US";
  const numberFormat = new Intl.NumberFormat(locale);
  elements.summaryTotal.textContent = numberFormat.format(summary.total);
  elements.summaryUsers.textContent = numberFormat.format(summary.users);

  const knownStatuses = ["0", "1", "4", "5"];
  const statuses = [
    ...knownStatuses,
    ...Object.keys(summary.status_counts).filter((status) => !knownStatuses.includes(status)).sort(),
  ];
  const statusCards = document.createDocumentFragment();
  statuses.forEach((status) => {
    const card = document.createElement("article");
    card.className = "status-summary-card";
    const label = document.createElement("span");
    label.textContent = displayLabel(status, STATUS_LABELS);
    const total = document.createElement("strong");
    total.textContent = numberFormat.format(summary.status_counts[status] || 0);
    card.append(label, total);
    statusCards.appendChild(card);
  });
  elements.summaryStatus.replaceChildren(statusCards);

  const svgNamespace = "http://www.w3.org/2000/svg";
  const chartWidth = Math.max(
    320,
    Math.min(720, Math.round(elements.attendanceChart.getBoundingClientRect().width || 720)),
  );
  const chartHeight = 240;
  const chartLeft = 44;
  const chartRight = 36;
  const chartTop = 18;
  const chartBottom = 190;
  const chartPlotWidth = chartWidth - chartLeft - chartRight;
  const chartPlotHeight = chartBottom - chartTop;
  const maxDailyTotal = Math.max(1, ...summary.daily.map((day) => day.total));
  const points = summary.daily.map((day, index) => ({
    ...day,
    x: chartLeft + (chartPlotWidth * index) / Math.max(1, summary.daily.length - 1),
    y: chartBottom - (day.total / maxDailyTotal) * chartPlotHeight,
  }));
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("class", "attendance-line-chart");
  svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("summary.chartDescription"));
  const title = document.createElementNS(svgNamespace, "title");
  title.textContent = t("summary.chartTitle");
  svg.appendChild(title);

  const grid = document.createDocumentFragment();
  const tickValues = [...new Set([maxDailyTotal, Math.floor(maxDailyTotal / 2), 0])];
  tickValues.forEach((value) => {
    const y = chartBottom - (value / maxDailyTotal) * chartPlotHeight;
    const line = document.createElementNS(svgNamespace, "line");
    line.setAttribute("class", "attendance-chart-gridline");
    line.setAttribute("x1", String(chartLeft));
    line.setAttribute("x2", String(chartWidth - chartRight));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    grid.appendChild(line);

    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("class", "attendance-chart-axis-label");
    label.setAttribute("x", String(chartLeft - 10));
    label.setAttribute("y", String(y + 4));
    label.setAttribute("text-anchor", "end");
    label.textContent = numberFormat.format(value);
    grid.appendChild(label);
  });
  svg.appendChild(grid);

  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute(
    "d",
    points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" "),
  );
  path.setAttribute("class", "attendance-chart-line");
  svg.appendChild(path);

  points.forEach((point) => {
    const date = new Date(`${point.date}T00:00:00`);
    const formattedDate = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(date);
    const marker = document.createElementNS(svgNamespace, "circle");
    marker.setAttribute("class", "attendance-chart-point");
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    marker.setAttribute("r", "4");
    const pointTitle = document.createElementNS(svgNamespace, "title");
    pointTitle.textContent = t("summary.chartPoint", {
      date: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date),
      total: numberFormat.format(point.total),
    });
    marker.appendChild(pointTitle);
    svg.appendChild(marker);

    const label = document.createElementNS(svgNamespace, "text");
    label.setAttribute("class", "attendance-chart-axis-label");
    label.setAttribute("x", String(point.x));
    label.setAttribute("y", "218");
    label.setAttribute("text-anchor", "middle");
    label.textContent = formattedDate;
    svg.appendChild(label);
  });
  elements.attendanceChart.replaceChildren(svg);

  if (!summary.latest.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = t("summary.latestEmpty");
    elements.latestAttendance.replaceChildren(empty);
    return;
  }
  const table = document.createElement("table");
  table.className = "latest-attendance-table";
  const headings = document.createElement("tr");
  [
    "summary.userColumn",
    "summary.userId",
    "summary.statusColumn",
    "summary.timeColumn",
  ].forEach((key) => {
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = t(key);
    headings.appendChild(heading);
  });
  const head = document.createElement("thead");
  head.appendChild(headings);
  table.appendChild(head);
  const body = document.createElement("tbody");
  summary.latest.forEach((record) => {
    const row = document.createElement("tr");
    [
      record.name || record.pin,
      record.pin,
      displayLabel(record.status, STATUS_LABELS),
      formatAttendanceTime(record.ts),
    ].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value || "-";
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
  table.appendChild(body);
  elements.latestAttendance.replaceChildren(table);
}

let summaryChartWidth = 0;
let summaryChartResizeTimer = null;
if ("ResizeObserver" in window) {
  const summaryChartObserver = new ResizeObserver((entries) => {
    const width = Math.round(entries[0]?.contentRect.width || 0);
    if (!width || width === summaryChartWidth) return;
    summaryChartWidth = width;
    clearTimeout(summaryChartResizeTimer);
    summaryChartResizeTimer = setTimeout(() => {
      if (summaryData) renderSummary(summaryData);
    }, 120);
  });
  summaryChartObserver.observe(elements.attendanceChart);
}

async function refreshSummary() {
  try {
    const response = await fetch("/api/summary", { cache: "no-store" });
    if (!response.ok) throw new Error(t("common.httpError", { status: response.status }));
    const summary = await response.json();
    if (
      typeof summary.date !== "string"
      || !Number.isInteger(summary.total) || summary.total < 0
      || !Number.isInteger(summary.users) || summary.users < 0
      || !summary.status_counts || typeof summary.status_counts !== "object"
      || Object.values(summary.status_counts).some((total) => !Number.isInteger(total) || total < 0)
      || !Array.isArray(summary.daily) || summary.daily.length !== 7
      || summary.daily.some((day) => (
        !day || typeof day.date !== "string" || !Number.isInteger(day.total) || day.total < 0
      ))
      || !Array.isArray(summary.latest) || summary.latest.length > 3
      || summary.latest.some((record) => !record || typeof record !== "object")
    ) {
      throw new Error(t("errors.summaryInvalid"));
    }
    summaryData = summary;
    summaryErrorState = null;
    renderSummary(summaryData);
    elements.summaryError.hidden = true;
  } catch (error) {
    summaryErrorState = error;
    elements.summaryError.textContent = t("errors.summaryLoad", {
      error: localizeError(error),
    });
    elements.summaryError.hidden = false;
  }
}

async function refresh() {
  const requestId = ++dashboardRequestId;
  const params = queryParams();
  updateExportLink();
  try {
    const response = await fetch(`/api/dashboard?${params}`, { cache: "no-store" });
    if (!response.ok) throw new Error(t("common.httpError", { status: response.status }));
    const data = await response.json();
    if (requestId !== dashboardRequestId) return;
    dashboardDataLoaded = true;
    renderDevices(data.devices);
    renderLogs(data.logs, data.total, data.page);
    dashboardErrorState = null;
    elements.error.hidden = true;
  } catch (error) {
    if (requestId !== dashboardRequestId) return;
    dashboardErrorState = {
      key: "errors.dashboardLoad",
      error,
    };
    elements.error.textContent = dashboardErrorText(dashboardErrorState);
    elements.error.hidden = false;
    if (!document.getElementById("settings-view").hidden) {
      showSettingsNotice("errors.settingsLoad", { error }, true);
    }
  }
}

function refreshVisibleView() {
  const currentView = document.querySelector(".page-view:not([hidden])");
  if (currentView && currentView.id === "dashboard-view") {
    refreshSummary();
  } else {
    refresh();
  }
}

function updateConnectionStatus() {
  elements.connection.classList.remove("online", "warning");
  if (databaseStatusChecking) {
    elements.connection.textContent = databaseStatus.backend === "mysql"
      ? t("connection.checkingMysql")
      : t("connection.checkingDatabase");
    elements.connection.classList.add("warning");
    return;
  }
  if (databaseStatus.connected === false) {
    elements.connection.textContent = databaseStatus.backend === "mysql"
      ? t("connection.mysqlDisconnected")
      : t("connection.databaseDisconnected");
    elements.connection.classList.add("warning");
    return;
  }
  if (eventStreamConnected) {
    elements.connection.textContent = t("connection.connected");
    elements.connection.classList.add("online");
    return;
  }
  elements.connection.textContent = t("connection.reconnecting");
}

async function refreshDatabaseStatus() {
  const requestId = ++databaseStatusRequestId;
  databaseStatusChecking = true;
  updateConnectionStatus();
  try {
    const response = await fetch("/api/database/status", { cache: "no-store" });
    if (!response.ok) throw new Error(t("common.httpError", { status: response.status }));
    const status = await response.json();
    if (!["mysql", "sqlite"].includes(status.backend) || typeof status.connected !== "boolean") {
      throw new Error(t("errors.databaseStatusInvalid"));
    }
    if (requestId === databaseStatusRequestId) databaseStatus = status;
  } catch (error) {
    console.error(t("errors.databaseStatusCheck"), error);
  } finally {
    if (requestId === databaseStatusRequestId) {
      databaseStatusChecking = false;
      updateConnectionStatus();
    }
  }
}

function handleDatabaseStatusEvent(event) {
  try {
    const status = JSON.parse(event.data);
    if (
      !["mysql", "sqlite"].includes(status.backend)
      || (status.connected !== null && typeof status.connected !== "boolean")
    ) {
      throw new Error(t("errors.databaseStatusInvalid"));
    }
    databaseStatusRequestId += 1;
    databaseStatus = status;
    if (status.connected === null) {
      refreshDatabaseStatus();
      return;
    }
    databaseStatusChecking = false;
    updateConnectionStatus();
  } catch (error) {
    console.error(t("errors.databaseStatusEvent"), error);
  }
}

function showSettingsNotice(key, values = {}, isError = false) {
  settingsNoticeState = { key, values, isError };
  elements.settingsNotice.textContent = noticeText(settingsNoticeState);
  elements.settingsNotice.className = isError ? "notice error" : "notice success";
  elements.settingsNotice.hidden = false;
}

function showDatabaseNotice(key, values = {}, isError = false) {
  databaseNoticeState = { key, values, isError };
  elements.databaseNotice.textContent = noticeText(databaseNoticeState);
  elements.databaseNotice.className = isError ? "notice error" : "notice success";
  elements.databaseNotice.hidden = false;
}

function finishConfirmation(confirmed) {
  if (!elements.confirmationDialog.open) return;
  elements.confirmationDialog.close();
  const resolve = resolveConfirmation;
  resolveConfirmation = null;
  if (resolve) resolve(confirmed);
}

function confirmAction(title, message, confirmText, isDanger = false) {
  elements.confirmationTitle.textContent = title;
  elements.confirmationMessage.textContent = message;
  elements.confirmationConfirm.textContent = confirmText;
  elements.confirmationConfirm.className = isDanger ? "button danger" : "button";
  return new Promise((resolve) => {
    resolveConfirmation = resolve;
    elements.confirmationDialog.showModal();
  });
}

function updatePasswordField() {
  const useEmptyPassword = elements.databaseClearPassword.checked;
  elements.databasePassword.required = !useEmptyPassword;
  elements.databasePassword.disabled = useEmptyPassword;
  elements.databasePassword.placeholder = useEmptyPassword
    ? t("settings.passwordMayBeEmpty")
    : t("settings.enterMysqlPassword");
  if (useEmptyPassword) elements.databasePassword.value = "";
}

async function loadDatabaseSettings() {
  try {
    const response = await fetch("/api/settings/database", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t("common.httpError", { status: response.status }));
    elements.databaseBackend.value = result.backend;
    savedSqliteName = result.sqlite_name;
    savedMysqlDatabase = result.mysql.database;
    databaseNameBackend = result.backend;
    elements.databaseName.value = result.backend === "sqlite" ? savedSqliteName : savedMysqlDatabase;
    elements.databaseName.maxLength = result.backend === "sqlite" ? 67 : 64;
    elements.databaseHost.value = result.mysql.host;
    elements.databasePort.value = result.mysql.port;
    elements.databaseUser.value = result.mysql.user;
    elements.databasePassword.value = "";
    elements.databaseClearPassword.checked = !result.mysql.password_set;
    updatePasswordField();
  } catch (error) {
    showDatabaseNotice("settings.databaseLoadFailed", { error }, true);
  }
}

elements.databaseClearPassword.addEventListener("change", updatePasswordField);
elements.appearanceTheme.addEventListener("change", (event) => {
  const theme = event.target.value;
  if (!APPEARANCE_THEMES.includes(theme)) return;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("rekabsen-theme", theme);
  updateExportLink();
});
elements.appearanceStyle.addEventListener("change", () => {
  const style = elements.appearanceStyle.value;
  if (!UI_STYLES.includes(style)) return;
  document.documentElement.dataset.uiStyle = style;
  localStorage.setItem("rekabsen-ui-style", style);
  updateNavIndicator();
});
elements.appearanceLanguage.addEventListener("change", () => {
  const language = elements.appearanceLanguage.value;
  if (!LANGUAGES.includes(language)) return;
  localStorage.setItem("rekabsen-language", language);
  applyLanguage(language);
  updateExportLink();
});
elements.pageSize.addEventListener("change", () => {
  const pageSize = Number(elements.pageSize.value);
  if (!PAGE_SIZE_OPTIONS.includes(pageSize)) return;
  localStorage.setItem("rekabsen-page-size", String(pageSize));
  currentPage = 1;
  refresh();
});
elements.previousPage.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  refresh();
});
elements.paginationPages.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) return;
  const page = Number(button.dataset.page);
  if (!Number.isInteger(page) || page === currentPage) return;
  currentPage = page;
  refresh();
});
elements.nextPage.addEventListener("click", () => {
  currentPage += 1;
  refresh();
});
elements.confirmationConfirm.addEventListener("click", () => finishConfirmation(true));
elements.confirmationCancel.addEventListener("click", () => finishConfirmation(false));
elements.confirmationDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishConfirmation(false);
});
elements.confirmationDialog.addEventListener("click", (event) => {
  if (event.target === elements.confirmationDialog) finishConfirmation(false);
});

elements.databaseBackend.addEventListener("change", () => {
  if (databaseNameBackend === "sqlite") {
    savedSqliteName = elements.databaseName.value;
  } else {
    savedMysqlDatabase = elements.databaseName.value;
  }
  databaseNameBackend = elements.databaseBackend.value;
  elements.databaseName.value = databaseNameBackend === "sqlite"
    ? savedSqliteName
    : savedMysqlDatabase;
  elements.databaseName.maxLength = databaseNameBackend === "sqlite" ? 67 : 64;
});

document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const viewId = button.dataset.view;
    document.querySelectorAll(".page-view").forEach((view) => {
      view.hidden = view.id !== viewId;
    });
    document.querySelectorAll(".sidebar-nav .nav-item").forEach((item) => {
      const active = item.dataset.view === viewId;
      item.classList.toggle("active", active);
      if (active) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
    updateNavIndicator();

    const settingsOpen = viewId === "settings-view";
    updatePageHeader(viewId);
    if (settingsOpen) {
      refresh();
      loadDatabaseSettings();
    } else if (viewId === "dashboard-view") {
      refreshSummary();
    } else {
      refresh();
    }
  });
});

elements.databaseSettings.addEventListener("submit", async (event) => {
  event.preventDefault();
  const backend = elements.databaseBackend.value;
  const transfer = elements.databaseTransfer.value;
  const backendName = backend === "mysql" ? "MySQL Server" : "SQLite";
  const databaseName = elements.databaseName.value.trim();
  const sqliteName = backend === "sqlite" ? databaseName : savedSqliteName;
  const mysqlDatabase = backend === "mysql" ? databaseName : savedMysqlDatabase;
  const transferDescription = t(transfer === "migrate"
    ? "settings.transferMigrate"
    : "settings.transferEmpty");
  const destinationDescription = backend === "sqlite"
    ? t("settings.destinationSqlite", {
      file: databaseName.toLowerCase().endsWith(".db") ? databaseName : `${databaseName}.db`,
    })
    : t("settings.destinationMysql", { name: mysqlDatabase });
  const confirmed = await confirmAction(
    t("settings.confirmDatabaseTitle", { backend: backendName }),
    `${destinationDescription}\n\n${transferDescription}`,
    t("settings.confirmApply"),
  );
  if (!confirmed) return;

  const button = document.getElementById("save-database");
  button.disabled = true;
  try {
    const response = await fetch("/api/settings/database", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        backend,
        transfer,
        sqlite_name: sqliteName,
        mysql: {
          host: elements.databaseHost.value,
          port: elements.databasePort.value,
          database: mysqlDatabase,
          user: elements.databaseUser.value,
          password: elements.databasePassword.value,
          clear_password: elements.databaseClearPassword.checked,
        },
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t("common.httpError", { status: response.status }));
    elements.databaseBackend.value = result.backend;
    savedSqliteName = result.sqlite_name;
    savedMysqlDatabase = result.mysql.database;
    databaseNameBackend = result.backend;
    elements.databaseName.value = result.backend === "sqlite" ? savedSqliteName : savedMysqlDatabase;
    elements.databaseName.maxLength = result.backend === "sqlite" ? 67 : 64;
    elements.databasePassword.value = "";
    elements.databaseClearPassword.checked = !result.mysql.password_set;
    updatePasswordField();
    showDatabaseNotice("settings.databaseChanged", {
      backend: result.backend === "mysql" ? "MySQL Server" : "SQLite",
    });
    await refresh();
  } catch (error) {
    showDatabaseNotice("settings.databaseChangeFailed", { error }, true);
    await loadDatabaseSettings();
  } finally {
    button.disabled = false;
  }
});

elements.deviceSettings.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-save-sn]");
  if (!button) return;

  const input = button.closest("tr").querySelector("input[data-sn]");
  button.disabled = true;
  try {
    const response = await fetch("/api/devices/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sn: input.dataset.sn, name: input.value }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t("common.httpError", { status: response.status }));
    input.value = result.name;
    showSettingsNotice("settings.deviceNameSaved", { sn: result.sn });
    await refresh();
  } catch (error) {
    showSettingsNotice("settings.deviceNameSaveFailed", { error }, true);
  } finally {
    button.disabled = false;
  }
});

let searchTimer;
elements.filters.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPage = 1;
  refresh();
});
elements.clearData.addEventListener("click", async () => {
  const confirmed = await confirmAction(
    t("errors.clearTitle"),
    t("errors.clearMessage"),
    t("errors.clearConfirm"),
    true,
  );
  if (!confirmed) return;

  try {
    const response = await fetch("/api/clear", { method: "POST" });
    if (!response.ok) throw new Error(t("common.httpError", { status: response.status }));
    await refresh();
    await refreshSummary();
  } catch (error) {
    dashboardErrorState = {
      key: "errors.clearFailed",
      error,
    };
    elements.error.textContent = dashboardErrorText(dashboardErrorState);
    elements.error.hidden = false;
  }
});
elements.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  currentPage = 1;
  searchTimer = setTimeout(refresh, 300);
});
elements.searchBy.addEventListener("change", () => {
  elements.search.type = elements.searchBy.value === "ts" ? "date" : "search";
  elements.search.value = "";
  currentPage = 1;
  refresh();
});
elements.datePickerButton.addEventListener("click", () => {
  if (typeof elements.dateInput.showPicker === "function") {
    elements.dateInput.showPicker();
  } else {
    elements.dateInput.click();
  }
});
elements.dateInput.addEventListener("change", () => {
  dashboardDate = elements.dateInput.value || localDateValue();
  elements.dateInput.value = dashboardDate;
  updateDateDisplay();
  currentPage = 1;
  refresh();
});
elements.sortHeaders.forEach((button) => {
  button.addEventListener("click", () => {
    const column = button.dataset.sort;
    if (!SORT_COLUMNS.includes(column)) return;
    if (column === sortBy) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortBy = column;
    }
    updateSortHeaders();
    currentPage = 1;
    refresh();
  });
});

elements.changePassword.addEventListener("click", () => {
  elements.passwordForm.reset();
  elements.passwordChangeError.hidden = true;
  elements.passwordModal.showModal();
  elements.oldPassword.focus();
});
elements.cancelPasswordChange.addEventListener("click", () => {
  elements.passwordModal.close();
});
elements.passwordModal.addEventListener("click", (event) => {
  if (event.target === elements.passwordModal) elements.passwordModal.close();
});
elements.passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (elements.newPassword.value !== elements.confirmNewPassword.value) {
    elements.passwordChangeError.textContent = t("auth.passwordMismatch");
    elements.passwordChangeError.hidden = false;
    return;
  }

  elements.savePasswordChange.disabled = true;
  elements.passwordChangeError.hidden = true;
  try {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        old_password: elements.oldPassword.value,
        new_password: elements.newPassword.value,
        confirm_password: elements.confirmNewPassword.value,
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || t("common.httpError", { status: response.status }));
    elements.passwordModal.close();
    elements.passwordForm.reset();
    elements.authNotice.textContent = t("auth.passwordChanged");
    elements.authNotice.hidden = false;
    window.setTimeout(() => {
      elements.authNotice.hidden = true;
    }, 5000);
  } catch (error) {
    elements.passwordChangeError.textContent = localizeError(error);
    elements.passwordChangeError.hidden = false;
  } finally {
    elements.savePasswordChange.disabled = false;
  }
});

elements.logout.addEventListener("click", async () => {
  elements.logout.disabled = true;
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error(t("common.httpError", { status: response.status }));
    window.location.replace("/");
  } catch (error) {
    elements.logout.disabled = false;
    window.alert(`Gagal logout: ${error.message}`);
  }
});

const events = new EventSource("/events");
events.onopen = () => {
  eventStreamConnected = true;
  updateConnectionStatus();
  refreshVisibleView();
  refreshDatabaseStatus();
};
events.onerror = () => {
  eventStreamConnected = false;
  updateConnectionStatus();
};
events.addEventListener("attlog", refreshVisibleView);
events.addEventListener("database", handleDatabaseStatusEvent);
events.addEventListener("auth", () => window.location.replace("/"));
