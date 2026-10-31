"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { CitationNotes } from "@/components/CitationNotes";
import { Icon } from "@/components/Icon";
import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";
import { levelKey } from "@/lib/quiz/levels";
import { routes } from "@/lib/routes";

import { answerAction } from "../../quiz/actions";
import { StartQuiz } from "../../quiz/StartQuiz";

type Quiz = Schemas["Quiz"];
type Current = Schemas["QuizQuestion"];
type Answered = { question: Current; choice: number; result: Schemas["AnswerResult"] };

/** One question at a time with immediate feedback, then the summary (008 US2 AS1–AS4). */
export function QuizRunner({ courseId, initial }: { courseId: string; initial: Quiz }) {
  const t = useTranslations("student.quiz");
  const tQuiz = useTranslations("common.quiz");
  const tAll = useTranslations();
  const [quiz, setQuiz] = useState<Quiz>(initial);
  const [answered, setAnswered] = useState<Answered | null>(null);
  // Shown above the next question: why the level moved (FR-002).
  const [change, setChange] = useState<Schemas["DifficultyChange"] | null>(null);
  const [summary, setSummary] = useState(initial.status === "completed");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const top = useRef<HTMLDivElement>(null);

  const submit = (choice: number) => {
    const question = quiz.current;
    if (!question) return;
    setError(null);
    startTransition(async () => {
      const outcome = await answerAction(courseId, quiz.id, question.id, choice);
      if (!outcome.ok) {
        setError(outcome.code);
        return;
      }
      setAnswered({ question, choice, result: outcome.data });
      setChange(outcome.data.difficulty_change ?? null);
      setQuiz(outcome.data.quiz);
    });
  };

  const advance = () => {
    setAnswered(null);
    if (quiz.status === "completed") setSummary(true);
    top.current?.focus();
  };

  if (summary && quiz.summary) return <Summary courseId={courseId} quiz={quiz} />;

  return (
    <div ref={top} tabIndex={-1} className="flex flex-col gap-4 outline-none">
      {answered ? (
        <Feedback answered={answered} last={quiz.status === "completed"} onNext={advance} />
      ) : (
        quiz.current && (
          <>
            {change && (
              <p role="status" className="flex items-start gap-2 rounded-xl border border-info-200 bg-info-50 p-4 font-medium text-info-800" data-component="DecisionReason">
                <Icon name="sparkles" className="mt-0.5 size-5 shrink-0" />
                <span>
                  {change.reason === "level_exhausted"
                    ? t("reasonExhausted", {
                        from: tQuiz(levelKey(change.from_level)).toLocaleLowerCase(),
                        to: tQuiz(levelKey(change.to_level)).toLocaleLowerCase()
                      })
                    : t(change.reason === "correct_streak" ? "reasonUp" : "reasonDown", { count: change.streak })}{" "}
                  {t("provisional")}
                </span>
              </p>
            )}
            <QuestionForm key={quiz.current.id} question={quiz.current} total={quiz.question_count} pending={pending} onSubmit={submit} />
          </>
        )
      )}
      {error && <Alert tone="danger">{tAll(errorMessageKey(error))}</Alert>}
    </div>
  );
}

function DifficultyBadge({ level }: { level: number }) {
  const t = useTranslations("student.quiz");
  const tQuiz = useTranslations("common.quiz");
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-border-strong px-2 py-1 text-xs font-semibold text-fg">
      <span className="inline-flex items-end gap-1" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={`w-1 rounded-full ${bar <= level ? "bg-neutral-700" : "bg-neutral-300"} ${["h-1.5", "h-2", "h-2.5"][bar - 1]}`} />
        ))}
      </span>
      <span>
        {t("difficulty")} {tQuiz(levelKey(level))}
      </span>
    </span>
  );
}

