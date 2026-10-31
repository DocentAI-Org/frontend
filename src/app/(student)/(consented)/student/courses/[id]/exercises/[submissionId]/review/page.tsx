import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/AccessDenied";
import { LinkButton } from "@/components/Button";
import { CitationNotes } from "@/components/CitationNotes";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { errorTypeLabel } from "@/components/LearningRecord";
import { PageHeader } from "@/components/PageHeader";
import { MathText } from "@/components/MathText";
import { getErrorTypes, getReview, getSubmission } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.errorPatterns");
  return { title: t("pageTitle") };
}

/** Review of a repeated mistake (#F15 practice.html, 001 US12 AS2; spec 007 US2). */
export default async function ReviewPage({ params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const { id, submissionId } = await params;
  const t = await getTranslations();
  const locale = await getLocale();
  const [review, submission, taxonomy] = await Promise.all([getReview(id, submissionId), getSubmission(id, submissionId), getErrorTypes()]);
  // Not created yet: the feedback page offers it.
  if (!review.ok && review.status === 404 && submission.ok) redirect(routes.studentSubmission(id, submissionId));
  if (!submission.ok) {
    return submission.status === 404 ? <AccessDenied reason="not-found" home="/student/courses" /> : <ErrorState code={submission.code} />;
  }
  if (!review.ok) return <ErrorState code={review.code} />;
  const r = review.data;
  const repeated = submission.data.repeated_mistake;
  const pattern = [errorTypeLabel(taxonomy.ok ? taxonomy.data : null, r.error_type, locale), r.topic_name].filter(Boolean).join(" · ");
  const back = { href: routes.studentSubmission(id, submissionId), label: t("student.errorPatterns.back") };

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={t("student.errorPatterns.pageTitle")}
        back={back}
        lead={
          <>
            <span className="block font-semibold text-fg">{pattern}</span>
            {repeated && (
              <span className="block tabular-nums">
                {t("student.errorPatterns.timesIn", { count: repeated.count, days: repeated.window_days })}
              </span>
            )}
          </>
        }
      />

      {r.kind === "no_source" ? (
        <div className="flex gap-4 rounded-lg border border-info-200 bg-info-50 px-4 py-4" data-component="NoSourceNotice">
          <Icon name="info" className="mt-1 size-6 shrink-0 text-info-700" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-fg">{t("student.chat.noSource.heading")}</h2>
              <p className="font-serif text-fg">{t("student.errorPatterns.noSourceBody")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton href={routes.studentCourse(id)} icon="message-circle">
                {t("student.feedback.askTutor")}
              </LinkButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-9">
            <section aria-labelledby="what-title" className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-6">
              <div className="flex items-center gap-2">
                <h2 id="what-title" className="text-lg font-semibold text-fg">
                  {t("student.errorPatterns.whatTitle")}
                </h2>
                <abbr title={t("student.chat.aiTagLabel")} className="rounded-sm border border-info-300 px-1 text-xs font-bold text-info-800 no-underline">
                  {t("student.chat.aiTag")}
                </abbr>
              </div>
              <p className="font-serif text-lg text-fg"><MathText text={r.explanation} /></p>
            </section>
            {r.worked_example && (
              <section aria-labelledby="example-title" className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-6">
                <h2 id="example-title" className="text-lg font-semibold text-fg">
                  {t("student.errorPatterns.exampleTitle")}
                </h2>
                <p className="font-mono whitespace-pre-line text-fg">{r.worked_example}</p>
              </section>
            )}
            {r.practice.length > 0 && (
              <section id="practice" aria-labelledby="practice-title" className="flex scroll-mt-6 flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
                <div>
                  <h2 id="practice-title" className="text-lg font-semibold text-fg">
                    {t("student.errorPatterns.practiceTitle")}
                  </h2>
                  <p className="text-fg-muted">{t("student.errorPatterns.practiceLead")}</p>
                </div>
                <ol className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {r.practice.map((statement, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                      <p className="min-w-0 font-serif text-fg">{statement}</p>
                      <LinkButton
                        href={`${routes.studentExercise(id)}?problem=${encodeURIComponent(statement)}`}
                        variant="secondary"
                        icon="send"
                        aria-label={`${t("student.errorPatterns.solve")}: ${statement}`}
                      >
                        {t("student.errorPatterns.solve")}
                      </LinkButton>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
          <aside className="flex flex-col gap-2 lg:col-span-3" aria-label={t("student.chat.sources")}>
            <CitationNotes citations={r.citations} />
          </aside>
        </div>
      )}
    </div>
  );
}
