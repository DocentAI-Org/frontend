import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LearningRecord } from "@/components/LearningRecord";
import { PageHeader } from "@/components/PageHeader";
import { getStudentCourse } from "@/lib/api/courses";
import { getErrorTypes, getLearningRecord } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.progress");
  return { title: t("pageTitle") };
}

/** My progress (#13, spec 005 US2): the mistakes of the learning record; mastery is P2. */
export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("student.progress");
  const [course, record, taxonomy] = await Promise.all([getStudentCourse(id), getLearningRecord(id), getErrorTypes()]);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("mistakesLead")} back={{ href: routes.studentCourse(id), label: course.data.name }} />
      {!record.ok ? (
        <ErrorState code={record.code} />
      ) : record.data.length === 0 ? (
        <EmptyState icon="chart-column" title={t("noMistakesTitle")} body={t("noMistakesBody")} />
      ) : (
        <LearningRecord
          entries={record.data}
          taxonomy={taxonomy.ok ? taxonomy.data : null}
          exampleHref={(submissionId) => routes.studentSubmission(id, submissionId)}
        />
      )}
    </div>
  );
}
