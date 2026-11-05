import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { listTeacherCourses } from "@/lib/api/courses";
import { listMyQuestionnaires } from "@/lib/api/me";
import { env } from "@/lib/env";
import { apiQuery, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.courses");
  return { title: t("pageTitle") };
}

const SORTS = ["recent", "name"] as const;

export default async function TeacherCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, SORTS);
  const t = await getTranslations("teacher.courses");
  const tl = await getTranslations("common.list");
  const format = await getFormatter();
  const [courses, questionnaires] = await Promise.all([
    listTeacherCourses(apiQuery(list, SORTS), list.shown),
    env.studyQuestionnaires ? listMyQuestionnaires() : null
  ]);
  const create = (
    <LinkButton href="/teacher/courses/new" icon="plus">
      {t("create")}
    </LinkButton>
  );
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} actions={create} />
      {questionnaires?.ok && <StudyQuestionnaires items={questionnaires.data} />}
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : courses.data.total === 0 && !list.q ? (
        <EmptyState icon="graduation-cap" title={t("emptyTitle")} body={t("emptyBody")} action={create} />
      ) : (
        <>
          <ListToolbar
            searchLabel={t("search")}
            sorts={SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))}
          />
          {courses.data.items.length === 0 ? (
            <NoMatches q={list.q} />
          ) : (
            <ul
              aria-label={t("listLabel")}
              className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-2 sm:px-3"
            >
              {courses.data.items.map((course) => (
                <li key={course.id} className="flex items-start gap-2 py-2">
                  <Link
                    href={routes.teacherCourse(course.id)}
                    className="group flex min-w-0 flex-1 flex-col gap-2 rounded-lg px-2 py-4 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-3"
                    data-component="Card"
                    data-variant="interactive"
                  >
                    <h2 className="text-2xl font-semibold text-fg group-hover:underline">{course.name}</h2>
                    <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
                      <span className="inline-flex items-center gap-2">
                        <Icon name="users" />
                        <span className="tabular-nums">{t("students", { count: course.student_count })}</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Icon name="clock" />
                        <span className="tabular-nums">
                          {t("created", { date: format.dateTime(new Date(course.created_at), { dateStyle: "long" }) })}
                        </span>
                      </span>
                    </span>
                  </Link>
                  <span className="pt-4">
                    <FavoriteStar courseId={course.id} name={course.name} initial={course.is_favorite} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {courses.data.items.length > 0 && (
            <ListFooter path="/teacher/courses" params={params} shown={list.shown} total={courses.data.total} />
          )}
        </>
      )}
    </div>
  );
}
