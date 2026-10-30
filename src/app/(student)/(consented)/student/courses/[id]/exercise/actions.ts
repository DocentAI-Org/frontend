"use server";

import { redirect } from "next/navigation";

import { submitExercise } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export type SubmitResult = { code: string; resetsAt?: string };

export async function submitAction(courseId: string, problem: string, answer: string): Promise<SubmitResult> {
  const result = await submitExercise(courseId, problem, answer);
  if (!result.ok) {
    const resetsAt = typeof result.details?.resets_at === "string" ? result.details.resets_at : undefined;
    return { code: result.code, resetsAt };
  }
  redirect(routes.studentSubmission(courseId, result.data.id));
}
