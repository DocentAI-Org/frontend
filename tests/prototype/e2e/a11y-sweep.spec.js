// Axe sweep: every manifest page × state, WCAG 2.2 A/AA, at 1440 px and (when mobile) 390 px (T037).
import AxeBuilder from "@axe-core/playwright";
import { expect, expectNoMissingKeys, gotoState, readManifest, test, waitForReady } from "./helpers.js";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function format(violations, where) {
  return violations
    .map((v) => `${where} — ${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(" ")}`).join("\n")}`)
    .join("\n");
}

async function audit(page, where) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(violations, format(violations, where)).toEqual([]);
}

for (const path of ["index.html", "design-system.html"]) {
  test(`axe ${path}`, async ({ page }) => {
    await page.goto(`/prototype/${path}?panel=0`);
    await waitForReady(page);
    await page.waitForLoadState("networkidle");
    await expectNoMissingKeys(page);
    await audit(page, path);
  });
}

for (const entry of readManifest()) {
  const langs = entry.priority === "P1" ? ["es", "en"] : ["es"];
  for (const state of entry.states) {
    for (const lang of langs) {
      test(`axe ${entry.path}?state=${state} [${lang}]`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name === "mobile" && !entry.mobile, "desktop-only page");
        await gotoState(page, entry.path, state, { lang });
        await expectNoMissingKeys(page);
        await audit(page, `${entry.path}?state=${state} [${lang}, ${testInfo.project.name}]`);
      });
    }
  }
}
