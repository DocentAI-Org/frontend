// Shared helpers for the prototype E2E tests (tasks T036).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../public/prototype");

export function readManifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "assets/pages.json"), "utf8"));
}

export function manifestEntry(pagePath) {
  return readManifest().find((p) => p.path === pagePath);
}

/** Open a prototype page in a given state and wait until it is revealed. */
export async function gotoState(page, pagePath, state = "default", { lang = "es", panel = 0 } = {}) {
  const params = new URLSearchParams({ lang, panel: String(panel) });
  if (state && state !== "default") params.set("state", state);
  await page.goto(`/prototype/${pagePath}?${params}`);
  await waitForReady(page);
}

/** The runtime removes data-cloak once includes, copy, state and the Tailwind build are done. */
export async function waitForReady(page) {
  await expect(page.locator("body")).not.toHaveAttribute("data-cloak", { timeout: 15_000 });
}

/** One acceptance scenario = one test, titled with its ID (Constitution V). */
export function scenario(id, title, fn) {
  test(`${id} ${title}`, fn);
}

/** Visible text never contains an unresolved copy key. */
export async function expectNoMissingKeys(page) {
  await expect(page.locator("body")).not.toContainText("⟦");
}
