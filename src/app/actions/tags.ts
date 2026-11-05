"use server";

import { revalidatePath } from "next/cache";

import { createCourseTag, deleteCourseTag, setCourseTag, updateCourseTag } from "@/lib/api/me";
import type { TagColor } from "@/lib/tag-colors";

export type TagResult = { ok: true } | { ok: false; error: "taken" | "invalid" | "failed" };

function outcome(result: { ok: boolean; status?: number; code?: string }): TagResult {
  if (result.ok) return { ok: true };
  if (result.status === 409) return { ok: false, error: "taken" };
  if (result.status === 422) return { ok: false, error: "invalid" };
  return { ok: false, error: "failed" };
}

/** Course tags of one's own (spec 016 US4); the caller refreshes the list. */
export async function saveTag(tagId: string | null, name: string, color: TagColor): Promise<TagResult> {
  const body = { name: name.trim(), color };
  if (!body.name || body.name.length > 40) return { ok: false, error: "invalid" };
  return outcome(tagId ? await updateCourseTag(tagId, body) : await createCourseTag(body));
}

export async function setTagOnCourse(tagId: string, courseId: string, on: boolean): Promise<TagResult> {
  return outcome(await setCourseTag(tagId, courseId, on));
}

/** From the confirmation dialog: deletes the tag and refreshes both course lists. */
export async function deleteTagAction(form: FormData) {
  await deleteCourseTag(String(form.get("tag_id")));
  revalidatePath("/teacher/courses");
  revalidatePath("/student/courses");
}
