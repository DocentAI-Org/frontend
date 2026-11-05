import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { CourseScope } from "@/components/CourseScope";
import { CourseTagsDialog } from "@/components/CourseTagsDialog";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { TagChips } from "@/components/TagChips";
import { listTeacherCourses } from "@/lib/api/courses";
import { listCourseTags, listMyQuestionnaires } from "@/lib/api/me";
import { env } from "@/lib/env";
import { apiQuery, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.courses");
  return { title: t("pageTitle") };
}

const SORTS = ["recent", "name"] as const;
const MENU_ROW =
  "flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

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
  const favoritesOnly = params.only === "favorites";
  const tagId = typeof params.tag === "string" ? params.tag : undefined;
  const [courses, all, favorites, tags, questionnaires] = await Promise.all([
    listTeacherCourses({ ...apiQuery(list, SORTS), favorite: favoritesOnly || undefined, tag: tagId }, list.shown),
    // The side filter's counts, whatever the search (spec 016).
    listTeacherCourses({}, 1),
    listTeacherCourses({ favorite: true }, 1),
    listCourseTags(),
    env.studyQuestionnaires ? listMyQuestionnaires() : null
  ]);
  const myTags = tags.ok ? tags.data : [];
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
      ) : (all.ok ? all.data.total : 0) === 0 ? (
        <EmptyState icon="graduation-cap" title={t("emptyTitle")} body={t("emptyBody")} action={create} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <CourseScope
            path="/teacher/courses"
            params={params}
            current={{ favorites: favoritesOnly, tag: tagId }}
            counts={{ all: all.ok ? all.data.total : 0, favorites: favorites.ok ? favorites.data.total : 0 }}
            tags={myTags}
          />
          <div className="flex min-w-0 flex-col gap-4">
            <ListToolbar
              searchLabel={t("search")}
              sorts={SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))}
            />
            {courses.data.items.length === 0 ? (
              favoritesOnly && !list.q ? (
                <EmptyState icon="star" title={tl("noFavorites")} body={tl("noFavoritesBody")} />
              ) : (
                <NoMatches q={list.q} />
              )
            ) : (
              <ul
                aria-label={t("listLabel")}
                className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-2 sm:px-3"
              >
                {courses.data.items.map((course) => (
                  <li key={course.id} className="flex items-center gap-2 py-1">
                    <Link
                      href={routes.teacherCourse(course.id)}
                      className="group flex min-w-0 flex-1 flex-col gap-1 rounded-lg px-2 py-3 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-3"
                      data-component="Card"
                      data-variant="interactive"
                    >
                      <h2 className="truncate text-base font-semibold text-fg group-hover:underline">{course.name}</h2>
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
                      <TagChips tags={course.tags ?? []} />
                    </Link>
                    <FavoriteStar courseId={course.id} name={course.name} initial={course.is_favorite} />
                    <details className="relative">
                      <summary
                        aria-label={tl("rowActions", { name: course.name })}
                        title={tl("rowActions", { name: course.name })}
                        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                      >
                        <Icon name="ellipsis" className="size-5 shrink-0" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-1 flex w-56 flex-col gap-1 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
                        <CourseTagsDialog
                          courseId={course.id}
                          courseName={course.name}
                          tags={myTags}
                          selected={(course.tags ?? []).map((tag) => tag.id)}
                          triggerClassName={MENU_ROW}
                        />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
            {courses.data.items.length > 0 && (
              <ListFooter path="/teacher/courses" params={params} shown={list.shown} total={courses.data.total} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
