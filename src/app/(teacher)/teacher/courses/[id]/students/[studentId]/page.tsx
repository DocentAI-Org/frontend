import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LearningRecord } from "@/components/LearningRecord";
import { PageHeader } from "@/components/PageHeader";
import { listCourseStudents } from "@/lib/api/courses";
import { getErrorTypes, getStudentLearningRecord } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.student");
  return { title: t("pageTitle") };
}

/** A student's learning record (#28, spec 005 US3): their mistakes; activity and risk are P2. */
export default async function StudentRecordPage({ params }: { params: Promise<{ id: string; studentId: string }> }) {
  const { id, studentId } = await params;
  const t = await getTranslations("teacher.student");
  const [students, record, taxonomy] = await Promise.all([
    listCourseStudents(id),
    getStudentLearningRecord(id, studentId),
    getErrorTypes()
  ]);
  if (!students.ok) return <ErrorState code={students.code} />;
  const student = students.data.items.find((s) => s.student_id === studentId);
  if (!student) return <AccessDenied reason="not-found" home={routes.teacherCourse(id)} />;
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={student.display_name}
        lead={t("mistakesLead")}
        back={{ href: routes.teacherCourse(id), label: t("backToCourse") }}
      />
      {!record.ok ? (
        <ErrorState code={record.code} />
      ) : record.data.length === 0 ? (
        <EmptyState
          icon="chart-column"
          title={t("noMistakesTitle", { name: student.display_name })}
          body={t("noMistakesBody")}
        />
      ) : (
        <LearningRecord
          entries={record.data}
          taxonomy={taxonomy.ok ? taxonomy.data : null}
          exampleHref={(submissionId) => routes.teacherSubmission(id, submissionId)}
        />
      )}
    </div>
  );
}
