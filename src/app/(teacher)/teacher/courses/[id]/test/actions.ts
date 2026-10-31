"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import type { Schemas } from "@/lib/api/client";
import {
  type TestPhase,
  addTestQuestion,
  copyQuizQuestion,
  deleteTestQuestion,
  setTestPhase,
  updateTestQuestion
} from "@/lib/api/course-tests";
import { routes } from "@/lib/routes";

function back(courseId: string, done: string): never {
  redirect(routes.teacherTest(courseId, `?done=${encodeURIComponent(done)}`) as Route);
}

export type FormResult = { code: string };

/** Adds a question (010 US1 AS2); checked in the form first, the API decides. */
export async function addQuestionAction(courseId: string, body: Schemas["TestQuestionCreate"]): Promise<FormResult> {
  const result = await addTestQuestion(courseId, body);
  if (!result.ok) return { code: result.code };
  back(courseId, "added");
}

export async function editQuestionAction(courseId: string, questionId: string, body: Schemas["TestQuestionUpdate"]): Promise<FormResult> {
  const result = await updateTestQuestion(courseId, questionId, body);
  if (!result.ok) return { code: result.code };
  back(courseId, "saved");
}

export async function deleteQuestionAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const result = await deleteTestQuestion(courseId, String(form.get("question_id")));
  back(courseId, result.ok ? "deleted" : `error:${result.code}`);
}

export async function copyQuestionAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const result = await copyQuizQuestion(courseId, String(form.get("question_id")));
  back(courseId, result.ok ? "added" : `error:${result.code}`);
}

/** Opens or closes a phase (010 US2). */
export async function phaseAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const phase = String(form.get("phase")) as TestPhase;
  const status = String(form.get("status")) as "open" | "closed";
  const result = await setTestPhase(courseId, phase, status);
  back(courseId, result.ok ? `phase:${phase}` : `error:${result.code}`);
}
