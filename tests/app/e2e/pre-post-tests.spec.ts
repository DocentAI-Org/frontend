// 010 — pre-test and post-test: the teacher prepares, opens and reads; students take each once.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, chooseOption, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type Phase = "pre" | "post";

async function seedTest(request: APIRequestContext, courseId: string, opts: { count?: number; open?: Phase[]; answered?: Partial<Record<Phase, boolean[]>> } = {}) {
  const response = await request.post(`${MOCK}/__test/course-test`, { data: { course_id: courseId, ...opts } });
  return ((await response.json()) as { questions: { id: string; statement: string; options: string[]; correct_option: number }[] }).questions;
}

/** A classroom whose teacher is signed in on the "Pre/post-test" tab. */
async function teacherRoom(request: APIRequestContext, page: Page, topics = true) {
  const response = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true } });
  const { course_id: courseId } = (await response.json()) as { course_id: string };
  if (topics) await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, levels: [2], status: "approved" } });
  await signIn(page, USERS.teacher);
  return { courseId };
}

async function openTab(page: Page, courseId: string) {
  await page.goto(`/teacher/courses/${courseId}/test`);
  await expect(page.getByRole("heading", { level: 2, name: /pre-test y post-test/i })).toBeVisible();
}

const phase = (page: Page, name: RegExp) => page.getByRole("region", { name });
const questionList = (page: Page) => page.getByRole("list", { name: /preguntas del test/i });

async function addQuestion(page: Page, statement: string, options = ["2x - 6", "2x - 3", "2x + 6", "x - 6"]) {
  const form = page.getByRole("form", { name: /añadir una pregunta/i });
  await form.getByRole("textbox", { name: /^enunciado$/i }).fill(statement);
  for (const [i, option] of options.entries()) await form.getByRole("textbox", { name: new RegExp(`^opción ${i + 1}$`, "i") }).fill(option);
  await form.getByRole("radio", { name: /opción 1 es la correcta/i }).check();
  await form.getByRole("button", { name: /añadir pregunta/i }).click();
  return form;
}

test.describe("010 US1 the teacher prepares the test", () => {
  scenario("010-US1-AS1", "the tab shows both phases, the questions and the form", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedTest(request, courseId, { count: 2 });
    await openTab(page, courseId);

    await expect(page.getByRole("link", { name: /^pre\/post-test$/i })).toHaveAttribute("aria-current", "page");
    await expect(phase(page, /^pre-test$/i).getByText(/sin abrir/i)).toBeVisible();
    await expect(phase(page, /^post-test$/i).getByText(/sin abrir/i)).toBeVisible();
    const first = questionList(page).getByRole("listitem").filter({ hasText: /pregunta 1 del test/i });
    await expect(first.getByText(/respuesta correcta/i)).toBeVisible();
    await expect(first.getByText(/tema: paréntesis/i)).toBeVisible();
    await expect(page.getByRole("form", { name: /añadir una pregunta/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("010-US1-AS2", "a question is added; repeated options are explained", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await openTab(page, courseId);

    const form = await addQuestion(page, "¿Cuánto es 2(x - 3)?", ["2x - 6", "2x - 6", "2x + 6", "x - 6"]);
    await expect(form.getByText(/las cuatro opciones tienen que ser distintas/i)).toBeVisible();

    await form.getByRole("textbox", { name: /^opción 2$/i }).fill("2x - 3");
    await form.getByRole("button", { name: /añadir pregunta/i }).click();
    await expect(questionList(page).getByRole("listitem").filter({ hasText: "¿Cuánto es 2(x - 3)?" })).toBeVisible();
  });

  scenario("010-US1-AS3", "an approved quiz question can be copied", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await openTab(page, courseId);

    const copy = page.getByRole("region", { name: /copiar del banco de preguntas/i });
    await chooseOption(copy.getByRole("combobox", { name: /pregunta aprobada/i }), /quitar el paréntesis/i);
    await copy.getByRole("button", { name: /copiar al test/i }).click();

    await expect(questionList(page).getByRole("listitem")).toHaveCount(1);
    await expect(questionList(page).getByText(/quitar el paréntesis/i)).toBeVisible();
  });

  scenario("010-US1-AS4", "questions can be edited and deleted", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedTest(request, courseId, { count: 2 });
    await openTab(page, courseId);

    const first = questionList(page).getByRole("listitem").filter({ hasText: /pregunta 1 del test/i });
    await first.getByRole("button", { name: /^editar$/i }).click();
    const edit = page.getByRole("form", { name: /editar pregunta/i });
    await edit.getByRole("textbox", { name: /^enunciado$/i }).fill("Pregunta revisada");
    await edit.getByRole("button", { name: /^guardar$/i }).click();
    await expect(questionList(page).getByText("Pregunta revisada")).toBeVisible();

    const second = questionList(page).getByRole("listitem").filter({ hasText: /pregunta 2 del test/i });
    await second.getByRole("button", { name: /^eliminar$/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^eliminar$/i }).click();
    await expect(questionList(page).getByRole("listitem")).toHaveCount(1);
  });

  scenario("010-US1-AS5", "without topics the tab points to Temas", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page, false);
    await openTab(page, courseId);

    await expect(page.getByRole("heading", { name: /primero define los temas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /ir a temas/i })).toBeVisible();
  });
});

