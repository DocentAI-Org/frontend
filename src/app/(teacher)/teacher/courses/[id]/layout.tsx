import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getTeacherCourse } from "@/lib/api/courses";

export default async function TeacherCourseLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("teacher.course");
  const course = await getTeacherCourse(id);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/teacher/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  // The course sections are in the sidebar (AppShell); the header names the course on every one.
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.data.name}
        lead={course.data.description ?? undefined}
        back={{ href: "/teacher/courses", label: t("back") }}
      />
      {children}
    </div>
  );
}
