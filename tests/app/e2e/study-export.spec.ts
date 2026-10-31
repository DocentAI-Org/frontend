// 012 — study data export for the admin (spec 012 US1, requirement P5).
import { USERS, chooseOption, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, signOut, test } from "./helpers";

test.describe("012 US1 study data export", () => {
  scenario("012-US1-AS1", "the page says what is exported and what is not", async ({ page }) => {
    await signIn(page, USERS.admin);
    await openMenuIfNeeded(page);
    await page.getByRole("link", { name: /datos del estudio/i }).filter({ visible: true }).first().click();

    await expect(page.getByRole("heading", { level: 1, name: /datos del estudio/i })).toBeVisible();
    await expect(page.getByText(/solo estudiantes que han dado su consentimiento/i)).toBeVisible();
    await expect(page.getByText(/sin nombres, correos ni texto libre/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("012-US1-AS2", "the admin downloads the ZIP for all courses or one", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/teacher/courses/new");
    await page.getByLabel(/nombre del curso/i).fill("Álgebra");
    await page.getByRole("button", { name: /crear curso/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Álgebra" })).toBeVisible();
    await signOut(page);
    await signIn(page, USERS.admin);
    await page.goto("/admin/study-export");

    const all = page.waitForEvent("download");
    await page.getByRole("button", { name: /descargar zip/i }).click();
    const everything = await all;
    expect(everything.suggestedFilename()).toBe("docentai-study-export.zip");
    expect(new URL(everything.url()).searchParams.get("course_id") ?? "").toBe("");

    await chooseOption(page.getByRole("combobox", { name: /curso/i }), /álgebra/i);
    const one = page.waitForEvent("download");
    await page.getByRole("button", { name: /descargar zip/i }).click();
    expect(new URL((await one).url()).searchParams.get("course_id")).toMatch(/.+/);
  });

  scenario("012-US1-AS3", "an API failure is shown and nothing is downloaded", async ({ page, mock }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/study-export");
    await mock.faults(["study_export_fails"]);

    await page.getByRole("button", { name: /descargar zip/i }).click();

    await expect(page.getByRole("alert")).toContainText(/no se ha podido|no hemos podido/i);
    await expectAccessible(page);
    await mock.faults([]);
  });

  scenario("012-US1-AS4", "teachers and students cannot reach it", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/admin/study-export");
    await expect(page.getByRole("heading", { level: 1, name: /datos del estudio/i })).toHaveCount(0);
    await page.context().clearCookies();

    await signIn(page, USERS.student);
    await expect(page).toHaveURL(/\/student\/consent/);
    await page.goto("/admin/study-export");
    await expect(page.getByRole("heading", { level: 1, name: /datos del estudio/i })).toHaveCount(0);
  });
});
