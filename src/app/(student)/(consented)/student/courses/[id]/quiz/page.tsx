import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { LinkButton } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getStudentCourse } from "@/lib/api/courses";
import { listQuizzes } from "@/lib/api/quizzes";
import { routes } from "@/lib/routes";

import { StartQuiz } from "./StartQuiz";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.quiz");
  return { title: t("pageTitle") };
}

/** Start or continue a quiz (#16 quiz.html, 001 US11; 008 US2 AS1, AS5, AS6). */
export default async function QuizStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("student.quiz");
  const [course, quizzes] = await Promise.all([getStudentCourse(id), listQuizzes(id)]);
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  if (!quizzes.ok) return <ErrorState code={quizzes.code} />;
  const unfinished = quizzes.data.items.find((quiz) => quiz.status === "in_progress" && quiz.current);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("startLead")} back={{ href: routes.studentCourse(id), label: course.data.name }} />
      {unfinished?.current && (
        <section aria-labelledby="unfinished-title" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
          <div>
            <h2 id="unfinished-title" className="text-lg font-semibold text-fg">
              {t("unfinished")}
            </h2>
            <p className="text-fg-muted tabular-nums">{t("unfinishedBody", { n: unfinished.current.position, total: unfinished.question_count })}</p>
          </div>
          <div>
            <LinkButton href={routes.studentQuiz(id, unfinished.id)} icon="chevron-right">
              {t("continue")}
            </LinkButton>
          </div>
        </section>
      )}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
        <p className="text-fg">{t("adaptive")}</p>
        <StartQuiz courseId={id} label={t("start")} variant={unfinished ? "secondary" : "primary"} />
      </div>
    </div>
  );
}
