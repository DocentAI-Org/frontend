import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { CourseTabs } from "@/components/CourseTabs";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getTeacherCourse } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.data.name}
        lead={course.data.description ?? undefined}
        back={{ href: "/teacher/courses", label: t("back") }}
      />
      <CourseTabs
        label={t("tabs")}
        tabs={[
          { href: routes.teacherCourse(id), label: t("tab.students"), exact: true },
          { href: routes.teacherMaterial(id), label: t("tab.material") },
          { href: routes.teacherTopics(id), label: t("tab.topics") },
          { href: routes.teacherSettings(id), label: t("tab.settings") },
          { href: routes.teacherConversations(id), label: t("tab.conversations") }
        ]}
      />
      {children}
    </div>
  );
}
