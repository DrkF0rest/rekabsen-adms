(() => {
  const passwordMinLength = 8;
  const language = document.documentElement.lang === "id" ? "id" : "en";
  const translations = {
    en: {
      setupTitle: "Create application password",
      setupDescription: "Create a password to secure the REKABSEN dashboard.",
      loginTitle: "Log in to REKABSEN",
      loginDescription: "Enter your password to open the dashboard.",
      passwordLabel: `Password (at least ${passwordMinLength} characters)`,
      confirmationLabel: "Confirm password",
      setupButton: "Save password",
      loginButton: "Login",
      passwordMismatch: "Passwords do not match.",
      authFailure: "Authentication failed.",
      networkFailure: "Unable to connect to the server.",
      errors: {
        "Request body must be a JSON object.": "Request body must be a JSON object.",
        "Request body must be valid JSON.": "Request body must be valid JSON.",
        "Password must be text.": "Password must be text.",
        "Password must be at most 128 characters.": "Password must be at most 128 characters.",
        [`Password must be between ${passwordMinLength} and 128 characters.`]:
          `Password must be between ${passwordMinLength} and 128 characters.`,
        "The application password is already set.": "The application password is already set.",
        "Too many attempts. Try again in 5 minutes.": "Too many attempts. Try again in 5 minutes.",
        "Password has not been set.": "Password has not been set.",
        "Incorrect password.": "Incorrect password.",
      },
    },
    id: {
      setupTitle: "Buat password aplikasi",
      setupDescription: "Buat password untuk mengamankan dashboard REKABSEN.",
      loginTitle: "Login REKABSEN",
      loginDescription: "Masukkan password untuk membuka dashboard.",
      passwordLabel: `Password (minimal ${passwordMinLength} karakter)`,
      confirmationLabel: "Ulangi password",
      setupButton: "Simpan password",
      loginButton: "Login",
      passwordMismatch: "Password tidak sama.",
      authFailure: "Autentikasi gagal.",
      networkFailure: "Tidak dapat menghubungi server.",
      errors: {
        "Request body must be a JSON object.": "Body harus berupa objek JSON.",
        "Request body must be valid JSON.": "Body harus berupa JSON yang valid.",
        "Password must be text.": "Password wajib berupa teks.",
        "Password must be at most 128 characters.": "Password maksimal 128 karakter.",
        [`Password must be between ${passwordMinLength} and 128 characters.`]:
          `Password harus terdiri dari ${passwordMinLength} sampai 128 karakter.`,
        "The application password is already set.": "Password aplikasi sudah dibuat.",
        "Too many attempts. Try again in 5 minutes.": "Terlalu banyak percobaan. Coba lagi dalam 5 menit.",
        "Password has not been set.": "Password belum dibuat.",
        "Incorrect password.": "Password salah.",
      },
    },
  };
  const messages = translations[language];
  const title = document.getElementById("auth-title");
  const description = document.getElementById("auth-description");
  const passwordLabel = document.getElementById("password-label");
  const password = document.getElementById("password");
  const confirmationField = document.getElementById("confirmation-field");
  const confirmationLabel = document.getElementById("confirm-password-label");
  const confirmation = document.getElementById("confirm-password");
  const submit = document.getElementById("submit");
  const error = document.getElementById("error");
  const form = document.getElementById("auth-form");
  let setupRequired = false;

  document.getElementById("copyright-year").textContent = String(new Date().getFullYear());

  function renderMode() {
    title.textContent = setupRequired ? messages.setupTitle : messages.loginTitle;
    description.textContent = setupRequired
      ? messages.setupDescription
      : messages.loginDescription;
    passwordLabel.textContent = messages.passwordLabel;
    password.autocomplete = setupRequired ? "new-password" : "current-password";
    confirmationField.hidden = !setupRequired;
    confirmation.required = setupRequired;
    confirmation.disabled = !setupRequired;
    confirmationLabel.textContent = messages.confirmationLabel;
    submit.textContent = setupRequired ? messages.setupButton : messages.loginButton;
    submit.disabled = false;
  }

  async function loadAuthMode() {
    try {
      const response = await fetch("/api/auth/status", { cache: "no-store" });
      if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
      const status = await response.json();
      if (!status || typeof status.configured !== "boolean") {
        throw new Error("Invalid authentication status response.");
      }
      setupRequired = !status.configured;
      renderMode();
    } catch (cause) {
      error.textContent = cause instanceof TypeError
        ? messages.networkFailure
        : cause.message || messages.authFailure;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (setupRequired && password.value !== confirmation.value) {
      error.textContent = messages.passwordMismatch;
      return;
    }

    submit.disabled = true;
    error.textContent = "";
    try {
      const response = await fetch(
        setupRequired ? "/api/auth/setup" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password.value }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || messages.authFailure);
      window.location.replace("/");
    } catch (cause) {
      const message = cause && typeof cause.message === "string"
        ? cause.message
        : messages.authFailure;
      error.textContent = cause instanceof TypeError
        ? messages.networkFailure
        : messages.errors[message] || message;
      submit.disabled = false;
    }
  });

  loadAuthMode();
})();
