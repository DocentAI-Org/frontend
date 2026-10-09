// Constitution VIII: ES and EN complete; every key used by a page exists in both (contract §5).
import { describe, expect, it } from "vitest";
import { flattenKeys, listFiles, parseHtml, read, readJson } from "./files.js";

const LANGS = ["es", "en"];
const messages = Object.fromEntries(LANGS.map((l) => [l, new Set(flattenKeys(readJson(`assets/messages/${l}.json`)))]));
const sample = Object.fromEntries(LANGS.map((l) => [l, new Set(flattenKeys(readJson(`assets/sample/${l}.json`)))]));
const has = (lang, key) => (key.startsWith("sample.") ? sample[lang].has(key) : messages[lang].has(key));

function keysUsedInHtml() {
  const used = [];
  for (const file of listFiles(".html")) {
    const doc = parseHtml(file);
    doc.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (el.hasAttribute("data-i18n-count")) used.push([file, `${key}_one`], [file, `${key}_other`]);
      else used.push([file, key]);
    });
    doc.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      for (const pair of el.getAttribute("data-i18n-attr").split(";")) {
        const key = pair.split(":")[1]?.trim();
        if (key) used.push([file, key]);
      }
    });
    doc.querySelectorAll("[data-i18n-vars]").forEach((el) => {
      for (const value of Object.values(JSON.parse(el.getAttribute("data-i18n-vars")))) {
        if (typeof value === "string" && value.startsWith("sample.")) used.push([file, value]);
      }
    });
  }
  return used;
}

function keysUsedInScriptsAndManifest() {
  const used = [];
  for (const file of listFiles(".js").filter((f) => f.startsWith("assets/js/"))) {
    for (const m of read(file).matchAll(/["'`]((?:prototype|common)\.[A-Za-z0-9_.]+)["'`]/g)) used.push([file, m[1]]);
  }
  for (const lang of LANGS) used.push(["assets/js/state.js", `common.language.${lang}`]);
  for (const page of readJson("assets/pages.json")) used.push(["assets/pages.json", page.titleKey]);
  return used;
}

describe("message files", () => {
  it("es and en have the same keys", () => {
    const onlyEs = [...messages.es].filter((k) => !messages.en.has(k));
    const onlyEn = [...messages.en].filter((k) => !messages.es.has(k));
    expect({ onlyEs, onlyEn }).toEqual({ onlyEs: [], onlyEn: [] });
  });

  it("sample es and en have the same keys", () => {
    const onlyEs = [...sample.es].filter((k) => !sample.en.has(k));
    const onlyEn = [...sample.en].filter((k) => !sample.es.has(k));
    expect({ onlyEs, onlyEn }).toEqual({ onlyEs: [], onlyEn: [] });
  });

  it("every key used in a page, script or the manifest exists in both languages", () => {
    const missing = [...keysUsedInHtml(), ...keysUsedInScriptsAndManifest()]
      .flatMap(([file, key]) => LANGS.filter((l) => !has(l, key)).map((l) => `${file}: ${key} (${l})`));
    expect([...new Set(missing)]).toEqual([]);
  });
});
