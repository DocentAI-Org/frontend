// US4 — teacher configures the tutor (spec 002 US4, 001 US3).
import { expect, expectAccessible, scenario, test } from "./helpers";
import { newCourse } from "./helpers-course";

test.describe("US4 tutor settings", () => {
  test.beforeEach(async ({ page }) => {
    await newCourse(page);
    await page.getByRole("link", { name: /configuración del tutor/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: /nivel del curso/i }).or(page.getByRole("group", { name: /nivel del curso/i }))).toBeVisible();
  });

  scenario("001-US3-AS1", "defaults are pre-selected and every option is explained", async ({ page }) => {
    await expect(page.getByRole("radio", { name: /intermedio/i })).toBeChecked();
    await expect(page.getByRole("radio", { name: /cercano/i })).toBeChecked();
    await expect(page.getByRole("radio", { name: /primero pistas, luego solución/i })).toBeChecked();
    await expect(page.getByText(/explicaciones completas que dan por sabidos/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US3-AS2", "saving hints only confirms and shows a guided example", async ({ page }) => {
    await page.getByRole("radio", { name: /solo pistas/i }).check();
    await page.getByRole("button", { name: /guardar cambios/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await expect(page.getByText(/pista 1:/i)).toBeVisible();
    await expect(page.getByText(/nunca da la solución completa/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("radio", { name: /solo pistas/i })).toBeChecked();
    await expectAccessible(page);
  });

  scenario("001-US3-AS3", "unsaved changes are warned about before leaving", async ({ page }) => {
    await page.getByRole("radio", { name: /formal/i }).check();
    await expect(page.getByText("Tienes cambios sin guardar.", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: /^material$/i }).click();
    await expect(page.getByRole("dialog")).toContainText(/salir sin guardar/i);
    await page.getByRole("dialog").getByRole("button", { name: /seguir editando/i }).click();
    await expect(page.getByRole("radio", { name: /formal/i })).toBeChecked();

    await page.getByRole("link", { name: /^material$/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /salir sin guardar/i }).click();
    await expect(page).toHaveURL(/\/material$/);
  });

  scenario("001-US3-AS4", "a failed save keeps the changes and offers a retry", async ({ page, mock }) => {
    await mock.faults(["save_settings_fails"]);
    await page.getByRole("radio", { name: /avanzado/i }).check();
    await page.getByRole("button", { name: /guardar cambios/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /no hemos podido guardar/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /avanzado/i })).toBeChecked();

    await mock.faults([]);
    await page.getByRole("button", { name: /guardar cambios/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
  });

  scenario("002-US4-AS1", "the example follows the selected policy before saving", async ({ page }) => {
    await page.getByRole("radio", { name: /soluciones directas/i }).check();
    await expect(page.getByText(/x = 5/)).toBeVisible();
    await page.getByRole("radio", { name: /solo pistas/i }).check();
    await expect(page.getByText(/x = 5/)).toHaveCount(0);
    await expect(page.getByText(/pista 1:/i)).toBeVisible();
  });
});
