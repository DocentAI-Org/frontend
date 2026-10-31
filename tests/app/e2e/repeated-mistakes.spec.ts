// 007 — repeated mistake notice, targeted review and practice (spec 007 US1–US3).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, signOut, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

type ReviewMode = "answer" | "no_source" | "fail" | "limit";

/** Lucas's mistakes of the same type and topic; the third and later ones repeat a pattern. */
async function seedMistakes(request: APIRequestContext, courseId: string, count: number) {
  const response = await request.post(`${MOCK}/__test/mistakes`, { data: { course_id: courseId, count } });
  return ((await response.json()) as { ids: string[] }).ids;
}

async function reviewMode(request: APIRequestContext, mode: ReviewMode, delay_ms = 0) {
  await request.post(`${MOCK}/__test/review`, { data: { mode, delay_ms } });
}

/** Signed in as the student on the feedback of their `nth` mistake (1-based). */
async function feedbackOf(request: APIRequestContext, page: Page, nth = 3, count = nth) {
  const { courseId } = await classroom(request, page);
  const ids = await seedMistakes(request, courseId, count);
  await page.goto(`/student/courses/${courseId}/exercises/${ids[nth - 1]}`);
  await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  return { courseId, ids };
}

const notice = (page: Page) => page.getByRole("region", { name: /este error te ha salido/i });

async function openReview(page: Page) {
  await notice(page).getByRole("button", { name: /ver explicación/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /repaso de un error/i })).toBeVisible();
}

test.describe("007 US1 repeated mistake notice", () => {
  scenario("007-US1-AS1", "the third mistake shows the pattern and the options", async ({ page, request }) => {
    await feedbackOf(request, page);

    await expect(notice(page).getByRole("heading", { name: /este error te ha salido 3 veces en los últimos 30 días/i })).toBeVisible();
    await expect(notice(page).getByText(/error de procedimiento · paréntesis/i)).toBeVisible();
    await expect(notice(page).getByText(/provisional/i)).toBeVisible();
    await expect(notice(page).getByRole("button", { name: /ver explicación/i })).toBeVisible();
    await expect(notice(page).getByRole("button", { name: /^practicar$/i })).toBeVisible();
    await expect(notice(page).getByRole("button", { name: /ahora no/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("007-US1-AS2", "'Ahora no' hides the pattern for the rest of the session", async ({ page, request }) => {
    const { courseId, ids } = await feedbackOf(request, page, 3, 4);
    await notice(page).getByRole("button", { name: /ahora no/i }).click();

    await expect(notice(page)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
    await page.goto(`/student/courses/${courseId}/exercises/${ids[3]}`);
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  });

  scenario("007-US1-AS3", "the second mistake has no notice", async ({ page, request }) => {
    await feedbackOf(request, page, 2);

    await expect(page.getByText(/error de procedimiento/i).first()).toBeVisible();
    await expect(notice(page)).toHaveCount(0);
  });
});

test.describe("007 US2 targeted review", () => {
  scenario("007-US2-AS1", "the review explains, shows an example, sources and practice", async ({ page, request }) => {
    await feedbackOf(request, page);
    await reviewMode(request, "answer", 1500);
    await notice(page).getByRole("button", { name: /ver explicación/i }).click();

    const preparing = page.getByRole("button", { name: /preparando el repaso/i });
    await expect(preparing).toBeVisible();
    await expect(preparing).toBeDisabled();
    await expect(page.getByRole("heading", { level: 1, name: /repaso de un error/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /qué está pasando/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /un ejemplo resuelto/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /ver fuente: ecuaciones\.md/i })).toBeVisible();
    const practice = page.getByRole("region", { name: /^practica$/i });
    await expect(practice.getByRole("listitem")).toHaveCount(2);
    await expect(page.getByText(/este error te ha salido 3 veces/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("007-US2-AS2", "'Practicar' opens the practice section", async ({ page, request }) => {
    await feedbackOf(request, page);
    await notice(page).getByRole("button", { name: /^practicar$/i }).click();

    await expect(page).toHaveURL(/\/review#practice$/);
    await expect(page.getByRole("region", { name: /^practica$/i })).toBeVisible();
  });

  scenario("007-US2-AS3", "'Resolver' opens the exercise form with the statement", async ({ page, request }) => {
    await feedbackOf(request, page);
    await openReview(page);
    const first = page.getByRole("region", { name: /^practica$/i }).getByRole("listitem").first();
    const statement = (await first.locator("p").first().textContent())!.trim();
    await first.getByRole("link", { name: /resolver/i }).click();

    await expect(page.getByLabel(/enunciado del ejercicio/i)).toHaveValue(statement);
    await expect(page.getByLabel(/tu solución, paso a paso/i)).toHaveValue("");
  });

  scenario("007-US2-AS4", "when the material has nothing, the review says so", async ({ page, request }) => {
    await feedbackOf(request, page);
    await reviewMode(request, "no_source");
    await openReview(page);

    await expect(page.locator('[data-component="NoSourceNotice"]')).toBeVisible();
    await expect(page.getByText(/no he encontrado una explicación de este error/i)).toBeVisible();
    await expect(page.getByRole("region", { name: /^practica$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /preguntar al tutor/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("007-US2-AS5", "an unavailable tutor or the daily limit is explained on the feedback", async ({ page, request }) => {
    await feedbackOf(request, page);
    await reviewMode(request, "fail");
    await notice(page).getByRole("button", { name: /ver explicación/i }).click();

    await expect(notice(page).getByRole("alert").filter({ hasText: /no ha podido/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();

    await reviewMode(request, "limit");
    await notice(page).getByRole("button", { name: /ver explicación/i }).click();
    await expect(notice(page).getByRole("alert").filter({ hasText: /límite/i })).toBeVisible();

    await reviewMode(request, "answer");
    await openReview(page);
  });
});

test.describe("007 US3 teacher view", () => {
  scenario("007-US3-AS1", "the teacher sees the same basis and the review", async ({ page, request }) => {
    const { courseId, ids } = await feedbackOf(request, page);
    await openReview(page);
    await signOut(page);

    await signIn(page, USERS.teacher);
    await page.goto(`/teacher/courses/${courseId}/exercises/${ids[2]}`);
    await expect(page.getByText(/este error se ha repetido 3 veces en los últimos 30 días/i)).toBeVisible();
    const review = page.getByRole("region", { name: /repaso que recibió/i });
    await expect(review.getByText(/qué está pasando/i)).toBeVisible();
    await expect(review.getByRole("listitem")).toHaveCount(2);
    await expectAccessible(page);
  });
});
