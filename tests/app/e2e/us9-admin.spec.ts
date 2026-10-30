// US9 — admin area: users, courses, teacher accounts and pseudonymous students (002 US1 AS4, US9).
import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";

test.describe("US9 admin area", () => {
  scenario("001-US7-AS6", "the admin creates a teacher account (deviation D3)", async ({ page }) => {
    await signIn(page, USERS.admin);
    await expectAccessible(page);
    await page.getByRole("link", { name: /crear cuenta de profesor/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /crear cuenta de profesor/i })).toBeVisible();
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /revisa los campos/i })).toBeVisible();
    await expectAccessible(page);

    await page.getByLabel(/nombre completo/i).fill("Prof. Nueva");
    await page.getByLabel(/correo electrónico/i).fill("nueva@docentai.local");
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page.getByRole("heading", { name: /cuenta creada/i })).toBeVisible();
    await expect(page.getByTestId("initial-password")).not.toBeEmpty();
    await expectAccessible(page);
    await page.getByRole("link", { name: /volver a usuarios/i }).last().click();
    await expect(page.getByRole("row").filter({ hasText: "Prof. Nueva" }).filter({ visible: true }).or(
      page.getByRole("listitem").filter({ hasText: "Prof. Nueva" }).filter({ visible: true })
    )).toBeVisible();
  });

  scenario("002-US1-AS4", "a duplicate email is explained", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/teachers/new");
    await page.getByLabel(/nombre completo/i).fill("Otra");
    await page.getByLabel(/correo electrónico/i).fill(USERS.teacher);
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /ya existe una cuenta/i })).toBeVisible();
  });

  scenario("002-US9-AS1", "the admin creates pseudonymous accounts and a student signs in with one", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.getByRole("link", { name: /crear cuentas de estudiante/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /crear cuentas de estudiante/i })).toBeVisible();
    await expectAccessible(page);
    await page.getByLabel(/número de cuentas/i).fill("3");
    await page.getByRole("button", { name: /crear cuentas/i }).click();

    await expect(page.getByRole("heading", { name: /cuentas creadas/i })).toBeVisible();
    await expect(page.getByText(/no se volverán a mostrar/i)).toBeVisible();
    const rows = page.getByRole("table").getByRole("row");
    await expect(rows).toHaveCount(4);
    await expect(page.getByRole("link", { name: /descargar csv/i })).toHaveAttribute("download", /\.csv$/);
    await expectAccessible(page);
    const code = (await rows.nth(1).getByRole("rowheader").textContent())?.trim() ?? "";
    const password = (await rows.nth(1).getByRole("cell").textContent())?.trim() ?? "";

    await signOut(page);
    await signIn(page, code, password);
    await expect(page).toHaveURL(/\/student\/consent/);
  });

  scenario("002-US9-AS2", "passwords are not shown again after leaving", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/students/new");
    await page.getByLabel(/número de cuentas/i).fill("1");
    await page.getByRole("button", { name: /crear cuentas/i }).click();
    await expect(page.getByRole("heading", { name: /cuentas creadas/i })).toBeVisible();

    await page.goto("/admin/students/new");
    await expect(page.getByRole("heading", { name: /cuentas creadas/i })).toHaveCount(0);
    await page.goto("/admin/users");
    await expect(page.getByText(/^EST-/).filter({ visible: true }).first()).toBeVisible();
  });

  scenario("001-US7-AS6b", "the admin sees every course", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/teacher/courses/new");
    await page.getByLabel(/nombre del curso/i).fill("Álgebra");
    await page.getByRole("button", { name: /crear curso/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Álgebra" })).toBeVisible();
    await signOut(page);

    await signIn(page, USERS.admin);
    await page.goto("/admin/courses");
    await expect(page.getByRole("row").filter({ hasText: "Álgebra" })).toContainText("Prof. Elena Ruiz");
    await expectAccessible(page);
  });
});
