// Axe sweep: every manifest page × state, WCAG 2.2 A/AA, at 1440 px and (when mobile) 390 px (T037),
// in the light scheme and again in the dark scheme (Spanish only for dark: copy does not change colors).
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

const SCHEMES = ["light", "dark"];

for (const path of ["index.html", "design-system.html"]) {
  for (const scheme of SCHEMES) {
    test(`axe ${path} [${scheme}]`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`/prototype/${path}?panel=0`);
      await waitForReady(page);
      await page.waitForLoadState("networkidle");
      await expectNoMissingKeys(page);
      await audit(page, `${path} [${scheme}]`);
    });
  }
}

for (const entry of readManifest()) {
  const runs = [
    ...(entry.priority === "P1" ? ["es", "en"] : ["es"]).map((lang) => ({ lang, scheme: "light" })),
    { lang: "es", scheme: "dark" }
  ];
  for (const state of entry.states) {
    for (const { lang, scheme } of runs) {
      test(`axe ${entry.path}?state=${state} [${lang}, ${scheme}]`, async ({ page }, testInfo) => {
        test.skip(testInfo.project.name === "mobile" && !entry.mobile, "desktop-only page");
        await page.emulateMedia({ colorScheme: scheme });
        await gotoState(page, entry.path, state, { lang });
        await expectNoMissingKeys(page);
        await audit(page, `${entry.path}?state=${state} [${lang}, ${scheme}, ${testInfo.project.name}]`);
      });
    }
  }
}
