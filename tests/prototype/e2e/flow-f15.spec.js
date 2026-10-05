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

test.describe("F15 · Progress by topic", () => {
  scenario("US-13 AS1", "each topic shows its mastery level, a timeline and a text basis", async ({ page }) => {
    await gotoState(page, "student/progress.html");
    const items = page.locator('[data-component="ProgressByTopic"]:visible');
    await expect(items).toHaveCount(4);
    await expect(items.first().locator('[data-component="MasteryLevel"]')).toContainText("En progreso");
    await expect(items.first().locator('[data-component="ProgressTimeline"] li')).toHaveCount(3);
    await expect(items.first()).toContainText("6 de 10 ejercicios correctos");
    await expect(page.locator("main")).toContainText("Tu profesor/a también");
  });

  scenario("US-13 AS2", "with no activity yet, an empty state invites the student to start", async ({ page }) => {
    await gotoState(page, "student/progress.html", "empty");
    const empty = page.locator('[data-component="EmptyState"]:visible');
    await expect(empty).toContainText("Todavía no hay actividad");
    await expect(empty.getByRole("link", { name: "Preguntar al tutor" })).toBeVisible();
    await expect(empty.getByRole("link", { name: "Hacer un cuestionario" })).toBeVisible();
  });

  scenario("US-13 AS3", "a topic lists the student's most frequent error types, each with an example", async ({ page }) => {
    await gotoState(page, "student/progress.html");
    await page.getByRole("button", { name: /Ver mis errores/ }).first().click();
    await expect(page).toHaveURL(/state=topic-detail/);
    const list = page.locator('[data-component="ErrorTypeList"]:visible');
    await expect(list).toContainText("Pasar un término sin cambiar de signo");
    await expect(list.getByRole("link", { name: /Ver un ejemplo/ }).first()).toHaveAttribute("href", /exercise-feedback\.html/);
  });

  scenario("US-13 AS4", "the page says when it was last updated", async ({ page }) => {
    await gotoState(page, "student/progress.html");
    await expect(page.locator("main")).toContainText("Actualizado el 12 oct 2026");
  });

  scenario("US-13 AS5", "a mastery level explains its basis in one sentence", async ({ page }) => {
    await gotoState(page, "student/progress.html");
    const why = page.getByRole("button", { name: "¿Por qué?" }).first();
    await expect(why).toHaveAttribute("aria-expanded", "false");
    await why.click();
    await expect(page).toHaveURL(/state=mastery-basis/);
    await expect(page.locator('[data-component="DecisionReason"]:visible').first()).toContainText("Porque has resuelto bien 6 de los últimos 8 ejercicios");
    await expect(page.getByRole("button", { name: "Ocultar explicación" })).toHaveAttribute("aria-expanded", "true");
  });
});
