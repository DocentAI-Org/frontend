import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { COURSE_SORTS, CourseList } from "@/components/CourseList";
import { CourseTagsDialog } from "@/components/CourseTagsDialog";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteStar } from "@/components/FavoriteStar";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { MessageAllowance } from "@/components/MessageAllowance";
import { NextStepLine } from "@/components/NextSteps";
import { PageHeader } from "@/components/PageHeader";
import { RowMenu } from "@/components/RowMenu";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { TagChips } from "@/components/TagChips";
import { getAllowance } from "@/lib/api/chat";
import type { Schemas } from "@/lib/api/client";
import { listTestPhases } from "@/lib/api/course-tests";
import { listStudentCourses } from "@/lib/api/courses";
import { listCourseTags, listMyQuestionnaires } from "@/lib/api/me";
import { getNextSteps } from "@/lib/api/progress";
import { env } from "@/lib/env";
import { apiQuery, courseScope, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.courses");
  return { title: t("pageTitle") };
}

const ACTION =
  "flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

type Step = Schemas["NextSteps"]["steps"][number];

export default async function StudentCoursesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = listState(params, COURSE_SORTS);
  const t = await getTranslations("student.courses");
  const scope = courseScope(params);
  const [courses, all, favorites, tags, allowance, questionnaires] = await Promise.all([
    listStudentCourses({ ...apiQuery(list, COURSE_SORTS), favorite: scope.favorites || undefined, tag: scope.tag }, list.shown),
    // The side filter's counts, whatever the search (spec 016).
    listStudentCourses({}, 1),
    listStudentCourses({ favorite: true }, 1),
    listCourseTags(),
    getAllowance(),
    env.studyQuestionnaires ? listMyQuestionnaires() : null
  ]);
  const { pending, firstStep } = await rowNotices(courses.ok ? courses.data.items : []);
  const join = (variant: "primary" | "secondary") => (
    <LinkButton href="/student/join" variant={variant} icon="plus">
      {t("join")}
    </LinkButton>
  );
  const allCount = all.ok ? all.data.total : 0;
  const myTags = tags.ok ? tags.data : [];
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
          <CourseList
            path="/student/courses"
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
              aria-label={t("title")}
              className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised"
            >
              {courses.data.items.map((course) => (
                <CourseRow key={course.id} course={course} tags={myTags} phase={pending.get(course.id)} step={firstStep.get(course.id)} />
              ))}
            </ul>
          </CourseList>
        </>
      )}
    </div>
  );
}

/**
 * An open pre/post-test the student has not done yet is announced on its row (010 US3 AS1);
 * otherwise, the first recommended step (023).
 */
async function rowNotices(courses: Schemas["StudentCourse"][]) {
  const pending = new Map<string, "pre" | "post">();
  const firstStep = new Map<string, Step>();
  const [phases, steps] = await Promise.all([
    Promise.all(courses.map((course) => listTestPhases(course.id))),
    Promise.all(courses.map((course) => getNextSteps(course.id)))
  ]);
  courses.forEach((course, i) => {
    const result = phases[i];
    const open = result.ok ? result.data.find((p) => p.status === "open" && !p.done) : undefined;
    if (open) pending.set(course.id, open.phase);
    const step = steps[i].ok ? steps[i].data.steps[0] : undefined;
    if (!open && step) firstStep.set(course.id, step);
  });
  return { pending, firstStep };
}

async function CourseRow({
  course,
  tags,
  phase,
  step
}: {
  course: Schemas["StudentCourse"];
  tags: Schemas["CourseTag"][];
  phase?: "pre" | "post";
  step?: Step;
}) {
  const t = await getTranslations("student.courses");
  const tt = await getTranslations("student.test");
  const tp = await getTranslations("teacher.test");
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-4" data-component="CourseRow">
      <FavoriteStar courseId={course.id} name={course.name} initial={course.is_favorite} />
      {/* At least 12rem for the name: on phones the actions wrap to a second line. */}
      <div className="flex min-w-48 flex-1 flex-col gap-0.5">
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
        <TagChips tags={course.tags ?? []} />
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
        {step && <NextStepLine step={step} href={routes.studentProgress(course.id)} />}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <LinkButton href={routes.studentCourse(course.id)} icon="message-circle">
          {t("openChat")}
        </LinkButton>
        <RowMenu label={t("moreActions", { name: course.name })} className="w-60">
          <CourseTagsDialog
            courseId={course.id}
            courseName={course.name}
            tags={tags}
            selected={(course.tags ?? []).map((tag) => tag.id)}
            triggerClassName={ACTION}
          />
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
        </RowMenu>
      </div>
    </li>
  );
}
