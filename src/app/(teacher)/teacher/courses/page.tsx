import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { COURSE_SORTS, CourseList } from "@/components/CourseList";
import { CourseTagsDialog } from "@/components/CourseTagsDialog";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { TagChips } from "@/components/TagChips";
import type { Schemas } from "@/lib/api/client";
import { listTeacherCourses } from "@/lib/api/courses";
import { listCourseTags, listMyQuestionnaires } from "@/lib/api/me";
import { env } from "@/lib/env";
import { apiQuery, courseScope, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.courses");
  return { title: t("pageTitle") };
}

const TAG_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default async function TeacherCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, COURSE_SORTS);
  const t = await getTranslations("teacher.courses");
  const scope = courseScope(params);
  const [courses, all, favorites, tags, questionnaires] = await Promise.all([
    listTeacherCourses({ ...apiQuery(list, COURSE_SORTS), favorite: scope.favorites || undefined, tag: scope.tag }, list.shown),
    // The side filter's counts, whatever the search (spec 016).
    listTeacherCourses({}, 1),
    listTeacherCourses({ favorite: true }, 1),
    listCourseTags(),
    env.studyQuestionnaires ? listMyQuestionnaires() : null
  ]);
  const allCount = all.ok ? all.data.total : 0;
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
      ) : allCount === 0 ? (
        <EmptyState icon="graduation-cap" title={t("emptyTitle")} body={t("emptyBody")} action={create} />
      ) : (
        <CourseList
          path="/teacher/courses"
          params={params}
          scope={scope}
          counts={{ all: allCount, favorites: favorites.ok ? favorites.data.total : 0 }}
          tags={myTags}
          searchLabel={t("search")}
          list={list}
          total={courses.data.total}
          empty={courses.data.items.length === 0}
        >
          <ul
            aria-label={t("listLabel")}
            className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-2 sm:px-3"
          >
            {courses.data.items.map((course) => (
              <CourseRow key={course.id} course={course} tags={myTags} />
            ))}
          </ul>
        </CourseList>
      )}
    </div>
  );
}

async function CourseRow({ course, tags }: { course: Schemas["TeacherCourse"]; tags: Schemas["CourseTag"][] }) {
  const t = await getTranslations("teacher.courses");
  const format = await getFormatter();
  return (
    <li className="flex items-center gap-2 py-1">
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
      <CourseTagsDialog
        courseId={course.id}
        courseName={course.name}
        tags={tags}
        selected={(course.tags ?? []).map((tag) => tag.id)}
        triggerClassName={TAG_BUTTON}
        iconOnly
      />
    </li>
  );
}
