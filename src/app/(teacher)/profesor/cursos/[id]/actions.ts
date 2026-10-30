"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { regenerateClassCode, revokeStudent, setClassCodeActive } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

export async function regenerateCodeAction(form: FormData) {
  const id = String(form.get("course_id"));
  const result = await regenerateClassCode(id);
  redirect(`${routes.teacherCourse(id)}?${result.ok ? "codigo=nuevo" : `error=${result.code}`}` as Route);
}

export async function setCodeActiveAction(form: FormData) {
  const id = String(form.get("course_id"));
  await setClassCodeActive(id, form.get("active") === "true");
  revalidatePath(routes.teacherCourse(id));
}

export async function revokeStudentAction(form: FormData) {
  const id = String(form.get("course_id"));
  await revokeStudent(id, String(form.get("student_id")));
  revalidatePath(routes.teacherCourse(id));
}
