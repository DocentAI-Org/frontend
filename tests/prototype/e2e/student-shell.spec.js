// T102 · FR-010, FR-011, FR-014: chat, guided chat and exercise pages show the AI label, the
// teacher-review notice and the remaining-message count.
import { expect, gotoState, test } from "./helpers.js";

for (const path of ["student/chat.html", "student/chat-guided.html", "student/exercise.html"]) {
  test(`FR-010/011/014 ${path} shows the AI label, teacher review and allowance`, async ({ page }) => {
    await gotoState(page, path);
    const label = page.locator('[data-component="AIDisclosure"][data-variant="header-label"]');
    await expect(label).toContainText("Tutor IA");
    await expect(label).toContainText("tu profesor/a puede revisar tus conversaciones");
    await expect(page.locator('[data-component="MessageAllowance"]:visible')).toContainText("mensajes hoy");
  });
}

test("cover page: every flow has a start link and none is pending", async ({ page }) => {
  await page.goto("/prototype/index.html?panel=0");
  await expect(page.locator("#flow-list li")).toHaveCount(15);
  await expect(page.locator("#flow-list").getByText("Pendiente")).toHaveCount(0);
  await expect(page.locator("#flow-list").getByRole("link", { name: "Empezar" })).toHaveCount(15);
});
