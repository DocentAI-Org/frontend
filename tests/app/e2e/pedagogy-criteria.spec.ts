// 015 — configurable pedagogical criteria (spec 015 US1–US2; open questions OQ3, OQ9, OQ12).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

const group = (page: Page, name: RegExp) => page.getByRole("group", { name });

async function teacherCourse(request: APIRequestContext, page: Page) {
  const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
  const { course_id } = (await seeded.json()) as { course_id: string };
  await signIn(page, USERS.teacher);
  return course_id;
}

test.describe("015 US1 the study team sets the defaults", () => {
  scenario("015-US1-AS1", "the admin sees every group with today's values", async ({ page }) => {
    await signIn(page, USERS.admin);
    await openMenuIfNeeded(page);
    await page.getByRole("link", { name: /criterios pedagógicos/i }).filter({ visible: true }).first().click();

    await expect(page.getByRole("heading", { level: 1, name: /criterios pedagógicos/i })).toBeVisible();
    await expect(group(page, /sin actividad/i).getByLabel(/días sin actividad/i)).toHaveValue("7");
    await expect(group(page, /proporción de errores/i).getByLabel(/porcentaje de errores/i)).toHaveValue("60");
    await expect(group(page, /errores repetidos/i).getByLabel(/veces/i)).toHaveValue("3");
    await expect(group(page, /adaptación/i).getByRole("checkbox")).toBeChecked();
    await expect(group(page, /dominio de un tema/i).getByLabel(/dominado desde/i)).toHaveValue("80");
    await expect(page.getByRole("checkbox", { name: /provisionales/i })).toBeChecked();
    await expectAccessible(page);
  });

  scenario("015-US1-AS2", "a saved change stays after a reload", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/pedagogy");
    await group(page, /sin actividad/i).getByLabel(/días sin actividad/i).fill("10");
    await page.getByRole("button", { name: /guardar criterios/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await page.reload();
    await expect(group(page, /sin actividad/i).getByLabel(/días sin actividad/i)).toHaveValue("10");
  });

  scenario("015-US1-AS3", "values the API rejects are explained and not saved", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/pedagogy");
    await group(page, /dominio de un tema/i).getByLabel(/en progreso desde/i).fill("90");
    await page.getByRole("button", { name: /guardar criterios/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /revisa los valores/i })).toBeVisible();
    await expectAccessible(page);
    await page.reload();
    await expect(group(page, /dominio de un tema/i).getByLabel(/en progreso desde/i)).toHaveValue("50");
  });
});

test.describe("015 US1 slow phones", () => {
  scenario("015-US1-AS4", "a value typed before the page is ready is the one saved", async ({ page }) => {
    // Seen in CI on mobile: hydration reset the typed value and the old one was saved.
    await signIn(page, USERS.admin);
    await page.route("**/_next/static/chunks/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.continue();
    });
    await page.goto("/admin/pedagogy", { waitUntil: "commit" });
    await group(page, /sin actividad/i).getByLabel(/días sin actividad/i).fill("12");
    await page.waitForLoadState("networkidle");
    await page.unroute("**/_next/static/chunks/**");
    await page.getByRole("button", { name: /guardar criterios/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await page.reload();
    await expect(group(page, /sin actividad/i).getByLabel(/días sin actividad/i)).toHaveValue("12");
  });
});

test.describe("015 US2 a teacher adjusts their course", () => {
  scenario("015-US2-AS1", "each group follows the study by default, read-only", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: /^criterios$/i }).click();

    const inactive = group(page, /sin actividad/i);
    await expect(inactive.getByRole("radio", { name: /los del estudio/i })).toBeChecked();
    await expect(inactive.getByLabel(/días sin actividad/i)).toBeDisabled();
    await expect(inactive.getByLabel(/días sin actividad/i)).toHaveValue("7");
    await expectAccessible(page);
  });

  scenario("015-US2-AS2", "a customised group is the course's own; the others follow the study", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/criteria`);
    const inactive = group(page, /sin actividad/i);
    await inactive.getByRole("radio", { name: /personalizar/i }).check();
    await inactive.getByLabel(/días sin actividad/i).fill("3");
    await page.getByRole("button", { name: /guardar criterios/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await page.reload();
    await expect(group(page, /sin actividad/i).getByRole("radio", { name: /personalizar/i })).toBeChecked();
    await expect(group(page, /sin actividad/i).getByLabel(/días sin actividad/i)).toHaveValue("3");
    await expect(group(page, /dominio de un tema/i).getByRole("radio", { name: /los del estudio/i })).toBeChecked();
  });

  scenario("015-US2-AS3", "going back to the study's values", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/criteria`);
    const inactive = group(page, /sin actividad/i);
    await inactive.getByRole("radio", { name: /personalizar/i }).check();
    await inactive.getByLabel(/días sin actividad/i).fill("3");
    await page.getByRole("button", { name: /guardar criterios/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();

    await group(page, /sin actividad/i).getByRole("radio", { name: /los del estudio/i }).check();
    await page.getByRole("button", { name: /guardar criterios/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await page.reload();
    await expect(group(page, /sin actividad/i).getByLabel(/días sin actividad/i)).toHaveValue("7");
  });
});
