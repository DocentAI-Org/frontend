// Contract §2: the page manifest and the page files agree.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, listFiles, parseHtml, readJson } from "./files.js";

const pages = readJson("assets/pages.json");
const NOT_PAGES = ["index.html", "design-system.html"];
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("pages.json", () => {
  it("has an entry for every page and a file for every entry", () => {
    const files = listFiles(".html").filter((f) => !NOT_PAGES.includes(f) && !f.startsWith("partials/"));
    const paths = pages.map((p) => p.path);
    expect({
      withoutEntry: files.filter((f) => !paths.includes(f)),
      withoutFile: paths.filter((p) => !fs.existsSync(path.join(ROOT, p)))
    }).toEqual({ withoutEntry: [], withoutFile: [] });
  });

  it("has unique paths", () => {
    const paths = pages.map((p) => p.path);
    expect(paths.length).toBe(new Set(paths).size);
  });

  it.each(pages.map((p) => [p.path, p]))("%s has a valid entry", (_, page) => {
    expect(page.states[0]).toBe("default");
    expect(page.states.every((s) => KEBAB.test(s))).toBe(true);
    expect(page.states.length).toBe(new Set(page.states).size);
    expect(Array.isArray(page.screen) && page.screen.every(Number.isInteger)).toBe(true);
    expect(["all", "admin", "teacher", "student"]).toContain(page.role);
    expect(typeof page.titleKey).toBe("string");
    expect(page.stories.length).toBeGreaterThan(0);
    expect(page.requirements.length).toBeGreaterThan(0);
    expect(["P1", "P2", "P3"]).toContain(page.priority);
    expect(typeof page.mobile).toBe("boolean");
    for (const s of page.simulate ?? []) expect(page.states).toContain(s);
  });

  it.each(pages.map((p) => [p.path, p]))("%s uses only declared states", (_, page) => {
    const used = new Set();
    const doc = parseHtml(page.path);
    doc.querySelectorAll("[data-state]").forEach((el) =>
      el.getAttribute("data-state").split(/\s+/).filter(Boolean).forEach((s) => used.add(s))
    );
    doc.querySelectorAll("[data-goto], [data-advance]").forEach((el) =>
      used.add(el.getAttribute("data-goto") ?? el.getAttribute("data-advance"))
    );
    expect([...used].filter((s) => !page.states.includes(s))).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s gives every declared state some markup", (_, page) => {
    const doc = parseHtml(page.path);
    const marked = new Set();
    doc.querySelectorAll("[data-state]").forEach((el) =>
      el.getAttribute("data-state").split(/\s+/).forEach((s) => marked.add(s))
    );
    expect(page.states.filter((s) => !marked.has(s))).toEqual([]);
  });
});
