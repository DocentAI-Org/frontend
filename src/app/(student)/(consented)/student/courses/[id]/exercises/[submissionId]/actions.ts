"use server";

import { redirect } from "next/navigation";

import { requestReview } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export type ReviewResult = { code: string; resetsAt?: string };

/** Creates the review (or finds it) and opens it, at the practice section if asked (007 US2). */
export async function reviewAction(courseId: string, submissionId: string, practice: boolean): Promise<ReviewResult> {
  const result = await requestReview(courseId, submissionId);
  if (!result.ok) {
    const resetsAt = typeof result.details?.resets_at === "string" ? result.details.resets_at : undefined;
    return { code: result.code, resetsAt };
  }
  redirect(`${routes.studentReview(courseId, submissionId)}${practice ? "#practice" : ""}`);
}
