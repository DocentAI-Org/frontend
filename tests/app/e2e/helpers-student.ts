// Student-side setup: a seeded course with validated material, signed in as the student.
import type { APIRequestContext, Page } from "@playwright/test";

import { USERS, signIn } from "./helpers";

export const MOCK = "http://127.0.0.1:8010";
export type Policy = "direct" | "hints_first" | "hints_only";

export async function classroom(
  request: APIRequestContext,
  page: Page,
  opts: { policy?: Policy; disclosure?: boolean; path?: string } = {}
) {
  const { path = "", ...seed } = opts;
  const response = await request.post(`${MOCK}/__test/classroom`, { data: { policy: "direct", disclosure: true, ...seed } });
  const { course_id, document_id } = (await response.json()) as { course_id: string; document_id: string };
  await signIn(page, USERS.student);
  await page.goto(`/student/courses/${course_id}${path}`);
  return { courseId: course_id, documentId: document_id };
}
