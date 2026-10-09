// Prototype entry module (research R-01, R-02, R-06; contract §3 processing order).
// Loads the shared @theme, then the pinned Tailwind browser build, then runs
// include → i18n → state, and finally reveals the page.

import { bindCelebration, celebrate } from "./celebrate.js";
import { applyIncludes, markCurrentLinks } from "./include.js";
import { LANGS, applyI18n, getLang, setLang, translate } from "./i18n.js";
import { THEMES, applyTheme, getTheme, setTheme, syncThemeSwitchers } from "./theme.js";
import { applyState, bindNavigation, decorateLinks, isPanelHidden, renderPanel, resolveState } from "./state.js";

const TAILWIND_URL = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3";
const ASSETS_URL = new URL("../", import.meta.url);
const PROTOTYPE_ROOT = new URL("../../", import.meta.url);
const REVEAL_FALLBACK_MS = 10000;

function reveal() {
  document.body.removeAttribute("data-cloak");
}

// Self-hosted Literata and Atkinson Hyperlegible Next: preload the Latin files so text paints in the
// brand faces on first reveal.
function loadFonts() {
  const preloads = ["literata-latin-opsz-normal.woff2", "atkinson-hyperlegible-next-latin-wght-normal.woff2"].map((file) => {
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "font";
    preload.type = "font/woff2";
    preload.crossOrigin = "anonymous";
    preload.href = new URL(`fonts/${file}`, ASSETS_URL).href;
    return preload;
  });
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = new URL("fonts/fonts.css", ASSETS_URL).href;
  document.head.append(...preloads, sheet);
}

async function loadTheme() {
  const res = await fetch(new URL("theme.css", ASSETS_URL));
  const theme = await res.text();
  const style = document.createElement("style");
  style.type = "text/tailwindcss";
  style.textContent = `@import "tailwindcss";\n${theme}`;
  document.head.append(style);
}

function injectScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = TAILWIND_URL;
    script.addEventListener("load", () => resolve(true), { once: true });
    script.addEventListener(
      "error",
      () => {
        script.remove();
        resolve(false);
      },
      { once: true }
    );
    document.head.append(script);
  });
}

async function loadTailwind() {
  // One retry: a transient CDN failure would otherwise reveal an unstyled page.
  if (!(await injectScript())) await injectScript();
}

// The browser build generates CSS asynchronously after its script loads. The page is ready once
// a theme variable used by the body (bg-surface) is defined.
function stylesReady(timeoutMs = 3000) {
  const start = performance.now();
  return new Promise((resolve) => {
    const check = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim();
      if (value || performance.now() - start > timeoutMs) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}

async function loadManifestEntry() {
  try {
    const res = await fetch(new URL("pages.json", ASSETS_URL));
    const pages = await res.json();
    const path = decodeURIComponent(window.location.pathname).replace(PROTOTYPE_ROOT.pathname, "");
    return pages.find((page) => page.path === path) ?? null;
  } catch {
    return null;
  }
}

function syncLanguageSwitchers(lang) {
  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-set-lang") === lang));
  });
}

async function localize(entry, lang) {
  const dict = await applyI18n(document, lang);
  if (entry?.titleKey) {
    document.title = `${translate(dict, entry.titleKey, {}, lang)} · ${translate(dict, "prototype.titleSuffix", {}, lang)}`;
  }
  syncLanguageSwitchers(lang);
}

function bindLanguageSwitch(entry) {
  document.addEventListener("click", async (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-set-lang]") : null;
    if (!button) return;
    const lang = button.getAttribute("data-set-lang");
    if (!LANGS.includes(lang)) return;
    setLang(lang);
    await localize(entry, lang);
  });
}

function bindThemeSwitch() {
  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-set-theme]") : null;
    if (!button) return;
    const theme = button.getAttribute("data-set-theme");
    if (THEMES.includes(theme)) setTheme(theme);
  });
}

async function start() {
  // First: an explicit light/dark choice must apply before anything paints.
  const theme = getTheme();
  applyTheme(theme);
  const fallback = setTimeout(reveal, REVEAL_FALLBACK_MS);
  loadFonts();
  const tailwindReady = loadTheme().then(loadTailwind);

  const [entry] = await Promise.all([loadManifestEntry(), applyIncludes(document)]);

  if (entry && !isPanelHidden()) renderPanel(entry, resolveState(entry));
  await localize(entry, getLang());
  syncThemeSwitchers(theme);
  markCurrentLinks(document.body);
  decorateLinks(document.body);
  if (entry) applyState(document.body, entry);
  bindNavigation(document.body);
  bindLanguageSwitch(entry);
  bindThemeSwitch();

  await tailwindReady;
  await stylesReady();
  clearTimeout(fallback);
  reveal();
  // After reveal, so the moment is actually seen; later state switches can trigger it too.
  bindCelebration(document.body);
  celebrate(document.body);
}

start();
