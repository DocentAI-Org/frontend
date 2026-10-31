"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import type { Schemas } from "@/lib/api/client";
import { generateQuestions, updateQuestion } from "@/lib/api/quizzes";
import { routes } from "@/lib/routes";

export type GenerateResult = { kind: "answer" | "no_source"; count: number } | { code: string };

/** Asks the tutor for drafts (008 US1 AS2, AS3); the page refreshes to show them. */
export async function generateAction(courseId: string, topicId: string, count: number): Promise<GenerateResult> {
  const result = await generateQuestions(courseId, topicId, count);
  if (!result.ok) return { code: result.code };
  return { kind: result.data.kind, count: result.data.questions.length };
}

/** Back to the list the teacher was on, with the outcome to announce. */
function back(courseId: string, view: string, done: string): never {
  const query = new URLSearchParams(view);
  query.set("done", done);
  redirect(routes.teacherQuestions(courseId, `?${query.toString()}`) as Route);
}

/** Approve or reject without edits (008 US1 AS4). */
export async function reviewQuestionAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const status = String(form.get("status")) as Schemas["TeacherQuestion"]["status"];
  const view = String(form.get("view") ?? "");
  const result = await updateQuestion(courseId, String(form.get("question_id")), { status });
  back(courseId, view, result.ok ? status : `error:${result.code}`);
}

export type EditResult = { code: string; fields?: Record<string, unknown> };

/** Saves the teacher's edits, approving them if asked (008 US1 AS5). */
export async function editQuestionAction(
  courseId: string,
  questionId: string,
  view: string,
  body: Schemas["QuestionUpdate"]
): Promise<EditResult> {
  const result = await updateQuestion(courseId, questionId, body);
  if (!result.ok) return { code: result.code, fields: result.details?.fields as Record<string, unknown> | undefined };
  back(courseId, view, body.status === "approved" ? "approved" : "saved");
}
