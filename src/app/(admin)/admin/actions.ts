"use server";

import { createPseudonymousStudents, createTeacher } from "@/lib/api/admin";
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
