"use server";

import { revalidatePath } from "next/cache";

import type { Schemas } from "@/lib/api/client";
import { updateCourseCriteria } from "@/lib/api/pedagogy";
import { routes } from "@/lib/routes";

export async function saveCourseCriteriaAction(
  courseId: string,
  body: Schemas["CourseCriteriaUpdate"]
): Promise<{ ok: true } | { ok: false; code: string }> {
  const result = await updateCourseCriteria(courseId, body);
  if (!result.ok) return { ok: false, code: result.code };
  revalidatePath(routes.teacherCriteria(courseId));
  return { ok: true };
}
