"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import type { Schemas } from "@/lib/api/client";

import { saveSettingsAction } from "./actions";

type Values = Schemas["TutorSettingsUpdate"];

const GROUPS = [
  { name: "level", legend: "level.legend", options: ["basic", "intermediate", "advanced"] },
  { name: "tone", legend: "tone.legend", options: ["friendly", "neutral", "formal"] },
  { name: "solution_policy", legend: "policy.legend", options: ["direct", "hints_first", "hints_only"] }
] as const;

const OPTION_KEYS: Record<string, string> = {
  basic: "level.basic",
  intermediate: "level.intermediate",
  advanced: "level.advanced",
  friendly: "tone.friendly",
  neutral: "tone.neutral",
  formal: "tone.formal",
  direct: "policy.direct",
  hints_first: "policy.hintsFirst",
  hints_only: "policy.hintsOnly"
};

/** Tutor settings (#19, 001 US3): defaults, example, unsaved-changes guard, retry on failure. */
export function SettingsForm({ courseId, initial }: { courseId: string; initial: Schemas["TutorSettings"] }) {
  const t = useTranslations("teacher.tutorSettings");
  const format = useFormatter();
  const router = useRouter();
  const [saved, setSaved] = useState<Values>({ level: initial.level, tone: initial.tone, solution_policy: initial.solution_policy });
  const [values, setValues] = useState<Values>(saved);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  // Warns before closing the tab and before following an in-app link (001 US3 AS3).
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTo(link.getAttribute("href"));
      dialog.current?.showModal();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  function save() {
    startTransition(async () => {
      const result = await saveSettingsAction(courseId, values);
      if (result.ok) {
        setSaved(values);
        setSavedAt(result.updatedAt);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });
  }

  const policy = values.solution_policy;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,24rem)]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        {GROUPS.map((group) => (
          <fieldset key={group.name} className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
            <legend className="px-1 text-lg font-semibold text-fg">{t(group.legend)}</legend>
            {group.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-start gap-4 rounded-lg p-2 hover:bg-surface-sunken has-checked:bg-surface-sunken">
                <input
                  type="radio"
                  name={group.name}
                  value={option}
                  checked={values[group.name] === option}
                  onChange={() => setValues((current) => ({ ...current, [group.name]: option }))}
                  className="mt-1 size-5 shrink-0 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  aria-describedby={`${group.name}-${option}-help`}
                />
                <span className="flex flex-col">
                  <span className="font-medium text-fg">{t(OPTION_KEYS[option])}</span>
                  <span id={`${group.name}-${option}-help`} className="text-sm text-fg-muted">
                    {t(`${OPTION_KEYS[option]}Help`)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        ))}
        {failed && <Alert tone="danger">{t("saveFailed")}</Alert>}
        <div className="flex flex-wrap items-center justify-end gap-4">
          {dirty ? (
            <p className="text-sm text-warning-900">{t("unsaved")}</p>
          ) : (
            savedAt && (
              <p role="status" className="text-sm text-success-800">
                {t("saved", { date: format.dateTime(new Date(savedAt), { dateStyle: "medium", timeStyle: "short" }) })}
              </p>
            )
          )}
          <Button type="submit" icon="check" pending={pending}>
            {t("save")}
          </Button>
        </div>
      </form>

      <aside aria-labelledby="preview-title" className="flex flex-col gap-4 self-start rounded-xl border border-border bg-surface p-4 sm:p-6">
        <h2 id="preview-title" className="text-lg font-semibold text-fg">
          {t("preview.title")}
        </h2>
        <p className="text-sm text-fg-muted">
          {policy === "direct" ? t("preview.leadDirect") : policy === "hints_first" ? t("preview.leadHintsFirst") : t("preview.lead")}
        </p>
        <p className="ml-auto max-w-xs rounded-r-md border-l-4 border-primary-600 bg-surface-raised px-4 py-2 text-sm text-fg shadow-sm">
          <span className="sr-only">{t("preview.student")}: </span>
          {t("preview.question")}
        </p>
        {policy === "direct" ? (
          <p className="font-serif text-fg">{t("preview.direct")}</p>
        ) : (
          <div className="flex flex-col gap-2 font-serif text-fg">
            <p>{t("preview.hint1")}</p>
            <p>{t("preview.hint2")}</p>
          </div>
        )}
        <p className="text-sm text-fg-muted">
          {policy === "direct" ? t("preview.noteDirect") : policy === "hints_first" ? t("preview.noteHintsFirst") : t("preview.note")}
        </p>
      </aside>

      <dialog
        ref={dialog}
        aria-labelledby="leave-title"
        className="m-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id="leave-title" className="text-xl font-semibold text-fg">
            {t("leaveTitle")}
          </h2>
          <p className="text-fg-muted">{t("leaveBody")}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              {t("keepEditing")}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                dialog.current?.close();
                setSaved(values);
                if (leaveTo) router.push(leaveTo as Parameters<typeof router.push>[0]);
              }}
            >
              {t("leave")}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
