import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import type { Schemas } from "@/lib/api/client";
import { type TestPhase, getCourseTest, getTestResults } from "@/lib/api/course-tests";
import { errorMessageKey } from "@/lib/api/errors";
import { listQuestions } from "@/lib/api/quizzes";
import { listTopics } from "@/lib/api/topics";
import { routes } from "@/lib/routes";

import { CopyQuestion } from "./CopyQuestion";
import { TestQuestionForm } from "./TestQuestionForm";
import { TestQuestionItem } from "./TestQuestionItem";
import { phaseAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.test");
  return { title: t("pageTitle") };
}

const DONE = { added: "added", saved: "saved", deleted: "deleted" } as const;
const TH = "pb-2 pr-4 text-left text-sm font-semibold text-fg-muted";
const TD = "py-2 pr-4 text-fg tabular-nums";

/** The course's pre/post-test (P3; spec 010 US1, US2, US4). */
export default async function TestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string }> }) {
  const { id } = await params;
  const { done = "" } = await searchParams;
  const t = await getTranslations();
  const [test, topics, results, bank] = await Promise.all([getCourseTest(id), listTopics(id), getTestResults(id), listQuestions(id, "approved")]);
  if (!test.ok) return <ErrorState code={test.code} />;
  if (!topics.ok) return <ErrorState code={topics.code} />;
  const topicList = topics.data.map((x) => ({ id: x.id, name: x.name }));
  const { locked, questions, phases } = test.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-fg">{t("teacher.test.title")}</h2>
        <p className="max-w-3xl text-fg-muted">{t("teacher.test.lead")}</p>
      </div>
      {done in DONE && <Alert tone="success">{t(`teacher.test.${DONE[done as keyof typeof DONE]}`)}</Alert>}
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
          <div className="grid gap-4 md:grid-cols-2">
            {phases.map((phase) => (
              <PhaseCard key={phase.phase} courseId={id} phase={phase} hasQuestions={questions.length > 0} />
            ))}
          </div>

          <section aria-labelledby="questions-title" className="flex flex-col gap-4">
            <h3 id="questions-title" className="text-xl font-semibold text-fg">
              {t("teacher.test.questionsTitle", { count: questions.length })}
            </h3>
            {locked && <Alert tone="info">{t("teacher.test.locked")}</Alert>}
            {questions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-strong px-6 py-6 text-fg-muted">{t("teacher.test.noQuestions")}</p>
            ) : (
              <ol aria-label={t("teacher.test.questionsLabel")} className="flex flex-col gap-4">
                {questions.map((question) => (
                  <TestQuestionItem key={question.id} courseId={id} question={question} topics={topicList} locked={locked} />
                ))}
              </ol>
            )}
            {!locked && (
              <div className="grid gap-4 lg:grid-cols-2">
                <section aria-labelledby="add-title" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
                  <h4 id="add-title" className="text-lg font-semibold text-fg">
                    {t("teacher.test.addTitle")}
                  </h4>
                  <TestQuestionForm courseId={id} topics={topicList} />
                </section>
                {bank.ok && bank.data.items.length > 0 && (
                  <CopyQuestion courseId={id} questions={bank.data.items.map((q) => ({ id: q.id, statement: q.statement }))} />
                )}
              </div>
            )}
          </section>

          <Results results={results.ok ? results.data : null} code={results.ok ? null : results.code} />
        </>
      )}
    </div>
  );
}

