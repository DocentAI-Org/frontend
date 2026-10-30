"use server";

import { redirect } from "next/navigation";

import { createCourse } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

export type CreateCourseState = { nameError?: boolean; error?: string; values?: { name: string; description: string } };

export async function createCourseAction(_: CreateCourseState, form: FormData): Promise<CreateCourseState> {
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const values = { name, description };
  if (!name || name.length > 80) return { nameError: true, values };
  const result = await createCourse({ name, description: description || null });
  if (!result.ok) {
    return result.code === "validation_error" ? { nameError: true, values } : { error: result.code, values };
  }
  redirect(routes.teacherCourse(result.data.id));
}
