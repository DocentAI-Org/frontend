// Role separation over every app route (spec 002 SC-006, Constitution II, routes.md "Guards").
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

type Ids = { course: string; document: string; conversation: string; submission: string };

async function seed(request: APIRequestContext): Promise<Ids> {
  const classroom = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
  const { course_id, document_id } = (await classroom.json()) as { course_id: string; document_id: string };
  const activity = await request.post(`${MOCK}/__test/activity`, { data: { course_id } });
  const { conversation_id, submission_id } = (await activity.json()) as { conversation_id: string; submission_id: string };
  return { course: course_id, document: document_id, conversation: conversation_id, submission: submission_id };
}

const ROUTES = {
  student: (i: Ids) => [
    "/alumno/cursos",
    "/alumno/unirse",
    "/alumno/perfil",
    `/alumno/cursos/${i.course}`,
    `/alumno/cursos/${i.course}/conversaciones/${i.conversation}`,
    `/alumno/cursos/${i.course}/ejercicio`,
    `/alumno/cursos/${i.course}/ejercicios/${i.submission}`
  ],
  teacher: (i: Ids) => [
    "/profesor/cursos",
    "/profesor/cursos/nuevo",
    `/profesor/cursos/${i.course}`,
    `/profesor/cursos/${i.course}/material`,
    `/profesor/cursos/${i.course}/material/${i.document}`,
    `/profesor/cursos/${i.course}/tutor`,
    `/profesor/cursos/${i.course}/temas`,
    `/profesor/cursos/${i.course}/temas/asignacion`,
    `/profesor/cursos/${i.course}/conversaciones`,
    `/profesor/cursos/${i.course}/conversaciones/${i.conversation}`,
    `/profesor/cursos/${i.course}/ejercicios/${i.submission}`,
    `/profesor/cursos/${i.course}/correcciones`
  ],
  admin: () => ["/admin/usuarios", "/admin/profesores/nuevo", "/admin/estudiantes/nuevos", "/admin/cursos"]
};

async function expectDenied(page: Page, routes: string[], variant: string) {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator(`[data-component="AccessDenied"][data-variant="${variant}"]`), route).toBeVisible();
  }
}

test.describe("Role separation", () => {
  scenario("002-SC-006a", "signed-out visitors are sent to sign in from every route", async ({ page, request }) => {
    const ids = await seed(request);
    for (const route of [...ROUTES.student(ids), ...ROUTES.teacher(ids), ...ROUTES.admin()]) {
      await page.goto(route);
      await expect(page, route).toHaveURL(/\/entrar\?next=/);
    }
  });

  scenario("002-SC-006b", "a student is denied every teacher and admin route", async ({ page, request }) => {
    const ids = await seed(request);
    await signIn(page, USERS.student);
    await expectDenied(page, [...ROUTES.teacher(ids), ...ROUTES.admin()], "denied");
  });

  scenario("002-SC-006c", "a teacher is denied every student and admin route", async ({ page, request }) => {
    const ids = await seed(request);
    await signIn(page, USERS.teacher);
    await expectDenied(page, [...ROUTES.student(ids), ...ROUTES.admin()], "denied");
  });

  scenario("002-SC-006d", "an admin is denied every student and teacher route", async ({ page, request }) => {
    const ids = await seed(request);
    await signIn(page, USERS.admin);
    await expectDenied(page, [...ROUTES.student(ids), ...ROUTES.teacher(ids)], "denied");
  });

  scenario("002-SC-006e", "another teacher cannot open a course that is not theirs", async ({ page, request }) => {
    const ids = await seed(request);
    await signIn(page, USERS.otherTeacher);
    await expectDenied(page, ROUTES.teacher(ids).slice(2), "not-found");
  });
});
