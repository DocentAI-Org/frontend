// Role separation over every app route (spec 002 SC-006, Constitution II, routes.md "Guards").
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, expect, scenario, signIn, test } from "./helpers";
import { MOCK } from "./helpers-student";

type Ids = { course: string; document: string; conversation: string; submission: string; student: string };

async function seed(request: APIRequestContext): Promise<Ids> {
  const classroom = await request.post(`${MOCK}/__test/classroom`, { data: { disclosure: true } });
  const { course_id, document_id } = (await classroom.json()) as { course_id: string; document_id: string };
  const activity = await request.post(`${MOCK}/__test/activity`, { data: { course_id } });
  const { conversation_id, submission_id, student_id } = (await activity.json()) as {
    conversation_id: string;
    submission_id: string;
    student_id: string;
  };
  return { course: course_id, document: document_id, conversation: conversation_id, submission: submission_id, student: student_id };
}

const ROUTES = {
  student: (i: Ids) => [
    "/student/courses",
    "/student/join",
    "/student/profile",
    `/student/courses/${i.course}`,
    `/student/courses/${i.course}/conversations/${i.conversation}`,
    `/student/courses/${i.course}/exercise`,
    `/student/courses/${i.course}/exercises/${i.submission}`,
    `/student/courses/${i.course}/progress`
  ],
  teacher: (i: Ids) => [
    "/teacher/courses",
    "/teacher/courses/new",
    `/teacher/courses/${i.course}`,
    `/teacher/courses/${i.course}/material`,
    `/teacher/courses/${i.course}/material/${i.document}`,
    `/teacher/courses/${i.course}/tutor`,
    `/teacher/courses/${i.course}/topics`,
    `/teacher/courses/${i.course}/topics/assignment`,
    `/teacher/courses/${i.course}/conversations`,
    `/teacher/courses/${i.course}/conversations/${i.conversation}`,
    `/teacher/courses/${i.course}/exercises/${i.submission}`,
    `/teacher/courses/${i.course}/corrections`,
    `/teacher/courses/${i.course}/students/${i.student}`
  ],
  admin: () => ["/admin/users", "/admin/teachers/new", "/admin/students/new", "/admin/courses"]
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
      await expect(page, route).toHaveURL(/\/sign-in\?next=/);
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
