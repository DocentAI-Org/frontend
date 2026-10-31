// 008 — the teacher's question review and the student's adaptive quiz (spec 008 US1–US2).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, chooseOption, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Seeded = { id: string; statement: string; options: string[]; correct_option: number };

/** A classroom (course + validated material) with the teacher signed in on "Preguntas". */
async function teacherRoom(request: APIRequestContext, page: Page) {
  const response = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true } });
  const { course_id: courseId } = (await response.json()) as { course_id: string };
  await signIn(page, USERS.teacher);
  return { courseId };
}

async function seedQuestions(request: APIRequestContext, courseId: string, opts: { levels?: number[]; status?: string } = {}) {
  const response = await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, ...opts } });
  return (await response.json()) as { topic_id: string; questions: Seeded[] };
}

async function generation(request: APIRequestContext, mode: "drafts" | "no_source" | "fail", delay_ms = 0) {
  await request.post(`${MOCK}/__test/generation`, { data: { mode, delay_ms } });
}

async function openQuestions(page: Page, courseId: string, query = "") {
  await page.goto(`/teacher/courses/${courseId}/questions${query}`);
  await expect(page.getByRole("heading", { level: 2, name: /preguntas de cuestionario/i })).toBeVisible();
}

const card = (page: Page, statement: string) => page.getByRole("article", { name: statement });
const statusTabs = (page: Page) => page.getByRole("navigation", { name: /estado de las preguntas/i });

