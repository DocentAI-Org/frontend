// US1 — everyone signs in and lands in their own area (spec 002 US1, 001 US7).
import { USERS, chooseOption, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, signOut, test } from "./helpers";

test.describe("US1 sign-in and role areas", () => {
  scenario("001-US7-AS1", "sign-in shows identity, form, IMFAHE and privacy", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { level: 1, name: /bienvenida a docentai/i })).toBeVisible();
    await expect(page.getByLabel(/correo electrónico o código/i)).toBeVisible();
    await expect(page.getByText(/fundación imfahe/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /privacidad/i }).first()).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US7-AS2", "each role lands on its own home", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await expect(page).toHaveURL(/\/teacher\/courses$/);
    await openMenuIfNeeded(page);
    await expect(page.getByRole("navigation", { name: /navegación principal/i }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText("Prof. Elena Ruiz").filter({ visible: true })).toBeVisible();
    await expectAccessible(page);

    await signOut(page);
    await signIn(page, USERS.admin);
    await expect(page).toHaveURL(/\/admin\/users$/);
  });

  scenario("001-US7-AS3", "invalid credentials show a non-revealing error", async ({ page }) => {
    await signIn(page, USERS.teacher, "wrong-password", { expectFailure: true });

    await expect(page.getByRole("alert").filter({ hasText: /incorrectos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /has olvidado tu contraseña/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US7-AS4", "first sign-in of a student asks for study consent", async ({ page }) => {
    await signIn(page, USERS.student);
    await expect(page).toHaveURL(/\/student\/consent/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("checkbox", { name: /acepto participar/i }).check();
    await page.getByRole("button", { name: /^continuar/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /cómo funciona el tutor/i })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("link", { name: /entendido, continuar/i }).click();
    await expect(page).toHaveURL(/\/student\/courses$/);
  });

  scenario("001-US7-AS5", "another role's page shows access denied", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await expect(page).toHaveURL(/\/teacher\/courses$/);

    await page.goto("/admin/users");

    await expect(page.getByRole("heading", { level: 1, name: /no tienes acceso/i })).toBeVisible();
    await page.getByRole("link", { name: /ir a mi inicio/i }).click();
    await expect(page).toHaveURL(/\/teacher\/courses$/);
  });

  scenario("001-US7-AS7", "an expired session returns to the same page after signing in", async ({ page, mock }) => {
    await signIn(page, USERS.teacher);
    await expect(page).toHaveURL(/\/teacher\/courses$/);
    await mock.faults(["expire_sessions"]);

    await page.goto("/teacher/courses/new");

    await expect(page).toHaveURL(/\/sign-in\?expired=1/);
    await expect(page.getByRole("alert").filter({ hasText: /sesión ha caducado/i })).toBeVisible();
    await mock.faults([]);
    await page.getByLabel(/correo electrónico o código/i).fill(USERS.teacher);
    await page.getByLabel(/^contraseña/i).fill("docentai-dev-password");
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await expect(page).toHaveURL(/\/teacher\/courses\/new$/);
  });

  scenario("002-US1-AS1", "a student signs in with a pseudonymous code", async ({ page }) => {
    await signIn(page, USERS.pseudonymous);

    await expect(page).toHaveURL(/\/student\/consent/);
  });

  scenario("002-US1-AS2", "signed-out visitors go to sign-in and come back", async ({ page }) => {
    await page.goto("/teacher/courses/new");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fteacher%2Fcourses%2Fnew/);

    await page.getByLabel(/correo electrónico o código/i).fill(USERS.teacher);
    await page.getByLabel(/^contraseña/i).fill("docentai-dev-password");
    await page.getByRole("button", { name: /^entrar$/i }).click();

    await expect(page).toHaveURL(/\/teacher\/courses\/new$/);
  });

  scenario("002-US1-AS5", "the language choice is applied and saved to the profile", async ({ page }) => {
    await page.goto("/sign-in");
    const language = page.getByRole("banner").getByRole("combobox", { name: "Idioma" });
    await language.click();
    await expect(page.getByRole("listbox", { name: "Idioma" })).toBeVisible();
    await expectAccessible(page);
    await page.keyboard.press("Escape");
    await chooseOption(language, "English");
    await expect(page.getByRole("heading", { level: 1, name: /welcome to docentai/i })).toBeVisible();

    await chooseOption(page.getByRole("banner").getByRole("combobox", { name: "Language" }), "Español");
    await expect(page.getByRole("heading", { level: 1, name: /bienvenida a docentai/i })).toBeVisible();
    await signIn(page, USERS.teacher);
    await openMenuIfNeeded(page);
    await chooseOption(page.getByRole("combobox", { name: "Idioma" }).filter({ visible: true }), "English");
    await expect(page.getByRole("heading", { level: 1, name: "My courses" })).toBeVisible();
    await openMenuIfNeeded(page);
    await expect(page.getByRole("button", { name: /sign out/i }).filter({ visible: true })).toBeVisible();

    await page.getByRole("button", { name: /sign out/i }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await page.getByLabel(/correo electrónico o código/i).fill(USERS.teacher);
    await page.getByLabel(/^contraseña/i).fill("docentai-dev-password");
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: "My courses" })).toBeVisible();
    await openMenuIfNeeded(page);
    await expect(page.getByRole("button", { name: /sign out/i }).filter({ visible: true })).toBeVisible();
  });
});
