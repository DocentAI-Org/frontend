import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { errorMessageKey } from "@/lib/api/errors";
import { type QuestionStatus, listQuestions } from "@/lib/api/quizzes";
import { listTopics } from "@/lib/api/topics";
import { routes } from "@/lib/routes";

import { QuestionCard } from "./QuestionCard";
import { RequestQuestions } from "./RequestQuestions";
import { TopicFilter } from "./TopicFilter";

const STATUSES: QuestionStatus[] = ["pending", "approved", "rejected"];
const DONE = { approved: "approvedToast", rejected: "rejectedToast", saved: "savedToast" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.questions");
  return { title: t("pageTitle") };
}

/** Quiz questions drafted by the AI, reviewed by the teacher (#30 questions.html, 001 US10; 008 US1). */
export default async function QuestionsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; topic?: string; done?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const status: QuestionStatus = STATUSES.includes(query.status as QuestionStatus) ? (query.status as QuestionStatus) : "pending";
  const topicFilter = query.topic ?? "";
  const t = await getTranslations();
  const [topics, questions] = await Promise.all([listTopics(id), listQuestions(id, status, topicFilter || undefined)]);
  if (!topics.ok) return <ErrorState code={topics.code} />;
  if (!questions.ok) return <ErrorState code={questions.code} />;

  const view = new URLSearchParams({ status, ...(topicFilter ? { topic: topicFilter } : {}) }).toString();
  const hrefFor = (s: QuestionStatus) =>
    routes.teacherQuestions(id, `?${new URLSearchParams({ status: s, ...(topicFilter ? { topic: topicFilter } : {}) }).toString()}`);
  const counts = questions.data.counts;
  const total = counts.pending + counts.approved + counts.rejected;
  const topicList = topics.data.map((x) => ({ id: x.id, name: x.name }));
  const done = query.done ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-fg">{t("teacher.questions.title")}</h2>
        <p className="max-w-3xl text-fg-muted">{t("teacher.questions.lead")}</p>
      </div>

      {done in DONE && <Alert tone="success">{t(`teacher.questions.${DONE[done as keyof typeof DONE]}`)}</Alert>}
      {done.startsWith("error:") && <Alert tone="danger">{t(errorMessageKey(done.slice("error:".length)))}</Alert>}

      {topicList.length === 0 ? (
        <EmptyState
          icon="book-open"
          title={t("teacher.questions.noTopicsTitle")}
          body={t("teacher.questions.noTopicsBody")}
          action={
            <LinkButton href={routes.teacherTopics(id)} icon="chevron-right">
              {t("teacher.questions.goTopics")}
            </LinkButton>
          }
        />
      ) : (
        <>
          <RequestQuestions courseId={id} topics={topicList} />
          {total === 0 && !topicFilter ? (
            <EmptyState icon="lightbulb" title={t("teacher.questions.noneTitle")} body={t("teacher.questions.noneBody")} />
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <nav aria-label={t("teacher.questions.tabsLabel")} className="overflow-x-auto border-b border-border">
                  <ul className="flex gap-1">
                    {STATUSES.map((s) => (
                      <li key={s}>
                        <Link
                          href={hrefFor(s)}
                          aria-current={s === status ? "page" : undefined}
                          className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${s === status ? "border-neutral-900 text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
                        >
                          {t(`teacher.questions.${s}`)}{" "}
                          <span className="rounded-full bg-surface-sunken px-2 text-xs tabular-nums">{counts[s]}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <TopicFilter courseId={id} status={status} topic={topicFilter} topics={topicList} />
              </div>
              {questions.data.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-center text-fg-muted">
                  {status === "pending"
                    ? t("teacher.questions.emptyTitle")
                    : t(status === "approved" ? "teacher.questions.emptyApproved" : "teacher.questions.emptyRejected")}
                </p>
              ) : (
                <ul aria-label={t("teacher.questions.listLabel", { status: t(`teacher.questions.${status}`) })} className="flex flex-col gap-4">
                  {questions.data.items.map((question) => (
                    <li key={question.id}>
                      <QuestionCard courseId={id} question={question} view={view} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
