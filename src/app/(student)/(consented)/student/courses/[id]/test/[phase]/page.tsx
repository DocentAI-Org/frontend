import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { Alert } from "@/components/Alert";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { type TestPhase, getStudentTest } from "@/lib/api/course-tests";
import { getStudentCourse } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

import { TestForm } from "./TestForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.test");
  return { title: t("pageTitle") };
}

/** Take the pre-test or the post-test, once (P3; spec 010 US3). */
export default async function StudentTestPage({ params }: { params: Promise<{ id: string; phase: string }> }) {
  const { id, phase: raw } = await params;
  if (raw !== "pre" && raw !== "post") notFound();
  const phase = raw as TestPhase;
  const t = await getTranslations("student.test");
  const tp = await getTranslations("teacher.test");
  const format = await getFormatter();
  const [course, test] = await Promise.all([getStudentCourse(id), getStudentTest(id, phase)]);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  const lower = tp(`phaseLower.${phase}`);
  const header = <PageHeader title={t(`title.${phase}`)} lead={t(`lead.${phase}`)} back={{ href: routes.studentCourse(id), label: course.data.name }} />;

  if (!test.ok) {
    return (
      <div className="flex max-w-3xl flex-col gap-6">
        {header}
        {test.code === "test_not_open" ? <Alert tone="info">{t("notOpen", { phase: lower })}</Alert> : <ErrorState code={test.code} />}
      </div>
    );
  }
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {header}
      {test.data.done ? (
        <Alert tone="success">
          {t("done", { phase: lower, date: format.dateTime(new Date(test.data.submitted_at!), { dateStyle: "long" }) })}
        </Alert>
      ) : (
        <TestForm courseId={id} phase={phase} phaseName={lower} questions={test.data.questions} />
      )}
    </div>
  );
}
