// 005 — real exercise feedback and the learning record (spec 005 US1–US3).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

const COVERED = "Despeja la incógnita en 2x = 4";
const UNCOVERED = "Calcula la derivada del seno";

async function feedbackMode(request: APIRequestContext, mode: "mistake" | "correct" | "fail", delay_ms = 0) {
  await request.post(`${MOCK}/__test/feedback`, { data: { mode, delay_ms } });
}

async function send(page: Page, problem = COVERED) {
  await page.getByLabel(/enunciado del ejercicio/i).fill(problem);
  await page.getByLabel(/tu solución, paso a paso/i).fill("2x = 4\nx = 4 - 2\nx = 2");
  await page.getByRole("button", { name: /revisar antes de enviar/i }).click();
  await page.getByRole("button", { name: /enviar ejercicio/i }).click();
}

async function sendAndOpen(page: Page, problem = COVERED) {
  await send(page, problem);
  await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
}

test.describe("005 US1 real feedback", () => {
  scenario("005-US1-AS1", "a mistake shows its type by name, the topic and citations", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await sendAndOpen(page);

    await expect(page.getByText(/^incorrecta$/i)).toBeVisible();
    await expect(page.getByText(/dónde está el error:/i)).toBeVisible();
    await expect(page.getByText("Error de procedimiento")).toBeVisible();
    await expect(page.getByText("procedural")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /guardado en tu progreso/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ver fuente: ecuaciones\.md/i })).toBeVisible();
    await expect(page.getByRole("note").filter({ hasText: /todavía se está preparando/i })).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("005-US1-AS2", "a correct answer shows no mistake", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await feedbackMode(request, "correct");
    await sendAndOpen(page);

    await expect(page.getByText(/^correcta$/i)).toBeVisible();
    await expect(page.getByText(/tipo de error:/i)).toHaveCount(0);
    await expect(page.getByText(/dónde está el error:/i)).toHaveCount(0);
    await expect(page.getByText(/guardado en tu progreso/i)).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("005-US1-AS3", "an uncovered exercise is not assessed", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await sendAndOpen(page, UNCOVERED);

    await expect(page.getByText(/^no evaluado$/i)).toBeVisible();
    await expect(page.locator('[data-component="NoSourceNotice"]')).toBeVisible();
    await expectAccessible(page);
  });

  scenario("005-US1-AS4", "when the tutor is unavailable the student can retry", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await feedbackMode(request, "fail");
    await send(page);

    await expect(page.getByRole("alert").filter({ hasText: /no ha podido/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /revisa tu envío/i })).toBeVisible();

    await feedbackMode(request, "mistake");
    await page.getByRole("button", { name: /enviar ejercicio/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });

  scenario("005-US1-AS5", "while the tutor checks, the button says so", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await feedbackMode(request, "mistake", 2000);
    await send(page);

    const checking = page.getByRole("button", { name: /revisando tu ejercicio/i });
    await expect(checking).toBeVisible();
    await expect(checking).toBeDisabled();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });
});

test.describe("005 US2–US3 learning record", () => {
  scenario("005-US2-AS1", "the student sees their mistakes by topic and type", async ({ page, request }) => {
    const { courseId } = await classroom(request, page, { path: "/exercise" });
    await sendAndOpen(page);
    await page.goto(`/student/courses/${courseId}/exercise`);
    await sendAndOpen(page);

    await page.getByRole("link", { name: /guardado en tu progreso/i }).click();
    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}/progress$`));
    await expect(page.getByRole("heading", { level: 1, name: /mi progreso/i })).toBeVisible();
    await expect(page.getByText(/los tipos de error son provisionales/i)).toBeVisible();
    const item = page.getByRole("listitem").filter({ hasText: "Error de procedimiento" });
    await expect(item.getByText(/2 veces/i)).toBeVisible();
    await expectAccessible(page);

    await item.getByRole("link", { name: /ver un ejemplo/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });

  scenario("005-US2-AS2", "with no mistakes the page explains where they come from", async ({ page, request }) => {
    const { courseId } = await classroom(request, page);
    await page.goto("/student/courses");
    await page.getByRole("link", { name: /mi progreso/i }).first().click();

    await expect(page).toHaveURL(new RegExp(`/student/courses/${courseId}/progress$`));
    await expect(page.getByRole("heading", { name: /todavía no hay errores registrados/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("005-US3-AS1", "the teacher sees a student's mistakes and the example", async ({ page, request }) => {
    const { courseId } = await classroom(request, page, { path: "/exercise" });
    await sendAndOpen(page);
    await signOut(page);

    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: "Lucas Herrera" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Lucas Herrera" })).toBeVisible();
    const item = page.getByRole("listitem").filter({ hasText: "Error de procedimiento" });
    await expect(item.getByText(/1 vez/i)).toBeVisible();
    await expectAccessible(page);

    await item.getByRole("link", { name: /ver un ejemplo/i }).click();
    await expect(page).toHaveURL(new RegExp(`/teacher/courses/${courseId}/exercises/`));
  });
});
