// 022 — a repeated mistake is overcome after correct exercises in a row in its topic.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seed = { topic: string; kind: "exercise"; result: "correct" | "partially_correct" | "incorrect"; days_ago: number; error_type?: string };
const ex = (result: Seed["result"], days_ago: number, error_type = "procedural"): Seed => ({ topic: "Paréntesis", kind: "exercise", result, days_ago, error_type });
const MISTAKES = [ex("incorrect", 10), ex("incorrect", 9), ex("incorrect", 8)];

async function room(request: APIRequestContext, page: Page, items: Seed[]) {
  const { courseId } = await classroom(request, page);
  const seeded = await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, topics: ["Paréntesis"], items } });
  const { submissions } = (await seeded.json()) as { submissions: string[] };
  return { courseId, submissions };
}

const overcomeNotice = (page: Page) => page.locator('[data-component="OvercomeNotice"]');
const topicErrors = (page: Page) => page.getByRole("list", { name: /errores más frecuentes en este tema/i });

test.describe("022 US1 the student is told when they got past a mistake", () => {
  scenario("022-US1-AS1", "the exercise that completes the run says the mistake is overcome", async ({ page, request }) => {
    const { courseId, submissions } = await room(request, page, [...MISTAKES, ex("correct", 5), ex("correct", 4), ex("correct", 3)]);
    await page.goto(`/student/courses/${courseId}/exercises/${submissions[5]}`);

    await expect(overcomeNotice(page).getByRole("heading", { name: /error superado/i })).toBeVisible();
    await expect(overcomeNotice(page)).toContainText(/llevas 3 ejercicios bien seguidos en «paréntesis» desde tu último error de tipo «.+», que habías cometido 3 veces/i);
    await expectAccessible(page);
  });

  scenario("022-US1-AS2", "earlier correct exercises say nothing yet", async ({ page, request }) => {
    const { courseId, submissions } = await room(request, page, [...MISTAKES, ex("correct", 5), ex("correct", 4)]);
    await page.goto(`/student/courses/${courseId}/exercises/${submissions[4]}`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(overcomeNotice(page)).toHaveCount(0);
  });
});

test.describe("022 US2 progress shows how far each mistake is", () => {
  scenario("022-US2-AS1", "a mistake on its way and one overcome, for the student and the teacher", async ({ page, request }) => {
    const { courseId } = await room(request, page, [...MISTAKES, ex("correct", 5), ex("correct", 4)]);
    await page.goto(`/student/courses/${courseId}/progress`);
    await expect(topicErrors(page).getByText(/llevas 2 ejercicios bien seguidos desde el último/i)).toBeVisible();

    await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, items: [ex("correct", 3)] } });
    await page.reload();
    await expect(topicErrors(page).getByText(/superado: 3 ejercicios bien seguidos desde el último/i)).toBeVisible();
    await expectAccessible(page);

    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: /lucas herrera/i }).first().click();
    await expect(page.getByRole("region", { name: /progreso por tema/i }).getByText(/superado: 3 ejercicios bien seguidos/i)).toBeVisible();
  });
});

test.describe("022 US3 overcome mistakes are not recommended", () => {
  scenario("022-US3-AS1", "the next steps stop proposing the review", async ({ page, request }) => {
    const { courseId } = await room(request, page, [...MISTAKES, ex("correct", 5), ex("correct", 4), ex("correct", 3)]);
    await page.goto(`/student/courses/${courseId}/progress`);

    await expect(page.getByRole("heading", { level: 1, name: /mi progreso/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /tu siguiente paso/i }).getByText(/repasa un error que se repite/i)).toHaveCount(0);
  });
});

test.describe("022 US4 the threshold is a criterion", () => {
  scenario("022-US4-AS1", "the repeated mistakes group shows when a mistake is overcome", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/pedagogy");

    await expect(page.getByRole("group", { name: /errores repetidos/i }).getByLabel(/para darlo por superado/i)).toHaveValue("3");
  });
});
