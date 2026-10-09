// F17 · Teacher views a student's learning record (US15). Task T140. Desktop page.
import { expect, gotoState, scenario, test } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F17 · Student learning record", () => {
  test.skip(({ isMobile }) => isMobile, "the student detail is a desktop page");

  scenario("US-15 AS1", "a student who is not at risk shows mastery, a timeline, error types and activity", async ({ page }) => {
    await gotoState(page, "teacher/student.html");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lucas Herrera");
    await expect(page.getByRole("combobox", { name: "Periodo" })).toBeVisible();
    const linear = page.locator('[data-component="ProgressByTopic"]:visible').filter({ hasText: "Ecuaciones de primer grado" });
    await expect(linear.locator('[data-component="MasteryLevel"]')).toContainText("En progreso");
    await expect(linear.locator('[data-component="ProgressTimeline"] li').first()).toContainText("12 oct 2026");
    await expect(linear.locator('[data-component="DecisionReason"]')).toContainText("Porque ha resuelto bien 6 de sus últimos 8");
    await expect(page.locator('[data-component="ErrorTypeList"]:visible')).toContainText("2 veces");
    await expect(page.locator("[data-activity]:visible")).toContainText(/12 ejercicios/);
  });

  scenario("US-15 AS2", "a student at risk also shows why, in plain language", async ({ page }) => {
    await gotoState(page, "teacher/student.html", "at-risk");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Estudiante-07");
    const main = page.locator("main");
    await expect(main).toContainText("Sin actividad en 7 días");
    await expect(main).toContainText(/Tasa de error 60\s?%/);
    await expect(page.locator('[data-component="DecisionReason"]:visible').first()).toContainText("Aparece aquí porque");
    await expect(page.locator('[data-chart="activity"] [data-value]')).toHaveCount(4);
  });

  scenario("US-15 AS3", "an error type lists that student's mistakes, each linking to where it happened", async ({ page }) => {
    await gotoState(page, "teacher/student.html");
    const list = page.locator('[data-component="ErrorTypeList"]:visible');
    await list.getByRole("link", { name: /Ver un ejemplo/ }).first().click();
    await expect(page).toHaveURL(/state=error-type/);
    const items = page.locator("[data-mistake-item]:visible");
    await expect(items).toHaveCount(2);
    await expect(items.first().getByRole("link")).toHaveAttribute("href", /conversation(s)?\.html/);
  });

  scenario("US-15 AS4", "a student with no activity shows an empty state", async ({ page }) => {
    await gotoState(page, "teacher/student.html", "empty");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mateo Ortega");
    await expect(page.locator('[data-component="EmptyState"]:visible')).toContainText("todavía no tiene actividad");
  });

  scenario("US-15 AS5", "only the display name or pseudonym is shown, never an email", async ({ page }) => {
    for (const state of ["default", "at-risk", "error-type", "empty"]) {
      await gotoState(page, "teacher/student.html", state);
      await expect(page.locator("main")).not.toContainText("@");
    }
  });
});
