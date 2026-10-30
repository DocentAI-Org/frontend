// US5 — teacher defines topics and assigns material (spec 002 US5, 001 US14).
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, chooseOption, expect, expectAccessible, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

async function teacherCourse(request: APIRequestContext, page: Page, path = "/temas") {
  const response = await request.post(`${MOCK}/__test/classroom`, { data: {} });
  const { course_id } = (await response.json()) as { course_id: string };
  await signIn(page, USERS.teacher);
  await page.goto(`/profesor/cursos/${course_id}${path}`);
  return course_id;
}

async function addTopic(page: Page, name: string) {
  await page.getByLabel(/nuevo tema/i).fill(name);
  await page.getByRole("button", { name: /añadir (el primer )?tema/i }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${name}» se ha añadido` })).toBeVisible();
}

const topicItems = (page: Page) => page.getByRole("list", { name: /temas, en orden/i }).getByRole("listitem");

test.describe("US5 topics", () => {
  scenario("001-US14-AS1", "a course without topics explains them and offers the first one", async ({ page, request }) => {
    await teacherCourse(request, page);

    await expect(page.getByRole("heading", { name: /todavía no hay temas/i })).toBeVisible();
    await expect(page.getByLabel(/nuevo tema/i)).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US14-AS2", "topics can be added, renamed, reordered and deleted with confirmation", async ({ page, request }) => {
    await teacherCourse(request, page);
    await addTopic(page, "Ecuaciones");
    await addTopic(page, "Paréntesis");
    await expect(topicItems(page)).toHaveCount(2);
    await expectAccessible(page);

    await topicItems(page).nth(1).getByRole("button", { name: /subir/i }).click();
    await expect(topicItems(page).first()).toContainText("Paréntesis");

    await topicItems(page).first().getByRole("button", { name: /renombrar/i }).click();
    await page.getByRole("dialog").getByLabel(/nombre del tema/i).fill("Quitar paréntesis");
    await page.getByRole("dialog").getByRole("button", { name: /guardar nombre/i }).click();
    await expect(topicItems(page).first()).toContainText("Quitar paréntesis");

    await topicItems(page).first().getByRole("button", { name: /eliminar/i }).click();
    await expect(page.getByRole("dialog")).toContainText(/quedarán sin tema/i);
    await page.getByRole("dialog").getByRole("button", { name: /eliminar tema/i }).click();
    await expect(topicItems(page)).toHaveCount(1);
  });

  scenario("002-US5-AS2", "a duplicate name shows its error next to the field", async ({ page, request }) => {
    await teacherCourse(request, page);
    await addTopic(page, "Ecuaciones");

    await page.getByLabel(/nuevo tema/i).fill("ecuaciones");
    await page.getByRole("button", { name: /añadir (el primer )?tema/i }).click();

    await expect(page.getByText(/ya hay un tema con ese nombre/i)).toBeVisible();
    await expect(page.getByLabel(/nuevo tema/i)).toHaveAttribute("aria-invalid", "true");
  });

  scenario("001-US14-AS3", "suggestions are marked and only confirmed assignments count", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, "Ecuaciones");
    await request.post(`${MOCK}/__test/suggestion`, { data: { topic_name: "Ecuaciones", section: "3.1 Transponer términos" } });

    await page.goto(`/profesor/cursos/${courseId}/temas/asignacion`);
    const suggested = page.getByRole("group", { name: /3\.1 transponer términos/i });
    await expect(suggested.getByText(/^sugerido$/i)).toBeVisible();
    await expectAccessible(page);

    await chooseOption(page.getByRole("group", { name: /3\.2 despejar la incógnita/i }).getByRole("combobox", { name: /tema de la sección/i }), "Ecuaciones");
    await page.getByRole("button", { name: /guardar temas/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /temas guardados/i })).toBeVisible();
    await expect(page.getByRole("group", { name: /3\.1 transponer términos/i }).getByText(/^confirmado$/i)).toBeVisible();
    await expect(page.getByRole("group", { name: /3\.2 despejar la incógnita/i }).getByText(/^confirmado$/i)).toBeVisible();
  });

  scenario("001-US14-AS4", "sections without a confirmed topic are listed on Temas and Material", async ({ page, request }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, "Ecuaciones");

    await expect(page.getByRole("alert").filter({ hasText: /hay secciones sin tema/i })).toContainText("3.1 Transponer términos");
    await page.goto(`/profesor/cursos/${courseId}/material`);
    await expect(page.getByRole("alert").filter({ hasText: /hay secciones sin tema/i })).toBeVisible();
  });

  scenario("001-US14-AS5", "when suggestions fail to load, topics can still be assigned by hand", async ({ page, request, mock }) => {
    const courseId = await teacherCourse(request, page);
    await addTopic(page, "Ecuaciones");
    await mock.faults(["assignments_fail"]);

    await page.goto(`/profesor/cursos/${courseId}/temas/asignacion`);

    await expect(page.getByRole("alert").filter({ hasText: /no hemos podido cargar las sugerencias/i })).toBeVisible();
    await expect(page.getByRole("group", { name: /3\.1 transponer términos/i }).getByLabel(/tema de la sección/i)).toBeEnabled();
  });
});
