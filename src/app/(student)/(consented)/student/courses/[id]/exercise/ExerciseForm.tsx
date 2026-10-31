"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { errorMessageKey } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

import { submitAction } from "./actions";

const FIELD =
  "w-full rounded-lg border border-border-strong bg-surface-raised px-4 py-2 text-base text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-sunken aria-invalid:border-danger-600";

/** Submit a worked exercise (#11, 001 US6 AS1, AS5, AS6): write, review, send. */
export function ExerciseForm({
  courseId,
  limit,
  resetsAt,
  initialProblem = ""
}: {
  courseId: string;
  limit: number;
  resetsAt: string | null;
  /** A practice statement from a mistake review (spec 007 US2 AS3). */
  initialProblem?: string;
}) {
  const t = useTranslations("student");
  const tAll = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const ids = useId();
  const problemRef = useRef<HTMLTextAreaElement>(null);
  const stepsRef = useRef<HTMLTextAreaElement>(null);
  // Kept after "Editar" so nothing typed is lost; `reviewing` switches to the review step.
  const [values, setValues] = useState({ problem: initialProblem, steps: "" });
  const [reviewing, setReviewing] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reached, setReached] = useState<string | null>(resetsAt);
  const [pending, startTransition] = useTransition();

  if (reached) {
    return (
      <div className="flex flex-col gap-6">
        <section aria-labelledby={`${ids}-limit`} className="rounded-xl border border-warning-300 bg-warning-50 p-4" data-component="LimitReachedBanner" data-variant="exercise">
          <div className="flex gap-4">
            <Icon name="clock" className="mt-1 size-6 shrink-0 text-warning-800" />
            <div>
              <h2 id={`${ids}-limit`} className="font-semibold text-fg tabular-nums">
                {t("chat.limit.title", { limit })}
              </h2>
              <p className="mt-1 text-fg">
                {t("chat.limit.exerciseBody", { time: format.dateTime(new Date(reached), { timeStyle: "short" }) })}
              </p>
            </div>
          </div>
        </section>
        <Fields ids={ids} disabled defaults={values} problemRef={problemRef} stepsRef={stepsRef} invalid={false} />
      </div>
    );
  }

  if (reviewing) {
    return (
      <section aria-labelledby={`${ids}-review`} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
        <div>
          <h2 id={`${ids}-review`} className="text-xl font-semibold text-fg">
            {t("exercise.reviewTitle")}
          </h2>
          <p className="text-fg-muted">{t("exercise.reviewLead")}</p>
        </div>
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-sm font-semibold text-fg-muted">{t("exercise.problem")}</dt>
            <dd className="font-serif text-lg text-fg">{values.problem}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-fg-muted">{t("exercise.steps")}</dt>
            <dd className="font-serif whitespace-pre-line text-fg">{values.steps}</dd>
          </div>
        </dl>
        {error && (
          <Alert tone="danger">
            {tAll(errorMessageKey(error))}
            {error === "disclosure_not_acknowledged" && (
              <a href={routes.studentCourse(courseId)} className="ml-1 underline">
                {t("feedback.askTutor")}
              </a>
            )}
          </Alert>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" icon="chevron-left" onClick={() => setReviewing(false)}>
            {t("exercise.edit")}
          </Button>
          <Button
            type="button"
            icon="send"
            pending={pending}
            pendingLabel={t("exercise.checking")}
            onClick={() =>
              startTransition(async () => {
                const result = await submitAction(courseId, values.problem, values.steps);
                if (result.code === "daily_limit_reached") setReached(result.resetsAt ?? new Date().toISOString());
                else if (result.code === "consent_required") router.push("/student/consent");
                else setError(result.code);
              })
            }
          >
            {t("exercise.send")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const problem = problemRef.current?.value.trim() ?? "";
        const steps = stepsRef.current?.value.trim() ?? "";
        if (!problem || !steps) return setEmpty(true);
        setEmpty(false);
        setValues({ problem, steps });
        setReviewing(true);
      }}
    >
      {empty && <Alert tone="danger">{t("exercise.emptyError")}</Alert>}
      <Fields ids={ids} defaults={values} problemRef={problemRef} stepsRef={stepsRef} invalid={empty} />
      <Button type="submit" icon="eye" className="self-end">
        {t("exercise.review")}
      </Button>
    </form>
  );

}

type FieldsProps = {
  ids: string;
  disabled?: boolean;
  invalid: boolean;
  defaults: { problem: string; steps: string };
  problemRef: React.RefObject<HTMLTextAreaElement | null>;
  stepsRef: React.RefObject<HTMLTextAreaElement | null>;
};

function Fields({ ids, disabled = false, invalid, defaults, problemRef, stepsRef }: FieldsProps) {
  const t = useTranslations("student.exercise");
  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-problem`} className="text-sm font-semibold text-fg">
          {t("problem")}
        </label>
        <textarea
          ref={problemRef}
          id={`${ids}-problem`}
          rows={2}
          maxLength={2000}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          defaultValue={defaults.problem}
          placeholder={t("problemPlaceholder")}
          className={FIELD}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-steps`} className="text-sm font-semibold text-fg">
          {t("steps")}
        </label>
        <p id={`${ids}-steps-help`} className="text-sm text-fg-muted">
          {t("stepsHelp")}
        </p>
        <textarea
          ref={stepsRef}
          id={`${ids}-steps`}
          rows={6}
          maxLength={4000}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={`${ids}-steps-help`}
          defaultValue={defaults.steps}
          className={`${FIELD} font-mono`}
        />
      </div>
    </>
  );
}
