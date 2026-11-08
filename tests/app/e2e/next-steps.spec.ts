// 020 — recommended next steps on the student's progress and the teacher's student page.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seed = { topic: string | null; kind: "exercise" | "quiz"; result: "correct" | "partially_correct" | "incorrect"; days_ago: number };

const TOPICS = ["Paréntesis", "Transponer términos", "Despejar la incógnita"];
const qz = (topic: string, right: boolean, days_ago = 1): Seed => ({ topic, kind: "quiz", result: right ? "correct" : "incorrect", days_ago });
/** Paréntesis 1 of 5 (starting), Transponer 4 of 5 (mastered), Despejar not started. */
const WEAK_PARENS: Seed[] = [
  qz("Paréntesis", true),
  ...Array.from({ length: 4 }, () => qz("Paréntesis", false)),
  ...Array.from({ length: 4 }, () => qz("Transponer términos", true)),
  qz("Transponer términos", false)
];

async function room(request: APIRequestContext, page: Page, items: Seed[] = []) {
  const { courseId } = await classroom(request, page);
  await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, topics: TOPICS, items } });
  return { courseId };
}

async function openProgress(page: Page, courseId: string) {
  await page.goto(`/student/courses/${courseId}/progress`);
  await expect(page.getByRole("heading", { level: 1, name: /mi progreso/i })).toBeVisible();
}

const nextSteps = (page: Page) => page.getByRole("region", { name: /tu siguiente paso/i });
const steps = (page: Page) => nextSteps(page).getByRole("list", { name: /pasos recomendados/i }).getByRole("listitem");

test.describe("020 US1 the student's next steps", () => {
  scenario("020-US1-AS1", "with no activity the first topic is proposed, with its reason", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    await openProgress(page, courseId);

    await expect(steps(page)).toHaveCount(1);
    await expect(steps(page).first()).toContainText(/empieza con «paréntesis»/i);
    await expect(steps(page).first()).toContainText(/todavía no has trabajado este tema/i);
    await expect(nextSteps(page).getByText(/recomendación provisional/i)).toBeVisible();
    await expectAccessible(page);

    await steps(page).first().getByRole("link", { name: /preguntar al tutor/i }).click();
    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}(/conversations/.*)?$`));
  });

  scenario("020-US1-AS2", "the weakest topic is practised with a quiz", async ({ page, request }) => {
    const { courseId } = await room(request, page, WEAK_PARENS);
    await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, topic: "Paréntesis" } });
    await openProgress(page, courseId);

    const practice = steps(page).first();
    await expect(practice).toContainText(/practica «paréntesis»/i);
    await expect(practice).toContainText(/es tu tema más flojo: has acertado el 20\s?% de tus últimos 5 ejercicios y preguntas/i);
    await expect(steps(page).nth(1)).toContainText(/empieza con «despejar la incógnita»/i);
    await expectAccessible(page);

    await practice.getByRole("button", { name: /hacer un cuestionario/i }).click();
    await expect(page).toHaveURL(/\/quizzes\//);
    await expect(page.getByText(/preguntas sobre paréntesis/i)).toBeVisible();
  });

  scenario("020-US1-AS3", "an open test comes first", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    await request.post(`${MOCK}/__test/course-test`, { data: { course_id: courseId, open: ["pre"] } });
    await openProgress(page, courseId);

    await expect(steps(page).first()).toContainText(/haz el test inicial/i);
    await steps(page).first().getByRole("link", { name: /hacer el test/i }).click();
    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}/test/pre$`));
  });

  scenario("020-US1-AS4", "a repeated mistake is reviewed, with its count", async ({ page, request }) => {
    const { courseId } = await room(request, page);
    await request.post(`${MOCK}/__test/mistakes`, { data: { course_id: courseId, count: 3 } });
    await openProgress(page, courseId);

    const review = steps(page).filter({ hasText: /repasa un error que se repite/i });
    await expect(review).toContainText(/has cometido 3 errores de tipo «.+» en «paréntesis» en los últimos 30 días/i);
    await review.getByRole("link", { name: /^repasar$/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });

  scenario("020-US1-AS5", "with every topic mastered there is nothing to recommend", async ({ page, request }) => {
    const { courseId } = await room(request, page, TOPICS.flatMap((topic) => [qz(topic, true), qz(topic, true), qz(topic, true)]));
    await openProgress(page, courseId);

    await expect(nextSteps(page).getByText(/vas al día/i)).toBeVisible();
    await expect(nextSteps(page).getByRole("list")).toHaveCount(0);
  });

  scenario("020-US1-AS6", "each topic with questions can be practised from its card", async ({ page, request }) => {
    const { courseId } = await room(request, page, WEAK_PARENS);
    await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, topic: "Transponer términos" } });
    await openProgress(page, courseId);

    const topics = page.getByRole("list", { name: /progreso por tema/i });
    await expect(topics.getByRole("button", { name: /practicar «transponer términos» con un cuestionario/i })).toBeVisible();
    await expect(topics.getByRole("button", { name: /practicar «paréntesis»/i })).toHaveCount(0);

    await topics.getByRole("button", { name: /practicar «transponer términos» con un cuestionario/i }).click();
    await expect(page.getByText(/preguntas sobre transponer términos/i)).toBeVisible();
  });
});

test.describe("020 US2 the teacher's view", () => {
  scenario("020-US2-AS1", "the teacher sees the same steps, worded for them and without actions", async ({ page, request }) => {
    const { courseId } = await room(request, page, WEAK_PARENS);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: /lucas herrera/i }).first().click();

    const section = page.getByRole("region", { name: /siguientes pasos recomendados/i });
    await expect(section.getByRole("listitem").first()).toContainText(/tema más flojo: «paréntesis»/i);
    await expect(section.getByRole("listitem").first()).toContainText(/es su tema más flojo: ha acertado el 20\s?%/i);
    await expect(section.getByRole("button")).toHaveCount(0);
    await expect(section.getByRole("link")).toHaveCount(0);
    await expectAccessible(page);
  });
});
