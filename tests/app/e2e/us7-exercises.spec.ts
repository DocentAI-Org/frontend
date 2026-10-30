// US7 — student submits a worked exercise; feedback is the API stub (spec 002 US7, 001 US6).
import type { Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, test } from "./helpers";
import { MOCK, classroom } from "./helpers-student";

const COVERED = "Despeja la incógnita en 2x = 4";

async function fill(page: Page, problem: string, steps = "2x = 4\nx = 4 - 2\nx = 2") {
  await page.getByLabel(/enunciado del ejercicio/i).fill(problem);
  await page.getByLabel(/tu solución, paso a paso/i).fill(steps);
}

async function submit(page: Page, problem = COVERED) {
  await fill(page, problem);
  await page.getByRole("button", { name: /revisar antes de enviar/i }).click();
  await page.getByRole("button", { name: /enviar ejercicio/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
}

test.describe("US7 exercises", () => {
  scenario("001-US6-AS1", "the student reviews the exercise before sending", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await expectAccessible(page);
    await fill(page, COVERED);

    await page.getByRole("button", { name: /revisar antes de enviar/i }).click();

    await expect(page.getByRole("heading", { name: /revisa tu envío/i })).toBeVisible();
    await expect(page.getByText(COVERED)).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: /editar/i }).click();
    await expect(page.getByLabel(/enunciado del ejercicio/i)).toHaveValue(COVERED);
  });

  scenario("001-US6-AS2", "the feedback stays available after leaving", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await submit(page);
    const url = page.url();

    await page.goto("/student/courses");
    await page.goto(url);

    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();
  });

  scenario("001-US6-AS3", "feedback names the result, the mistake, its type and topic, with citations", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await submit(page);

    await expect(page.getByText(/^incorrecta$/i)).toBeVisible();
    await expect(page.getByText(/dónde está el error:/i)).toBeVisible();
    await expect(page.getByText(/tipo de error:/i)).toBeVisible();
    await expect(page.getByText(/guardado en tu progreso/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ver fuente: ecuaciones\.md/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US6-AS4", "an exercise outside the material uses the not-covered pattern", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await submit(page, "Calcula la derivada del seno");

    await expect(page.locator('[data-component="NoSourceNotice"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /ver fuente/i })).toHaveCount(0);
  });

  scenario("001-US6-AS5", "an empty submission explains how to fix it", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });

    await page.getByRole("button", { name: /revisar antes de enviar/i }).click();

    await expect(page.getByRole("alert").filter({ hasText: /escribe el enunciado y tu solución/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US6-AS6", "at the daily limit the same limit message appears", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await request.post(`${MOCK}/__test/usage`, { data: { email: USERS.student, used: 30 } });
    await page.reload();

    await expect(page.getByRole("heading", { name: /has usado tus 30 mensajes de hoy/i })).toBeVisible();
    await expect(page.getByText(/no puedes enviar ejercicios hasta las/i)).toBeVisible();
    await expect(page.getByLabel(/enunciado del ejercicio/i)).toBeDisabled();
  });

  scenario("002-US7-AS1", "stub feedback carries a discreet provisional notice", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await submit(page);

    await expect(page.getByRole("note").filter({ hasText: /todavía se está preparando/i })).toBeVisible();
    await expect(page.getByText(/^incorrecta$/i)).toBeVisible();
  });
});