function QuestionForm({ question, total, pending, onSubmit }: { question: Current; total: number; pending: boolean; onSubmit: (choice: number) => void }) {
  const t = useTranslations("student.quiz");
  const tQuiz = useTranslations("common.quiz");
  const ids = useId();
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-border bg-surface-raised p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (choice !== null) onSubmit(choice);
      }}
    >
      <DifficultyBadge level={question.difficulty} />
      <div className="flex flex-col gap-4" data-component="QuizQuestion" data-variant="unanswered">
        <p className="text-sm font-medium text-fg-muted tabular-nums">{tQuiz("counter", { n: question.position, total })}</p>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-4 font-serif text-2xl font-semibold text-fg">{question.statement}</legend>
          {question.options.map((option, i) => (
            <label
              key={i}
              className="flex min-h-11 cursor-pointer items-center gap-4 rounded-lg border border-border-strong bg-surface-raised p-4 hover:bg-surface-sunken has-checked:border-neutral-900 has-checked:bg-surface-sunken has-checked:ring-1 has-checked:ring-neutral-900"
            >
              <input
                type="radio"
                name={`${ids}-answer`}
                value={i}
                required
                checked={choice === i}
                onChange={() => setChoice(i)}
                disabled={pending}
                className="size-5 shrink-0 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
              <span className="text-fg">{option}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <div className="flex justify-end">
        <Button type="submit" icon="check" pending={pending} disabled={choice === null}>
          {t("check")}
        </Button>
      </div>
    </form>
  );
}

function Feedback({ answered, last, onNext }: { answered: Answered; last: boolean; onNext: () => void }) {
  const t = useTranslations("student.quiz");
  const tQuiz = useTranslations("common.quiz");
  const ids = useId();
  const { question, choice, result } = answered;
  const right = result.correct;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
        <DifficultyBadge level={question.difficulty} />
        <p className="text-sm font-medium text-fg-muted tabular-nums">{tQuiz("counter", { n: question.position, total: answered.result.quiz.question_count })}</p>
        <p className="font-serif text-2xl font-semibold text-fg">{question.statement}</p>
        <ol aria-label={t("optionsLabel")} className="flex flex-col gap-2" data-component="QuizQuestion" data-variant={right ? "correct" : "incorrect"}>
          {question.options.map((option, i) => {
            const isRight = i === result.correct_option;
            const isMine = i === choice;
            const tone = isRight ? "border-success-300 bg-success-50" : isMine ? "border-danger-600 bg-danger-50" : "border-border";
            return (
              <li key={i} className={`flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border p-4 ${tone}`}>
                <span className="text-fg">{option}</span>
                <span className="ml-auto flex flex-wrap gap-x-4">
                  {isMine && (
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isRight ? "text-success-800" : "text-danger-700"}`}>
                      <Icon name={isRight ? "check" : "x"} />
                      {tQuiz("yourAnswer")}
                    </span>
                  )}
                  {isRight && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-800">
                      <Icon name="check" />
                      {tQuiz("correctAnswer")}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <section
        aria-labelledby={`${ids}-title`}
        className={`flex flex-col gap-4 rounded-xl border p-6 ${right ? "border-success-300 bg-success-50" : "border-danger-200 bg-danger-50"}`}
      >
        <h2 id={`${ids}-title`} className={`flex items-center gap-2 text-lg font-semibold ${right ? "text-success-800" : "text-danger-700"}`}>
          <Icon name={right ? "check" : "x"} className="size-5 shrink-0" />
          {right ? t("correct") : t("incorrect")}
        </h2>
        <p className="text-fg">{result.explanation}</p>
        {result.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <CitationNotes citations={result.citations} />
          </div>
        )}
        <div className="flex justify-end">
          <Button type="button" icon="chevron-right" onClick={onNext}>
            {last ? t("summary") : t("next")}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Summary({ courseId, quiz }: { courseId: string; quiz: Quiz }) {
  const t = useTranslations("student.quiz");
  const tQuiz = useTranslations("common.quiz");
  const s = quiz.summary!;
  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-6 rounded-xl border border-border bg-surface-raised p-6">
      <div className="flex flex-col gap-1">
        <h2 id="summary-title" className="text-2xl font-semibold text-fg">
          {t("summaryTitle")}
        </h2>
        <p className="font-serif text-3xl font-semibold text-fg tabular-nums">{t("score", { right: s.score, total: s.total })}</p>
        <p className="text-fg-muted">{t("finalLevel", { level: tQuiz(levelKey(s.final_level)) })}</p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 id="by-topic" className="font-semibold text-fg">
          {t("byTopic")}
        </h3>
        <ul aria-labelledby="by-topic" className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {s.by_topic.map((topic) => (
            <li key={`${topic.topic_id}-${topic.topic_name}`} className="flex flex-col gap-2 px-4 py-3">
              <span className="text-fg tabular-nums">{t("topicScore", { topic: topic.topic_name, right: topic.correct, total: topic.total })}</span>
              <span className="h-2 w-full overflow-hidden rounded-full bg-neutral-200" aria-hidden="true">
                <span className="block h-full rounded-full bg-primary-600" style={{ width: `${(topic.correct / Math.max(topic.total, 1)) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-fg">{t("nextSteps")}</h3>
        <div className="flex flex-wrap gap-2">
          <StartQuiz courseId={courseId} label={t("stepAnother")} icon="refresh-cw" />
          {s.by_topic
            .filter((topic) => topic.topic_id)
            .map((topic) => (
              <StartQuiz key={topic.topic_id} courseId={courseId} topicId={topic.topic_id!} label={t("stepTopic", { topic: topic.topic_name })} icon="lightbulb" variant="secondary" />
            ))}
          <LinkButton href={routes.studentCourse(courseId)} variant="ghost" icon="message-circle">
            {t("askTutor")}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
