// F2 · Student asks the tutor and sees cited sources (US1 part, from consent). Tasks T038.
import { expect, expectNoMissingKeys, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F2 · Ask the tutor and see the sources", () => {
  scenario("US-07 AS1", "the journey starts at sign-in, which shows the identity and IMFAHE", async ({ page }) => {
    await gotoState(page, "auth/sign-in.html");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DocentAI");
    await expect(page.locator('main [data-component="ImfaheAcknowledgement"]')).toBeVisible();
  });

  scenario("US-07 AS2", "a first-time student lands on consent, then their courses, then the chat", async ({ page }) => {
    await gotoState(page, "auth/sign-in.html");
    await page.getByRole("link", { name: "Entrar como estudiante" }).click();
    await expect(page).toHaveURL(/student\/consent\.html/);
    await waitForReady(page);
    await page.getByRole("checkbox", { name: /He leído/ }).check();
    await page.getByRole("button", { name: "Continuar" }).click();
    await waitForReady(page);
    await page.getByRole("link", { name: /Entendido/ }).click();
    await expect(page).toHaveURL(/student\/courses\.html/);
    await waitForReady(page);
    await page.getByRole("link", { name: "Preguntar al tutor" }).first().click();
    await expect(page).toHaveURL(/student\/chat\.html/);
  });

  scenario("US-07 AS4", "consent must be accepted before continuing", async ({ page }) => {
    await gotoState(page, "student/consent.html");
    await expectNoMissingKeys(page);
    const next = page.getByRole("button", { name: "Continuar" });
    await next.click();
    await expect(page).not.toHaveURL(/state=ai-disclosure/);
    await page.getByRole("checkbox", { name: /He leído/ }).check();
    await next.click();
    await expect(page).toHaveURL(/state=ai-disclosure/);
    await waitForReady(page);
    await expect(page.getByRole("heading", { name: "Cómo funciona el tutor" })).toBeVisible();
    await page.getByRole("link", { name: /Entendido/ }).click();
    await expect(page).toHaveURL(/student\/courses\.html/);
  });

  scenario("US-01 AS1", "first-use disclosure blocks sending until acknowledged", async ({ page }) => {
    await gotoState(page, "student/chat.html", "first-use");
    const dialog = page.getByRole("dialog", { name: /Antes de empezar/ });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("inteligencia artificial");
    await expect(dialog).toContainText("solo con el material que ha validado tu profesor/a");
    await expect(dialog).toContainText("tu profesor/a puede revisar");
    await expect(page.locator("dialog:modal")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Enviar" }).click({ trial: true, timeout: 1000 })).rejects.toThrow();
    await dialog.getByRole("button", { name: "Empezar" }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Empezar" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Enviar" })).toBeVisible();
  });

  scenario("US-01 AS2", "sending shows the tutor writing, then a cited answer", async ({ page }) => {
    await gotoState(page, "student/chat.html");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Escribiendo" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Tema 3 · p\. 12/ }).first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/state=answer/);
  });

  scenario("US-01 AS3", "a citation opens the cited passage and closes back to the chat", async ({ page }, testInfo) => {
    await gotoState(page, "student/chat.html", "answer");
    const chip = page.getByRole("button", { name: /Tema 3 · p\. 12/ }).first();
    await chip.click();
    const sheet = page.getByRole("dialog", { name: "Fuente citada" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText("Tema 3 – Ecuaciones de primer grado.pdf");
    await expect(sheet).toContainText("p. 12");
    await expect(sheet.locator("blockquote")).toBeVisible();
    const box = await sheet.boundingBox();
    const viewport = page.viewportSize();
    if (testInfo.project.name === "mobile") {
      expect(Math.round(box.y + box.height)).toBeGreaterThanOrEqual(viewport.height - 2);
      expect(Math.round(box.width)).toBeGreaterThanOrEqual(viewport.width - 2);
    } else {
      expect(Math.round(box.x + box.width)).toBeGreaterThanOrEqual(viewport.width - 2);
      expect(Math.round(box.height)).toBeGreaterThanOrEqual(viewport.height - 2);
    }
    await sheet.getByRole("button", { name: "Cerrar" }).click();
    await expect(sheet).toBeHidden();
    await expect(chip).toBeFocused();
  });

  scenario("US-01 AS7", "a failed message explains the error, offers a retry and does not count", async ({ page }) => {
    await gotoState(page, "student/chat.html", "failed");
    await expect(page.getByText("No se ha podido enviar")).toBeVisible();
    await expect(page.getByText(/no cuenta para tu límite/)).toBeVisible();
    await page.getByRole("button", { name: "Reintentar" }).click();
    await expect(page).toHaveURL(/state=tutor-writing|state=answer/);
  });

  scenario("US-01 AS9", "the chat header shows the level, tone and solution policy the teacher chose", async ({ page }) => {
    await gotoState(page, "student/chat.html", "answer");
    await page.getByRole("button", { name: "Cómo responde el tutor" }).click();
    await expect(page).toHaveURL(/state=tutor-info/);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Tu profesor/a ha elegido");
    await expect(dialog).toContainText("Intermedio");
    await expect(dialog).toContainText("Cercano");
    await expect(dialog).toContainText("la solución");
    await dialog.getByRole("button", { name: "Entendido" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Cómo responde el tutor" })).toBeFocused();
  });
});
