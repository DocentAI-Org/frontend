import type { Metadata, Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Icon } from "@/components/Icon";
import { DoneAlert } from "@/components/DoneAlert";
import { EmptyState } from "@/components/EmptyState";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { NoTopics } from "@/components/NoTopics";
import { ErrorState } from "@/components/ErrorState";
import type { Schemas } from "@/lib/api/client";
import { type QuestionStatus, listQuestions } from "@/lib/api/quizzes";
import { listTopics } from "@/lib/api/topics";
import { apiQuery, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

import { QuestionCard } from "./QuestionCard";
import { RequestQuestions } from "./RequestQuestions";
import { TopicFilter } from "./TopicFilter";

const STATUSES: QuestionStatus[] = ["pending", "approved", "rejected"];
const DONE = {
  approved: "teacher.questions.approvedToast",
  rejected: "teacher.questions.rejectedToast",
  saved: "teacher.questions.savedToast"
};

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const query = search as { status?: string; topic?: string; done?: string };
  // No sort here: the status tabs split the list and each keeps the newest first (spec 016).
  const list = listState(search, ["default"] as const);
  const status: QuestionStatus = STATUSES.includes(query.status as QuestionStatus) ? (query.status as QuestionStatus) : "pending";
  const topicFilter = query.topic ?? "";
  const t = await getTranslations();
  const [topics, questions] = await Promise.all([
    listTopics(id),
    listQuestions(id, status, topicFilter || undefined, apiQuery(list, ["default"] as const), list.shown)
  ]);
  if (!topics.ok) return <ErrorState code={topics.code} />;
  if (!questions.ok) return <ErrorState code={questions.code} />;

  const kept = { ...(topicFilter ? { topic: topicFilter } : {}), ...(list.q ? { q: list.q } : {}) };
  const view = new URLSearchParams({ status, ...kept }).toString();
  const hrefFor = (s: QuestionStatus) => routes.teacherQuestions(id, `?${new URLSearchParams({ status: s, ...kept }).toString()}`);
  const counts = questions.data.counts;
  const total = counts.pending + counts.approved + counts.rejected;
  const topicList = topics.data.map((x) => ({ id: x.id, name: x.name }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-fg">{t("teacher.questions.title")}</h2>
        <p className="max-w-3xl text-fg-muted">{t("teacher.questions.lead")}</p>
      </div>

      <DoneAlert done={query.done ?? ""} messages={DONE} />

      {topicList.length === 0 ? (
        <NoTopics courseId={id} />
      ) : (
        <>
          <RequestQuestions courseId={id} topics={topicList} />
          {total === 0 && !topicFilter && !list.q ? (
            <EmptyState icon="lightbulb" title={t("teacher.questions.noneTitle")} body={t("teacher.questions.noneBody")} />
          ) : (
            <>
              <ListToolbar searchLabel={t("teacher.questions.search")} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <StatusTabs status={status} counts={counts} hrefFor={hrefFor} />
                <TopicFilter courseId={id} status={status} topic={topicFilter} topics={topicList} />
              </div>
              <Questions courseId={id} status={status} questions={questions.data} view={view} q={list.q} shown={list.shown} search={search} />
            </>
          )}
        </>
      )}
    </div>
  );
}

/** One tab per review status, each with how many questions it holds. */
async function StatusTabs({
  status,
  counts,
  hrefFor
}: {
  status: QuestionStatus;
  counts: Schemas["QuestionPage"]["counts"];
  hrefFor: (s: QuestionStatus) => Route;
}) {
  const t = await getTranslations("teacher.questions");
  return (
    <nav aria-label={t("tabsLabel")} className="overflow-x-auto border-b border-border">
      <ul className="flex gap-1">
        {STATUSES.map((s) => (
          <li key={s}>
            <Link
              href={hrefFor(s)}
              aria-current={s === status ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${s === status ? "border-neutral-900 text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
            >
              {t(s)}{" "}
              <span className="rounded-full bg-surface-sunken px-2 text-xs tabular-nums">{counts[s]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The questions of the selected tab, or why there are none. */
async function Questions({
  courseId,
  status,
  questions,
  view,
  q,
  shown,
  search
}: {
  courseId: string;
  status: QuestionStatus;
  questions: Schemas["QuestionPage"];
  view: string;
  q: string;
  shown: number;
  search: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations("teacher.questions");
  if (questions.items.length === 0 && q) return <NoMatches q={q} />;
  if (questions.items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-center text-fg-muted">
        {status === "pending" ? t("emptyTitle") : t(status === "approved" ? "emptyApproved" : "emptyRejected")}
      </p>
    );
  }
  return (
    <>
      {status === "pending" && (
        // AI drafts often mark a wrong option or leave two right ones (end-to-end review).
        <p
          role="note"
          className="flex items-start gap-2 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3 text-sm text-fg"
          data-component="AnswerKeyReminder"
        >
          <Icon name="triangle-alert" className="mt-0.5 size-4 shrink-0 text-warning-900" />
          <span>{t("checkAnswerKey")}</span>
        </p>
      )}
      <ul aria-label={t("listLabel", { status: t(status) })} className="flex flex-col gap-4">
        {questions.items.map((question) => (
          <li key={question.id}>
            <QuestionCard courseId={courseId} question={question} view={view} />
          </li>
        ))}
      </ul>
      <ListFooter path={routes.teacherQuestions(courseId)} params={search} shown={shown} total={questions.total} />
    </>
  );
}
