"use server";

import { revalidatePath } from "next/cache";

import type { Schemas } from "@/lib/api/client";
import { type FlagTarget, removeFlag, saveFlag } from "@/lib/api/review";

export async function saveFlagAction(
  courseId: string,
  target: FlagTarget,
  body: Schemas["FlagUpsert"],
  path: string
): Promise<boolean> {
  const result = await saveFlag(courseId, target, body);
  if (result.ok) revalidatePath(path);
  return result.ok;
}

export async function removeFlagAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const target = { kind: String(form.get("kind")) as FlagTarget["kind"], id: String(form.get("target_id")) };
  await removeFlag(courseId, target);
  revalidatePath(String(form.get("path")));
}
