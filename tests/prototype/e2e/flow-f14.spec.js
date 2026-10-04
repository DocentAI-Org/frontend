// F14 · Student adaptive quiz (US11). Tasks T093.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F14 · Adaptive quiz", () => {
  scenario("US-11 AS1", "the quiz shows the number of questions and the topic", async ({ page }) => {
    await gotoState(page, "student/quiz.html");
    const main = page.locator("main");
    await expect(main).toContainText("5 preguntas");
    await expect(main).toContainText("Ecuaciones de primer grado");
    await expect(main).toContainText("Pregunta 1 de 5");
  });

  scenario("US-11 AS2", "each answer gets immediate feedback with an explanation and a citation", async ({ page }) => {
    await gotoState(page, "student/quiz.html");
    await page.getByRole("radio", { name: "x = 5" }).check();
    await page.getByRole("button", { name: "Comprobar" }).click();
    await expect(page).toHaveURL(/state=correct/);
    const ok = page.locator('[data-quiz-feedback]:visible');
    await expect(ok).toContainText("¡Correcto!");
    await expect(ok.locator('[data-component="SourceCitation"]')).toBeVisible();

    await gotoState(page, "student/quiz.html");
    await page.getByRole("radio", { name: "x = 3" }).check();
    await page.getByRole("button", { name: "Comprobar" }).click();
    await expect(page).toHaveURL(/state=incorrect/);
    const bad = page.locator('[data-quiz-feedback]:visible');
    await expect(bad).toContainText("No es correcta");
    await expect(bad.locator('[data-component="SourceCitation"]')).toBeVisible();
    await expect(page.locator('[data-component="QuizQuestion"][data-variant="incorrect"]:visible')).toContainText("Respuesta correcta");
  });

  scenario("US-11 AS3", "a run of answers changes the difficulty, said in plain language", async ({ page }) => {
    await gotoState(page, "student/quiz.html", "correct");
    await page.getByRole("button", { name: "Siguiente pregunta" }).click();
    await expect(page).toHaveURL(/state=difficulty-up/);
    await expect(page.getByRole("status").filter({ hasText: "Subimos el nivel" })).toBeVisible();
  });

  scenario("US-11 AS4", "the summary shows the score by topic and next steps", async ({ page }) => {
    await gotoState(page, "student/quiz.html", "incorrect");
    await page.getByRole("link", { name: "Ver resumen" }).click();
    await expect(page).toHaveURL(/student\/quiz-summary\.html/);
    await waitForReady(page);
    const main = page.locator("main");
    await expect(main).toContainText("4 de 5");
    await expect(main.getByRole("link", { name: /Practicar/ })).toBeVisible();
  });

  scenario("US-11 AS5", "with no approved questions, an empty state says the teacher hasn't published any", async ({ page }) => {
    await gotoState(page, "student/quiz.html", "empty");
    await expect(page.locator('[data-component="EmptyState"]:visible')).toContainText("todavía no ha publicado preguntas");
  });
});
