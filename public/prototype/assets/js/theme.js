// Color scheme preference: system (default), light or dark. The tokens in theme.css carry both
// values with light-dark(); this module only sets data-theme on <html> for an explicit choice.
// localStorage holds the choice, never personal data (Constitution VII).

export const THEME_KEY = "docentai.prototype.theme";
export const THEMES = ["system", "light", "dark"];
const DEFAULT_THEME = "system";

function readStored() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function writeStored(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the choice then lasts for this page only.
  }
}

export function getTheme(search = window.location.search) {
  const fromUrl = new URLSearchParams(search).get("theme");
  if (THEMES.includes(fromUrl)) return fromUrl;
  const stored = readStored();
  if (THEMES.includes(stored)) return stored;
  return DEFAULT_THEME;
}

export function applyTheme(theme, root = document.documentElement) {
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
}

export function syncThemeSwitchers(theme, scope = document) {
  scope.querySelectorAll("[data-set-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-set-theme") === theme));
  });
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  writeStored(theme);
  // ?theme= wins over storage, so keep it in step when a session link carries it.
  const url = new URL(window.location.href);
  if (url.searchParams.has("theme")) {
    url.searchParams.set("theme", theme);
    window.history.replaceState(window.history.state, "", url);
  }
  applyTheme(theme);
  syncThemeSwitchers(theme);
}
