// 023 — the next step in "Mis cursos" and the chat; the teacher sees an overcome mistake.
import type { APIRequestContext, Locator, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seed = { topic: string; kind: "exercise"; result: "correct" | "incorrect"; days_ago: number; error_type?: string };
const ex = (result: Seed["result"], days_ago: number): Seed => ({ topic: "Paréntesis", kind: "exercise", result, days_ago, error_type: "procedural" });

async function room(request: APIRequestContext, page: Page, items: Seed[] = []) {
  const { courseId } = await classroom(request, page);
  const seeded = await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, topics: ["Paréntesis"], items } });
  const { submissions } = (await seeded.json()) as { submissions: string[] };
  return { courseId, submissions };
}

const nextStep = (page: Page | Locator) => page.locator('[data-component="NextStepLine"]');

async function courseRow(page: Page, courseId: string) {
  await page.goto("/student/courses");
  await expect(page.getByRole("heading", { level: 1, name: /mis cursos/i })).toBeVisible();
  return page.locator('[data-component="CourseRow"]').filter({ has: page.locator(`#course-${courseId}`) });
}

test.describe("023 US1 the next step is where the student starts", () => {
  scenario("023-US1-AS1", "each course row says its next step and links to progress", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    const row = await courseRow(page, courseId);

    await expect(nextStep(row)).toContainText(/tu siguiente paso: empieza con «paréntesis»/i);
    await expectAccessible(page);

    await nextStep(row).getByRole("link", { name: /empieza con «paréntesis»/i }).click();
    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}/progress$`));
  });

  scenario("023-US1-AS2", "an open test keeps its own notice and no second line", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    await request.post(`${MOCK}/__test/course-test`, { data: { course_id: courseId, open: ["pre"] } });
    const row = await courseRow(page, courseId);

    await expect(row.locator('[data-component="TestNotice"]')).toBeVisible();
    await expect(nextStep(row)).toHaveCount(0);
  });

  scenario("023-US1-AS3", "the chat shows the next step under the course title", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    await page.goto(`/student/courses/${courseId}`);

    await expect(nextStep(page)).toContainText(/tu siguiente paso: empieza con «paréntesis»/i);
    await expectAccessible(page);
    await nextStep(page).getByRole("link", { name: /empieza con «paréntesis»/i }).click();
    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}/progress$`));
  });
});

test.describe("023 US2 the teacher sees when an exercise overcame a mistake", () => {
  scenario("023-US2-AS1", "the overcome notice, worded for the teacher", async ({ page, request }) => {
    const items = [ex("incorrect", 10), ex("incorrect", 9), ex("incorrect", 8), ex("correct", 5), ex("correct", 4), ex("correct", 3)];
    const { courseId, submissions } = await room(request, page, items);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}/exercises/${submissions[5]}`);

    const notice = page.locator('[data-component="OvercomeNotice"]');
    await expect(notice.getByRole("heading", { name: /error superado/i })).toBeVisible();
    await expect(notice).toContainText(/lleva 3 ejercicios bien seguidos en «paréntesis» desde su último error de tipo «.+», que había cometido 3 veces/i);
    await expectAccessible(page);
  });
});
