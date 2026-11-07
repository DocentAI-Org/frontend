"use server";

import { revalidatePath } from "next/cache";

import { updateCourseAISettings } from "@/lib/api/ai";
import type { Schemas } from "@/lib/api/client";
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
