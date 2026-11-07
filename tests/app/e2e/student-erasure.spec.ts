// 017 — the admin erases a student on request (spec 017, requirements §4.1).
// Each scenario erases a student it creates, so it also runs against the real stack.
import { type Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";

/** Creates one pseudonymous student and returns their code. */
async function newStudent(page: Page): Promise<string> {
  await page.goto("/admin/students/new");
  await page.getByLabel(/número de cuentas/i).fill("1");
  await page.getByRole("button", { name: /crear cuentas/i }).click();
  await expect(page.getByRole("heading", { name: /cuentas creadas/i })).toBeVisible();
  return (await page.getByRole("table").getByRole("row").nth(1).getByRole("rowheader").textContent())?.trim() ?? "";
}

/** The user's row in the list (a table row on desktop, a list item on a phone). */
function userRow(page: Page, name: string) {
  return page.locator("table tr, ul[aria-label] > li").filter({ hasText: name }).filter({ visible: true });
}

/** Opens the user list searched for `name` and returns that user's row. */
async function rowOf(page: Page, name: string) {
  await page.goto(`/admin/users?q=${encodeURIComponent(name)}`);
  await expect(page.getByRole("heading", { level: 1, name: /usuarios/i })).toBeVisible();
  return userRow(page, name);
}

test.describe("017 US1 the admin erases a student", () => {
  scenario("017-US1-AS1", "only student rows can be erased", async ({ page }) => {
    await signIn(page, USERS.admin);
    const code = await newStudent(page);

    const student = await rowOf(page, code);
    await expect(student.getByRole("button", { name: /borrar estudiante/i })).toBeVisible();
    const teacher = await rowOf(page, "Prof. Elena Ruiz");
    await expect(teacher).toBeVisible();
    await expect(teacher.getByRole("button", { name: /borrar/i })).toHaveCount(0);
    const admin = await rowOf(page, "Admin DocentAI");
    await expect(admin.getByRole("button", { name: /borrar/i })).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("017-US1-AS2", "the dialog says what goes and asks for the name", async ({ page }) => {
    await signIn(page, USERS.admin);
    const code = await newStudent(page);
    const row = await rowOf(page, code);

    await row.getByRole("button", { name: /borrar estudiante/i }).click();

    const dialog = page.getByRole("dialog", { name: new RegExp(`borrar a ${code}`, "i") });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/no se puede deshacer/i);
    await expect(dialog).toContainText(/conversaciones/i);
    const confirm = dialog.getByRole("button", { name: /borrar para siempre/i });
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel(/para confirmar/i).fill("otro");
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel(/para confirmar/i).fill(` ${code.toLowerCase()} `);
    await expect(confirm).toBeEnabled();
    await expectAccessible(page);

    await dialog.getByRole("button", { name: /cancelar/i }).click();
    await expect(dialog).toBeHidden();
    await expect(row).toBeVisible();
  });

  scenario("017-US1-AS3", "after confirming, the student is gone and the counts are shown", async ({ page }) => {
    await signIn(page, USERS.admin);
    const code = await newStudent(page);
    const row = await rowOf(page, code);
    await row.getByRole("button", { name: /borrar estudiante/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/para confirmar/i).fill(code);

    await dialog.getByRole("button", { name: /borrar para siempre/i }).click();

    await expect(page).toHaveURL(/\/admin\/users\?/);
    const status = page.getByRole("status").filter({ hasText: /estudiante borrado/i });
    await expect(status).toBeVisible();
    await expect(status).toContainText(/0 conversaciones/i);
    expect(page.url()).not.toContain(code);
    await expectAccessible(page);
    await page.goto(`/admin/users?q=${code}`);
    await expect(page.getByRole("heading", { level: 1, name: /usuarios/i })).toBeVisible();
    await expect(userRow(page, code)).toHaveCount(0);
  });

  scenario("017-US1-AS4", "an API failure is shown and the student stays", async ({ page, mock }) => {
    await signIn(page, USERS.admin);
    const code = await newStudent(page);
    const row = await rowOf(page, code);
    await mock.faults(["student_erasure_fails"]);
    await row.getByRole("button", { name: /borrar estudiante/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/para confirmar/i).fill(code);

    await dialog.getByRole("button", { name: /borrar para siempre/i }).click();

    await expect(page.getByRole("alert")).toContainText(/no se ha podido borrar/i);
    await expectAccessible(page);
    await mock.faults([]);
    await expect(await rowOf(page, code)).toBeVisible();
  });
});

test.describe("017 US2 only the admin", () => {
  scenario("017-US2-AS1", "teachers and students cannot reach the user list", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/admin/users");
    await expect(page.getByRole("button", { name: /borrar estudiante/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: /usuarios/i })).toHaveCount(0);
    await page.context().clearCookies();

    await signIn(page, USERS.student);
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { level: 1, name: /usuarios/i })).toHaveCount(0);
  });
});
