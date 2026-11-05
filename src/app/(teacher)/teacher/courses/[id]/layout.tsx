import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { CourseGroupTabs } from "@/components/CourseGroupTabs";
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
  // The header names the course on every section; the two rows of tabs move between them.
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={course.data.name}
        lead={course.data.description ?? undefined}
        back={{ href: "/teacher/courses", label: t("back") }}
      />
      <CourseGroupTabs
        label={t("tabs")}
        base={routes.teacherCourse(id)}
        groups={[
          {
            key: "follow",
            label: t("group.follow"),
            sections: [
              { path: "", label: t("tab.students"), also: ["/students"] },
              { path: "/dashboard", label: t("tab.dashboard") },
              { path: "/conversations", label: t("tab.conversations"), also: ["/exercises", "/corrections"] }
            ]
          },
          {
            key: "content",
            label: t("group.content"),
            sections: [
              { path: "/material", label: t("tab.material") },
              { path: "/topics", label: t("tab.topics") },
              { path: "/questions", label: t("tab.questions") },
              { path: "/test", label: t("tab.test") }
            ]
          },
          {
            key: "settings",
            label: t("group.settings"),
            sections: [
              { path: "/tutor", label: t("tab.settings") },
              { path: "/criteria", label: t("tab.criteria") }
            ]
          }
        ]}
      />
      {children}
    </div>
  );
}
