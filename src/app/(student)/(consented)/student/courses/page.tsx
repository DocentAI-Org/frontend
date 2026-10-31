import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { MessageAllowance } from "@/components/MessageAllowance";
import { PageHeader } from "@/components/PageHeader";
import { StudyQuestionnaires } from "@/components/StudyQuestionnaires";
import { getAllowance } from "@/lib/api/chat";
import { listTestPhases } from "@/lib/api/course-tests";
import { listStudentCourses } from "@/lib/api/courses";
import { listMyQuestionnaires } from "@/lib/api/me";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.courses");
  return { title: t("pageTitle") };
}

const ACTION =
  "inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default async function StudentCoursesPage() {
  const t = await getTranslations("student.courses");
  const tt = await getTranslations("student.test");
  const tp = await getTranslations("teacher.test");
  const [courses, allowance, questionnaires] = await Promise.all([listStudentCourses(), getAllowance(), listMyQuestionnaires()]);
  // An open pre/post-test the student has not done yet is announced on its card (010 US3 AS1).
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
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} actions={join("secondary")} />
      {questionnaires.ok && <StudyQuestionnaires items={questionnaires.data} />}
      {!courses.ok ? (
        <ErrorState code={courses.code} />
      ) : courses.data.items.length === 0 ? (
        <EmptyState icon="book-open" title={t("emptyTitle")} body={t("emptyBody")} action={join("primary")} />
      ) : (
        <>
          {allowance.ok && <MessageAllowance allowance={allowance.data} />}
          <ul className="grid gap-4 md:grid-cols-2">
            {courses.data.items.map((course) => (
              <li
                key={course.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6"
                data-component="Card"
              >
                <div className="flex flex-col gap-2">
                  <h2 id={`course-${course.id}`} className="font-serif text-2xl font-semibold text-fg">
                    {course.name}
                  </h2>
                  <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
                    <Icon name="graduation-cap" />
                    <span>{t("teacher", { teacher: course.teacher_name })}</span>
                  </p>
                  {course.description && <p className="text-fg">{course.description}</p>}
                </div>
                {pending.has(course.id) && (
                  <div className="flex flex-col gap-2 rounded-lg border border-info-200 bg-info-50 p-4" data-component="TestNotice">
                    <p className="font-medium text-info-800">{tt("cardOpen", { phase: tp(`phaseLower.${pending.get(course.id)!}`) })}</p>
                    <div>
                      <LinkButton href={routes.studentTest(course.id, pending.get(course.id)!)} icon="file-text">
                        {tt("cardLink", { phase: tp(`phaseLower.${pending.get(course.id)!}`) })}
                      </LinkButton>
                    </div>
                  </div>
                )}
                <nav aria-labelledby={`course-${course.id}`} className="flex flex-wrap gap-2">
                  <LinkButton href={routes.studentCourse(course.id)} icon="message-circle">
                    {t("openChat")}
                  </LinkButton>
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
                </nav>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