test.describe("008 US1 question review", () => {
  scenario("008-US1-AS1", "questions are listed by status with everything needed to review them", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    const { questions } = await seedQuestions(request, courseId, { levels: [1, 3], status: "pending" });
    await seedQuestions(request, courseId, { levels: [2], status: "approved" });
    await openQuestions(page, courseId);

    await expect(page.getByRole("link", { name: /^preguntas$/i })).toHaveAttribute("aria-current", "page");
    await expect(statusTabs(page).getByRole("link", { name: /pendientes 2/i })).toHaveAttribute("aria-current", "page");
    await expect(statusTabs(page).getByRole("link", { name: /aprobadas 1/i })).toBeVisible();
    await expect(statusTabs(page).getByRole("link", { name: /rechazadas 0/i })).toBeVisible();
    const first = card(page, questions[0].statement);
    const right = questions[0].options[questions[0].correct_option];
    await expect(first.getByRole("listitem").filter({ hasText: right })).toContainText(/respuesta correcta/i);
    await expect(first.getByRole("listitem")).toHaveCount(4);
    await expect(first.getByText(/dificultad: fácil/i)).toBeVisible();
    await expect(card(page, questions[1].statement).getByText(/dificultad: difícil/i)).toBeVisible();
    await expect(first.getByText(/paréntesis/i).first()).toBeVisible();
    await expect(first.getByText(/multiplica a cada término/i)).toBeVisible();
    await expect(first.getByRole("button", { name: /ver fuente: ecuaciones\.md/i })).toBeVisible();
    await expect(first.getByTitle(/generada con ia/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("008-US1-AS2", "new questions are generated for a topic and arrive as pending", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedQuestions(request, courseId, { levels: [] });
    await generation(request, "drafts", 1500);
    await openQuestions(page, courseId);

    const form = page.getByRole("region", { name: /pedir preguntas nuevas/i });
    await chooseOption(form.getByRole("combobox", { name: /tema/i }), "Paréntesis");
    await chooseOption(form.getByRole("combobox", { name: /cuántas/i }), "3");
    await form.getByRole("button", { name: /pedir preguntas/i }).click();

    const pending = form.getByRole("button", { name: /generando preguntas nuevas/i });
    await expect(pending).toBeVisible();
    await expect(pending).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: /han llegado 3 preguntas nuevas/i })).toBeVisible();
    await expect(statusTabs(page).getByRole("link", { name: /pendientes 3/i })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(3);
    await expectAccessible(page);
  });

  scenario("008-US1-AS3", "no usable material or an unavailable tutor is explained", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedQuestions(request, courseId, { levels: [] });
    await generation(request, "no_source");
    await openQuestions(page, courseId);
    const form = page.getByRole("region", { name: /pedir preguntas nuevas/i });
    await form.getByRole("button", { name: /pedir preguntas/i }).click();

    await expect(form.getByText(/el material de este tema no da para preguntas/i)).toBeVisible();
    await expect(form.getByRole("link", { name: /temas/i })).toBeVisible();

    await generation(request, "fail");
    await form.getByRole("button", { name: /pedir preguntas/i }).click();
    await expect(form.getByRole("alert")).toContainText(/tutor no está disponible/i);
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  scenario("008-US1-AS4", "approving and rejecting move the question and say who sees it", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    const { questions } = await seedQuestions(request, courseId, { levels: [1, 2], status: "pending" });
    await openQuestions(page, courseId);

    await card(page, questions[0].statement).getByRole("button", { name: /^aprobar$/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /tus estudiantes ya pueden verla/i })).toBeVisible();
    await expect(card(page, questions[0].statement)).toHaveCount(0);
    await expect(statusTabs(page).getByRole("link", { name: /aprobadas 1/i })).toBeVisible();

    await card(page, questions[1].statement).getByRole("button", { name: /^rechazar$/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /tus estudiantes no la verán/i })).toBeVisible();
    await expect(statusTabs(page).getByRole("link", { name: /rechazadas 1/i })).toBeVisible();
    await expect(page.getByText(/todo al día: no hay preguntas pendientes/i)).toBeVisible();

    await statusTabs(page).getByRole("link", { name: /aprobadas/i }).click();
    await expect(card(page, questions[0].statement)).toBeVisible();
  });

  scenario("008-US1-AS5", "editing explains invalid options and 'Guardar y aprobar' approves", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    const { questions } = await seedQuestions(request, courseId, { levels: [1], status: "pending" });
    await openQuestions(page, courseId);
    await card(page, questions[0].statement).getByRole("button", { name: /^editar$/i }).click();

    const form = page.getByRole("form", { name: /editar pregunta/i });
    await form.getByRole("textbox", { name: /^enunciado$/i }).fill("¿Cuánto es 2(x - 3) sin paréntesis?");
    await form.getByRole("textbox", { name: /^opción 1$/i }).fill("2x - 6");
    await form.getByRole("textbox", { name: /^opción 2$/i }).fill("2x - 6");
    await form.getByRole("button", { name: /guardar y aprobar/i }).click();
    await expect(form.getByText(/las cuatro opciones tienen que ser distintas/i)).toBeVisible();
    await expectAccessible(page);

    await form.getByRole("textbox", { name: /^opción 2$/i }).fill("2x - 3");
    await form.getByRole("radio", { name: /opción 1/i }).check();
    await form.getByRole("button", { name: /guardar y aprobar/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /tus estudiantes ya pueden verla/i })).toBeVisible();
    await statusTabs(page).getByRole("link", { name: /aprobadas 1/i }).click();
    const edited = card(page, "¿Cuánto es 2(x - 3) sin paréntesis?");
    await expect(edited.getByRole("listitem").filter({ hasText: "2x - 6" })).toContainText(/respuesta correcta/i);
    await expect(edited.getByText(/editada/i)).toBeVisible();
  });

  scenario("008-US1-AS6", "approved questions show how students answered them", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    const { questions } = await seedQuestions(request, courseId, { levels: [2] });
    await signOut(page);
    await signIn(page, USERS.student);
    await page.goto(`/student/courses/${courseId}/quiz`);
    await page.getByRole("button", { name: /empezar cuestionario/i }).click();
    await answer(page, questions, true);
    await signOut(page);
    await signIn(page, USERS.teacher);
    await openQuestions(page, courseId, "?status=approved");

    await expect(card(page, questions[0].statement).getByText(/respondida 1 vez · 100\s?% de aciertos/i)).toBeVisible();
  });

  scenario("008-US1-AS7", "empty states point to what to do next", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await openQuestions(page, courseId);

    await expect(page.getByRole("heading", { name: /primero define los temas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /ir a temas/i })).toBeVisible();

    await seedQuestions(request, courseId, { levels: [] });
    await page.reload();
    await expect(page.getByRole("heading", { name: /todavía no hay preguntas/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /pedir preguntas nuevas/i })).toBeVisible();
    await expectAccessible(page);
  });
});

/** Answers the current question right or wrong, using the seeded answer key. */
async function answer(page: Page, seeded: Seeded[], right: boolean) {
  const legend = (await page.locator("form fieldset legend").first().innerText()).trim();
  const question = seeded.find((q) => q.statement === legend);
  expect(question, `seeded question "${legend}"`).toBeDefined();
  const choice = right ? question!.correct_option : (question!.correct_option + 1) % 4;
  await page.getByRole("radio", { name: question!.options[choice], exact: true }).check();
  await page.getByRole("button", { name: /^comprobar$/i }).click();
  await expect(page.getByRole("heading", { name: right ? /¡correcto!/i : /no es correcta/i })).toBeVisible();
}

async function next(page: Page) {
  await page.getByRole("button", { name: /siguiente pregunta/i }).click();
}

