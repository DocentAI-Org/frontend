// F4 · Daily message limit (chat part). Tasks T040.
import { expect, test } from "@playwright/test";
import { gotoState, scenario } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F4 · Daily limit", () => {
  scenario("US-01 AS5", "the remaining count is visible and warns when low", async ({ page }) => {
    await gotoState(page, "student/chat.html");
    await expect(page.getByText(/Te quedan 12 mensajes hoy/)).toBeVisible();

    await gotoState(page, "student/chat.html", "low-allowance");
    const low = page.locator('[data-component="MessageAllowance"][data-variant="low"]');
    await expect(low).toContainText("Te quedan 3 mensajes hoy");
    await expect(low.locator("svg")).toHaveCount(1);
  });

  scenario("US-01 AS6", "at the limit the input is replaced, the reset time shows and history stays readable", async ({ page }) => {
    await gotoState(page, "student/chat.html", "low-allowance");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page).toHaveURL(/state=limit-reached/);

    const banner = page.locator('[data-component="LimitReachedBanner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Podrás escribir de nuevo a las 00:00");
    await expect(banner).toContainText("¿Y si la x está en los dos lados?");
    await expect(page.getByRole("textbox", { name: "Escribe tu pregunta" })).toHaveCount(0);

    const chip = page.getByRole("button", { name: /Tema 3 · p\. 12/ }).first();
    await expect(chip).toBeVisible();
    await chip.focus();
    await expect(chip).toBeFocused();
  });

  scenario("US-06 AS6", "at the limit, exercise submission shows the same limit message and is blocked", async ({ page }) => {
    await gotoState(page, "student/exercise.html", "limit-reached");
    const banner = page.locator('[data-component="LimitReachedBanner"][data-variant="exercise"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("Has usado tus 30 mensajes de hoy");
    await expect(banner).toContainText("00:00");
    await expect(page.getByRole("button", { name: "Revisar antes de enviar" })).toBeDisabled();
  });
});
