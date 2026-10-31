import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { listTeacherCourses } from "@/lib/api/courses";
import { listMyQuestionnaires } from "@/lib/api/me";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.courses");
  return { title: t("pageTitle") };
}

export default async function TeacherCoursesPage() {
  const t = await getTranslations("teacher.courses");
  const format = await getFormatter();
  const [courses, questionnaires] = await Promise.all([listTeacherCourses(), listMyQuestionnaires()]);
  const create = (
    <LinkButton href="/teacher/courses/new" icon="plus">
      {t("create")}
    </LinkButton>
  );
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} actions={create} />
      {questionnaires.ok && <StudyQuestionnaires items={questionnaires.data} />}
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : courses.data.items.length === 0 ? (
        <EmptyState icon="graduation-cap" title={t("emptyTitle")} body={t("emptyBody")} action={create} />
      ) : (
        <ul
          aria-label={t("listLabel")}
          className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6"
        >
          {courses.data.items.map((course) => (
            <li key={course.id}>
              <Link
                href={routes.teacherCourse(course.id)}
                className="group -mx-4 flex flex-col gap-2 px-4 py-6 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:-mx-6 sm:px-6"
                data-component="Card"
                data-variant="interactive"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="font-serif text-2xl font-semibold text-fg group-hover:underline">{course.name}</span>
                  <Icon name="chevron-right" className="mt-1 size-5 shrink-0 text-fg-muted" />
                </span>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
