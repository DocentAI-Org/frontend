// F9 · Student submits a worked exercise and gets feedback (US6). Tasks T069.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F9 · Exercise feedback", () => {
  scenario("US-06 AS1", "the student enters the problem and steps and reviews before sending", async ({ page }) => {
    await gotoState(page, "student/exercise.html");
    await page.getByRole("textbox", { name: "Enunciado del ejercicio" }).fill("Resuelve 2(x − 3) = 4x + 2");
    await page.getByRole("textbox", { name: /Tu solución/ }).fill("2x − 6 = 4x + 2\n2x − 4x = 2 − 6");
    await expect(page.getByLabel(/Foto de tu trabajo/)).toHaveAttribute("accept", /jpg/);
    await page.getByRole("button", { name: "Revisar antes de enviar" }).click();
    await expect(page).toHaveURL(/state=review/);
    const review = page.locator("section[data-state='review']");
    await expect(review).toContainText("Resuelve 2(x − 3) = 4x + 2");
    await expect(review).toContainText("2x − 4x = 2 − 6");
    await expect(review.getByRole("button", { name: "Editar" })).toBeVisible();
  });

  scenario("US-06 AS2", "while feedback is generated the student can leave and come back", async ({ page }) => {
    await gotoState(page, "student/exercise.html", "review");
    await page.getByRole("link", { name: "Enviar ejercicio" }).click();
    await expect(page).toHaveURL(/exercise-feedback\.html\?.*state=pending/);
    await waitForReady(page);
    const pending = page.getByRole("status").filter({ hasText: "Estamos revisando tu ejercicio" });
    await expect(pending).toBeVisible();
    await expect(page.locator("main")).toContainText("Puedes salir y volver");
    await expect(page.getByRole("link", { name: "Volver a mis cursos" })).toBeVisible();
  });

  scenario("US-06 AS3", "feedback names the verdict and the wrong step, explains with citations and keeps the solution back", async ({ page }) => {
    await gotoState(page, "student/exercise-feedback.html");
    const main = page.locator("main");
    await expect(main).toContainText("Incorrecta");
    await expect(main.locator('[data-mistake="true"]')).toContainText("Paso 2");
    await expect(main.locator('[data-component="SourceCitation"]').first()).toBeVisible();
    await expect(main).not.toContainText(/(?<![\d−])x = −4/);
    await main.getByRole("button", { name: /Ver fuente/ }).first().click();
    await expect(page.getByRole("dialog", { name: "Fuente citada" })).toContainText("§ 3.2");
  });

  scenario("US-06 AS4", "an exercise outside the material uses the no-source pattern", async ({ page }) => {
    await gotoState(page, "student/exercise-feedback.html", "no-source");
    const notice = page.locator('[data-component="NoSourceNotice"]:visible');
    await expect(notice.getByRole("heading", { name: "El material del curso no cubre esta pregunta" })).toBeVisible();
    await expect(notice.locator('[data-component="SourceCitation"]')).toHaveCount(0);
  });

  scenario("US-06 AS5", "an empty submission or an unreadable photo explains how to fix it", async ({ page }) => {
    await gotoState(page, "student/exercise.html");
    await page.getByRole("button", { name: "Revisar antes de enviar" }).click();
    await expect(page).toHaveURL(/state=empty-submission/);
    await expect(page.getByRole("alert")).toContainText("Escribe el enunciado y tu solución, o adjunta una foto");
    await expect(page.getByRole("textbox", { name: "Enunciado del ejercicio" })).toHaveAttribute("aria-invalid", "true");

    await gotoState(page, "student/exercise.html", "unreadable-photo");
    await expect(page.getByRole("alert")).toContainText("No podemos leer la foto");
    await expect(page.getByLabel(/Foto de tu trabajo/)).toHaveAttribute("aria-invalid", "true");
  });
});
