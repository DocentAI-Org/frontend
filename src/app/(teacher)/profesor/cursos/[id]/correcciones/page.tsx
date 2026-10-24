import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { listCourseFlags } from "@/lib/api/review";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.flags");
  return { title: t("pageTitle") };
}

/** Flagged answers of a course with their corrections (#25, 001 US8 AS3). */
export default async function FlagsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations();
  const format = await getFormatter();
  const flags = await listCourseFlags(id);
  if (!flags.ok) return <ErrorState code={flags.code} />;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={routes.teacherConversations(id)}
        className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="chevron-left" />
        <span>{t("teacher.conversations.back")}</span>
      </Link>
      <h2 className="text-2xl font-semibold text-fg">{t("teacher.flags.title")}</h2>
      <p className="max-w-3xl text-fg-muted">{t("teacher.flags.lead")}</p>
      {flags.data.items.length === 0 ? (
        <EmptyState icon="flag" title={t("teacher.flags.emptyTitle")} body={t("teacher.flags.emptyBody")} />
      ) : (
        <ul aria-label={t("teacher.flags.listLabel")} className="flex flex-col gap-4">
          {flags.data.items.map((flag) => {
            const href = flag.conversation_id
              ? routes.teacherConversation(id, flag.conversation_id)
              : routes.teacherSubmission(id, flag.submission_id ?? "");
            return (
              <li key={flag.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-4" data-component="FlagRow">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-sm border border-teacher-300 bg-teacher-50 px-2 py-0.5 text-xs font-semibold text-teacher-800">
                    <Icon name="flag" />
                    <span>{flag.category === "incorrect" ? t("teacher.flags.incorrect") : t("teacher.flags.improve")}</span>
                  </span>
                  {flag.target === "submission" && <span className="text-fg-muted">{t("teacher.conversations.exercise")}</span>}
                  <span className="text-fg-muted tabular-nums">
                    {t("teacher.flags.meta", {
                      student: flag.student_name,
                      date: format.dateTime(new Date(flag.updated_at), { dateStyle: "long" })
                    })}
                  </span>
                </p>
                <p className="font-serif text-fg-muted line-through decoration-teacher-600 decoration-1">{flag.original_text}</p>
                <p className="font-serif text-fg">
                  <span className="font-sans text-sm font-semibold text-teacher-700">{t("teacher.flags.correctionLabel")} </span>
                  {flag.correction}
                </p>
                <Link
                  href={href}
                  className="inline-flex min-h-11 w-fit items-center gap-1 rounded-lg px-2 text-sm font-semibold text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <span>{t("teacher.flags.goToMessage")}</span>
                  <Icon name="chevron-right" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
