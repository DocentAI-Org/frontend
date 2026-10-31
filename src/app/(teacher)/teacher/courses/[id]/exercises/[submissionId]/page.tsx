import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { Alert } from "@/components/Alert";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { errorTypeLabel } from "@/components/LearningRecord";
import type { Schemas } from "@/lib/api/client";
import { getErrorTypes } from "@/lib/api/exercises";
import { getCourseSubmission, getCourseSubmissionReview } from "@/lib/api/review";
import { routes } from "@/lib/routes";

import { ReviewedAnswer } from "../../conversations/ReviewedAnswer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.feedback");
  return { title: t("pageTitle") };
}

/** The repeated-mistake basis and the review the student got (spec 007 US3; same basis as theirs). */
async function RepeatedMistake({
  repeated,
  review,
  pattern
}: {
  repeated: NonNullable<Schemas["TeacherSubmission"]["repeated_mistake"]>;
  review: Schemas["MistakeReview"] | null;
  pattern: { type: string; topic: string | null };
}) {
  const t = await getTranslations("student.errorPatterns");
  const values = { count: repeated.count, days: repeated.window_days, type: pattern.type, topic: pattern.topic ?? "" };
  return (
    <section aria-labelledby="review-title" className="flex flex-col gap-4 rounded-xl border border-warning-300 bg-warning-50 p-6">
      <p className="flex items-start gap-2 font-medium text-fg">
        <Icon name="lightbulb" className="mt-1 size-4 shrink-0 text-warning-800" />
        <span>{pattern.topic ? t("teacherBasis", values) : t("teacherBasisNoTopic", values)}</span>
      </p>
      <h3 id="review-title" className="font-semibold text-fg">
        {t("teacherReviewTitle")}
      </h3>
      {!review ? (
        <p className="text-fg-muted">{t("teacherNoReview")}</p>
      ) : review.kind === "no_source" ? (
        <p className="font-serif text-fg">{t("noSourceBody")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-fg-muted">{t("whatTitle")}</p>
            <p className="font-serif text-fg">{review.explanation}</p>
          </div>
          {review.worked_example && (
            <div>
              <p className="text-sm font-semibold text-fg-muted">{t("exampleTitle")}</p>
              <p className="font-mono whitespace-pre-line text-fg">{review.worked_example}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-fg-muted">{t("practiceTitle")}</p>
            <ol className="list-decimal pl-6 font-serif text-fg">
              {review.practice.map((statement, i) => (
                <li key={i}>{statement}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

/** Exercise feedback as the teacher reviews it (#24, feedback variant). */
export default async function SubmissionReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; submissionId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id, submissionId } = await params;
  const { saved } = await searchParams;
  const t = await getTranslations();
  const locale = await getLocale();
  const [submission, review, taxonomy] = await Promise.all([
    getCourseSubmission(id, submissionId),
    getCourseSubmissionReview(id, submissionId),
    getErrorTypes()
  ]);
  if (!submission.ok) {
    return submission.status === 404 ? <AccessDenied reason="not-found" home="/teacher/courses" /> : <ErrorState code={submission.code} />;
  }
  const s = submission.data;
  const repeated = s.repeated_mistake;
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
          {t("teacher.conversations.exercise")} · {s.student_name}
        </h2>
      </div>
      {saved && <Alert tone="success">{t("teacher.flags.saved")}</Alert>}
      {repeated && (
        <RepeatedMistake
          repeated={repeated}
          review={review.ok ? review.data : null}
          pattern={{ type: errorTypeLabel(taxonomy.ok ? taxonomy.data : null, repeated.error_type, locale), topic: repeated.topic_name }}
        />
      )}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-6">
        <h3 className="text-sm font-semibold text-fg-muted">{t("student.exercise.problem")}</h3>
        <p className="font-serif text-lg text-fg">{s.problem_statement}</p>
        <h3 className="mt-2 text-sm font-semibold text-fg-muted">{t("student.feedback.stepsTitle")}</h3>
        <p className="font-mono whitespace-pre-line text-fg">{s.worked_answer}</p>
      </section>
      <ReviewedAnswer
        courseId={id}
        target={{ kind: "submission", id: s.id }}
        path={routes.teacherSubmission(id, s.id)}
        text={s.explanation}
        kind={s.explanation_kind}
        citations={s.citations}
        flag={s.flag}
      />
    </div>
  );
}
