"use server";

import type { Schemas } from "@/lib/api/client";
import { saveTutorSettings } from "@/lib/api/tutor";

export type SaveResult = { ok: true; updatedAt: string } | { ok: false };

export async function saveSettingsAction(courseId: string, values: Schemas["TutorSettingsUpdate"]): Promise<SaveResult> {
  const result = await saveTutorSettings(courseId, values);
  return result.ok ? { ok: true, updatedAt: result.data.updated_at } : { ok: false };
}
