// F8 · Student guided (Socratic) mode (US5). Tasks T065.
import { expect, gotoState, scenario, test } from "./helpers.js";

test.describe.configure({ mode: "serial" });

const hint = (page) => page.locator('[data-component="ChatMessage"][data-variant="tutor-hint"]:visible');

test.describe("F8 · Guided mode", () => {
  scenario("US-05 AS1", "a visible indicator explains hints come before solutions", async ({ page }) => {
    await gotoState(page, "student/chat-guided.html");
    const indicator = page.locator('[data-component="GuidedModeIndicator"]:visible');
    await expect(indicator).toContainText("Modo guiado");
    await expect(indicator).toContainText("pistas antes");
  });

  scenario("US-05 AS2", "a problem question gets a numbered hint with next steps", async ({ page }) => {
    await gotoState(page, "student/chat-guided.html");
    await page.getByRole("button", { name: "¿Cómo resuelvo 2x − 4 = 10?" }).click();
    await expect(page).toHaveURL(/state=hint-1/);
    await expect(hint(page).last()).toContainText("Pista 1 de 3");
    await expect(page.getByRole("button", { name: "Otra pista" })).toBeVisible();
    await page.getByRole("button", { name: "Intentarlo yo" }).click();
    await expect(page.getByRole("textbox", { name: "Escribe tu pregunta" })).toBeFocused();
    await page.getByRole("button", { name: "Otra pista" }).click();
    await expect(page).toHaveURL(/state=hint-2/);
    await expect(hint(page).last()).toContainText("Pista 2 de 3");
    await expect(page.locator('[data-component="GuidedModeIndicator"]:visible')).toContainText("Pista 2 de 3");
  });

  scenario("US-05 AS3", "after the last hint, the solution appears only if the teacher allows it", async ({ page }) => {
    await gotoState(page, "student/chat-guided.html", "hint-2");
    await page.getByRole("button", { name: "Otra pista" }).click();
    await expect(page).toHaveURL(/state=hints-done-solution/);
    await page.getByRole("button", { name: "Ver solución" }).click();
    await expect(page).toHaveURL(/state=solution/);
    await expect(page.locator('[data-component="ChatMessage"][data-variant="tutor-answer"]:visible').last()).toContainText("x = 14 ÷ 2 = 7");

    await gotoState(page, "student/chat-guided.html", "hints-done-hints-only");
    await expect(page.getByRole("button", { name: "Ver solución" })).toHaveCount(0);
    await expect(page.locator("main")).toContainText("ha elegido que el tutor solo dé pistas");
  });

  scenario("US-05 AS4", "hints carry source citations", async ({ page }) => {
    await gotoState(page, "student/chat-guided.html", "hint-2");
    for (const h of await hint(page).all()) {
      await expect(h.locator('[data-component="SourceCitation"]')).not.toHaveCount(0);
    }
    const chip = hint(page).last().getByRole("button", { name: /Tema 3 · p\. 12/ });
    await chip.click();
    const sheet = page.getByRole("dialog", { name: "Fuente citada" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Cerrar" }).click();
    await expect(page).toHaveURL(/state=hint-2/);
    await expect(chip).toBeFocused();
  });
});
