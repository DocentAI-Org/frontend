// 009 — progress and mastery by topic, for the student and on the teacher's student page.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seed = { topic: string | null; kind: "exercise" | "quiz"; result: "correct" | "partially_correct" | "incorrect"; days_ago: number; error_type?: string };

async function seed(request: APIRequestContext, courseId: string, items: Seed[], topics: string[] = []) {
  await request.post(`${MOCK}/__test/progress`, { data: { course_id: courseId, topics, items } });
}

const ex = (topic: string | null, result: Seed["result"], days_ago: number, error_type?: string): Seed => ({ topic, kind: "exercise", result, days_ago, error_type });
const qz = (topic: string | null, right: boolean, days_ago: number): Seed => ({ topic, kind: "quiz", result: right ? "correct" : "incorrect", days_ago });

/** Paréntesis: 3 of 4 exercises right (one half), 2 of 3 quiz answers; Transponer: 2 items; Despejar: none. */
const ACTIVITY: Seed[] = [
  ex("Paréntesis", "correct", 20),
  ex("Paréntesis", "incorrect", 13, "procedural"),
  ex("Paréntesis", "partially_correct", 6, "conceptual"),
  ex("Paréntesis", "incorrect", 5, "procedural"),
  qz("Paréntesis", true, 2),
  qz("Paréntesis", true, 2),
  qz("Paréntesis", false, 2),
  ex("Transponer términos", "correct", 1),
  ex("Transponer términos", "correct", 1)
];

async function progressPage(request: APIRequestContext, page: Page, items = ACTIVITY) {
  const { courseId } = await classroom(request, page);
  await seed(request, courseId, items, ["Paréntesis", "Transponer términos", "Despejar la incógnita"]);
  await page.goto(`/student/courses/${courseId}/progress`);
  await expect(page.getByRole("heading", { level: 1, name: /mi progreso/i })).toBeVisible();
  return { courseId };
}

const topics = (page: Page) => page.getByRole("list", { name: /progreso por tema/i });
const topic = (page: Page, name: RegExp) => topics(page).getByRole("listitem").filter({ has: page.getByRole("heading", { name }) });

test.describe("009 US1 my progress", () => {
  scenario("009-US1-AS1", "every topic shows its level in words and its basis", async ({ page, request }) => {
    await progressPage(request, page);

    const parens = topic(page, /^paréntesis$/i);
    await expect(parens.getByText(/nivel de dominio: en progreso/i)).toBeVisible();
    await expect(parens.getByText(/1 de 4 ejercicios correctos \(1 a medias\) · 2 de 3 preguntas acertadas/i)).toBeVisible();
    await expect(topics(page).getByRole("heading", { level: 2 })).toHaveText(["Paréntesis", "Transponer términos", "Despejar la incógnita"]);
    await expectAccessible(page);
  });

  scenario("009-US1-AS2", "'¿Por qué?' states the score, its basis and that it is provisional", async ({ page, request }) => {
    await progressPage(request, page);
    const parens = topic(page, /^paréntesis$/i);

    await parens.getByText(/¿por qué\?/i).click();

    await expect(parens.getByText(/has acertado el 50\s?% de tus últimos 7 ejercicios y preguntas de este tema/i)).toBeVisible();
    await expect(parens.getByText(/criterio provisional/i)).toBeVisible();
  });

  scenario("009-US1-AS3", "few items and no items are explained", async ({ page, request }) => {
    await progressPage(request, page);

    await expect(topic(page, /transponer términos/i).getByText(/todavía hay poca actividad/i)).toBeVisible();
    await expect(topic(page, /despejar la incógnita/i).getByText(/todavía no has trabajado este tema/i)).toBeVisible();
  });

  scenario("009-US1-AS4", "the last 8 weeks have a text alternative", async ({ page, request }) => {
    await progressPage(request, page);

    const history = topic(page, /^paréntesis$/i).getByRole("list", { name: /últimas 8 semanas/i });
    await expect(history.getByRole("listitem")).toHaveCount(8);
    await expect(history.getByRole("listitem").first()).toHaveText(/semana del .*: sin datos/i);
    await expect(history.getByRole("listitem").last()).toHaveText(/semana del .*: 50\s?%/i);
  });

  scenario("009-US1-AS5", "frequent mistakes link to their latest example", async ({ page, request }) => {
    await progressPage(request, page);

    const errors = topic(page, /^paréntesis$/i).getByRole("list", { name: /errores más frecuentes/i });
    await expect(errors.getByRole("listitem").first()).toContainText(/error de procedimiento.*2 veces/i);
    await errors.getByRole("listitem").first().getByRole("link", { name: /ver un ejemplo/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });

  scenario("009-US1-AS6", "graded work without a topic is shown apart", async ({ page, request }) => {
    await progressPage(request, page, [ex(null, "correct", 3), ex(null, "correct", 2), ex(null, "incorrect", 1, "execution")]);

    await expect(topic(page, /^sin tema$/i).getByText(/nivel de dominio: en progreso/i)).toBeVisible();
  });

  scenario("009-US1-AS7", "without activity an empty state points to the tutor and quizzes", async ({ page, request }) => {
    await progressPage(request, page, []);

    await expect(page.getByRole("heading", { name: /todavía no hay actividad/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /preguntar al tutor/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /hacer un cuestionario/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("009-US1-AS8", "the page says when it was updated and keeps the list of mistakes", async ({ page, request }) => {
    await progressPage(request, page);

    await expect(page.getByText(/actualizado el/i)).toBeVisible();
    await expect(page.getByText(/1 cuestionario hecho/i)).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /todos tus errores/i })).toBeVisible();
  });
});

test.describe("009 US2 the teacher's student page", () => {
  scenario("009-US2-AS1", "the teacher sees the same progress, worded for them", async ({ page, request }) => {
    const { courseId } = await progressPage(request, page);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: /lucas herrera/i }).first().click();

    const section = page.getByRole("region", { name: /progreso por tema/i });
    const parens = section.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /^paréntesis$/i }) });
    await expect(parens.getByText(/nivel de dominio: en progreso/i)).toBeVisible();
    await expect(parens.getByText(/1 de 4 ejercicios correctos \(1 a medias\) · 2 de 3 preguntas acertadas/i)).toBeVisible();
    await parens.getByText(/¿por qué\?/i).click();
    await expect(parens.getByText(/ha acertado el 50\s?% de sus últimos 7 ejercicios y preguntas/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("009-US2-AS2", "the weekly activity counts completed quizzes", async ({ page, request }) => {
    const { courseId } = await progressPage(request, page);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: /lucas herrera/i }).first().click();

    const table = page.getByRole("table");
    await expect(table.getByRole("columnheader", { name: /cuestionarios/i })).toBeVisible();
    await expect(table.getByRole("row").last()).toContainText(/1$/);
  });
});