async function PhaseCard({ courseId, phase, hasQuestions }: { courseId: string; phase: Schemas["TestPhaseView"]; hasQuestions: boolean }) {
  const t = await getTranslations("teacher.test");
  const tc = await getTranslations("common.actions");
  const format = await getFormatter();
  const date = (iso: string | null) => (iso ? format.dateTime(new Date(iso), { dateStyle: "long" }) : "");
  const name = t(`phase.${phase.phase as TestPhase}`);
  const lower = t(`phaseLower.${phase.phase as TestPhase}`);
  const status =
    phase.status === "open"
      ? t("status.open", { date: date(phase.opened_at) })
      : phase.status === "closed"
        ? t("status.closed", { date: date(phase.closed_at) })
        : t("status.not_open");
  const fields = { course_id: courseId, phase: phase.phase };
  const titleId = `phase-${phase.phase}`;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
      <div className="flex flex-col gap-1">
        <h3 id={titleId} className="text-lg font-semibold text-fg">
          {name}
        </h3>
        <p className="font-medium text-fg">{status}</p>
        <p className="text-sm text-fg-muted tabular-nums">{t("submitted", { count: phase.submitted_count })}</p>
      </div>
      {!hasQuestions ? (
        <p className="text-sm text-fg-muted">{t("needQuestions")}</p>
      ) : phase.status === "open" ? (
        <form action={phaseAction}>
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="phase" value={phase.phase} />
          <input type="hidden" name="status" value="closed" />
          <Button type="submit" variant="secondary" icon="lock">
            {t("close", { phase: lower })}
          </Button>
        </form>
      ) : phase.phase === "pre" && phase.status === "not_open" ? (
        // Opening the pre-test freezes the questions: confirm first (010 US2 AS1).
        <div>
          <ConfirmDialog
            trigger={t("open", { phase: lower })}
            triggerIcon="check"
            title={t("openTitle")}
            body={t("openBody")}
            confirmLabel={t("openConfirm")}
            cancelLabel={tc("cancel")}
            action={phaseAction}
            fields={{ ...fields, status: "open" }}
          />
        </div>
      ) : (
        <form action={phaseAction}>
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="phase" value={phase.phase} />
          <input type="hidden" name="status" value="open" />
          <Button type="submit" icon="check">
            {phase.status === "closed" ? t("reopen", { phase: lower }) : t("open", { phase: lower })}
          </Button>
        </form>
      )}
    </section>
  );
}

async function Results({ results, code }: { results: Schemas["TestResults"] | null; code: string | null }) {
  const t = await getTranslations("teacher.test");
  const format = await getFormatter();
  if (!results) return <ErrorState code={code ?? "unknown"} />;
  const percent = (value: number) => format.number(value, { style: "percent", maximumFractionDigits: 0 });
  const score = (s: Schemas["PhaseScore"] | null) => (s ? t("score", { right: s.right, total: s.total, percent: percent(s.right / s.total) }) : t("notDone"));
  const averages = Object.fromEntries(results.averages.map((a) => [a.phase, a]));
  const topicNames = [...new Set(results.averages.flatMap((a) => a.by_topic.map((x) => x.topic_name)))];
  const topicScore = (phase: string, topic: string) => {
    const value = averages[phase]?.by_topic.find((x) => x.topic_name === topic)?.score;
    return value === undefined ? t("notDone") : percent(value);
  };
  const anyone = results.students.some((s) => s.pre || s.post);

  return (
    <section aria-labelledby="results-title" className="flex flex-col gap-4">
      <h3 id="results-title" className="text-xl font-semibold text-fg">
        {t("resultsTitle")}
      </h3>
      {!anyone ? (
        <p className="text-fg-muted">{t("noResults")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-4" tabIndex={0} role="region" aria-labelledby="students-results">
            <table aria-labelledby="students-results" className="w-full border-collapse text-sm">
              <caption id="students-results" className="pb-2 text-left font-semibold text-fg">
                {t("studentsLabel")}
              </caption>
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th scope="col" className={TH}>{t("colStudent")}</th>
                  <th scope="col" className={TH}>{t("phase.pre")}</th>
                  <th scope="col" className={TH}>{t("phase.post")}</th>
                </tr>
              </thead>
              <tbody>
                {results.students.map((s) => (
                  <tr key={s.student_id} className="border-b border-border last:border-b-0">
                    <th scope="row" className="py-2 pr-4 text-left font-normal text-fg">{s.display_name}</th>
                    <td className={TD}>{score(s.pre)}</td>
                    <td className={TD}>{score(s.post)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-4" tabIndex={0} role="region" aria-labelledby="topics-results">
            <table aria-labelledby="topics-results" className="w-full border-collapse text-sm">
              <caption id="topics-results" className="pb-2 text-left font-semibold text-fg">
                {t("topicsLabel")}
              </caption>
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th scope="col" className={TH}>{t("colTopic")}</th>
                  <th scope="col" className={TH}>{t("phase.pre")}</th>
                  <th scope="col" className={TH}>{t("phase.post")}</th>
                </tr>
              </thead>
              <tbody>
                {topicNames.map((topic) => (
                  <tr key={topic} className="border-b border-border last:border-b-0">
                    <th scope="row" className="py-2 pr-4 text-left font-normal text-fg">{topic}</th>
                    <td className={TD}>{topicScore("pre", topic)}</td>
                    <td className={TD}>{topicScore("post", topic)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
