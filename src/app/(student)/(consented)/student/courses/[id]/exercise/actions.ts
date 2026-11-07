"use server";

import { redirect } from "next/navigation";

import { submitExercise } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export type SubmitResult = { code: string; details?: Record<string, unknown> };

export async function submitAction(courseId: string, problem: string, answer: string): Promise<SubmitResult> {
  const result = await submitExercise(courseId, problem, answer);
  if (!result.ok) {
    return { code: result.code, details: result.details ?? undefined };
  }
  redirect(routes.studentSubmission(courseId, result.data.id));
}
