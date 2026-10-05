// F11 · Teacher reviews conversations and corrects answers (US8). Tasks T086, T130 (corrections, 2026-10-06).
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

const CORRECTION = "Revisa el paso 1: el 2 multiplica a los dos términos, 2(x − 3) = 2x − 6.";

test.describe("F11 · Conversations and corrections", () => {
  scenario("US-08 AS1", "the list includes exercise feedback, filters by student, date and topic, and marks corrected answers", async ({ page }) => {
    await gotoState(page, "teacher/conversations.html");
    for (const name of ["Estudiante", "Fecha", "Tema"]) await expect(page.getByRole("combobox", { name })).toBeVisible();
    const rows = page.locator("[data-conversation]:visible");
    await expect(rows.first()).toContainText(/\d+ mensajes/);
    await expect(rows.filter({ hasText: "Sin fuente" }).first()).toBeVisible();
    await expect(rows.filter({ hasText: "Ejercicio" }).first()).toBeVisible();
    await expect(rows.filter({ hasText: "Corregida" }).first()).toBeVisible();
    await page.getByRole("combobox", { name: "Estudiante" }).selectOption({ label: "Lucas Herrera" });
    await page.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(page).toHaveURL(/state=filtered/);
    await expect(page.locator("[data-conversation]:visible")).toHaveCount(1);
    await expect(page.locator("[data-conversation]:visible")).toContainText("Lucas Herrera");
  });

  scenario("US-08 AS2", "flagging requires a correction, which the teacher previews as the student will see it and saves", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "conversation detail is a desktop page");
    await gotoState(page, "teacher/conversations.html");
    await page.locator("[data-conversation]").filter({ hasText: "Lucas Herrera" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/teacher\/conversation\.html/);
    await waitForReady(page);
    await page.locator("[data-flag-target]").filter({ hasText: "queda 2x − 3" }).getByRole("button", { name: /Marcar respuesta/ }).click();
    const dialog = page.getByRole("dialog", { name: "Marcar y corregir la respuesta del tutor" });
    await dialog.getByRole("radio", { name: "Incorrecta" }).check();
    const field = dialog.getByRole("textbox", { name: /Corrección para el estudiante/ });
    await dialog.getByRole("button", { name: "Previsualizar" }).click();
    await expect(page).toHaveURL(/state=flag-dialog/);
    expect(await field.evaluate((el) => el.validity.valid)).toBe(false);
    await field.fill(CORRECTION);
    await dialog.getByRole("button", { name: "Previsualizar" }).click();
    await expect(page).toHaveURL(/state=correction-preview/);
    const preview = page.getByRole("dialog", { name: "Así lo verá tu estudiante" });
    await expect(preview).toContainText("Revisado por tu profesor/a");
    await expect(preview).toContainText(CORRECTION);
    await preview.getByRole("button", { name: "Guardar corrección" }).click();
    await expect(page).toHaveURL(/state=flagged/);
    await expect(page.locator('[data-component="FlagControl"][data-variant="incorrect"]:visible')).toContainText("Marcada como incorrecta");
    await expect(page.locator('[data-component="TeacherCorrection"][data-variant="teacher"]:visible')).toContainText(CORRECTION);
  });

  scenario("US-08 AS3", "the flags list shows type, correction and date, and links back to the message", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "flags list is a desktop page");
    await gotoState(page, "teacher/flags.html");
    const item = page.locator("[data-flag]").first();
    await expect(item).toContainText(/Incorrecta|Mejorable/);
    await expect(item).toContainText("Corrección");
    await expect(item).toContainText("2(x − 3) = 2x − 6");
    await expect(item).toContainText("10 oct 2026");
    await item.getByRole("link", { name: /Ver el mensaje/ }).click();
    await expect(page).toHaveURL(/teacher\/conversation\.html\?.*state=flagged/);
  });

  scenario("US-08 AS4", "without conversations, an empty state explains when they appear", async ({ page }) => {
    await gotoState(page, "teacher/conversations.html", "empty");
    await expect(page.locator('[data-component="EmptyState"]:visible')).toContainText("cuando tus estudiantes usen el tutor");
  });

  scenario("US-08 AS5", "students see a persistent reminder that the teacher may review conversations", async ({ page }) => {
    await gotoState(page, "student/chat.html");
    await expect(page.locator('[data-component="AIDisclosure"][data-variant="header-label"]')).toContainText("tu profesor/a puede revisar tus conversaciones");
  });

  scenario("US-08 AS6", "a correction can be edited, or removed after confirming", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "conversation detail is a desktop page");
    await gotoState(page, "teacher/conversation.html", "flagged");
    const correction = page.locator('[data-component="TeacherCorrection"][data-variant="teacher"]:visible');
    await correction.getByRole("button", { name: "Editar corrección" }).click();
    await expect(page).toHaveURL(/state=correction-editing/);
    const edit = page.getByRole("dialog", { name: "Editar la corrección" });
    await expect(edit.getByRole("textbox", { name: /Corrección para el estudiante/ })).toHaveValue(/2x − 6/);
    await edit.getByRole("button", { name: "Cancelar" }).click();
    await expect(page).toHaveURL(/state=flagged/);
    await correction.getByRole("button", { name: "Quitar corrección" }).click();
    await expect(page).toHaveURL(/state=remove-correction-confirm/);
    const confirm = page.getByRole("dialog", { name: "¿Quitar la corrección?" });
    await expect(confirm).toContainText("dejará de ver");
    await confirm.getByRole("button", { name: "Quitar corrección" }).click();
    await expect(page).toHaveURL(/state=default/);
    await expect(page.locator('[data-component="TeacherCorrection"]:visible')).toHaveCount(0);
  });

  scenario("US-08 AS7", "if saving fails, the correction is kept and can be retried", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "conversation detail is a desktop page");
    await gotoState(page, "teacher/conversation.html", "save-failed");
    const dialog = page.getByRole("dialog", { name: "Así lo verá tu estudiante" });
    await expect(dialog.getByRole("alert")).toContainText("No se ha podido guardar la corrección");
    await expect(dialog).toContainText("2x − 6");
    await dialog.getByRole("button", { name: "Reintentar" }).click();
    await expect(page).toHaveURL(/state=flagged/);
  });

  scenario("US-01 AS8", "the student sees the teacher's correction under the original answer", async ({ page }) => {
    await gotoState(page, "student/chat.html", "corrected");
    const correction = page.locator('[data-component="TeacherCorrection"][data-variant="student"]:visible');
    await expect(correction).toContainText("Revisado por tu profesor/a");
    await expect(correction).toContainText("2(x − 3) = 2x − 6");
    await expect(page.locator("main")).toContainText("Sí: al quitar el paréntesis queda 2x − 3.");
    await expect(page.locator("main")).toContainText("Corregida");
    await expect(correction).not.toContainText("Incorrecta");
  });
});