/** The student on "Cuestionario" with approved questions at levels 1–3, two of each. */
async function quizRoom(request: APIRequestContext, page: Page, levels?: number[]) {
  const { courseId } = await classroom(request, page);
  const seeded = await seedQuestions(request, courseId, levels ? { levels } : {});
  await page.goto(`/student/courses/${courseId}/quiz`);
  await expect(page.getByRole("heading", { level: 1, name: /^cuestionario$/i })).toBeVisible();
  return { courseId, ...seeded };
}

async function start(page: Page) {
  await page.getByRole("button", { name: /empezar cuestionario/i }).click();
  await expect(page.getByText(/pregunta 1 de/i)).toBeVisible();
}

test.describe("008 US2 adaptive quiz", () => {
  scenario("008-US2-AS1", "the quiz opens from the course and shows the first question", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await seedQuestions(request, courseId);
    await page.goto("/student/courses");
    await page.getByRole("link", { name: /hacer un cuestionario/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /^cuestionario$/i })).toBeVisible();
    await start(page);

    await expect(page.getByText(/5 preguntas de todos los temas/i)).toBeVisible();
    await expect(page.getByText(/la dificultad se adapta a tus respuestas y no cuenta para la nota/i)).toBeVisible();
    await expect(page.getByText(/pregunta 1 de 5/i)).toBeVisible();
    await expect(page.getByText(/dificultad: media/i)).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(4);
    await expect(page.getByText(/respuesta correcta/i)).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("008-US2-AS2", "an answer gets immediate feedback and the options lock", async ({ page, request }) => {
    const { questions } = await quizRoom(request, page);
    await start(page);
    await answer(page, questions, false);

    const feedback = page.getByRole("region", { name: /no es correcta/i });
    await expect(feedback.getByText(/multiplica a cada término/i)).toBeVisible();
    await expect(feedback.getByRole("button", { name: /ver fuente: ecuaciones\.md/i })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: /tu respuesta/i })).toHaveCount(1);
    await expect(page.getByRole("listitem").filter({ hasText: /respuesta correcta/i })).toHaveCount(1);
    await expect(page.getByRole("radio")).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("008-US2-AS3", "a level change says why", async ({ page, request }) => {
    const { questions } = await quizRoom(request, page);
    await start(page);
    await answer(page, questions, true);
    await next(page);
    await answer(page, questions, true);
    await next(page);

    await expect(page.getByRole("status").filter({ hasText: /subimos el nivel porque has acertado 2 seguidas/i })).toContainText(/provisional/i);
    await expect(page.getByText(/dificultad: difícil/i)).toBeVisible();

    await answer(page, questions, false);
    await next(page);
    await answer(page, questions, false);
    await next(page);
    await expect(page.getByRole("status").filter({ hasText: /bajamos el nivel porque has fallado 2 seguidas/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("008-US2-AS4", "the summary shows the score by topic and what to do next", async ({ page, request }) => {
    const { questions } = await quizRoom(request, page);
    await start(page);
    for (const [i, right] of [true, true, false, true, false].entries()) {
      await answer(page, questions, right);
      if (i < 4) await next(page);
    }
    await page.getByRole("button", { name: /ver resumen/i }).click();

    await expect(page.getByRole("heading", { name: /resumen del cuestionario/i })).toBeVisible();
    await expect(page.getByText(/3 de 5 correctas/i)).toBeVisible();
    const byTopic = page.getByRole("list", { name: /resultado por tema/i });
    await expect(byTopic.getByRole("listitem")).toContainText(/paréntesis.*3 de 5/i);
    await expect(page.getByText(/nivel final: /i)).toBeVisible();
    await expect(page.getByRole("button", { name: /hacer otro cuestionario/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /preguntar al tutor/i })).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("button", { name: /practicar paréntesis/i }).click();
    await expect(page.getByText(/preguntas sobre paréntesis/i)).toBeVisible();
  });

  scenario("008-US2-AS5", "without approved questions the student is told so", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await seedQuestions(request, courseId, { levels: [1], status: "pending" });
    await page.goto(`/student/courses/${courseId}/quiz`);
    await page.getByRole("button", { name: /empezar cuestionario/i }).click();

    await expect(page.getByRole("heading", { name: /tu profesor\/a todavía no ha publicado preguntas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /preguntar al tutor/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("008-US2-AS6", "an unfinished quiz can be continued", async ({ page, request }) => {
    const { courseId, questions } = await quizRoom(request, page);
    await start(page);
    await answer(page, questions, true);
    await page.reload();
    await expect(page.getByText(/pregunta 2 de 5/i)).toBeVisible();

    await page.goto(`/student/courses/${courseId}/quiz`);
    await page.getByRole("link", { name: /continuar/i }).click();
    await expect(page.getByText(/pregunta 2 de 5/i)).toBeVisible();
  });
});

