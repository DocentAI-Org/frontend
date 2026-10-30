// US2 — teacher creates a course and students join it (spec 002 US2, 001 US4).
import type { Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";

async function createCourse(page: Page, name = "Álgebra") {
  await page.goto("/teacher/courses/new");
  await page.getByLabel(/nombre del curso/i).fill(name);
  await page.getByLabel(/descripción/i).fill("Ecuaciones de primer grado");
  await page.getByRole("button", { name: /crear curso/i }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  const code = (await page.getByTestId("class-code").textContent())?.trim() ?? "";
  expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{4}$/);
  return { code, url: page.url() };
}

async function studentJoins(page: Page, code: string) {
  await signIn(page, USERS.student);
  // First sign-in: study consent, then the join screen.
  await page.getByRole("checkbox", { name: /acepto participar/i }).check();
  await page.getByRole("button", { name: /^continuar/i }).click();
  await page.getByRole("link", { name: /entendido, continuar/i }).click();
  await page.waitForURL(/\/student\/courses$/);
  await page.goto("/student/join");
  await page.getByLabel(/código de clase/i).fill(code);
  await page.getByRole("button", { name: /unirme al curso/i }).click();
}

test.describe("US2 courses and enrolment", () => {
  scenario("001-US4-AS1", "a teacher without courses is invited to create one", async ({ page }) => {
    await signIn(page, USERS.teacher);

    await expect(page.getByRole("heading", { name: /crea tu primer curso/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US4-AS2", "a new course shows its code and invitation link with copy actions", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.getByRole("link", { name: /crear curso/i }).first().click();
    await expectAccessible(page);
    await page.getByRole("button", { name: /crear curso/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /revisa el campo/i })).toBeVisible();

    const { code } = await createCourse(page);

    const link = page.getByLabel(/enlace de invitación/i);
    await expect(link).toHaveValue(new RegExp(`/join/${code}$`));
    await page.getByRole("button", { name: /copiar código/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /copiado/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US4-AS3", "the students section lists who joined or explains how to invite", async ({ page }) => {
    await signIn(page, USERS.teacher);
    const { code, url } = await createCourse(page);
    await expect(page.getByRole("heading", { name: /todavía no hay estudiantes/i })).toBeVisible();

    await signOut(page);
    await studentJoins(page, code);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(url);

    await expect(page.getByRole("listitem").filter({ hasText: "Lucas Herrera" })).toBeVisible();
  });

  scenario("001-US4-AS4", "regenerating or disabling the code stops the old one", async ({ page }) => {
    await signIn(page, USERS.teacher);
    const { code, url } = await createCourse(page);

    await page.getByRole("button", { name: /generar código nuevo/i }).click();
    await expect(page.getByRole("dialog")).toContainText(code);
    await expectAccessible(page);
    await page.getByRole("dialog").getByRole("button", { name: /generar código nuevo/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /código anterior ya no funciona/i })).toBeVisible();
    const newCode = (await page.getByTestId("class-code").textContent())?.trim() ?? "";
    expect(newCode).not.toBe(code);

    await page.getByRole("button", { name: /desactivar código/i }).click();
    await expect(page.getByText(/nadie puede unirse con este código/i)).toBeVisible();

    await signOut(page);
    await studentJoins(page, code);
    await expect(page.getByRole("alert").filter({ hasText: /no encontramos ningún curso/i })).toBeVisible();
    await page.getByLabel(/código de clase/i).fill(newCode);
    await page.getByRole("button", { name: /unirme al curso/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /desactivado este código/i })).toBeVisible();
    expect(url).toBeTruthy();
  });

  scenario("001-US4-AS5", "a student joins with a code and sees the course", async ({ page }) => {
    await signIn(page, USERS.teacher);
    const { code } = await createCourse(page);
    await signOut(page);

    await studentJoins(page, code);

    await expect(page.getByRole("heading", { name: /te has unido al curso/i })).toBeVisible();
    await expect(page.getByText("Álgebra").first()).toBeVisible();
    await expect(page.getByText(/Prof\. Elena Ruiz/).first()).toBeVisible();
    await expectAccessible(page);
    await page.goto("/student/courses");
    await expect(page.getByRole("heading", { level: 2, name: "Álgebra" })).toBeVisible();
  });

  scenario("001-US4-AS6", "an invalid code explains the problem", async ({ page }) => {
    await studentJoins(page, "ZZZ-9999");

    await expect(page.getByRole("alert").filter({ hasText: /no encontramos ningún curso/i })).toBeVisible();
    await expect(page.getByLabel(/código de clase/i)).toHaveValue("ZZZ-9999");
    await expectAccessible(page);
  });

  scenario("002-US2-AS1", "the invitation link opens the join screen with the code filled in", async ({ page }) => {
    await signIn(page, USERS.teacher);
    const { code } = await createCourse(page);
    const link = await page.getByLabel(/enlace de invitación/i).inputValue();
    await signOut(page);

    await page.goto(new URL(link).pathname);
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fjoin%2F/);
    await page.getByLabel(/correo electrónico o código/i).fill(USERS.student);
    await page.getByLabel(/^contraseña/i).fill("docentai-dev-password");
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await page.getByRole("checkbox", { name: /acepto participar/i }).check();
    await page.getByRole("button", { name: /^continuar/i }).click();
    await page.getByRole("link", { name: /entendido, continuar/i }).click();

    await expect(page.getByLabel(/código de clase/i)).toHaveValue(code);
  });

  scenario("002-US2-AS2", "a revoked student gets its own message", async ({ page }) => {
    await signIn(page, USERS.teacher);
    const { code, url } = await createCourse(page);
    await signOut(page);
    await studentJoins(page, code);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(url);
    await page.getByRole("button", { name: /quitar del curso/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /quitar del curso/i }).click();
    await expect(page.getByText(/fuera del curso/i)).toBeVisible();
    await signOut(page);

    await signIn(page, USERS.student);
    await page.goto("/student/join");
    await page.getByLabel(/código de clase/i).fill(code);
    await page.getByRole("button", { name: /unirme al curso/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /ya no estás inscrito/i })).toBeVisible();
  });
});
