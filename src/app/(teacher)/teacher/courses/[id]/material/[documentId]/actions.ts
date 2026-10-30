"use server";

import { revalidatePath } from "next/cache";

import { setFragmentExcluded } from "@/lib/api/documents";
import { routes } from "@/lib/routes";

export async function toggleFragmentAction(form: FormData) {
  const course_id = String(form.get("course_id"));
  const document_id = String(form.get("document_id"));
  await setFragmentExcluded(
    { course_id, document_id, fragment_id: String(form.get("fragment_id")) },
    form.get("excluded") === "true"
  );
  revalidatePath(routes.teacherDocument(course_id, document_id));
}
