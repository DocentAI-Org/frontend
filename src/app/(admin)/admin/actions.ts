"use server";

import { revalidatePath } from "next/cache";

import {
  createPseudonymousStudents,
  createQuestionnaire,
  createTeacher,
  deleteQuestionnaire,
  updateQuestionnaire
} from "@/lib/api/admin";
import type { Schemas } from "@/lib/api/client";

export type TeacherState = {
  nameError?: boolean;
  emailError?: boolean;
  error?: string;
  values?: { name: string; email: string };
  created?: { name: string; email: string; password: string };
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function createTeacherAction(_: TeacherState, form: FormData): Promise<TeacherState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const values = { name, email };
  const nameError = !name;
  const emailError = !EMAIL.test(email);
  if (nameError || emailError) return { nameError, emailError, values };
  const result = await createTeacher({ display_name: name, email });
  if (!result.ok) return { error: result.code, values };
  // Shown once and never stored by the app (spec deviation D3).
  return { created: { name, email, password: result.data.initial_password } };
}

export type StudentsState = {
  countError?: boolean;
  error?: string;
  accounts?: Schemas["PseudonymousAccount"][];
};

export async function createStudentsAction(_: StudentsState, form: FormData): Promise<StudentsState> {
  const count = Number(form.get("count"));
  if (!Number.isInteger(count) || count < 1 || count > 100) return { countError: true };
  const result = await createPseudonymousStudents(count);
  if (!result.ok) return { error: result.code };
  return { accounts: result.data.accounts };
}

export type QuestionnaireState = {
  titleError?: boolean;
  urlError?: boolean;
  error?: string;
  values?: { title: string; url: string; audience: string };
  /** Bumped on success so the form clears (012 US1 AS2). */
  created?: number;
};

const HTTPS = /^https:\/\/[^/\s]+/;

export async function createQuestionnaireAction(_: QuestionnaireState, form: FormData): Promise<QuestionnaireState> {
  const title = String(form.get("title") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const audience = String(form.get("audience") ?? "student") === "teacher" ? "teacher" : "student";
  const values = { title, url, audience };
  const titleError = !title;
  const urlError = !HTTPS.test(url);
  if (titleError || urlError) return { titleError, urlError, values };
  const result = await createQuestionnaire({ title, url, audience });
  if (!result.ok) return { error: result.code, values };
  revalidatePath("/admin/questionnaires");
  return { created: Date.now() };
}

export async function setQuestionnaireStatusAction(form: FormData): Promise<void> {
  const status = form.get("status") === "closed" ? "closed" : "open";
  await updateQuestionnaire(String(form.get("id")), { status });
  revalidatePath("/admin/questionnaires");
}

export async function deleteQuestionnaireAction(form: FormData): Promise<void> {
  await deleteQuestionnaire(String(form.get("id")));
  revalidatePath("/admin/questionnaires");
}
