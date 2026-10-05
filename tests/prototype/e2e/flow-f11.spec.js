// F11 · Teacher reviews conversations and flags answers (US8). Tasks T086.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F11 · Conversations and flags", () => {
  scenario("US-08 AS1", "the list filters by student, date and topic and shows counts and no-source markers", async ({ page }) => {
    await gotoState(page, "teacher/conversations.html");
    for (const name of ["Estudiante", "Fecha", "Tema"]) await expect(page.getByRole("combobox", { name })).toBeVisible();
    const rows = page.locator('[data-conversation]:visible');
    await expect(rows.first()).toContainText(/\d+ mensajes/);
    await expect(rows.filter({ hasText: "Sin fuente" }).first()).toBeVisible();
    await page.getByRole("combobox", { name: "Estudiante" }).selectOption({ label: "Lucas Herrera" });
    await page.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(page).toHaveURL(/state=filtered/);
    await expect(page.locator('[data-conversation]:visible')).toHaveCount(1);
    await expect(page.locator('[data-conversation]:visible')).toContainText("Lucas Herrera");
  });

  scenario("US-08 AS2", "a tutor answer can be flagged with a reason and comment, shown on the message", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "conversation detail is a desktop page");
    await gotoState(page, "teacher/conversations.html");
    await page.locator('[data-conversation]').filter({ hasText: "Lucas Herrera" }).getByRole("link").first().click();
    await expect(page).toHaveURL(/teacher\/conversation\.html/);
    await waitForReady(page);
    await page.getByRole("button", { name: /Marcar respuesta/ }).first().click();
    const dialog = page.getByRole("dialog", { name: "Marcar la respuesta del tutor" });
    await dialog.getByRole("radio", { name: "Incorrecta" }).check();
    await dialog.getByRole("textbox", { name: /Comentario/ }).fill("Falta comprobar el resultado.");
    await dialog.getByRole("button", { name: "Guardar marca" }).click();
    await expect(page).toHaveURL(/state=flagged/);
    const flagged = page.locator('[data-component="FlagControl"][data-variant="incorrect"]:visible');
    await expect(flagged).toContainText("Marcada como incorrecta");
  });

  scenario("US-08 AS3", "the flags list shows every flag with status and links back to its message", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "flags list is a desktop page");
    await gotoState(page, "teacher/flags.html");
    const item = page.locator('[data-flag]').first();
    await expect(item).toContainText(/Incorrecta|Mejorable/);
    await expect(item).toContainText(/Pendiente de revisar|Revisada/);
    await item.getByRole("link", { name: /Ver el mensaje/ }).click();
    await expect(page).toHaveURL(/teacher\/conversation\.html\?.*state=flagged/);
  });

  scenario("US-08 AS4", "without conversations, an empty state explains when they appear", async ({ page }) => {
    await gotoState(page, "teacher/conversations.html", "empty");
    await expect(page.locator('[data-component="EmptyState"]:visible')).toContainText("cuando tus estudiantes empiecen a usar el tutor");
  });

  scenario("US-08 AS5", "students see a persistent reminder that the teacher may review conversations", async ({ page }) => {
    await gotoState(page, "student/chat.html");
    await expect(page.locator('[data-component="AIDisclosure"][data-variant="header-label"]')).toContainText("tu profesor/a puede revisar tus conversaciones");
  });
});
