import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { PageHeader } from "@/components/PageHeader";
import { listAllCourses } from "@/lib/api/admin";
import { apiQuery, listState } from "@/lib/list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.courses");
  return { title: t("pageTitle") };
}

const SORTS = ["recent", "name"] as const;

export default async function AdminCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, SORTS);
  const t = await getTranslations("admin.courses");
  const tl = await getTranslations("common.list");
  const format = await getFormatter();
  const courses = await listAllCourses(apiQuery(list, SORTS), list.shown);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : courses.data.total === 0 && !list.q ? (
        <EmptyState icon="book-open" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <>
          <ListToolbar searchLabel={t("search")} sorts={SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))} />
          {courses.data.items.length === 0 ? (
            <NoMatches q={list.q} />
          ) : (
            // Scrolls sideways on phones, so it takes keyboard focus (axe scrollable-region-focusable).
            <div
              role="region"
              aria-label={t("tableCaption")}
              tabIndex={0}
              className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:p-6"
            >
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">{t("tableCaption")}</caption>
                <thead>
                  <tr className="border-b border-border">
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
          {courses.data.items.length > 0 && (
            <ListFooter path="/admin/courses" params={params} shown={list.shown} total={courses.data.total} />
          )}
        </>
      )}
    </div>
  );
}
