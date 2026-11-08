import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { AccessDenied, deniedReasonFor } from "@/components/AccessDenied";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LinkButton } from "@/components/Button";
import { LearningRecord } from "@/components/LearningRecord";
import { NextStepsList } from "@/components/NextSteps";
import { TopicProgressList } from "@/components/TopicProgress";
import { PageHeader } from "@/components/PageHeader";
import { getStudentCourse } from "@/lib/api/courses";
import { getErrorTypes, getLearningRecord } from "@/lib/api/exercises";
import type { Schemas } from "@/lib/api/client";
import { getNextSteps, getProgress } from "@/lib/api/progress";
import { listQuizTopics } from "@/lib/api/quizzes";
import { routes } from "@/lib/routes";

import { StartQuiz } from "../quiz/StartQuiz";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.progress");
  return { title: t("pageTitle") };
}

/** What the student can do for each recommended step (020 US1). */
async function StepAction({ courseId, step }: { courseId: string; step: Schemas["NextSteps"]["steps"][number] }) {
  const t = await getTranslations("student.nextSteps");
  switch (step.kind) {
    case "test":
      return (
        <LinkButton href={routes.studentTest(courseId, step.phase)} icon="file-text">
          {t("takeTest")}
        </LinkButton>
      );
    case "resume_quiz":
      return (
        <LinkButton href={routes.studentQuiz(courseId, step.quiz_id)} icon="chevron-right">
          {t("continue")}
        </LinkButton>
      );
    case "review_mistake":
      return step.reviewed ? (
        <LinkButton href={routes.studentReview(courseId, step.submission_id)} icon="book-open">
          {t("openReview")}
        </LinkButton>
      ) : (
        <LinkButton href={routes.studentSubmission(courseId, step.submission_id)} icon="lightbulb">
          {t("startReview")}
        </LinkButton>
      );
    case "practice_topic":
    case "start_topic":
      return step.has_questions ? (
        <StartQuiz courseId={courseId} topicId={step.topic_id} label={t("quiz")} icon="lightbulb" />
      ) : (
        <>
          <LinkButton href={routes.studentCourse(courseId)} icon="message-circle">
            {t("askTutor")}
          </LinkButton>
          <LinkButton href={routes.studentExercise(courseId)} variant="secondary" icon="file-text">
            {t("exercise")}
          </LinkButton>
        </>
      );
  }
}

/**
 * My progress (#13, 001 US13; 009 US1): the recommended next steps (020), mastery by topic, then
 * the mistakes of the learning record (spec 005).
 */
export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("student.progress");
  const [course, record, taxonomy, progress, nextSteps, quizTopics] = await Promise.all([
    getStudentCourse(id),
    getLearningRecord(id),
    getErrorTypes(),
    getProgress(id),
    getNextSteps(id),
    listQuizTopics(id)
  ]);
  const tc = await getTranslations("common.progress");
  const tn = await getTranslations("student.nextSteps");
  const hasSteps = nextSteps.ok && nextSteps.data.steps.length > 0;
  const withQuestions = new Set(quizTopics.ok ? quizTopics.data.map((topic) => topic.topic_id) : []);
  const format = await getFormatter();
  if (!course.ok) {
    return course.status === 404 || course.status === 403 ? (
      <AccessDenied reason={deniedReasonFor(course.code)} home="/student/courses" />
    ) : (
      <ErrorState code={course.code} />
    );
  }
  const active = progress.ok && (progress.data.updated_at !== null || progress.data.unassigned !== null);
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} back={{ href: routes.studentCourse(id), label: course.data.name }} />
      {nextSteps.ok && (
        <NextStepsList
          nextSteps={nextSteps.data}
          taxonomy={taxonomy.ok ? taxonomy.data : null}
          audience="student"
          action={(step) => <StepAction courseId={id} step={step} />}
        />
      )}
      {!progress.ok ? (
        <ErrorState code={progress.code} />
      ) : !active ? (
        <EmptyState
          icon="chart-column"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            // The next steps already say what to do (020): no second set of buttons.
            hasSteps ? undefined : (
              <div className="flex flex-wrap justify-center gap-2">
                <LinkButton href={routes.studentCourse(id)} icon="message-circle">
                  {t("ask")}
                </LinkButton>
                <LinkButton href={routes.studentQuizStart(id)} variant="secondary" icon="lightbulb">
                  {t("quiz")}
                </LinkButton>
              </div>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-fg-muted tabular-nums">
            {progress.data.updated_at && t("updated", { date: format.dateTime(new Date(progress.data.updated_at), { dateStyle: "long" }) })}
            {progress.data.updated_at && " · "}
            {t("quizzes", { count: progress.data.quizzes_completed })}
          </p>
          <TopicProgressList
            progress={progress.data}
            taxonomy={taxonomy.ok ? taxonomy.data : null}
            audience="student"
            exampleHref={(submissionId) => routes.studentSubmission(id, submissionId)}
            action={(topic) =>
              topic.topic_id && withQuestions.has(topic.topic_id) ? (
                <StartQuiz
                  courseId={id}
                  topicId={topic.topic_id}
                  label={tn("practiceTopicLabel", { topic: topic.topic_name ?? "" })}
                  icon="lightbulb"
                  variant="secondary"
                />
              ) : null
            }
          />
        </>
      )}
      {record.ok && active && (
        <section aria-labelledby="mistakes-title" className="flex flex-col gap-4">
          <div>
            <h2 id="mistakes-title" className="text-xl font-semibold text-fg">
              {tc("allMistakes")}
            </h2>
            <p className="text-fg-muted">{t("mistakesLead")}</p>
          </div>
          {record.data.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border-strong px-6 py-6 text-fg-muted">
              <span className="block font-semibold text-fg">{t("noMistakesTitle")}</span>
              {t("noMistakesBody")}
            </p>
          ) : (
            <LearningRecord
              entries={record.data}
              taxonomy={taxonomy.ok ? taxonomy.data : null}
              exampleHref={(submissionId) => routes.studentSubmission(id, submissionId)}
            />
          )}
        </section>
      )}
      {!record.ok && <ErrorState code={record.code} />}
    </div>
  );
}
