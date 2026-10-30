// US6 — student chats with the tutor, with citations and guided mode (spec 002 US6, 001 US1, US5).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, test } from "./helpers";
import { MOCK, type Policy, classroom as seedClassroom } from "./helpers-student";

const COVERED = "¿Cómo despejo la incógnita en 2x = 4?";
const UNCOVERED = "¿Quién ganó el mundial de 2010?";

async function classroom(request: APIRequestContext, page: Page, opts: { policy?: Policy; disclosure?: boolean } = {}) {
  return (await seedClassroom(request, page, opts)).courseId;
}

async function ask(page: Page, text: string) {
  await page.getByLabel(/escribe tu pregunta/i).fill(text);
  await page.getByRole("button", { name: /^enviar$/i }).click();
}

const tutorMessages = (page: Page) =>
  page.locator('[data-component="ChatMessage"][data-variant^="tutor-"]:not([data-variant="tutor-welcome"])');

test.describe("US6 student chat", () => {
  scenario("001-US1-AS1", "first use requires acknowledging the AI disclosure", async ({ page, request }) => {
    await classroom(request, page, { disclosure: false });

    await expect(page.getByRole("heading", { name: /antes de empezar/i })).toBeVisible();
    await expect(page.getByText(/tutor de inteligencia artificial, no con una persona/i)).toBeVisible();
    await expect(page.getByText(/puede revisar tus conversaciones/i).first()).toBeVisible();
    await expect(page.getByLabel(/escribe tu pregunta/i)).toHaveCount(0);
    await expectAccessible(page);

    await page.getByRole("checkbox", { name: /he leído y entiendo/i }).check();
    await page.getByRole("button", { name: /empezar/i }).click();
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeVisible();
  });

  scenario("001-US1-AS2", "a covered question gets an answer with citations", async ({ page, request }) => {
    await classroom(request, page);

    await ask(page, COVERED);

    await expect(page.getByText(COVERED)).toBeVisible();
    const answer = tutorMessages(page).last();
    await expect(answer).toContainText(/según el material/i);
    await expect(answer.getByRole("button", { name: /ver fuente: ecuaciones\.md · § 3\.2/i })).toBeVisible();
    await expect(answer.getByText(/^IA$/)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US1-AS3", "a citation opens the cited passage and closes back to the chat", async ({ page, request }) => {
    await classroom(request, page);
    await ask(page, COVERED);

    await tutorMessages(page).last().getByRole("button", { name: /ver fuente/i }).first().click();

    const sheet = page.getByRole("dialog", { name: /fuente citada/i });
    await expect(sheet).toContainText("ecuaciones.md");
    await expect(sheet).toContainText(/se divide entre el número/i);
    await expectAccessible(page);
    await sheet.getByRole("button", { name: /cerrar/i }).click();
    await expect(sheet).toBeHidden();
  });

  scenario("001-US1-AS4", "an uncovered question is answered as not covered, with no citations", async ({ page, request }) => {
    await classroom(request, page);

    await ask(page, UNCOVERED);

    const notCovered = page.locator('[data-component="NoSourceNotice"]').last();
    await expect(notCovered).toContainText(/el material del curso no cubre esta pregunta/i);
    await expect(notCovered.getByRole("button", { name: /ver fuente/i })).toHaveCount(0);
    await expect(notCovered.getByRole("button", { name: /reformular la pregunta/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US1-AS5", "the remaining messages are visible and warn when low", async ({ page, request }) => {
    await classroom(request, page);
    await expect(page.getByText(/te quedan 30 mensajes hoy/i)).toBeVisible();

    await request.post(`${MOCK}/__test/usage`, { data: { email: USERS.student, used: 26 } });
    await page.reload();

    await expect(page.getByText(/te quedan 4 mensajes hoy/i)).toBeVisible();
    await expect(page.getByText(/se renuevan a las/i)).toBeVisible();
  });

  scenario("001-US1-AS6", "at the limit the input is disabled and the reset time shown", async ({ page, request }) => {
    await classroom(request, page);
    await ask(page, COVERED);
    await expect(tutorMessages(page)).toHaveCount(1);
    await request.post(`${MOCK}/__test/usage`, { data: { email: USERS.student, used: 30 } });
    await page.reload();

    await expect(page.getByRole("heading", { name: /has usado tus 30 mensajes de hoy/i })).toBeVisible();
    await expect(page.getByText(/podrás escribir de nuevo a las \d/i)).toBeVisible();
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeDisabled();
    await expect(tutorMessages(page)).toHaveCount(1);
    await expectAccessible(page);
  });

  scenario("001-US1-AS7", "a failed reply is marked, does not count and can be retried", async ({ page, request, mock }) => {
    await classroom(request, page);
    await mock.faults(["tutor_unavailable"]);

    await ask(page, COVERED);

    await expect(page.getByRole("alert").filter({ hasText: /no se ha podido enviar/i })).toBeVisible();
    await expect(page.getByText(/este intento no cuenta para tu límite/i)).toBeVisible();
    await expect(page.getByText(/te quedan 30 mensajes hoy/i)).toBeVisible();
    await expectAccessible(page);

    await mock.faults([]);
    await page.getByRole("button", { name: /reintentar/i }).click();
    await expect(tutorMessages(page).last()).toContainText(/según el material/i);
    await expect(page.getByText(/te quedan 29 mensajes hoy/i)).toBeVisible();
  });

  scenario("001-US1-AS9", "the tutor information lists the teacher's settings", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_only" });

    await page.getByRole("button", { name: /cómo responde el tutor/i }).click();

    const info = page.getByRole("dialog", { name: /cómo responde el tutor en este curso/i });
    await expect(info).toContainText(/intermedio/i);
    await expect(info).toContainText(/cercano/i);
    await expect(info).toContainText(/nunca da la solución completa/i);
    await expect(info).toContainText(/tu profesor\/a ha elegido/i);
    await expectAccessible(page);
  });

  scenario("001-US5-AS1", "guided mode is announced in the chat", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_first" });

    await expect(page.getByText(/^modo guiado$/i)).toBeVisible();
    await expect(page.getByText(/te dará pistas antes que la solución/i)).toBeVisible();
  });

  scenario("001-US5-AS2", "problem answers come as numbered hints with another-hint and reply", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_first" });

    await ask(page, COVERED);
    await expect(tutorMessages(page).last()).toContainText(/pista 1/i);
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeEnabled();

    await page.getByRole("button", { name: /otra pista/i }).click();
    await expect(tutorMessages(page).last()).toContainText(/pista 2/i);
    await expectAccessible(page);
  });

  scenario("001-US5-AS3", "the solution is offered only when the teacher allows it", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_first" });
    await ask(page, COVERED);

    await page.getByRole("button", { name: /ver solución/i }).click();
    await expect(tutorMessages(page).last()).toContainText(/según el material/i);
  });

  scenario("001-US5-AS3b", "hints only explains that there is no solution", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_only" });
    await ask(page, COVERED);

    await expect(tutorMessages(page).last()).toContainText(/pista 1/i);
    await expect(page.getByRole("button", { name: /ver solución/i })).toHaveCount(0);
    await expect(page.getByText(/solo dé pistas en este curso/i)).toBeVisible();
  });

  scenario("001-US5-AS4", "hints carry citations", async ({ page, request }) => {
    await classroom(request, page, { policy: "hints_only" });
    await ask(page, COVERED);

    await expect(tutorMessages(page).last().getByRole("button", { name: /ver fuente/i }).first()).toBeVisible();
  });

  scenario("002-US6-AS1", "the disclosure acknowledgement is saved", async ({ page, request }) => {
    const courseId = await classroom(request, page, { disclosure: false });
    await page.getByRole("checkbox", { name: /he leído y entiendo/i }).check();
    await page.getByRole("button", { name: /empezar/i }).click();
    await expect(page.getByLabel(/escribe tu pregunta/i)).toBeVisible();

    await page.goto(`/alumno/cursos/${courseId}`);
    await expect(page.getByRole("heading", { name: /antes de empezar/i })).toHaveCount(0);
  });

  scenario("002-US6-AS2", "an excluded source shows as no longer available", async ({ page, request }) => {
    await classroom(request, page);
    await ask(page, COVERED);
    await expect(tutorMessages(page)).toHaveCount(1);
    await request.post(`${MOCK}/__test/exclude-all`);
    await page.reload();

    await tutorMessages(page).last().getByRole("button", { name: /ver fuente/i }).first().click();
    await expect(page.getByRole("dialog", { name: /fuente citada/i })).toContainText(/ya no disponible/i);
  });

  scenario("002-US6-AS3", "a conversation can be reopened from the course", async ({ page, request }) => {
    const courseId = await classroom(request, page);
    await ask(page, COVERED);
    await expect(page).toHaveURL(/\/conversaciones\//);
    const conversationUrl = page.url();

    await page.goto(`/alumno/cursos/${courseId}`);
    await expect(page).toHaveURL(conversationUrl);
    await expect(page.getByText(COVERED)).toBeVisible();
  });
});
