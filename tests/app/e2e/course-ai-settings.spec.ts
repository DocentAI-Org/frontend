// 019 — AI settings per course (spec 019 US1, US2, US3, US6): message limits, models per task.
import type { APIRequestContext, Page } from "@playwright/test";

import { courseSection, expect, expectAccessible, scenario, signIn, test, USERS } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

const group = (page: Page, name: RegExp) => page.getByRole("group", { name });
const save = (page: Page) => page.getByRole("button", { name: /guardar configuración/i }).click();
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: /^guardado$/i })).toBeVisible();

async function teacherCourse(request: APIRequestContext, page: Page) {
  const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
  const { course_id } = (await seeded.json()) as { course_id: string };
  await signIn(page, USERS.teacher);
  return course_id;
}

async function pick(page: Page, combobox: RegExp, option: RegExp) {
  await page.getByRole("combobox", { name: combobox }).click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("019 US1 the teacher sets the message limit", () => {
  scenario("019-US1-AS1", "the course follows the study's limit, told in a sentence", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}`);
    await (await courseSection(page, /^ia$/i)).click();

    const limits = group(page, /límite de mensajes/i);
    await expect(limits.getByRole("radio", { name: /los del estudio/i })).toBeChecked();
    await expect(limits.getByText(/sin límite de mensajes\. cuentan: chat con el tutor, corrección de ejercicios y repaso de errores/i)).toBeVisible();
    await expect(limits.getByText(/limita a 30 mensajes al día por estudiante/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("019-US1-AS2", "a weekly limit that does not count exercises is saved", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    const limits = group(page, /límite de mensajes/i);
    await limits.getByRole("radio", { name: /personalizar/i }).check();
    await limits.getByRole("radio", { name: /con límite/i }).check();
    await limits.getByLabel(/mensajes por estudiante/i).fill("20");
    await pick(page, /periodo/i, /a la semana/i);
    await limits.getByRole("checkbox", { name: /corrección de ejercicios/i }).uncheck();
    await save(page);

    await saved(page);
    await page.reload();
    await expect(limits.getByRole("radio", { name: /personalizar/i })).toBeChecked();
    await expect(limits.getByLabel(/mensajes por estudiante/i)).toHaveValue("20");
    await expect(page.getByRole("combobox", { name: /periodo/i })).toHaveText(/a la semana/i);
    await expect(limits.getByRole("checkbox", { name: /corrección de ejercicios/i })).not.toBeChecked();
    await expect(limits.getByRole("checkbox", { name: /chat con el tutor/i })).toBeChecked();
  });

  scenario("019-US1-AS3", "with no limit, the study's daily maximum still applies", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    const limits = group(page, /límite de mensajes/i);
    await limits.getByRole("radio", { name: /personalizar/i }).check();
    await limits.getByRole("radio", { name: /sin límite/i }).check();

    await expect(limits.getByLabel(/mensajes por estudiante/i)).toBeDisabled();
    await expect(limits.getByText(/limita a 30 mensajes al día/i)).toBeVisible();
  });
});

test.describe("019 US2 the student sees their messages in the course", () => {
  async function weekly(request: APIRequestContext, page: Page, used: number) {
    const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true } });
    const { course_id } = (await seeded.json()) as { course_id: string };
    await request.post(`${MOCK}/__test/course-limit`, {
      data: { course_id, used, limits: { messages: 20, period: "week", counted_tasks: ["tutor"] } }
    });
    await signIn(page, USERS.student);
    await page.goto(`/student/courses/${course_id}`);
  }

  scenario("019-US2-AS1", "a weekly limit shows the messages left this week", async ({ page, request }) => {
    await weekly(request, page, 8);

    await expect(page.getByText(/te quedan 12 mensajes esta semana en este curso/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("019-US2-AS1b", "with no course limit the daily maximum is shown", async ({ page, request }) => {
    await classroom(request, page);
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeVisible();
    await expect(page.getByText(/te quedan 30 mensajes hoy, en todos tus cursos/i)).toBeVisible();
  });

  scenario("019-US2-AS2", "at the weekly limit the input is disabled until Monday", async ({ page, request }) => {
    await weekly(request, page, 20);

    await expect(page.getByRole("heading", { name: /has usado tus 20 mensajes de esta semana en este curso/i })).toBeVisible();
    await expect(page.getByText(/podrás escribir de nuevo el lunes/i)).toBeVisible();
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeDisabled();
    await expectAccessible(page);
  });

  scenario("019-US2-AS3", "exercises not counted by the course can still be sent", async ({ page, request }) => {
    await weekly(request, page, 20);
    await page.goto(page.url() + "/exercise");

    await expect(page.getByRole("heading", { level: 1, name: /enviar un ejercicio|ejercicio/i })).toBeVisible();
    await expect(page.getByRole("region", { name: /has usado/i })).toHaveCount(0);
  });
});

test.describe("019 US3 the teacher chooses the models", () => {
  scenario("019-US3-AS1", "each task offers the local and commercial models with their size", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    await page.getByRole("combobox", { name: /corrección de ejercicios/i }).click();

    await expect(page.getByRole("option", { name: /los del estudio: qwen2\.5:7b/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /qwen2\.5:3b · 3\.1b · ollama \(local\)/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /claude haiku 5\.5 · anthropic/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expectAccessible(page);
  });

  scenario("019-US3-AS1b", "a source that does not answer is told, not an error", async ({ page, request, mock }) => {
    await mock.faults(["ollama_unreachable"]);
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);

    await expect(page.getByText(/ollama \(local\) no responde ahora/i)).toBeVisible();
  });

  scenario("019-US3-AS2", "a model with its own temperature is saved for one task", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    await pick(page, /corrección de ejercicios/i, /qwen2\.5:3b/i);
    const feedback = page.getByTestId("model-feedback");
    await feedback.getByText(/opciones avanzadas/i).click();
    await feedback.getByLabel(/temperatura/i).fill("0.3");
    await save(page);

    await saved(page);
    await page.reload();
    await expect(page.getByRole("combobox", { name: /corrección de ejercicios/i })).toHaveText(/qwen2\.5:3b/i);
    await expect(page.getByRole("combobox", { name: /chat con el tutor/i })).toHaveText(/los del estudio/i);
    await page.getByTestId("model-feedback").getByText(/opciones avanzadas/i).click();
    await expect(page.getByTestId("model-feedback").getByLabel(/temperatura/i)).toHaveValue("0.3");
  });

  scenario("019-US3-AS2b", "Anthropic models have no temperature", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    await pick(page, /borradores de preguntas/i, /claude haiku/i);
    const questions = page.getByTestId("model-questions");
    await questions.getByText(/opciones avanzadas/i).click();

    await expect(questions.getByLabel(/temperatura/i)).toHaveCount(0);
    await expect(questions.getByRole("combobox", { name: /razonamiento/i })).toBeVisible();
  });
});

test.describe("019 US6 the admin sets the study's values", () => {
  scenario("019-US6-AS1", "the study's limit and daily maximum reach every course", async ({ page, request }) => {
    const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
    const { course_id: courseId } = (await seeded.json()) as { course_id: string };
    await signIn(page, USERS.admin);
    await page.getByRole("link", { name: /ia del estudio/i }).filter({ visible: true }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: /ia del estudio/i })).toBeVisible();
    await expectAccessible(page);

    const limits = group(page, /límite de mensajes/i);
    await expect(limits.getByRole("radio", { name: /los del servidor/i })).toBeChecked();
    await limits.getByRole("radio", { name: /personalizar/i }).check();
    await limits.getByRole("radio", { name: /con límite/i }).check();
    await limits.getByLabel(/mensajes por estudiante/i).fill("40");
    const ceiling = group(page, /máximo diario/i);
    await ceiling.getByRole("radio", { name: /personalizar/i }).check();
    await ceiling.getByRole("radio", { name: /con máximo/i }).check();
    await ceiling.getByLabel(/mensajes al día/i).fill("50");
    await save(page);
    await saved(page);

    // Leave the admin page first: without its session it would redirect to the sign-in page
    // while the test opens it.
    await page.goto("about:blank");
    await page.context().clearCookies();
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}/ai`);
    const course = group(page, /límite de mensajes/i);
    await expect(course.getByText(/40 mensajes por estudiante al día/i)).toBeVisible();
    await expect(course.getByText(/limita a 50 mensajes al día/i)).toBeVisible();
  });

  scenario("019-US6-AS2", "values the API rejects are explained and not saved", async ({ page }) => {
    await signIn(page, USERS.admin);
    await page.goto("/admin/ai");
    const retrieval = group(page, /recuperación del material/i);
    await retrieval.getByRole("radio", { name: /personalizar/i }).check();
    await retrieval.getByLabel(/fragmentos por respuesta/i).fill("0");
    await save(page);

    await expect(page.getByRole("alert").filter({ hasText: /revisa los valores/i })).toBeVisible();
    await page.reload();
    await expect(group(page, /recuperación del material/i).getByLabel(/fragmentos por respuesta/i)).toHaveValue("4");
  });
});
