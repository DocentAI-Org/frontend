// 021 — quizzes start from the student's mastery; the quiz settings are course criteria.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seed = { topic: string; kind: "quiz"; result: "correct" | "incorrect"; days_ago: number };
const qz = (right: boolean): Seed => ({ topic: "Paréntesis", kind: "quiz", result: right ? "correct" : "incorrect", days_ago: 1 });

async function room(request: APIRequestContext, page: Page, items: Seed[]) {
  const { courseId } = await classroom(request, page);
  await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, topics: ["Paréntesis"], items } });
  await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, topic: "Paréntesis" } });
  return { courseId };
}

/** Starts a quiz on "Paréntesis" from its progress card (spec 020). */
async function startOnTopic(page: Page, courseId: string) {
  await page.goto(`/student/courses/${courseId}/progress`);
  await page.getByRole("button", { name: /practicar «paréntesis» con un cuestionario/i }).click();
  await expect(page.getByText(/pregunta 1 de/i)).toBeVisible();
}

const startNote = (page: Page) => page.locator('[data-component="DecisionReason"][data-variant="start"]');
const group = (page: Page, name: RegExp) => page.getByRole("group", { name });

test.describe("021 US1 the quiz starts where the student is", () => {
  scenario("021-US1-AS1", "a mastered topic starts with hard questions, and says why", async ({ page, request }) => {
    const { courseId } = await room(request, page, [qz(true), qz(true), qz(true)]);
    await startOnTopic(page, courseId);

    await expect(startNote(page)).toContainText(/empiezas con preguntas de dificultad difícil porque tu dominio de este tema es «dominado» \(100\s?% de aciertos\)/i);
    await expect(startNote(page)).toContainText(/regla provisional/i);
    await expect(page.getByText(/dificultad: difícil/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("021-US1-AS2", "a weak topic starts with easy questions", async ({ page, request }) => {
    const { courseId } = await room(request, page, [qz(true), qz(false), qz(false), qz(false), qz(false)]);
    await startOnTopic(page, courseId);

    await expect(startNote(page)).toContainText(/dificultad fácil porque tu dominio de este tema es «empezando» \(20\s?% de aciertos\)/i);
  });

  scenario("021-US1-AS3", "without enough activity the default is used and explained", async ({ page, request }) => {
    const { courseId } = await room(request, page, [qz(true)]);
    await startOnTopic(page, courseId);

    await expect(startNote(page)).toContainText(/dificultad media: todavía hay poca actividad para saber tu nivel/i);
  });

  scenario("021-US1-AS4", "the note goes away after the first answer", async ({ page, request }) => {
    const { courseId } = await room(request, page, [qz(true), qz(true), qz(true)]);
    await startOnTopic(page, courseId);

    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: /comprobar/i }).click();
    await page.getByRole("button", { name: /siguiente pregunta/i }).click();
    await expect(page.getByText(/pregunta 2 de/i)).toBeVisible();
    await expect(startNote(page)).toHaveCount(0);
  });
});

test.describe("021 US3 the quiz settings are course criteria", () => {
  scenario("021-US3-AS1", "the teacher sets a shorter, fixed quiz and the student gets it", async ({ page, request }) => {
    const { courseId } = await room(request, page, [qz(true), qz(true), qz(true)]);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}/criteria`);
    const quiz = group(page, /^cuestionarios/i);
    await expect(quiz.getByLabel(/preguntas por cuestionario/i)).toHaveValue("5");
    await quiz.getByRole("radio", { name: /personalizar/i }).check();
    await quiz.getByLabel(/preguntas por cuestionario/i).fill("3");
    await quiz.getByRole("checkbox", { name: /según el dominio/i }).uncheck();
    await page.getByRole("button", { name: /guardar criterios/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /guardado/i })).toBeVisible();
    await expectAccessible(page);

    await signOut(page);
    await signIn(page, USERS.student);
    await startOnTopic(page, courseId);
    await expect(page.getByText(/pregunta 1 de 3/i)).toBeVisible();
    await expect(startNote(page)).toContainText(/dificultad media, la que ha fijado tu profesor\/a/i);
  });
});
