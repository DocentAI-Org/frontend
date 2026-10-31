"use server";

import { redirect } from "next/navigation";

import type { Schemas } from "@/lib/api/client";
import { answerQuestion, startQuiz } from "@/lib/api/quizzes";
import { routes } from "@/lib/routes";

/** Starts a quiz over every topic or one (008 US2 AS1, AS4) and opens it. */
export async function startQuizAction(courseId: string, topicId?: string): Promise<{ code: string }> {
  const result = await startQuiz(courseId, topicId);
  if (!result.ok) return { code: result.code };
  redirect(routes.studentQuiz(courseId, result.data.id));
}

export type AnswerOutcome = { ok: true; data: Schemas["AnswerResult"] } | { ok: false; code: string };

/** Grades the current question; never calls the model (backend specs/006). */
export async function answerAction(courseId: string, quizId: string, questionId: string, choice: number): Promise<AnswerOutcome> {
  const result = await answerQuestion(courseId, quizId, questionId, choice);
  return result.ok ? { ok: true, data: result.data } : { ok: false, code: result.code };
}
