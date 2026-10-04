// SC-005 / T100: the manifest covers every page and state in the contract and plan.md, with the
// mobile flag matching the plan's "M" column.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readJson } from "./files.js";

const SPEC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../specs/001-mvp-prototype");
const pages = Object.fromEntries(readJson("assets/pages.json").map((p) => [p.path, p]));

function contractStates() {
  const text = fs.readFileSync(path.join(SPEC, "contracts/prototype-pages.md"), "utf8");
  const rows = {};
  for (const m of text.matchAll(/^\| [\d–]+ \| `([^`?]+\.html)` \| ([^|]+) \|$/gm)) {
    rows[m[1]] = m[2].split(",").map((s) => s.replace(/\(.*?\)/g, "").trim()).filter(Boolean);
  }
  return rows;
}

function planMobile() {
  const text = fs.readFileSync(path.join(SPEC, "plan.md"), "utf8");
  const rows = {};
  for (const m of text.matchAll(/^\| \d+ \|[^|]+\|[^|]+\| `([^`?]+\.html)` \|.*\| ([✓—]) \|$/gm)) rows[m[1]] = m[2] === "✓";
  return rows;
}

describe("coverage against the contract and plan", () => {
  const contract = contractStates();
  const mobile = planMobile();

  it("finds all 31 pages in the contract and the plan", () => {
    expect(Object.keys(contract)).toHaveLength(31);
    expect(Object.keys(mobile)).toHaveLength(31);
  });

  it("has a manifest entry for every contract page", () => {
    expect(Object.keys(contract).filter((p) => !pages[p])).toEqual([]);
  });

  it.each(Object.entries(contractStates()))("%s declares every contract state", (p, states) => {
    expect(states.filter((s) => !pages[p]?.states.includes(s))).toEqual([]);
  });

  it.each(Object.entries(planMobile()))("%s mobile flag matches the plan", (p, m) => {
    expect(pages[p]?.mobile).toBe(m);
  });
});
