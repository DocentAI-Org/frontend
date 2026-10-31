import type { Route } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";
import { errorTypeLabel } from "./LearningRecord";

type Progress = Schemas["Progress"];
type Topic = Schemas["TopicProgress"];
type Taxonomy = Schemas["ErrorTaxonomy"];

const LEVEL_KEY = { starting: "start", progressing: "progress", mastered: "mastered" } as const;
const BARS = { starting: 1, progressing: 2, mastered: 3 } as const;

/**
 * Mastery by topic (#13 progress.html ProgressByTopic, 009 US1–US2): the level in words and bars,
 * its basis, why (provisional criteria, backend 007), 8 weeks of history and frequent mistakes.
 * The teacher sees exactly the same data, worded for them.
 */
export async function TopicProgressList({
  progress,
  taxonomy,
  audience,
  exampleHref,
  headingLevel = 2
}: {
  progress: Progress;
  taxonomy: Taxonomy | null;
  audience: "student" | "teacher";
  exampleHref: (submissionId: string) => Route;
  headingLevel?: 2 | 3;
}) {
  const t = await getTranslations();
  const items = progress.unassigned ? [...progress.topics, progress.unassigned] : progress.topics;
  return (
    <ul aria-label={t("student.progress.listLabel")} className="flex flex-col gap-4">
      {items.map((topic) => (
        <TopicCard
          key={topic.topic_id ?? "none"}
          topic={topic}
          criteria={progress.criteria}
          taxonomy={taxonomy}
          audience={audience}
          exampleHref={exampleHref}
          headingLevel={headingLevel}
        />
      ))}
    </ul>
  );
}

async function TopicCard({
  topic,
  criteria,
  taxonomy,
  audience,
  exampleHref,
  headingLevel
}: {
  topic: Topic;
  criteria: Progress["criteria"];
  taxonomy: Taxonomy | null;
  audience: "student" | "teacher";
  exampleHref: (submissionId: string) => Route;
  headingLevel: 2 | 3;
}) {
  const t = await getTranslations();
  const format = await getFormatter();
  const locale = await getLocale();
  const Heading = `h${headingLevel}` as const;
  const name = topic.topic_name ?? t("common.record.noTopic");
  const percent = (value: number) => format.number(value, { style: "percent", maximumFractionDigits: 0 });
  const levelWord = (level: keyof typeof LEVEL_KEY) => t(`common.record.level.${LEVEL_KEY[level]}`);
  const b = topic.basis;
  const counted = b.exercises_total + b.quiz_total;
  const scored = topic.level in LEVEL_KEY;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6" data-component="ProgressByTopic">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading className="font-serif text-xl font-semibold text-fg">{name}</Heading>
        {scored && (
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-fg" data-component="MasteryLevel" data-variant={topic.level}>
            <span className="inline-flex items-end gap-1" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={`w-1.5 rounded-full ${["h-2", "h-3", "h-4"][bar - 1]} ${bar <= BARS[topic.level as keyof typeof BARS] ? "bg-primary-600" : "bg-neutral-300"}`}
                />
              ))}
            </span>
            {t("common.progress.level", { level: levelWord(topic.level as keyof typeof LEVEL_KEY) })}
          </p>
        )}
      </div>

      {topic.level === "not_started" ? (
        <p className="text-fg-muted">{audience === "student" ? t("student.progress.notStarted") : t("teacher.student.notStarted")}</p>
      ) : (
        <>
          <p className="text-fg tabular-nums">
            {[
              b.exercises_total > 0 &&
                [
                  t("common.progress.basisExercises", { right: b.exercises_correct, total: b.exercises_total }),
                  b.exercises_partial > 0 && t("common.progress.basisPartial", { count: b.exercises_partial })
                ]
                  .filter(Boolean)
                  .join(" "),
              b.quiz_total > 0 && t("common.progress.basisQuiz", { right: b.quiz_right, total: b.quiz_total })
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {topic.level === "insufficient" ? (
            <p className="text-fg-muted">
              {t(audience === "student" ? "common.progress.insufficientStudent" : "common.progress.insufficientTeacher", { count: criteria.min_items })}
            </p>
          ) : (
            topic.score !== null && (
              <details className="group" data-component="DecisionReason" data-variant="disclosure">
                <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg text-sm font-semibold text-fg underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  <Icon name="circle-help" />
                  {t("common.progress.why")}
                </summary>
                <div className="mt-2 flex flex-col gap-1 rounded-lg bg-surface-sunken p-4 text-fg">
                  <p>
                    {t(audience === "student" ? "common.progress.whyStudent" : "common.progress.whyTeacher", {
                      score: percent(topic.score),
                      count: counted
                    })}
                  </p>
                  <p className="text-sm text-fg-muted">
                    {t("common.progress.criteria", {
                      progressing: levelWord("progressing"),
                      progressingAt: percent(criteria.progressing),
                      mastered: levelWord("mastered"),
                      masteredAt: percent(criteria.mastered),
                      window: criteria.window
                    })}
                  </p>
                </div>
              </details>
            )
          )}

          <ol aria-label={t("common.progress.historyLabel")} className="flex h-16 items-end gap-1" data-component="ProgressTimeline">
            {topic.history.map((week) => {
              const date = format.dateTime(new Date(`${week.week_start}T00:00:00Z`), { day: "numeric", month: "short", timeZone: "UTC" });
              const value = week.score === null ? t("common.progress.noData") : percent(week.score);
              return (
                <li key={week.week_start} className="flex h-full flex-1 flex-col justify-end">
                  <span className="sr-only">{t("common.progress.week", { date, value })}</span>
                  <span
                    aria-hidden="true"
                    title={t("common.progress.week", { date, value })}
                    className={`block w-full rounded-t-sm ${week.score === null ? "h-1 bg-neutral-200" : "bg-primary-600"}`}
                    style={week.score === null ? undefined : { height: `${Math.max(week.score * 100, 6)}%` }}
                  />
                </li>
              );
            })}
          </ol>

          {topic.top_errors.length > 0 && (
            <ul aria-label={t("common.progress.errorsLabel")} className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {topic.top_errors.map((error) => (
                <li key={error.error_type} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                  <span className="text-fg">
                    {errorTypeLabel(taxonomy, error.error_type, locale)} · <span className="tabular-nums">{t("common.record.times", { count: error.count })}</span>
                  </span>
                  <Link
                    href={exampleHref(error.latest_submission_id)}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-fg underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {t("common.record.seeExample")}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {topic.last_activity_at && (
            <p className="text-sm text-fg-muted">
              {t("common.progress.lastActivity", { date: format.dateTime(new Date(topic.last_activity_at), { dateStyle: "medium" }) })}
            </p>
          )}
        </>
      )}
    </li>
  );
}
