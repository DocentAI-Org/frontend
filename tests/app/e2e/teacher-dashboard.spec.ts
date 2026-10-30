// 006 — teacher dashboard: recurring errors and students who may need help (spec 006 US1–US2).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

type Mode = "busy" | "quiet" | "calm";

/** A course with Lucas Herrera and EST-DEMO1, whose dashboard looks like `mode`; signed in as the teacher. */
async function dashboardCourse(request: APIRequestContext, page: Page, mode: Mode, path = "/dashboard") {
  const response = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true } });
  const { course_id } = (await response.json()) as { course_id: string };
  await request.post(`${MOCK}/__test/dashboard`, { data: { course_id, mode } });
  await signIn(page, USERS.teacher);
  await page.goto(`/teacher/courses/${course_id}${path}`);
  return course_id;
}

const topicTable = (page: Page) => page.getByRole("table", { name: /errores repetidos por tema/i });
const studentTable = (page: Page) => page.getByRole("table", { name: /errores repetidos por estudiante/i });
const atRisk = (page: Page) => page.getByRole("region", { name: /estudiantes que pueden necesitar ayuda/i });

test.describe("006 US1 recurring errors", () => {
  scenario("006-US1-AS1", "the teacher opens the dashboard and sees errors by topic", async ({ page, request }) => {
    await dashboardCourse(request, page, "busy", "");
    await page.getByRole("link", { name: /^panel$/i }).click();

    const row = topicTable(page).getByRole("row").filter({ hasText: "Paréntesis" });
    await expect(row).toBeVisible();
    await expect(row.getByRole("cell").nth(0)).toHaveText(/^7/);
    await expect(row.getByRole("cell").nth(1)).toHaveText("2");
    await expect(row.getByText("Error de procedimiento")).toBeVisible();
    await expect(topicTable(page).getByText("procedural")).toHaveCount(0);
    await expect(topicTable(page).getByRole("row").filter({ hasText: "Sin tema" })).toBeVisible();
    await expect(page.getByRole("link", { name: /últimos 30 días/i })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText(/errores detectados en ejercicios en los últimos 30 días/i)).toBeVisible();
    await expect(page.getByText(/los criterios y los tipos de error son provisionales/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("006-US1-AS2", "by student, any student opens their page", async ({ page, request }) => {
    await dashboardCourse(request, page, "busy");
    await page.getByRole("link", { name: /^por estudiante$/i }).click();

    const row = studentTable(page).getByRole("row").filter({ hasText: "EST-DEMO1" });
    await expect(row.getByRole("cell").nth(0)).toHaveText(/^3/);
    await expect(row.getByText("Error de ejecución")).toBeVisible();
    await expectAccessible(page);

    await row.getByRole("link", { name: "EST-DEMO1" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "EST-DEMO1" })).toBeVisible();
  });

  scenario("006-US1-AS3", "with too little activity the dashboard says what is missing", async ({ page, request }) => {
    await dashboardCourse(request, page, "quiet");

    await expect(page.getByRole("heading", { name: /el panel necesita más actividad/i })).toBeVisible();
    await expect(page.getByText(/12 de 20 mensajes/i)).toBeVisible();
    await expect(page.getByText(/2 de 5 ejercicios/i)).toBeVisible();
    await expect(topicTable(page)).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("006-US1-AS4", "the period is kept in the URL", async ({ page, request }) => {
    await dashboardCourse(request, page, "busy");
    await page.getByRole("link", { name: /^por estudiante$/i }).click();
    await expect(page).toHaveURL(/view=student/);
    await page.getByRole("link", { name: /últimos 7 días/i }).click();

    await expect(page).toHaveURL(/period=7d/);
    await expect(page).toHaveURL(/view=student/);
    await page.reload();
    await expect(page.getByRole("link", { name: /últimos 7 días/i })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText(/en los últimos 7 días/i)).toBeVisible();
    await expect(studentTable(page)).toBeVisible();
  });
});

test.describe("006 US2 students who may need help", () => {
  scenario("006-US2-AS1", "each flagged student shows every reason in a sentence", async ({ page, request }) => {
    await dashboardCourse(request, page, "busy");

    const item = atRisk(page).getByRole("listitem").filter({ hasText: "Lucas Herrera" });
    await expect(item.getByText(/sin actividad en 9 días/i)).toBeVisible();
    await expect(item.getByText(/6 de 10 ejercicios con errores en los últimos 14 días/i)).toBeVisible();
    await expect(atRisk(page).getByText("EST-DEMO1")).toHaveCount(0);
    await expect(atRisk(page).getByText(/no es una nota/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("006-US2-AS2", "'See why' opens the student with the reasons and weekly activity", async ({ page, request }) => {
    await dashboardCourse(request, page, "busy");
    await atRisk(page).getByRole("link", { name: /ver por qué/i }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Lucas Herrera" })).toBeVisible();
    const why = page.getByRole("region", { name: /por qué aparece aquí/i });
    await expect(why.getByText(/sin actividad en 9 días/i)).toBeVisible();
    await expect(why.getByText(/6 de 10 ejercicios con errores/i)).toBeVisible();
    const weeks = why.getByRole("table", { name: /actividad por semana/i });
    await expect(weeks.getByRole("row")).toHaveCount(9);
    await expect(page.getByRole("link", { name: /volver al panel/i })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("006-US2-AS3", "a student who is not flagged has no 'why' block", async ({ page, request }) => {
    const courseId = await dashboardCourse(request, page, "busy");
    await page.goto(`/teacher/courses/${courseId}`);
    await page.getByRole("link", { name: "EST-DEMO1" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "EST-DEMO1" })).toBeVisible();
    await expect(page.getByRole("region", { name: /por qué aparece aquí/i })).toHaveCount(0);
  });

  scenario("006-US2-AS4", "with nobody flagged the list says so", async ({ page, request }) => {
    await dashboardCourse(request, page, "calm");

    await expect(atRisk(page).getByText(/ningún estudiante cumple ahora los criterios/i)).toBeVisible();
    await expectAccessible(page);
  });
});
