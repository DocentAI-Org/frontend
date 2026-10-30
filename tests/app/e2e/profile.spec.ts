// Profile and study consent revocation (spec 002 D1, 001 US7 AS4, FR-015).
import { expect, expectAccessible, scenario, test } from "./helpers";
import { classroom } from "./helpers-student";

test.describe("Profile and consent", () => {
  scenario("001-US7-AS4", "a student revokes consent from the profile and can give it again", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await page.goto("/student/profile");
    await expect(page.getByText(/aceptado el/i)).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("button", { name: /retirar consentimiento/i }).click();
    const dialog = page.getByRole("dialog", { name: /retirar tu consentimiento/i });
    await expect(dialog).toContainText(/dejarás de poder usar el tutor/i);
    await dialog.getByRole("button", { name: /retirar consentimiento/i }).click();

    await expect(page.getByText(/retirado el/i)).toBeVisible();
    await expect(page.getByText(/has retirado tu consentimiento/i)).toBeVisible();
    await expectAccessible(page);

    await page.goto(`/student/courses/${courseId}`);
    await expect(page).toHaveURL(/\/student\/consent/);

    await page.goto("/student/profile");
    await page.getByRole("link", { name: /volver a dar mi consentimiento/i }).click();
    await page.getByRole("checkbox", { name: /acepto participar/i }).check();
    await page.getByRole("button", { name: /^continuar/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /cómo funciona el tutor/i })).toBeVisible();
    await page.goto("/student/profile");
    await expect(page.getByText(/aceptado el/i)).toBeVisible();
  });
});
