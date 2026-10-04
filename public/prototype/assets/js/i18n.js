// Copy, plurals, dates and numbers for the prototype (contract §3, §5; research R-09).

export const LANG_KEY = "docentai.prototype.lang";
export const LANGS = ["es", "en"];
const DEFAULT_LANG = "es";

const ASSETS_URL = new URL("../", import.meta.url);
const cache = new Map();

function readStored() {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

function writeStored(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage can be blocked (private mode); the URL still carries the language.
  }
}

export function getLang(search = window.location.search) {
  const fromUrl = new URLSearchParams(search).get("lang");
  if (LANGS.includes(fromUrl)) return fromUrl;
  const stored = readStored();
  if (LANGS.includes(stored)) return stored;
  return DEFAULT_LANG;
}

export function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  writeStored(lang);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState(window.history.state, "", url);
  document.documentElement.lang = lang;
}

export async function loadMessages(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const [messages, sample] = await Promise.all(
    [`messages/${lang}.json`, `sample/${lang}.json`].map(async (path) => {
      const res = await fetch(new URL(path, ASSETS_URL));
      if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
      return res.json();
    })
  );
  const dict = { ...messages, sample: sample.sample ?? {} };
  cache.set(lang, dict);
  return dict;
}

export function lookup(dict, key) {
  const value = key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dict);
  return typeof value === "string" ? value : undefined;
}

function parseLocalDate(value) {
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0] = timePart ? timePart.split(":").map(Number) : [];
  return new Date(y, m - 1, d, hh, mm);
}

export function formatDate(value, lang) {
  const hasTime = value.includes("T");
  return new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {})
  })
    .format(parseLocalDate(value))
    .replace(/\.(?=\s|,|$)/g, "");
}

export function formatNumber(value, lang) {
  return new Intl.NumberFormat(lang).format(Number(value));
}

function resolveVar(dict, value, lang) {
  if (typeof value !== "string") return String(value);
  if (value.startsWith("sample.")) return lookup(dict, value) ?? `⟦${value}⟧`;
  if (value.startsWith("date:")) return formatDate(value.slice(5), lang);
  if (value.startsWith("number:")) return formatNumber(value.slice(7), lang);
  if (value.startsWith("percent:")) {
    return new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 0 }).format(Number(value.slice(8)));
  }
  return value;
}

export function translate(dict, key, { count, vars } = {}, lang = DEFAULT_LANG) {
  let fullKey = key;
  if (count !== undefined && count !== null) {
    const category = new Intl.PluralRules(lang).select(Number(count));
    fullKey = lookup(dict, `${key}_${category}`) !== undefined ? `${key}_${category}` : `${key}_other`;
  }
  const template = lookup(dict, fullKey);
  if (template === undefined) return `⟦${fullKey}⟧`;
  const values = { ...(vars ?? {}) };
  if (count !== undefined && count !== null) values.count = formatNumber(count, lang);
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in values ? resolveVar(dict, values[name], lang) : match
  );
}

function readVars(el) {
  const raw = el.getAttribute("data-i18n-vars");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function applyI18nWith(root, dict, lang) {
  const scope = root.querySelectorAll ? root : document;
  const each = (selector, fn) => {
    if (root.matches?.(selector)) fn(root);
    scope.querySelectorAll(selector).forEach(fn);
  };

  each("[data-i18n]", (el) => {
    const count = el.getAttribute("data-i18n-count");
    el.textContent = translate(
      dict,
      el.getAttribute("data-i18n"),
      { count: count === null ? undefined : count, vars: readVars(el) },
      lang
    );
  });

  each("[data-i18n-attr]", (el) => {
    for (const pair of el.getAttribute("data-i18n-attr").split(";")) {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, translate(dict, key, { vars: readVars(el) }, lang));
    }
  });

  each("[data-i18n-date]", (el) => {
    el.textContent = formatDate(el.getAttribute("data-i18n-date"), lang);
    if (el.tagName === "TIME" && !el.hasAttribute("datetime")) {
      el.setAttribute("datetime", el.getAttribute("data-i18n-date"));
    }
  });

  each("[data-i18n-number]", (el) => {
    el.textContent = formatNumber(el.getAttribute("data-i18n-number"), lang);
  });

  document.documentElement.lang = lang;
}

export async function applyI18n(root = document, lang = getLang()) {
  const dict = await loadMessages(lang);
  applyI18nWith(root, dict, lang);
  return dict;
}
