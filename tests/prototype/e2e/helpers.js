// Shared helpers for the prototype E2E tests (tasks T036).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test as base } from "@playwright/test";

export { expect };

const TAILWIND_CDN = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3";
const TAILWIND_LOCAL = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../node_modules/@tailwindcss/browser/dist/index.global.js"
);

/**
 * Every test serves the pinned Tailwind browser build from node_modules (same version, byte-identical)
 * instead of jsDelivr, so hundreds of page loads don't depend on the CDN's speed or availability.
 * The prototype itself still loads it from the CDN.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route(`${TAILWIND_CDN}*`, (route) =>
      route.fulfill({ path: TAILWIND_LOCAL, contentType: "text/javascript; charset=utf-8" })
    );
    await provide(page);
  }
});

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
  // The runtime can reveal an unstyled page as a last resort; make that a clear failure here.
  await page.waitForFunction(
    () => getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim() !== "",
    null,
    { timeout: 5_000 }
  );
}

/** One acceptance scenario = one test, titled with its ID (Constitution V). */
export function scenario(id, title, fn) {
  test(`${id} ${title}`, fn);
}

/** Visible text never contains an unresolved copy key. */
export async function expectNoMissingKeys(page) {
  await expect(page.locator("body")).not.toContainText("⟦");
}
