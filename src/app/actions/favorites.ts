"use server";

import { setFavoriteCourse } from "@/lib/api/me";

/** Stars or unstars a course; the caller refreshes the list so it moves (spec 016). */
export async function setFavorite(courseId: string, favorite: boolean): Promise<{ ok: boolean }> {
  const result = await setFavoriteCourse(courseId, favorite);
  return { ok: result.ok };
}
