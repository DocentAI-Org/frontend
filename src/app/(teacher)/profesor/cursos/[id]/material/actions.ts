"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteDocument, excludeDocument, validateDocument } from "@/lib/api/documents";
import { routes } from "@/lib/routes";

function path(form: FormData) {
  return { course_id: String(form.get("course_id")), document_id: String(form.get("document_id")) };
}

function back(courseId: string, params: Record<string, string>): never {
  redirect(`${routes.teacherMaterial(courseId)}?${new URLSearchParams(params)}` as Route);
}

export async function validateAction(form: FormData) {
  const p = path(form);
  const result = await validateDocument(p);
  back(p.course_id, result.ok ? { validado: result.data.file_name } : { error: result.code });
}

export async function excludeAction(form: FormData) {
  const p = path(form);
  const result = await excludeDocument(p);
  back(p.course_id, result.ok ? { excluido: result.data.file_name } : { error: result.code });
}

export async function deleteAction(form: FormData) {
  const p = path(form);
  await deleteDocument(p);
  revalidatePath(routes.teacherMaterial(p.course_id));
}

/** Used by the uploader's "replace" choice once the new copy is uploaded. */
export async function deleteSilently(courseId: string, documentId: string) {
  await deleteDocument({ course_id: courseId, document_id: documentId });
}
