// F12 · Teacher dashboard and at-risk students (US9). Tasks T089. Desktop pages.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F12 · Dashboard and at-risk students", () => {
  test.skip(({ isMobile }) => isMobile, "the dashboard is a desktop page");

  scenario("US-09 AS1", "recurring errors by topic switch to by student, with counts and a time range", async ({ page }) => {
    await gotoState(page, "teacher/dashboard.html");
    await expect(page.getByRole("combobox", { name: "Periodo" })).toBeVisible();
    const topics = page.locator('[data-chart="errors"]:visible');
    await expect(topics).toContainText("Ecuaciones de primer grado");
    await expect(topics.locator("[data-value]").first()).toHaveText(/\d+/);
    await page.getByRole("link", { name: "Por estudiante" }).click();
    await expect(page).toHaveURL(/state=by-student/);
    await expect(page.getByRole("link", { name: "Por estudiante" })).toHaveAttribute("aria-current", "true");
    await expect(page.locator('[data-chart="errors"]:visible')).toContainText("Estudiante-07");
  });

  scenario("US-09 AS2", "an at-risk student shows the data behind the flag", async ({ page }) => {
    await gotoState(page, "teacher/dashboard.html");
    await page.locator("[data-at-risk]").filter({ hasText: "Estudiante-07" }).getByRole("link").click();
    await expect(page).toHaveURL(/teacher\/student-risk\.html/);
    await waitForReady(page);
    const main = page.locator("main");
    await expect(main).toContainText("Sin actividad en 7 días");
    await expect(main).toContainText(/Tasa de error 60\s?%/);
    await expect(page.locator('[data-chart="activity"] [data-value]')).toHaveCount(4);
    await expect(page.locator("[data-example-error]").first()).toBeVisible();
  });

  scenario("US-09 AS3", "with too little data, an empty state says what is needed", async ({ page }) => {
    await gotoState(page, "teacher/dashboard.html", "not-enough-data");
    await expect(page.locator('[data-component="EmptyState"]:visible')).toContainText("necesita más actividad");
  });
});
