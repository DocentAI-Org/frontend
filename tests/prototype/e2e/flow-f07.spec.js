// F7 · Teacher configures the tutor (US3). Tasks T053. Tutor settings is a desktop page.
import { expect, gotoState, scenario, test } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F7 · Configure the tutor", () => {
  test.skip(({ isMobile }) => isMobile, "tutor settings is a desktop page");

  scenario("US-03 AS1", "sensible defaults are pre-selected and each option is explained", async ({ page }) => {
    await gotoState(page, "teacher/tutor-settings.html");
    for (const name of ["Intermedio", "Cercano", "Primero pistas, luego solución"]) {
      const radio = page.getByRole("radio", { name, exact: true });
      await expect(radio).toBeChecked();
      await expect(radio).toHaveAccessibleDescription(/\S/);
    }
  });

  scenario("US-03 AS2", "choosing hints only and saving confirms and shows a hint-by-hint example", async ({ page }) => {
    await gotoState(page, "teacher/tutor-settings.html");
    await page.getByRole("radio", { name: "Solo pistas (modo guiado)" }).check();
    await expect(page).toHaveURL(/state=hints-only/);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page).toHaveURL(/state=saved/);
    await expect(page.getByRole("status").filter({ hasText: "Guardado" })).toBeVisible();
    const preview = page.locator('[data-component="Card"][data-variant="preview"]:visible');
    await expect(preview).toContainText("Pista 1");
    await expect(preview).toContainText("Pista 2");
  });

  scenario("US-03 AS3", "leaving with unsaved changes asks first", async ({ page }) => {
    await gotoState(page, "teacher/tutor-settings.html", "hints-only");
    await page.getByRole("navigation").getByRole("link", { name: "Mis cursos" }).first().click();
    const dialog = page.getByRole("dialog", { name: "¿Salir sin guardar?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Salir sin guardar" })).toHaveAttribute("href", /teacher\/courses\.html/);
    await dialog.getByRole("button", { name: "Seguir editando" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("radio", { name: "Solo pistas (modo guiado)" })).toBeChecked();
  });

  scenario("US-03 AS4", "a failed save keeps the changes and offers a retry", async ({ page }) => {
    await gotoState(page, "teacher/tutor-settings.html", "save-failed");
    await expect(page.getByRole("alert").filter({ hasText: "No se han podido guardar" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Solo pistas (modo guiado)" })).toBeChecked();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page).toHaveURL(/state=saved/);
  });
});
