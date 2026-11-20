// 025 — drafts whose key the automatic check doubts (spec 025).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

type Seeded = { id: string; statement: string; options: string[]; correct_option: number };

async function pendingDrafts(request: APIRequestContext, page: Page, levels: number[]) {
  const room = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true } });
  const { course_id: courseId } = (await room.json()) as { course_id: string };
  const seeded = await request.post(`${MOCK}/__test/questions`, { data: { course_id: courseId, levels, status: "pending" } });
  const { questions } = (await seeded.json()) as { questions: Seeded[] };
  await signIn(page, USERS.teacher);
  return { courseId, questions };
}

async function keyCheck(request: APIRequestContext, question: Seeded, key_check: string, options: number[]) {
  await request.post(`${MOCK}/__test/key-check`, { data: { question_id: question.id, key_check, options } });
}

async function openQuestions(page: Page, courseId: string) {
  await page.goto(`/teacher/courses/${courseId}/questions`);
  await expect(page.getByRole("heading", { level: 2, name: /preguntas de cuestionario/i })).toBeVisible();
}

const card = (page: Page, statement: string) => page.getByRole("article", { name: statement });
const other = (q: Seeded) => (q.correct_option + 1) % 4;
const letter = (i: number) => String.fromCharCode(65 + i);

test.describe("025 quiz key check", () => {
  scenario("025-US1-AS1", "a draft whose check chose another option says which", async ({ page, request }) => {
    const { courseId, questions } = await pendingDrafts(request, page, [1]);
    const [q] = questions;
    await keyCheck(request, q, "disagrees", [other(q)]);

    await openQuestions(page, courseId);

    const notice = card(page, q.statement).getByRole("note");
    await expect(notice).toContainText(`eligió otra respuesta: ${letter(other(q))} «${q.options[other(q)]}»`);
    await expect(card(page, q.statement).getByRole("listitem").filter({ hasText: q.options[other(q)] })).toContainText(/según la comprobación/i);
    await expectAccessible(page);
  });

  scenario("025-US1-AS2", "a draft with several right options names them all", async ({ page, request }) => {
    const { courseId, questions } = await pendingDrafts(request, page, [1]);
    const [q] = questions;
    await keyCheck(request, q, "several", [q.correct_option, other(q)]);

    await openQuestions(page, courseId);

    const notice = card(page, q.statement).getByRole("note");
    await expect(notice).toContainText(/más de una respuesta correcta/i);
    for (const i of [q.correct_option, other(q)]) await expect(notice).toContainText(`${letter(i)} «${q.options[i]}»`);
    await expect(card(page, q.statement).getByText(/según la comprobación/i)).toHaveCount(2);
  });

  scenario("025-US1-AS3", "a draft the check agrees with, or not checked, has no notice", async ({ page, request }) => {
    const { courseId, questions } = await pendingDrafts(request, page, [1, 2]);
    await keyCheck(request, questions[0], "agrees", [questions[0].correct_option]);

    await openQuestions(page, courseId);

    for (const q of questions) {
      await expect(card(page, q.statement)).toBeVisible();
      await expect(card(page, q.statement).getByRole("note")).toHaveCount(0);
      await expect(card(page, q.statement).getByText(/según la comprobación/i)).toHaveCount(0);
    }
  });

  scenario("025-US1-AS4", "flagged drafts are listed first", async ({ page, request }) => {
    const { courseId, questions } = await pendingDrafts(request, page, [1, 2, 3]);
    // Newest first otherwise: the oldest draft is flagged.
    await keyCheck(request, questions[0], "disagrees", [other(questions[0])]);

    await openQuestions(page, courseId);

    await expect(page.getByRole("article").first()).toHaveAccessibleName(questions[0].statement);
  });

  scenario("025-US1-AS5", "fixing the key clears the notice", async ({ page, request }) => {
    const { courseId, questions } = await pendingDrafts(request, page, [1]);
    const [q] = questions;
    await keyCheck(request, q, "disagrees", [other(q)]);
    await openQuestions(page, courseId);

    await card(page, q.statement).getByRole("button", { name: /^editar$/i }).click();
    const form = page.getByRole("form", { name: /editar pregunta/i });
    await form.getByRole("radio", { name: new RegExp(`opción ${other(q) + 1}`, "i") }).check();
    await form.getByRole("button", { name: /^guardar$/i }).click();

    await expect(card(page, q.statement).getByRole("listitem").filter({ hasText: q.options[other(q)] })).toContainText(/respuesta correcta/i);
    await expect(card(page, q.statement).getByRole("note")).toHaveCount(0);
  });
});
