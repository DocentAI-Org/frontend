"use server";

import type { Schemas } from "@/lib/api/client";
import { type TestPhase, submitTest } from "@/lib/api/course-tests";

export type SubmitOutcome = { ok: true } | { ok: false; code: string };

/** Sends every answer at once; the API returns no score (backend 008). */
export async function submitTestAction(courseId: string, phase: TestPhase, answers: Schemas["TestAnswerIn"][]): Promise<SubmitOutcome> {
  const result = await submitTest(courseId, phase, answers);
  return result.ok ? { ok: true } : { ok: false, code: result.code };
}
