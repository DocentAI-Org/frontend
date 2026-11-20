// 024 — suggested topics by section and their pages (spec 024, FR-073 of spec 001).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

async function teacherCourse(request: APIRequestContext, page: Page) {
  const response = await request.post(`${MOCK}/__test/classroom`, { data: {} });
  const { course_id } = (await response.json()) as { course_id: string };
  await signIn(page, USERS.teacher);
  return course_id;
}

async function addTopic(page: Page, courseId: string, name: string) {
  await page.goto(`/teacher/courses/${courseId}/topics`);
  await page.getByLabel(/nuevo tema/i).fill(name);
  await page.getByRole("button", { name: /añadir (el primer )?tema/i }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${name}» se ha añadido` })).toBeVisible();
}

const row = (page: Page) => page.locator('[data-component="DocumentRow"]').first();

test.describe("024 material topics", () => {
  scenario("024-US1-AS1", "the material says how many sections have a suggested topic", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, courseId, "Ecuaciones");
    for (const section of ["3.1 Transponer términos", "3.2 Despejar la incógnita"]) {
      await request.post(`${MOCK}/__test/suggestion`, { data: { topic_name: "Ecuaciones", section } });
    }

    await page.goto(`/teacher/courses/${courseId}/material`);

    await expect(row(page)).toContainText("2 secciones con tema sugerido");
    await expectAccessible(page);
    await row(page).getByRole("link", { name: /revisar temas/i }).click();
    await expect(page).toHaveURL(new RegExp(`/teacher/courses/${courseId}/topics/assignment`));
  });

  scenario("024-US1-AS2", "without suggestions pending there is no line", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, courseId, "Ecuaciones");
    await request.post(`${MOCK}/__test/suggestion`, { data: { topic_name: "Ecuaciones", section: "3.1 Transponer términos" } });

    await page.goto(`/teacher/courses/${courseId}/material`);
    await expect(row(page)).toContainText("1 sección con tema sugerido");

    // Confirming it on the assignment page clears the line. Markdown sections have no pages.
    await page.goto(`/teacher/courses/${courseId}/topics/assignment`);
    await expect(page.getByRole("group", { name: /3\.1 transponer términos/i })).not.toContainText(/p\. \d/);
    await page.getByRole("button", { name: /guardar temas/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /temas guardados/i })).toBeVisible();
    await page.goto(`/teacher/courses/${courseId}/material`);
    await expect(row(page)).not.toContainText(/con tema sugerido/i);
  });

  scenario("024-US2-AS1", "each section shows its pages next to its name", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, courseId, "Ecuaciones");
    await request.post(`${MOCK}/__test/pages`, { data: { section: "3.1 Transponer términos", pages: [3, 4, 5] } });
    await request.post(`${MOCK}/__test/pages`, { data: { section: "3.2 Despejar la incógnita", pages: [6] } });

    await page.goto(`/teacher/courses/${courseId}/topics/assignment`);

    await expect(page.getByRole("group", { name: /3\.1 transponer términos/i })).toContainText("p. 3–5");
    await expect(page.getByRole("group", { name: /3\.2 despejar la incógnita/i })).toContainText("p. 6");
    await expectAccessible(page);
  });
});
