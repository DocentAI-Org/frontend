import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { Alert } from "@/components/Alert";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { getCourseConversation } from "@/lib/api/review";
import { routes } from "@/lib/routes";

import { ReviewedAnswer } from "../ReviewedAnswer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.conversations");
  return { title: t("detailPageTitle") };
}

/** Conversation detail (#24, 001 US8 AS2, AS6, AS7). */
export default async function ConversationReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; conversacion: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  const { id, conversacion } = await params;
  const { guardado } = await searchParams;
  const t = await getTranslations();
  const conversation = await getCourseConversation(id, conversacion);
  if (!conversation.ok) {
    return conversation.status === 404 ? <AccessDenied reason="not-found" home="/profesor/cursos" /> : <ErrorState code={conversation.code} />;
  }
  const path = routes.teacherConversation(id, conversacion);
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={routes.teacherConversations(id)}
        className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="chevron-left" />
        <span>{t("teacher.conversations.back")}</span>
      </Link>
      <div>
        <h2 className="text-2xl font-semibold text-fg">
          {t("teacher.conversations.detailTitle", { student: conversation.data.student_name })}
        </h2>
        <p className="text-sm text-fg-muted tabular-nums">{t("teacher.conversations.messages", { count: conversation.data.message_count })}</p>
      </div>
      {guardado && <Alert tone="success">{t("teacher.flags.saved")}</Alert>}
      <ol className="flex flex-col gap-6">
        {conversation.data.messages.map((message) =>
          message.author === "student" ? (
            <li key={message.id} className="grid lg:grid-cols-12" data-component="ChatMessage" data-variant="student">
              <div className="flex justify-end lg:col-span-9">
                <p className="max-w-md rounded-r-md border-l-4 border-primary-600 bg-surface-raised px-4 py-2 text-fg shadow-sm">
                  <span className="sr-only">{conversation.data.student_name}: </span>
                  {message.text}
                </p>
              </div>
            </li>
          ) : (
            <li key={message.id}>
              <ReviewedAnswer
                courseId={id}
                target={{ kind: "message", id: message.id }}
                path={path}
                text={message.text}
                kind={message.kind === "question" ? "answer" : message.kind}
                citations={message.citations}
                flag={message.flag}
              />
            </li>
          )
        )}
      </ol>
    </div>
  );
}
