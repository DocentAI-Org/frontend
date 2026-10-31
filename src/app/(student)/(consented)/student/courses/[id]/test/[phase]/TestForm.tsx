"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";
import type { TestPhase } from "@/lib/api/course-tests";

import { submitTestAction } from "./actions";

/**
 * Every question on one page, no hints (010 US3 AS2–AS3). Sending asks for confirmation, as the
 * answers cannot change; afterwards only a thank-you, never a score.
 */
export function TestForm({
  courseId,
  phase,
  phaseName,
  questions
}: {
  courseId: string;
  phase: TestPhase;
  phaseName: string;
  questions: Schemas["StudentTestQuestion"][];
}) {
  const t = useTranslations("student.test");
  const tAll = useTranslations();
  const router = useRouter();
  const ids = useId();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const confirmRef = useRef<HTMLDivElement>(null);
  const missing = questions.filter((q) => choices[q.id] === undefined).length;

  if (sent) {
    return (
      <section aria-labelledby={`${ids}-thanks`} className="flex flex-col gap-2 rounded-xl border border-success-300 bg-success-50 p-6">
        <h2 id={`${ids}-thanks`} className="flex items-center gap-2 text-xl font-semibold text-success-800">
          <Icon name="check" className="size-5 shrink-0" />
          {t("thanksTitle")}
        </h2>
        <p className="text-fg">{t("thanks", { phase: phaseName })}</p>
      </section>
    );
  }

  const send = () =>
    startTransition(async () => {
      const outcome = await submitTestAction(
        courseId,
        phase,
        questions.map((q) => ({ question_id: q.id, choice: choices[q.id] }))
      );
      if (outcome.ok) setSent(true);
      else if (outcome.code === "consent_required") router.push("/student/consent");
      else {
        setError(outcome.code);
        setConfirming(false);
      }
    });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (missing === 0) {
          setConfirming(true);
          requestAnimationFrame(() => confirmRef.current?.focus());
        }
      }}
    >
      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <li key={question.id} className="rounded-xl border border-border bg-surface-raised p-6">
            <fieldset className="flex flex-col gap-2" disabled={confirming || pending}>
              <legend className="mb-4 font-serif text-xl font-semibold text-fg">
                <span className="sr-only">{index + 1}. </span>
                {question.statement}
              </legend>
              {question.options.map((option, i) => (
                <label
                  key={i}
                  className="flex min-h-11 cursor-pointer items-center gap-4 rounded-lg border border-border-strong bg-surface-raised p-4 hover:bg-surface-sunken has-checked:border-neutral-900 has-checked:bg-surface-sunken has-checked:ring-1 has-checked:ring-neutral-900"
                >
                  <input
                    type="radio"
                    name={`${ids}-${question.id}`}
                    checked={choices[question.id] === i}
                    onChange={() => setChoices((all) => ({ ...all, [question.id]: i }))}
                    className="size-5 shrink-0 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  <span className="text-fg">{option}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>
      {error && <Alert tone="danger">{tAll(errorMessageKey(error))}</Alert>}
      {confirming ? (
        <div ref={confirmRef} tabIndex={-1} role="group" aria-labelledby={`${ids}-confirm`} className="flex flex-col gap-4 rounded-xl border border-warning-300 bg-warning-50 p-6 outline-none">
          <div>
            <h2 id={`${ids}-confirm`} className="text-lg font-semibold text-fg">
              {t("confirmTitle")}
            </h2>
            <p className="text-fg">{t("confirmBody")}</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
              {t("back")}
            </Button>
            <Button type="button" icon="send" onClick={send} pending={pending}>
              {t("confirm")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end gap-2">
          {missing > 0 && <p className="text-sm text-fg-muted tabular-nums">{t("pending", { count: missing })}</p>}
          <Button type="submit" icon="send" disabled={missing > 0}>
            {t("send")}
          </Button>
        </div>
      )}
    </form>
  );
}
