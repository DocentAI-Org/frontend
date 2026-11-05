import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { CourseScope } from "@/components/CourseScope";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { MessageAllowance } from "@/components/MessageAllowance";
import { NoMatches } from "@/components/NoMatches";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { getAllowance } from "@/lib/api/chat";
import { listTestPhases } from "@/lib/api/course-tests";
import { listStudentCourses } from "@/lib/api/courses";
import { listMyQuestionnaires } from "@/lib/api/me";
import { env } from "@/lib/env";
import { apiQuery, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.courses");
  return { title: t("pageTitle") };
}

const ACTION =
  "flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

const SORTS = ["recent", "name"] as const;

export default async function StudentCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, SORTS);
  const t = await getTranslations("student.courses");
  const tl = await getTranslations("common.list");
  const tt = await getTranslations("student.test");
  const tp = await getTranslations("teacher.test");
  const favoritesOnly = params.only === "favorites";
  const [courses, all, favorites, allowance, questionnaires] = await Promise.all([
    listStudentCourses({ ...apiQuery(list, SORTS), favorite: favoritesOnly || undefined }, list.shown),
    // The side filter's counts, whatever the search (spec 016).
    listStudentCourses({}, 1),
    listStudentCourses({ favorite: true }, 1),
    getAllowance(),
    env.studyQuestionnaires ? listMyQuestionnaires() : null
  ]);
  // An open pre/post-test the student has not done yet is announced on its row (010 US3 AS1).
  const pending = new Map<string, "pre" | "post">();
  if (courses.ok) {
    const phases = await Promise.all(courses.data.items.map((course) => listTestPhases(course.id)));
    courses.data.items.forEach((course, i) => {
      const result = phases[i];
      const open = result.ok ? result.data.find((p) => p.status === "open" && !p.done) : undefined;
      if (open) pending.set(course.id, open.phase);
    });
  }
  const join = (variant: "primary" | "secondary") => (
    <LinkButton href="/student/join" variant={variant} icon="plus">
      {t("join")}
    </LinkButton>
  );
  const allCount = all.ok ? all.data.total : 0;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} actions={join("secondary")} />
      {questionnaires?.ok && <StudyQuestionnaires items={questionnaires.data} />}
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : allCount === 0 ? (
        <EmptyState icon="book-open" title={t("emptyTitle")} body={t("emptyBody")} action={join("primary")} />
      ) : (
        <>
          {allowance.ok && <MessageAllowance allowance={allowance.data} />}
          <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
            <CourseScope
              path="/student/courses"
              params={params}
              favoritesOnly={favoritesOnly}
              counts={{ all: allCount, favorites: favorites.ok ? favorites.data.total : 0 }}
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
                  aria-label={t("title")}
                  className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised"
                >
                  {courses.data.items.map((course) => {
                    const phase = pending.get(course.id);
                    return (
                      <li key={course.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-4" data-component="CourseRow">
                        <FavoriteStar courseId={course.id} name={course.name} initial={course.is_favorite} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <h2 id={`course-${course.id}`} className="truncate text-base font-semibold text-fg">
                            <Link
                              href={routes.studentCourse(course.id)}
                              className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            >
                              {course.name}
                            </Link>
                          </h2>
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                            <span className="inline-flex items-center gap-1 text-teacher-700">
                              <Icon name="graduation-cap" />
                              <span>{course.teacher_name}</span>
                            </span>
                            {course.description && <span className="line-clamp-1 min-w-0">{course.description}</span>}
                          </p>
                          {phase && (
                            <p className="flex flex-wrap items-center gap-2 text-sm text-info-800" data-component="TestNotice">
                              <span>{tt("cardOpen", { phase: tp(`phaseLower.${phase}`) })}</span>
                              <Link
                                href={routes.studentTest(course.id, phase)}
                                className="rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                              >
                                {tt("cardLink", { phase: tp(`phaseLower.${phase}`) })}
                              </Link>
                            </p>
                          )}
                        </div>
                        <LinkButton href={routes.studentCourse(course.id)} icon="message-circle">
                          {t("openChat")}
                        </LinkButton>
                        <details className="relative">
                          <summary
                            aria-label={t("moreActions", { name: course.name })}
                            title={t("moreActions", { name: course.name })}
                            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                          >
                            <Icon name="ellipsis" className="size-5 shrink-0" />
                          </summary>
                          <div className="absolute right-0 z-20 mt-1 flex w-60 flex-col gap-1 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
                            <Link href={routes.studentExercise(course.id)} className={ACTION}>
                              <Icon name="file-text" />
                              <span>{t("exercise")}</span>
                            </Link>
                            <Link href={routes.studentQuizStart(course.id)} className={ACTION}>
                              <Icon name="lightbulb" />
                              <span>{t("quiz")}</span>
                            </Link>
                            <Link href={routes.studentProgress(course.id)} className={ACTION}>
                              <Icon name="chart-column" />
                              <span>{t("progress")}</span>
                            </Link>
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              )}
              {courses.data.items.length > 0 && (
                <ListFooter path="/student/courses" params={params} shown={list.shown} total={courses.data.total} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
