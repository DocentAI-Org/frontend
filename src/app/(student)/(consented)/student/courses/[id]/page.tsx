import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { listConversations } from "@/lib/api/chat";
import { routes } from "@/lib/routes";

import { CourseChat } from "./CourseChat";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.chat");
  return { title: t("pageTitle") };
}

/** Course chat (#8, #10): reopens the latest conversation, or starts with the tutor's welcome. */
export default async function CourseChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversations = await listConversations(id);
  const latest = conversations.ok ? conversations.data.items[0] : undefined;
  if (latest) redirect(routes.studentConversation(id, latest.id));
  return <CourseChat courseId={id} conversationId={null} />;
}
