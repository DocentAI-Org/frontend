import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { LinkButton } from "@/components/Button";
import { CitationNotes } from "@/components/CitationNotes";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { errorTypeLabel } from "@/components/LearningRecord";
import { PageHeader } from "@/components/PageHeader";
import { MathText } from "@/components/MathText";
import { getErrorTypes, getSubmission } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

import { RepeatedMistakeNotice } from "./RepeatedMistakeNotice";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.feedback");
  return { title: t("pageTitle") };
}

const VERDICT_STYLE = {
  correct: "border-success-300 bg-success-50 text-success-800",
  partially_correct: "border-warning-300 bg-warning-50 text-warning-900",
  incorrect: "border-danger-200 bg-danger-50 text-danger-700",
  not_assessed: "border-border-strong bg-surface text-fg"
} as const;

/** Exercise feedback (#12, 001 US6 AS3, AS4, AS7; real feedback since spec 005). */
export default async function FeedbackPage({ params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const { id, submissionId } = await params;
  const t = await getTranslations();
  const format = await getFormatter();
  const locale = await getLocale();
  const [submission, taxonomy] = await Promise.all([getSubmission(id, submissionId), getErrorTypes()]);
  if (!submission.ok) {
    return submission.status === 404 ? <AccessDenied reason="not-found" home="/student/courses" /> : <ErrorState code={submission.code} />;
  }
  const s = submission.data;
  const types = taxonomy.ok ? taxonomy.data : null;
  const repeated = s.repeated_mistake;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("student.feedback.title")} back={{ href: "/student/courses", label: t("student.feedback.backToCourses") }} />
      {repeated && (
        <RepeatedMistakeNotice
          courseId={id}
          submissionId={s.id}
          count={repeated.count}
          days={repeated.window_days}
          pattern={[errorTypeLabel(types, repeated.error_type, locale), repeated.topic_name].filter(Boolean).join(" · ")}
          errorType={repeated.error_type}
          topic={repeated.topic_name}
        />
      )}
      <section aria-labelledby="exercise-title" className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-6">
        <h2 id="exercise-title" className="text-sm font-semibold text-fg-muted">
          {t("student.exercise.problem")}
        </h2>
        <p className="font-serif text-lg text-fg"><MathText text={s.problem_statement} /></p>
        <h3 className="mt-2 text-sm font-semibold text-fg-muted">{t("student.feedback.stepsTitle")}</h3>
        <p className="font-mono whitespace-pre-line text-fg">{s.worked_answer}</p>
      </section>

      <div className="grid gap-x-6 gap-y-4 lg:grid-cols-12">
        <section aria-labelledby="result-title" className="flex flex-col gap-4 lg:col-span-9">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="result-title" className="text-sm font-semibold text-fg-muted">
              {t("student.feedback.verdictLabel")}
            </h2>
            <span className={`rounded-sm border px-2 py-0.5 text-sm font-semibold ${VERDICT_STYLE[s.verdict]}`}>
              {t(`student.feedback.verdict.${s.verdict}`)}
            </span>
          </div>
          <dl className="flex flex-col gap-1 text-fg">
            {s.mistake_location && (
              <div className="flex flex-wrap gap-1">
                <dt className="text-fg-muted">{t("student.feedback.mistakeLabel")}</dt>
                <dd className="font-semibold"><MathText text={s.mistake_location} /></dd>
              </div>
            )}
            {s.error_type && (
              <div className="flex flex-wrap gap-1">
                <dt className="text-fg-muted">{t("common.record.errorTypeLabel")}</dt>
                <dd className="font-semibold">{errorTypeLabel(types, s.error_type, locale)}</dd>
              </div>
            )}
            {s.topic_name && (
              <div className="flex flex-wrap gap-1">
                <dt className="text-fg-muted">{t("common.record.topicLabel")}</dt>
                <dd className="font-semibold">{s.topic_name}</dd>
              </div>
            )}
          </dl>
          {s.saved_to_record && (
            <Link
              href={routes.studentProgress(id)}
              className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-success-800 underline decoration-success-300 underline-offset-2 hover:decoration-success-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Icon name="check" />
              <span>{t("common.record.saved")}</span>
            </Link>
          )}
          {s.explanation_kind === "no_source" ? (
            <div className="flex gap-4 rounded-lg border border-info-200 bg-info-50 px-4 py-4" data-component="NoSourceNotice">
              <Icon name="info" className="mt-1 size-6 shrink-0 text-info-700" />
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-fg">{t("student.chat.noSource.heading")}</h3>
                <p className="font-serif text-fg">{t("student.feedback.noSourceBody")}</p>
                <p className="text-fg-muted">{t("student.chat.noSource.teacherTip")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-fg">{t("student.feedback.explanationTitle")}</h3>
              <p className={`font-serif text-lg ${s.correction ? "text-fg-muted line-through decoration-teacher-600 decoration-1" : "text-fg"}`}>
                <MathText text={s.explanation} />
              </p>
            </div>
          )}
        </section>
        <aside className="flex flex-col gap-2 lg:col-span-3" aria-label={t("student.chat.sources")}>
          {s.correction && (
            <div className="flex flex-col gap-1 border-l-2 border-margin bg-surface pl-4" data-component="TeacherCorrection" data-variant="student">
              <p className="flex items-center gap-2 text-sm font-semibold text-teacher-700">
                <Icon name="graduation-cap" />
                <span>{t("common.correction.reviewed")}</span>
              </p>
              <p className="text-xs text-fg-muted tabular-nums">
                {t("common.correction.date", { date: format.dateTime(new Date(s.correction.reviewed_at), { dateStyle: "long" }) })}
              </p>
              <p className="mt-1 font-serif text-fg"><MathText text={s.correction.text} /></p>
            </div>
          )}
          <CitationNotes citations={s.citations} />
        </aside>
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href={routes.studentExercise(id)} icon="plus">
          {t("student.feedback.sendAnother")}
        </LinkButton>
        <LinkButton href={routes.studentCourse(id)} variant="secondary" icon="message-circle">
          {t("student.feedback.askTutor")}
        </LinkButton>
      </div>
    </div>
  );
}
