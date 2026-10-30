"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { joinCourse } from "@/lib/api/courses";

export type JoinState = { error?: string; code?: string };

export async function joinAction(_: JoinState, form: FormData): Promise<JoinState> {
  const code = String(form.get("code") ?? "").trim();
  if (!code) return { error: "class_code_invalid", code };
  const result = await joinCourse(code);
  if (!result.ok) return { error: result.code, code };
  redirect(`/student/join?joined=${result.data.id}` as Route);
}
