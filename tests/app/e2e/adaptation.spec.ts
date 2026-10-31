// 014 — explanations adapted to the student, with their basis (spec 014, requirement S8, §4.7).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

const ADAPTED = { error_type: "procedural", count: 3, window_days: 30 };

async function adapt(request: APIRequestContext, adaptation: typeof ADAPTED | null) {
  await request.post(`${MOCK}/__test/adaptation`, { data: { adaptation } });
}

async function ask(page: Page, text: string) {
  await page.getByLabel(/escribe tu pregunta/i).fill(text);
  await page.getByRole("button", { name: /^enviar$/i }).click();
}

async function sendExercise(page: Page) {
  await page.getByLabel(/enunciado del ejercicio/i).fill("Despeja la incógnita en 2x = 4");
  await page.getByLabel(/tu solución, paso a paso/i).fill("2x = 4\nx = 4 - 2\nx = 2");
  await page.getByRole("button", { name: /revisar antes de enviar/i }).click();
  await page.getByRole("button", { name: /enviar ejercicio/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
}

const note = (page: Page) => page.locator('[data-component="AdaptationNote"]');

test.describe("014 US1 the student sees why an answer was adapted", () => {
  scenario("014-US1-AS1", "an adapted chat answer says why, by error type name", async ({ page, request }) => {
    await adapt(request, ADAPTED);
    await classroom(request, page);

    await ask(page, "¿Cómo despejo la incógnita en 2x = 4?");

    await expect(note(page)).toHaveCount(1);
    await expect(note(page)).toContainText(/adaptada para ti/i);
    await expect(note(page)).toContainText(/3 errores de tipo «error de procedimiento» en los últimos 30 días/i);
    await expectAccessible(page);
  });

  scenario("014-US1-AS2", "adapted exercise feedback says why", async ({ page, request }) => {
    await adapt(request, ADAPTED);
    await classroom(request, page, { path: "/exercise" });

    await sendExercise(page);

    await expect(note(page)).toContainText(/adaptada para ti/i);
    await expect(note(page)).toContainText(/error de procedimiento/i);
    await expectAccessible(page);
  });

  scenario("014-US1-AS3", "without adaptation there is no sentence", async ({ page, request }) => {
    await adapt(request, null);
    await classroom(request, page, { path: "/exercise" });

    await sendExercise(page);

    await expect(page.getByText(/dónde está el error:/i)).toBeVisible();
    await expect(note(page)).toHaveCount(0);
  });
});

test.describe("014 US2 the teacher sees the same basis", () => {
  scenario("014-US2-AS1", "the teacher reads the basis in the conversation and the exercise", async ({ page, request }) => {
    await adapt(request, ADAPTED);
    const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
    const { course_id } = (await seeded.json()) as { course_id: string };
    const activity = await request.post(`${MOCK}/__test/activity`, { data: { course_id } });
    const { conversation_id, submission_id } = (await activity.json()) as { conversation_id: string; submission_id: string };
    await signIn(page, USERS.teacher);

    await page.goto(`/teacher/courses/${course_id}/conversations/${conversation_id}`);
    await expect(note(page)).toContainText(/adaptada: el estudiante ha cometido 3 errores de tipo «error de procedimiento»/i);
    await expectAccessible(page);

    await page.goto(`/teacher/courses/${course_id}/exercises/${submission_id}`);
    await expect(note(page)).toContainText(/adaptada: el estudiante/i);
  });
});
