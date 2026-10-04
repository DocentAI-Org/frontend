// F5 · Admin minimal tasks and role homes (US7). Tasks T074.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F5 · Minimal admin tasks", () => {
  scenario("US-07 AS1", "sign-in shows the identity, the form, IMFAHE and privacy", async ({ page }) => {
    await gotoState(page, "auth/sign-in.html");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DocentAI");
    await expect(page.getByRole("textbox", { name: "Correo electrónico" })).toBeVisible();
    await expect(page.getByLabel("Contraseña", { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.locator('main [data-component="ImfaheAcknowledgement"][data-variant="sign-in"]')).toContainText("Fundación IMFAHE");
    await expect(page.locator("main").getByRole("link", { name: "Privacidad" })).toBeVisible();
  });

  scenario("US-07 AS2", "each role lands on its own home", async ({ page }) => {
    await gotoState(page, "auth/sign-in.html");
    await page.getByRole("link", { name: "Entrar como admin" }).click();
    await expect(page).toHaveURL(/admin\/users\.html/);
    await waitForReady(page);
    await expect(page.getByRole("heading", { level: 1, name: "Usuarios" })).toBeVisible();

    await gotoState(page, "auth/sign-in.html");
    await page.getByRole("link", { name: "Entrar como profesor/a" }).click();
    await expect(page).toHaveURL(/teacher\/courses\.html/);

    await gotoState(page, "auth/sign-in.html");
    await page.getByRole("textbox", { name: "Correo electrónico" }).fill("admin@example.org");
    await page.getByLabel("Contraseña", { exact: true }).filter({ visible: true }).fill("demo");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/admin\/users\.html/);
  });

  scenario("US-07 AS6", "the admin creates a teacher, who appears with a pending invitation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "create teacher is a desktop page");
    await gotoState(page, "admin/users.html", "empty");
    await page.locator('[data-component="EmptyState"]').getByRole("link", { name: "Crear cuenta de profesor/a" }).click();
    await expect(page).toHaveURL(/admin\/teacher-new\.html/);
    await waitForReady(page);
    await page.getByRole("button", { name: "Enviar invitación" }).click();
    await expect(page).toHaveURL(/state=validation-error/);
    await page.getByRole("textbox", { name: "Nombre completo" }).fill("Prof. Nuria Campos Vidal");
    await page.getByRole("textbox", { name: "Correo electrónico" }).fill("nuria.campos@example.org");
    await page.getByRole("button", { name: "Enviar invitación" }).click();
    await expect(page).toHaveURL(/state=created/);
    await expect(page.getByRole("status").filter({ hasText: "Invitación pendiente" })).toBeVisible();
    await page.locator("section[data-state='created']").getByRole("link", { name: "Volver a usuarios" }).click();
    await waitForReady(page);
    const row = page.getByRole("row").filter({ hasText: "Prof. Nuria Campos Vidal" });
    await expect(row).toContainText("Invitación pendiente");
  });

  scenario("US-07 AS5", "another role's page or a foreign course shows access denied with a way home", async ({ page }) => {
    await gotoState(page, "auth/access-denied.html");
    await page.goto(page.url() + "&home=../admin/users.html");
    await waitForReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("No tienes acceso");
    await expect(page.getByRole("link", { name: "Ir a mi inicio" })).toHaveAttribute("href", /admin\/users\.html/);
    await gotoState(page, "auth/access-denied.html", "course-removed");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Este curso ya no está disponible");
  });
});
