// 013 — study questionnaires (spec 013 US1–US2, requirement P4).
import type { Page } from "@playwright/test";

import { USERS, chooseOption, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, signOut, test } from "./helpers";
import { classroom } from "./helpers-student";

const LINK = "https://tally.so/r/abc123?ref={study_ref}";

async function publish(page: Page, title: string, audience: RegExp, url = LINK) {
  await page.goto("/admin/questionnaires");
  await page.getByLabel(/^título/i).fill(title);
  await page.getByLabel(/^enlace/i).fill(url);
  await chooseOption(page.getByRole("combobox", { name: /para quién/i }), audience);
  await page.getByRole("button", { name: /publicar/i }).click();
}

function row(page: Page, title: string) {
  return page.getByRole("row").filter({ hasText: title });
}

test.describe("013 US1 the study team publishes questionnaires", () => {
  scenario("013-US1-AS1", "the admin page lists them and explains the code", async ({ page }) => {
    await signIn(page, USERS.admin);
    await openMenuIfNeeded(page);
    await page.getByRole("link", { name: /^cuestionarios$/i }).filter({ visible: true }).first().click();

    await expect(page.getByRole("heading", { level: 1, name: /cuestionarios/i })).toBeVisible();
    await expect(page.getByText("{study_ref}").first()).toBeVisible();
    await expectAccessible(page);
  });

  scenario("013-US1-AS2", "a valid questionnaire is published; errors are explained", async ({ page }) => {
    await signIn(page, USERS.admin);
    await publish(page, "", /estudiantes/i, "http://tally.so/r/x");

    await expect(page.getByText(/escribe un título/i)).toBeVisible();
    await expect(page.getByText(/empezar por https/i)).toBeVisible();
    await expectAccessible(page);

    await publish(page, "Satisfacción", /estudiantes/i);
    await expect(row(page, "Satisfacción")).toContainText(/abierto/i);
    await expect(row(page, "Satisfacción")).toContainText(/estudiantes/i);
  });

  scenario("013-US1-AS3", "the admin closes, reopens and deletes one", async ({ page }) => {
    await signIn(page, USERS.admin);
    await publish(page, "Confianza", /profesorado/i);

    await row(page, "Confianza").getByRole("button", { name: /cerrar/i }).click();
    await expect(row(page, "Confianza")).toContainText(/cerrado/i);
    await row(page, "Confianza").getByRole("button", { name: /reabrir/i }).click();
    await expect(row(page, "Confianza")).toContainText(/abierto/i);
    await row(page, "Confianza").getByRole("button", { name: /eliminar/i }).click();
    await expect(row(page, "Confianza")).toHaveCount(0);
  });
});

test.describe("013 US2 students and teachers find the open ones", () => {
  scenario("013-US2-AS1", "a student sees an open student questionnaire as an external link", async ({ page, request }) => {
    await signIn(page, USERS.admin);
    await publish(page, "Satisfacción", /estudiantes/i);
    await signOut(page);

    await classroom(request, page);
    await page.goto("/student/courses");
    const box = page.getByRole("region", { name: /cuestionarios del estudio/i });
    const link = box.getByRole("link", { name: /satisfacción/i });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\/tally\.so\/r\/abc123\?ref=[0-9a-f]{64}$/);
    await expect(link).toContainText(/se abre en otra pestaña/i);
    await expectAccessible(page);
  });

  scenario("013-US2-AS2", "a teacher sees teacher questionnaires; students do not", async ({ page, request }) => {
    await signIn(page, USERS.admin);
    await publish(page, "Carga docente", /profesorado/i);
    await signOut(page);

    await signIn(page, USERS.teacher);
    await page.goto("/teacher/courses");
    await expect(page.getByRole("region", { name: /cuestionarios del estudio/i }).getByRole("link", { name: /carga docente/i })).toBeVisible();
    await signOut(page);

    await classroom(request, page);
    await page.goto("/student/courses");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /carga docente/i })).toHaveCount(0);
  });

  scenario("013-US2-AS3", "without open questionnaires there is no box", async ({ page, request }) => {
    await classroom(request, page);
    await page.goto("/student/courses");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: /cuestionarios del estudio/i })).toHaveCount(0);
  });
});
