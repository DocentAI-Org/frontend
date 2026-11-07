"use server";

import { revalidatePath } from "next/cache";

import { createOwnCredential, deleteOwnCredential, testCourseAI, updateCourseAISettings } from "@/lib/api/ai";
import type { Schemas } from "@/lib/api/client";
import { type CredentialState, credentialFromForm } from "@/lib/credentials";
import { routes } from "@/lib/routes";

export async function saveCourseAISettingsAction(
  courseId: string,
  body: Schemas["CourseOverrides"]
): Promise<{ ok: true } | { ok: false; code: string }> {
  const result = await updateCourseAISettings(courseId, body);
  if (!result.ok) return { ok: false, code: result.code };
  revalidatePath(routes.teacherAI(courseId));
  return { ok: true };
}

/** Adds the teacher's own key to the course, if the study allows it (spec 019). */
export async function createOwnCredentialAction(courseId: string, _: CredentialState, form: FormData): Promise<CredentialState> {
  const parsed = credentialFromForm(form);
  if ("state" in parsed) return parsed.state;
  const result = await createOwnCredential(courseId, parsed.body);
  if (!result.ok) return { error: result.code, values: parsed.values };
  revalidatePath(routes.teacherAI(courseId));
  return { created: Date.now() };
}

export async function deleteOwnCredentialAction(courseId: string, form: FormData): Promise<void> {
  await deleteOwnCredential(courseId, String(form.get("id")));
  revalidatePath(routes.teacherAI(courseId));
}

/** Tries a message with the settings as they are in the form (spec 019 US5). */
export async function testCourseAIAction(
  courseId: string,
  body: Schemas["AITestRequest"]
): Promise<{ ok: true; result: Schemas["AITestResult"] } | { ok: false; code: string }> {
  const result = await testCourseAI(courseId, body);
  return result.ok ? { ok: true, result: result.data } : { ok: false, code: result.code };
}
