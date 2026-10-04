// F15 · Repeated-mistake help (US12) and progress by topic (US13). Tasks T095, T097.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F15 · Repeated mistakes", () => {
  scenario("US-12 AS1", "feedback names the repeated pattern and offers an explanation and practice", async ({ page }) => {
    await gotoState(page, "student/exercise-feedback.html", "repeated-mistake");
    const notice = page.locator("[data-repeated-notice]");
    await expect(notice).toContainText("Has cometido este error 3 veces");
    await expect(notice).toContainText("Error de signo al quitar paréntesis");
    await expect(notice.getByRole("link", { name: "Ver explicación" })).toBeVisible();
    await expect(notice.getByRole("link", { name: "Practicar" })).toBeVisible();
  });

  scenario("US-12 AS2", "the explanation is grounded in the material with citations", async ({ page }) => {
    await gotoState(page, "student/exercise-feedback.html", "repeated-mistake");
    await page.locator("[data-repeated-notice]").getByRole("link", { name: "Ver explicación" }).click();
    await expect(page).toHaveURL(/student\/practice\.html/);
    await waitForReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Error de signo al quitar paréntesis");
    const chip = page.locator('[data-component="SourceCitation"]:visible').first();
    await expect(chip).toBeVisible();
    await chip.click();
    await expect(page.getByRole("dialog", { name: "Fuente citada" })).toBeVisible();
  });

  scenario("US-12 AS3", "a dismissed notice stays hidden for the rest of the session", async ({ page }) => {
    await gotoState(page, "student/exercise-feedback.html", "repeated-mistake");
    await page.locator("[data-repeated-notice]").getByRole("button", { name: "Ahora no" }).click();
    await expect(page.locator("[data-repeated-notice]")).toBeHidden();
    await gotoState(page, "student/courses.html");
    await gotoState(page, "student/exercise-feedback.html", "repeated-mistake");
    await expect(page.locator("[data-repeated-notice]")).toBeHidden();
  });
});
