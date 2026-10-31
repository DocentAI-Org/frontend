import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LinkButton } from "@/components/Button";
import { LearningRecord } from "@/components/LearningRecord";
import { TopicProgressList } from "@/components/TopicProgress";
import { PageHeader } from "@/components/PageHeader";
import { getStudentCourse } from "@/lib/api/courses";
import { getErrorTypes, getLearningRecord } from "@/lib/api/exercises";
import { getProgress } from "@/lib/api/progress";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.progress");
  return { title: t("pageTitle") };
}

/** My progress (#13, 001 US13; 009 US1): mastery by topic, then the mistakes of the learning record (spec 005). */
export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("student.progress");
  const [course, record, taxonomy, progress] = await Promise.all([getStudentCourse(id), getLearningRecord(id), getErrorTypes(), getProgress(id)]);
  const tc = await getTranslations("common.progress");
  const format = await getFormatter();
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  const active = progress.ok && (progress.data.updated_at !== null || progress.data.unassigned !== null);
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} back={{ href: routes.studentCourse(id), label: course.data.name }} />
      {!progress.ok ? (
        <ErrorState code={progress.code} />
      ) : !active ? (
        <EmptyState
          icon="chart-column"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <LinkButton href={routes.studentCourse(id)} icon="message-circle">
                {t("ask")}
              </LinkButton>
              <LinkButton href={routes.studentQuizStart(id)} variant="secondary" icon="lightbulb">
                {t("quiz")}
              </LinkButton>
            </div>
          }
        />
      ) : (
        <>
          <p className="text-sm text-fg-muted tabular-nums">
            {progress.data.updated_at && t("updated", { date: format.dateTime(new Date(progress.data.updated_at), { dateStyle: "long" }) })}
            {progress.data.updated_at && " · "}
            {t("quizzes", { count: progress.data.quizzes_completed })}
          </p>
          <TopicProgressList
            progress={progress.data}
            taxonomy={taxonomy.ok ? taxonomy.data : null}
            audience="student"
            exampleHref={(submissionId) => routes.studentSubmission(id, submissionId)}
          />
        </>
      )}
      {record.ok && active && (
        <section aria-labelledby="mistakes-title" className="flex flex-col gap-4">
          <div>
            <h2 id="mistakes-title" className="text-xl font-semibold text-fg">
              {tc("allMistakes")}
            </h2>
            <p className="text-fg-muted">{t("mistakesLead")}</p>
          </div>
          {record.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-strong px-6 py-6 text-fg-muted">
              <span className="block font-semibold text-fg">{t("noMistakesTitle")}</span>
              {t("noMistakesBody")}
            </p>
          ) : (
            <LearningRecord
              entries={record.data}
              taxonomy={taxonomy.ok ? taxonomy.data : null}
              exampleHref={(submissionId) => routes.studentSubmission(id, submissionId)}
            />
          )}
        </section>
      )}
      {!record.ok && <ErrorState code={record.code} />}
    </div>
  );
}
