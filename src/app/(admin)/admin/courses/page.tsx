import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { listAllCourses } from "@/lib/api/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.courses");
  return { title: t("pageTitle") };
}

export default async function AdminCoursesPage() {
  const t = await getTranslations("admin.courses");
  const format = await getFormatter();
  const courses = await listAllCourses();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : courses.data.items.length === 0 ? (
        <EmptyState icon="book-open" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr className="border-b-2 border-neutral-900">
                {(["colCourse", "colTeacher", "colStudents", "colCreated"] as const).map((col) => (
                  <th key={col} scope="col" className="pb-2 pr-4 text-left text-sm font-semibold text-fg-muted">
                    {t(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.data.items.map((course) => (
                <tr key={course.id} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-4 pr-4 text-left font-semibold text-fg">
                    {course.name}
                  </th>
                  <td className="py-4 pr-4 text-fg">{course.teacher_name}</td>
                  <td className="py-4 pr-4 text-fg tabular-nums">{format.number(course.student_count)}</td>
                  <td className="py-4 text-fg-muted tabular-nums">
                    {format.dateTime(new Date(course.created_at), { dateStyle: "medium" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
