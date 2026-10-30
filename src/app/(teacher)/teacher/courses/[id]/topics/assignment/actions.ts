"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { confirmAssignment, createAssignment, deleteAssignment } from "@/lib/api/topics";
import { routes } from "@/lib/routes";

/**
 * Applies the teacher's choice for every section: keep, confirm a suggestion, change its topic,
 * create a confirmed assignment or remove one (001 US14 AS3).
 */
export async function saveAssignmentsAction(form: FormData) {
  const courseId = String(form.get("course_id"));
  const keys = form.getAll("key").map(String);
  let failed = false;
  for (const key of keys) {
    const [documentId, ...rest] = key.split("::");
    const section = rest.join("::");
    const chosen = String(form.get(`topic:${key}`) ?? "");
    const [assignmentId = "", status = "", currentTopic = ""] = String(form.get(`current:${key}`) ?? "").split("|");
    let result: { ok: boolean } = { ok: true };
    if (!assignmentId && chosen) {
      result = await createAssignment(courseId, { topic_id: chosen, document_id: documentId, section });
    } else if (assignmentId && !chosen) {
      result = await deleteAssignment(courseId, assignmentId);
    } else if (assignmentId && (status === "suggested" || chosen !== currentTopic)) {
      result = await confirmAssignment(courseId, assignmentId, chosen !== currentTopic ? chosen : undefined);
    }
    failed ||= !result.ok;
  }
  redirect(`${routes.teacherTopicAssignment(courseId)}?${failed ? "error=1" : "saved=1"}` as Route);
}
