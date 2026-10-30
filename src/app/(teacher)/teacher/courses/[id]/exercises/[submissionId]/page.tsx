import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { Alert } from "@/components/Alert";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { getCourseSubmission } from "@/lib/api/review";
import { routes } from "@/lib/routes";

import { ReviewedAnswer } from "../../conversations/ReviewedAnswer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.feedback");
  return { title: t("pageTitle") };
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
  const submission = await getCourseSubmission(id, submissionId);
  if (!submission.ok) {
    return submission.status === 404 ? <AccessDenied reason="not-found" home="/teacher/courses" /> : <ErrorState code={submission.code} />;
  }
  const s = submission.data;
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
