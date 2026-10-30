// US8 — teacher reviews conversations and corrects answers (spec 002 US8, 001 US8, 001 US1 AS8).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK } from "./helpers-student";

const CORRECTION = "Hay que dividir entre el número, no sumarlo.";

async function reviewSetup(request: APIRequestContext, page: Page, withActivity = true) {
  const seeded = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
  const { course_id } = (await seeded.json()) as { course_id: string };
  let ids = { conversation_id: "", submission_id: "" };
  if (withActivity) {
    const activity = await request.post(`${MOCK}/__test/activity`, { data: { course_id } });
    ids = (await activity.json()) as typeof ids;
  }
  await signIn(page, USERS.teacher);
  await page.goto(`/teacher/courses/${course_id}/conversations`);
  return { courseId: course_id, ...ids };
}

async function flagFirstAnswer(page: Page, category: RegExp = /^incorrecta/i, text = CORRECTION) {
  await page.getByRole("button", { name: /marcar respuesta del tutor/i }).first().click();
  const dialog = page.getByRole("dialog", { name: /marcar y corregir/i });
  await dialog.getByRole("radio", { name: category }).check();
  await dialog.getByLabel(/corrección para el estudiante/i).fill(text);
  return dialog;
}

test.describe("US8 review and corrections", () => {
  scenario("001-US8-AS1", "conversations and exercises are listed with markers and filters", async ({ page, request }) => {
    await reviewSetup(request, page);

    const list = page.getByRole("list", { name: /^conversaciones$/i });
    await expect(list.getByRole("listitem").filter({ hasText: /sin fuente/i })).toBeVisible();
    await expect(list.getByRole("listitem").filter({ hasText: /ejercicio/i })).toBeVisible();
    await expect(list.getByRole("listitem").first()).toContainText("Lucas Herrera");
    await expect(page.getByText(/4 mensajes/)).toBeVisible();
    await expectAccessible(page);

    await page.getByRole("checkbox", { name: /has corregido/i }).check();
    await page.getByRole("button", { name: /aplicar filtros/i }).click();
    await expect(page.getByRole("heading", { name: /ninguna conversación coincide/i })).toBeVisible();
  });

  scenario("001-US8-AS2", "a tutor answer is flagged with a previewed correction", async ({ page, request }) => {
    await reviewSetup(request, page);
    await page.getByRole("link", { name: /abrir conversación/i }).first().click();
    await expect(page.getByRole("heading", { level: 2, name: /conversación con lucas herrera/i })).toBeVisible();
    await expectAccessible(page);

    const dialog = await flagFirstAnswer(page);
    await dialog.getByRole("button", { name: /previsualizar/i }).click();
    await expect(dialog).toContainText(/así lo verá tu estudiante/i);
    await expect(dialog).toContainText(/revisado por tu profesor\/a/i);
    await expectAccessible(page);
    await dialog.getByRole("button", { name: /guardar corrección/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /corrección guardada/i })).toBeVisible();
    await expect(page.getByText(/marcada como incorrecta/i)).toBeVisible();
    await expect(page.getByText(CORRECTION)).toBeVisible();
  });

  scenario("001-US8-AS3", "the flags list shows type, correction, date and a link back", async ({ page, request }) => {
    const { courseId } = await reviewSetup(request, page);
    await page.getByRole("link", { name: /abrir conversación/i }).first().click();
    await (await flagFirstAnswer(page)).getByRole("button", { name: /guardar corrección/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /corrección guardada/i })).toBeVisible();

    await page.goto(`/teacher/courses/${courseId}/corrections`);

    const item = page.getByRole("list", { name: /respuestas marcadas/i }).getByRole("listitem").first();
    await expect(item).toContainText(/incorrecta/i);
    await expect(item).toContainText(CORRECTION);
    await expect(item).toContainText("Lucas Herrera");
    await expectAccessible(page);
    await item.getByRole("link", { name: /ver el mensaje/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: /conversación con lucas herrera/i })).toBeVisible();
  });

  scenario("001-US8-AS4", "without conversations an empty state explains when they appear", async ({ page, request }) => {
    await reviewSetup(request, page, false);

    await expect(page.getByRole("heading", { name: /todavía no hay conversaciones/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US8-AS6", "editing and removing the correction reaches the student", async ({ page, request }) => {
    const { courseId, conversation_id } = await reviewSetup(request, page);
    await page.goto(`/teacher/courses/${courseId}/conversations/${conversation_id}`);
    await (await flagFirstAnswer(page)).getByRole("button", { name: /guardar corrección/i }).click();
    await expect(page.getByText(CORRECTION)).toBeVisible();

    await page.getByRole("button", { name: /editar corrección/i }).click();
    const dialog = page.getByRole("dialog", { name: /editar la corrección/i });
    await dialog.getByLabel(/corrección para el estudiante/i).fill("Divide entre 2.");
    await dialog.getByRole("button", { name: /guardar cambios/i }).click();
    await expect(page.getByText("Divide entre 2.")).toBeVisible();

    await signOut(page);
    await signIn(page, USERS.student);
    await page.goto(`/student/courses/${courseId}/conversations/${conversation_id}`);
    await expect(page.getByText(/revisado por tu profesor\/a/i)).toBeVisible();
    await expect(page.getByText("Divide entre 2.")).toBeVisible();

    await signOut(page);
    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}/conversations/${conversation_id}`);
    await page.getByRole("button", { name: /quitar corrección/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /quitar corrección/i }).click();
    await expect(page.getByText("Divide entre 2.")).toHaveCount(0);
  });

  scenario("001-US8-AS7", "a failed save keeps the text and offers a retry", async ({ page, request, mock }) => {
    const { courseId, conversation_id } = await reviewSetup(request, page);
    await page.goto(`/teacher/courses/${courseId}/conversations/${conversation_id}`);
    await mock.faults(["save_flag_fails"]);

    const dialog = await flagFirstAnswer(page);
    await dialog.getByRole("button", { name: /guardar corrección/i }).click();

    await expect(dialog.getByRole("alert").filter({ hasText: /no hemos podido guardar la corrección/i })).toBeVisible();
    await expect(dialog.getByLabel(/corrección para el estudiante/i)).toHaveValue(CORRECTION);
    await mock.faults([]);
    await dialog.getByRole("button", { name: /guardar corrección/i }).click();
    await expect(page.getByText(CORRECTION)).toBeVisible();
  });

  scenario("001-US1-AS8", "the student sees the correction under the corrected answer", async ({ page, request }) => {
    const { courseId, conversation_id } = await reviewSetup(request, page);
    await page.goto(`/teacher/courses/${courseId}/conversations/${conversation_id}`);
    await (await flagFirstAnswer(page)).getByRole("button", { name: /guardar corrección/i }).click();
    await expect(page.getByText(CORRECTION)).toBeVisible();

    await signOut(page);
    await signIn(page, USERS.student);
    await page.goto(`/student/courses/${courseId}/conversations/${conversation_id}`);

    const corrected = page.locator('[data-component="ChatMessage"]').filter({ hasText: /corregida/i });
    await expect(corrected).toContainText(/revisado por tu profesor\/a/i);
    await expect(corrected).toContainText(CORRECTION);
    await expect(corrected).not.toContainText(/incorrecta/i);
    await expectAccessible(page);
  });

  scenario("002-US8-AS1", "exercise feedback can be corrected too", async ({ page, request }) => {
    const { courseId, submission_id } = await reviewSetup(request, page);
    await page.goto(`/teacher/courses/${courseId}/exercises/${submission_id}`);

    const dialog = await flagFirstAnswer(page, /^mejorable/i, "Revisa el signo.");
    await dialog.getByRole("button", { name: /guardar corrección/i }).click();
    await expect(page.getByText(/marcada como mejorable/i)).toBeVisible();

    await signOut(page);
    await signIn(page, USERS.student);
    await page.goto(`/student/courses/${courseId}/exercises/${submission_id}`);
    await expect(page.getByText("Revisa el signo.")).toBeVisible();
    await expect(page.getByText(/mejorable/i)).toHaveCount(0);
  });
});
