// F18 · Adapted explanations (US16). Task T148.
import { expect, gotoState, scenario, test } from "./helpers.js";

test.describe.configure({ mode: "serial" });

const REASON = "Te lo explico paso a paso porque esta semana has pasado 3 veces un término sin cambiarle el signo.";

test.describe("F18 · Adapted explanations", () => {
  scenario("US-16 AS1", "an adapted answer says so, gives its reason and keeps its citations", async ({ page }) => {
    await gotoState(page, "student/chat.html", "adapted");
    const answer = page.locator('[data-component="ChatMessage"][data-variant="tutor-answer"]:visible').filter({ has: page.locator('[data-component="AdaptedBadge"]:visible') });
    await expect(answer.getByRole("button", { name: "Adaptado para ti" })).toBeVisible();
    await expect(answer.locator('[data-component="DecisionReason"]')).toHaveText(REASON);
    await expect(answer.locator('[data-component="SourceCitation"]').first()).toBeVisible();
  });

  scenario("US-16 AS2", "the badge opens the record entries used and closes back to it", async ({ page }, testInfo) => {
    await gotoState(page, "student/chat.html", "adapted");
    const badge = page.getByRole("button", { name: "Adaptado para ti" });
    await badge.click();
    await expect(page).toHaveURL(/state=adapted-basis/);
    const sheet = page.getByRole("dialog", { name: "Por qué se ha adaptado esta respuesta" });
    await expect(sheet).toContainText("Pasar un término sin cambiar de signo");
    await expect(sheet).toContainText("3 veces");
    await expect(sheet).toContainText("Ecuaciones de primer grado");
    await expect(sheet.getByRole("link", { name: "Ver mi progreso" })).toBeVisible();
    const box = await sheet.boundingBox();
    const viewport = page.viewportSize();
    if (testInfo.project.name === "mobile") expect(Math.round(box.y + box.height)).toBeGreaterThanOrEqual(viewport.height - 2);
    else expect(Math.round(box.x + box.width)).toBeGreaterThanOrEqual(viewport.width - 2);
    await sheet.getByRole("button", { name: "Cerrar" }).click();
    await expect(sheet).toBeHidden();
    await expect(badge).toBeFocused();
  });

  scenario("US-16 AS3", "an answer that was not adapted has no badge", async ({ page }) => {
    await gotoState(page, "student/chat.html", "answer");
    await expect(page.locator('[data-component="AdaptedBadge"]:visible')).toHaveCount(0);
  });

  scenario("US-16 AS4", "an adapted hint is labelled too and gives no solution when the teacher chose hints only", async ({ page }) => {
    await gotoState(page, "student/chat-guided.html", "adapted-hint");
    await expect(page.locator('[data-component="AdaptedBadge"]:visible')).toContainText("Adaptado para ti");
    await expect(page.locator('[data-component="DecisionReason"]:visible')).toHaveText(REASON);
    await expect(page.getByText("Pista 1").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Ver solución" })).toHaveCount(0);
  });

  scenario("US-16 AS5", "the teacher sees the same label and reason in the conversation", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "conversation detail is a desktop page");
    await gotoState(page, "teacher/conversation.html", "adapted");
    await expect(page.locator('[data-component="AdaptedBadge"]:visible')).toContainText("Adaptado para ti");
    await expect(page.locator('[data-component="DecisionReason"]:visible')).toHaveText(REASON);
  });
});
