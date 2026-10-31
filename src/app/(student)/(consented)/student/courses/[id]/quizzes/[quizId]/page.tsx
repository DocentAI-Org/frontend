import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getQuiz } from "@/lib/api/quizzes";
import { routes } from "@/lib/routes";

import { QuizRunner } from "./QuizRunner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.quiz");
  return { title: t("pageTitle") };
}

/** A quiz: one question at a time, immediate feedback, summary (#16, #17; 008 US2). */
export default async function QuizPage({ params }: { params: Promise<{ id: string; quizId: string }> }) {
  const { id, quizId } = await params;
  const t = await getTranslations("student.quiz");
  const quiz = await getQuiz(id, quizId);
  if (!quiz.ok) {
    return quiz.status === 404 ? <AccessDenied reason="not-found" home="/student/courses" /> : <ErrorState code={quiz.code} />;
  }
  const q = quiz.data;
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={t("title")}
        back={{ href: routes.studentQuizStart(id), label: t("pageTitle") }}
        lead={
          <>
            <span className="block text-lg font-medium text-fg tabular-nums">
              {q.topic_name ? t("intro", { count: q.question_count, topic: q.topic_name }) : t("introAll", { count: q.question_count })}
            </span>
            <span className="block">{t("adaptive")}</span>
          </>
        }
      />
      <QuizRunner courseId={id} initial={q} />
    </div>
  );
}
