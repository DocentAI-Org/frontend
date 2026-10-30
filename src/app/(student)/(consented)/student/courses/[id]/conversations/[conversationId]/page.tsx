import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CourseChat } from "../../CourseChat";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.chat");
  return { title: t("pageTitle") };
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string; conversationId: string }> }) {
  const { id, conversationId } = await params;
  return <CourseChat courseId={id} conversationId={conversationId} />;
}
