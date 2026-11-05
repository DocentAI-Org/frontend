import { getTranslations } from "next-intl/server";

import { CourseTabs } from "@/components/CourseTabs";
import { routes } from "@/lib/routes";

/** Every page of a course the student is in starts with the course's sections as tabs. */
export default async function StudentCourseLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("student.shell.course");
  return (
    <div className="flex flex-col gap-6">
      <CourseTabs
        label={t("sections")}
        base={routes.studentCourse(id)}
        sections={[
          { path: "", label: t("tutor"), also: ["/conversations"] },
          { path: "/exercise", label: t("exercise"), also: ["/exercises"] },
          { path: "/quiz", label: t("quiz"), also: ["/quizzes"] },
          { path: "/progress", label: t("progress") }
        ]}
      />
      {children}
    </div>
  );
}
