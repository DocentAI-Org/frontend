// Constitution IV: no raw colors or arbitrary values outside assets/theme.css.
import { describe, expect, it } from "vitest";
import { listFiles, parseHtml, read } from "./files.js";

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/;
const ARBITRARY = /\S-\[[^\]]+\]|\b[a-z-]+:\[[^\]]+\]/;

describe("no hardcoded visual values", () => {
  it("pages and partials use only token utilities", () => {
    const problems = [];
    for (const file of listFiles(".html")) {
      const doc = parseHtml(file);
      doc.querySelectorAll("[class]").forEach((el) => {
        const cls = el.getAttribute("class");
        if (ARBITRARY.test(cls) || COLOR.test(cls)) problems.push(`${file}: class="${cls}"`);
      });
      doc.querySelectorAll("[style]").forEach((el) => {
        if (COLOR.test(el.getAttribute("style"))) problems.push(`${file}: style="${el.getAttribute("style")}"`);
      });
      doc.querySelectorAll("style").forEach((el) => {
        if (COLOR.test(el.textContent)) problems.push(`${file}: <style> contains a raw color`);
      });
    }
    expect(problems).toEqual([]);
  });

  it("runtime scripts use only token utilities", () => {
    const problems = [];
    for (const file of listFiles(".js").filter((f) => f.startsWith("assets/js/"))) {
      read(file)
        .split("\n")
        .forEach((line, i) => {
          if (COLOR.test(line) || ARBITRARY.test(line)) problems.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(problems).toEqual([]);
  });
});