test.describe("010 US2 phases", () => {
  scenario("010-US2-AS1", "opening the pre-test warns that questions freeze", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedTest(request, courseId, { count: 2 });
    await openTab(page, courseId);

    await phase(page, /^pre-test$/i).getByRole("button", { name: /abrir el pre-test/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/las preguntas quedarán fijas/i)).toBeVisible();
    await dialog.getByRole("button", { name: /^abrir$/i }).click();

    await expect(phase(page, /^pre-test$/i).getByText(/abierto desde/i)).toBeVisible();
    await expect(page.getByText(/las preguntas ya no se pueden cambiar/i)).toBeVisible();
    await expect(questionList(page).getByRole("button", { name: /^editar$/i })).toHaveCount(0);
    await expect(page.getByRole("form", { name: /añadir una pregunta/i })).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("010-US2-AS2", "a phase closes and reopens", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await seedTest(request, courseId, { count: 2, open: ["pre"] });
    await openTab(page, courseId);

    await phase(page, /^pre-test$/i).getByRole("button", { name: /cerrar el pre-test/i }).click();
    await expect(phase(page, /^pre-test$/i).getByText(/cerrado el/i)).toBeVisible();
    await phase(page, /^pre-test$/i).getByRole("button", { name: /volver a abrir el pre-test/i }).click();
    await expect(phase(page, /^pre-test$/i).getByText(/abierto desde/i)).toBeVisible();
  });

  scenario("010-US2-AS3", "without questions there is nothing to open", async ({ page, request }) => {
    const { courseId } = await teacherRoom(request, page);
    await openTab(page, courseId);

    await expect(phase(page, /^pre-test$/i).getByRole("button", { name: /abrir/i })).toHaveCount(0);
    await expect(phase(page, /^pre-test$/i).getByText(/añade preguntas para poder abrirlo/i)).toBeVisible();
  });
});

test.describe("010 US3 the student takes each phase once", () => {
  scenario("010-US3-AS1", "the course card announces the open phase", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await seedTest(request, courseId, { open: ["pre"] });
    await page.goto("/student/courses");

    await page.getByRole("link", { name: /hacer el pre-test/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /^pre-test$/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("010-US3-AS2", "every question must be answered and sending asks for confirmation", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    const questions = await seedTest(request, courseId, { open: ["pre"] });
    await page.goto(`/student/courses/${courseId}/test/pre`);

    const send = page.getByRole("button", { name: /enviar respuestas/i });
    await expect(page.getByRole("main").getByRole("group")).toHaveCount(3);
    await expect(page.getByText(/respuesta correcta|correcto/i)).toHaveCount(0);
    await expect(send).toBeDisabled();
    for (const q of questions) await page.getByRole("group", { name: q.statement }).getByRole("radio").first().check();
    await expect(send).toBeEnabled();
    await send.click();
    await expect(page.getByText(/no podrás cambiarlas/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("010-US3-AS3", "the submission is confirmed without a score", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    const questions = await seedTest(request, courseId, { open: ["pre"] });
    await page.goto(`/student/courses/${courseId}/test/pre`);
    for (const q of questions) await page.getByRole("group", { name: q.statement }).getByRole("radio").first().check();
    await page.getByRole("button", { name: /enviar respuestas/i }).click();
    await page.getByRole("button", { name: /^enviar$/i }).click();

    await expect(page.getByRole("heading", { name: /gracias/i })).toBeVisible();
    await expect(page.getByText(/de 3|%/)).toHaveCount(0);
  });

  scenario("010-US3-AS4", "a phase already done or not open says so", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await seedTest(request, courseId, { open: ["pre"], answered: { pre: [true, true, false] } });

    await page.goto(`/student/courses/${courseId}/test/pre`);
    await expect(page.getByText(/ya has hecho el pre-test/i)).toBeVisible();
    await page.goto(`/student/courses/${courseId}/test/post`);
    await expect(page.getByText(/el post-test todavía no está abierto/i)).toBeVisible();
  });
});

test.describe("010 US4 results", () => {
  scenario("010-US4-AS1", "the teacher reads the scores by student and the averages by topic", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await seedTest(request, courseId, { open: ["pre", "post"], answered: { pre: [true, false, false], post: [true, true, true] } });
    await signOut(page);
    await signIn(page, USERS.teacher);
    await openTab(page, courseId);

    const students = page.getByRole("table", { name: /resultados por estudiante/i });
    const lucas = students.getByRole("row", { name: /lucas herrera/i });
    await expect(lucas).toContainText(/1 de 3 · 33\s?%/);
    await expect(lucas).toContainText(/3 de 3 · 100\s?%/);
    const topics = page.getByRole("table", { name: /media por tema/i });
    await expect(topics.getByRole("row", { name: /paréntesis/i })).toContainText(/50\s?%.*100\s?%/);
    await expectAccessible(page);
  });
});
