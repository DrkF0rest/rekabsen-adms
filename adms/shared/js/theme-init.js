(() => {
  const themes = ["aqua", "lime", "orange", "grape", "pink", "graphite"];
  const uiStyles = ["web20", "modern", "windows-95"];
  const savedTheme = localStorage.getItem("rekabsen-theme");
  if (themes.includes(savedTheme)) {
    document.documentElement.dataset.theme = savedTheme;
  }

  document.documentElement.lang =
    localStorage.getItem("rekabsen-language") === "id" ? "id" : "en";
  const savedUiStyle = localStorage.getItem("rekabsen-ui-style");
  const uiStyle = savedUiStyle === "windows-nt" ? "windows-95" : savedUiStyle;
  document.documentElement.dataset.uiStyle = uiStyles.includes(uiStyle)
    ? uiStyle
    : "web20";
  if (uiStyle !== savedUiStyle && uiStyles.includes(uiStyle)) {
    localStorage.setItem("rekabsen-ui-style", uiStyle);
  }
})();
