// F3 · The course material doesn't cover the question (S2). Tasks T039.
import { expect, test } from "@playwright/test";
import { gotoState, scenario } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F3 · Material does not cover the question", () => {
  scenario("US-01 AS4", "an off-topic question gets a distinct no-source reply with next steps", async ({ page }) => {
    await gotoState(page, "student/chat.html", "answer");
    await page.getByRole("button", { name: "¿Quién inventó el álgebra?" }).click();
    await expect(page).toHaveURL(/state=no-source/);

    const reply = page.locator('[data-component="ChatMessage"][data-variant="tutor-no-source"]');
    await expect(reply).toBeVisible();
    await expect(reply.getByRole("heading", { name: "El material del curso no cubre esta pregunta" })).toBeVisible();
    await expect(reply.getByRole("img", { name: "Información" })).toBeVisible();
    await expect(reply.locator('[data-component="SourceCitation"]')).toHaveCount(0);
    await expect(reply.getByRole("link", { name: "Preguntar al profesor/a" })).toBeVisible();

    await reply.getByRole("button", { name: "Reformular la pregunta" }).click();
    await expect(page.getByRole("textbox", { name: "Escribe tu pregunta" })).toBeFocused();
  });
});
