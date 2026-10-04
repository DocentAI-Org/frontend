// F10 · Sign-in errors and session expiry (US7). Tasks T075.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F10 · Sign-in errors and session", () => {
  scenario("US-07 AS3", "invalid credentials give a non-revealing error and a recovery path", async ({ page }) => {
    await gotoState(page, "auth/sign-in.html");
    await page.getByRole("textbox", { name: "Correo electrónico" }).fill("alguien@example.org");
    await page.getByLabel("Contraseña", { exact: true }).filter({ visible: true }).fill("incorrecta");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/state=invalid-credentials/);
    await expect(page.getByRole("alert")).toContainText("Correo o contraseña incorrectos");
    await page.getByRole("link", { name: "¿Has olvidado tu contraseña?" }).first().click();
    await expect(page).toHaveURL(/auth\/password-recovery\.html/);
  });

  scenario("US-07 AS3 (recovery)", "password recovery confirms without revealing whether the account exists", async ({ page }) => {
    await gotoState(page, "auth/password-recovery.html");
    await page.getByRole("textbox", { name: "Correo electrónico" }).fill("alguien@example.org");
    await page.getByRole("button", { name: "Enviar enlace" }).click();
    await expect(page).toHaveURL(/state=sent/);
    await expect(page.getByRole("status")).toContainText("Si existe una cuenta con ese correo");
  });

  scenario("US-07 AS7", "after the session expires, signing in returns to where the user was", async ({ page }) => {
    await page.goto("/prototype/auth/sign-in.html?state=session-expired&lang=es&panel=0&next=../student/chat.html%3Fstate%3Danswer");
    await waitForReady(page);
    await expect(page.getByRole("alert")).toContainText("Tu sesión ha caducado");
    await page.getByRole("textbox", { name: "Correo electrónico" }).fill("lucas.herrera@example.org");
    await page.getByLabel("Contraseña", { exact: true }).filter({ visible: true }).fill("demo");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/student\/chat\.html\?.*state=answer/);
  });
});
