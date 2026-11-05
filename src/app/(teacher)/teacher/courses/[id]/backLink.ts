import { getTranslations } from "next-intl/server";

import { routes } from "@/lib/routes";

/**
 * Where a conversation or exercise review goes back to: the course page that linked to it
 * (`?back=`, only a page of this course), or else the conversations.
 */
export async function backLink(courseId: string, back: string | undefined, studentName: string) {
  const t = await getTranslations("teacher");
  const base = `/teacher/courses/${courseId}/`;
  if (back?.startsWith(base) && !back.includes("//")) {
    const path = back.slice(base.length);
    if (path.startsWith("students/")) return { href: back, label: t("student.backTo", { name: studentName }) };
    if (path.startsWith("corrections")) return { href: back, label: t("flags.back") };
  }
  return { href: routes.teacherConversations(courseId), label: t("conversations.back") };
}
