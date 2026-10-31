"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { CitationNotes } from "@/components/CitationNotes";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/Select";
import { TextArea } from "@/components/TextArea";
import { TextField } from "@/components/TextField";
import { MathText } from "@/components/MathText";
import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";
import { levelKey } from "@/lib/quiz/levels";

import { editQuestionAction, reviewQuestionAction } from "./actions";

type Question = Schemas["TeacherQuestion"];

/** One question to review (#30 questions.html, 008 US1 AS1, AS4–AS6). */
export function QuestionCard({ courseId, question, view }: { courseId: string; question: Question; view: string }) {
  const t = useTranslations("teacher.questions");
  const tQuiz = useTranslations("common.quiz");
  const format = useFormatter();
  const ids = useId();
  const [editing, setEditing] = useState(false);
  const q = question;

  return (
    <article aria-labelledby={`${ids}-statement`} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center rounded-sm border border-border-strong px-2 py-1 font-semibold text-fg">
          {t("difficulty", { level: tQuiz(levelKey(q.difficulty)) })}
        </span>
        <span className="text-fg-muted">{q.topic_name}</span>
        <abbr
          title={q.origin === "edited" ? t("editedLabel") : t("aiTagLabel")}
          className="rounded-sm border border-info-300 px-1 text-xs font-bold text-info-800 no-underline"
        >
          {q.origin === "edited" ? t("edited") : t("aiTag")}
        </abbr>
      </div>

      {editing ? (
        <QuestionEditor courseId={courseId} question={q} view={view} titleId={`${ids}-statement`} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <h3 id={`${ids}-statement`} className="font-serif text-xl font-semibold text-fg">
            <MathText text={q.statement} />
          </h3>
          <ol aria-label={t("optionsLabel")} className="flex flex-col gap-2">
            {q.options.map((option, i) => {
              const right = i === q.correct_option;
              return (
                <li
                  key={i}
                  className={`flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-2 ${right ? "border-success-300 bg-success-50" : "border-border"}`}
                >
                  <span className="font-semibold text-fg-muted" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-fg"><MathText text={option} /></span>
                  {right && (
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-success-800">
                      <Icon name="check" />
                      {tQuiz("correctAnswer")}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <div>
            <p className="text-sm font-semibold text-fg-muted">{t("explanation")}</p>
            <p className="text-fg"><MathText text={q.explanation} /></p>
          </div>
          {q.citations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <CitationNotes citations={q.citations} />
            </div>
          )}
          {q.status === "approved" && (
            <p className="text-sm text-fg-muted tabular-nums">
              {q.answered_count > 0 && q.correct_rate !== null
                ? t("stats", { count: q.answered_count, rate: format.number(q.correct_rate, { style: "percent" }) })
                : t("notAnswered")}
            </p>
          )}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {q.status !== "approved" && <ReviewButton courseId={courseId} question={q} view={view} status="approved" />}
            {q.status !== "rejected" && <ReviewButton courseId={courseId} question={q} view={view} status="rejected" />}
            <Button type="button" variant="ghost" icon="settings" onClick={() => setEditing(true)}>
              {tQuiz("edit")}
            </Button>
          </div>
        </>
      )}
    </article>
  );
}

function ReviewButton({ courseId, question, view, status }: { courseId: string; question: Question; view: string; status: "approved" | "rejected" }) {
  const tQuiz = useTranslations("common.quiz");
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(form) => {
        startTransition(() => reviewQuestionAction(form));
      }}
    >
      <input type="hidden" name="course_id" value={courseId} />
      <input type="hidden" name="question_id" value={question.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="view" value={view} />
      <Button type="submit" variant={status === "approved" ? "primary" : "secondary"} icon={status === "approved" ? "check" : "x"} pending={pending}>
        {tQuiz(status === "approved" ? "approve" : "reject")}
      </Button>
    </form>
  );
}

type Errors = { statement?: string; options?: string; explanation?: string; form?: string };

/** Edit form (008 US1 AS5): checked here first, so the teacher sees what to fix at once. */
function QuestionEditor({
  courseId,
  question,
  view,
  titleId,
  onCancel
}: {
  courseId: string;
  question: Question;
  view: string;
  titleId: string;
  onCancel: () => void;
}) {
  const t = useTranslations("teacher.questions");
  const tQuiz = useTranslations("common.quiz");
  const tAll = useTranslations();
  const ids = useId();
  const [statement, setStatement] = useState(question.statement);
  const [options, setOptions] = useState([...question.options]);
  const [correct, setCorrect] = useState(question.correct_option);
  const [explanation, setExplanation] = useState(question.explanation);
  const [difficulty, setDifficulty] = useState(String(question.difficulty));
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  const validate = (): Errors => {
    const found: Errors = {};
    const cleaned = options.map((o) => o.trim());
    if (!statement.trim()) found.statement = t("required");
    if (!explanation.trim()) found.explanation = t("required");
    if (cleaned.some((o) => !o)) found.options = t("optionsRequired");
    else if (new Set(cleaned.map((o) => o.toLocaleLowerCase())).size !== cleaned.length) found.options = t("optionsDistinct");
    return found;
  };

  const save = (approve: boolean) => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    startTransition(async () => {
      const result = await editQuestionAction(courseId, question.id, view, {
        statement: statement.trim(),
        options: options.map((o) => o.trim()),
        correct_option: correct,
        explanation: explanation.trim(),
        difficulty: Number(difficulty),
        ...(approve ? { status: "approved" as const } : {})
      });
      // Only reached on failure: success redirects.
      setErrors({ form: tAll(errorMessageKey(result.code)) });
    });
  };

  return (
    <form
      aria-label={t("editTitle")}
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save(true);
      }}
    >
      <h3 id={titleId} className="text-lg font-semibold text-fg">
        {t("editTitle")}
      </h3>
      <TextArea label={t("statement")} value={statement} onChange={(e) => setStatement(e.target.value)} rows={2} error={errors.statement} />
      <fieldset className="flex flex-col gap-2" aria-describedby={errors.options ? `${ids}-options-error` : undefined}>
        <legend className="mb-2 text-sm font-semibold text-fg">{t("optionsLabel")}</legend>
        {options.map((option, i) => (
          <TextField
            key={i}
            label={t("option", { n: i + 1 })}
            value={option}
            onChange={(e) => setOptions((all) => all.map((o, j) => (j === i ? e.target.value : o)))}
            aria-invalid={errors.options ? true : undefined}
          />
        ))}
        {errors.options && (
          <p id={`${ids}-options-error`} className="text-sm text-danger-700">
            {errors.options}
          </p>
        )}
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-fg">{t("correct")}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((_, i) => (
            <label key={i} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-4 has-checked:border-neutral-900 has-checked:bg-surface-sunken">
              <input
                type="radio"
                name={`${ids}-correct`}
                checked={correct === i}
                onChange={() => setCorrect(i)}
                className="size-5 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
              <span className="text-fg">{t("correctOption", { n: i + 1 })}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <TextArea label={t("explanation")} value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} error={errors.explanation} />
      <div className="flex flex-col gap-2 sm:w-48">
        <span id={`${ids}-difficulty`} className="text-sm font-semibold text-fg">
          {t("difficultyLabel")}
        </span>
        <Select
          labelId={`${ids}-difficulty`}
          options={[1, 2, 3].map((level) => ({ value: String(level), label: tQuiz(levelKey(level)) }))}
          value={difficulty}
          onValueChange={setDifficulty}
        />
      </div>
      {errors.form && <Alert tone="danger">{errors.form}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          {t("cancel")}
        </Button>
        <Button type="button" variant="secondary" onClick={() => save(false)} disabled={pending}>
          {t("save")}
        </Button>
        <Button type="submit" icon="check" pending={pending}>
          {t("saveApprove")}
        </Button>
      </div>
    </form>
  );
}
