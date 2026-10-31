import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getAllowance } from "@/lib/api/chat";
import { getStudentCourse } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

import { ExerciseForm } from "./ExerciseForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.exercise");
  return { title: t("pageTitle") };
}

export default async function ExercisePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ problem?: string }>;
}) {
  const { id } = await params;
  const { problem } = await searchParams;
  const t = await getTranslations("student");
  const [course, allowance] = await Promise.all([getStudentCourse(id), getAllowance()]);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  if (!allowance.ok) return <ErrorState code={allowance.code} />;
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={t("exercise.title")}
        lead={t("exercise.lead")}
        back={{ href: routes.studentCourse(id), label: course.data.name }}
      />
      <ExerciseForm
        courseId={id}
        limit={allowance.data.limit}
        resetsAt={allowance.data.remaining === 0 ? allowance.data.resets_at : null}
        initialProblem={problem?.slice(0, 2000)}
      />
    </div>
  );
}
