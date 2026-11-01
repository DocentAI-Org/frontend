"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import type { Schemas } from "@/lib/api/client";

import { Alert } from "./Alert";
import { Button } from "./Button";

type Criteria = Schemas["Criteria"];
type Group = keyof Criteria;
type Field = { key: string; kind: "bool" | "int" | "percent"; label: string };

const GROUPS: Group[] = ["inactive", "error_rate", "repeated_mistakes", "adaptation", "mastery"];
const FIELDS: Record<Group, Field[]> = {
  inactive: [
    { key: "enabled", kind: "bool", label: "inactiveEnabled" },
    { key: "days", kind: "int", label: "inactiveDays" }
  ],
  error_rate: [
    { key: "enabled", kind: "bool", label: "errorRateEnabled" },
    { key: "rate", kind: "percent", label: "errorRate" },
    { key: "min_exercises", kind: "int", label: "minExercises" },
    { key: "window_days", kind: "int", label: "windowDays" }
  ],
  repeated_mistakes: [
    { key: "count", kind: "int", label: "repeatedCount" },
    { key: "window_days", kind: "int", label: "windowDays" }
  ],
  adaptation: [{ key: "enabled", kind: "bool", label: "adaptationEnabled" }],
  mastery: [
    { key: "window", kind: "int", label: "masteryWindow" },
    { key: "min_items", kind: "int", label: "masteryMinItems" },
    { key: "progressing", kind: "percent", label: "progressing" },
    { key: "mastered", kind: "percent", label: "mastered" }
  ]
};

export type SaveCriteria = { ok: true } | { ok: false; code: string };

type Draft = Record<Group, Record<string, string | boolean>>;

/** Fractions become whole percentages for people (015 FR-001). */
function toDraft(criteria: Criteria): Draft {
  return Object.fromEntries(
    GROUPS.map((group) => [
      group,
      Object.fromEntries(
        FIELDS[group].map((f) => {
          const value = (criteria[group] as Record<string, number | boolean>)[f.key];
          if (f.kind === "bool") return [f.key, Boolean(value)];
          return [f.key, String(f.kind === "percent" ? Math.round(Number(value) * 100) : value)];
        })
      )
    ])
  ) as Draft;
}

/** A group's values as typed in the form; whole percentages become fractions again. */
function fromForm<G extends Group>(data: FormData, group: G): Criteria[G] {
  return Object.fromEntries(
    FIELDS[group].map((f) => {
      const value = data.get(`${group}.${f.key}`);
      if (f.kind === "bool") return [f.key, value !== null];
      return [f.key, f.kind === "percent" ? Number(value) / 100 : Number(value)];
    })
  ) as Criteria[G];
}

/**
 * The pedagogical criteria (spec 015): the study's defaults for the admin, or a course's own
 * groups for its teacher, who may follow the study's values for any group. The fields are
 * uncontrolled and read from the form when saving, so what is typed before hydration (slow
 * phones) is kept.
 */
export function CriteriaForm(
  props:
    | { mode: "study"; initial: Criteria; provisional: boolean; save: (body: Schemas["StudyCriteriaUpdate"]) => Promise<SaveCriteria> }
    | {
        mode: "course";
        study: Criteria;
        initial: Criteria;
        custom: Partial<Record<string, boolean>>;
        save: (body: Schemas["CourseCriteriaUpdate"]) => Promise<SaveCriteria>;
      }
) {
  const t = useTranslations("common.criteria");
  const router = useRouter();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const initial = toDraft(props.initial);
  const [own, setOwn] = useState<Record<Group, boolean>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g, props.mode === "study" || Boolean(props.custom[g])])) as Record<Group, boolean>
  );
  const [outcome, setOutcome] = useState<"saved" | "invalid" | "failed" | null>(null);
  const [pending, startTransition] = useTransition();
  const studyDraft = props.mode === "course" ? toDraft(props.study) : initial;

  // Picks up a "Personalizar" chosen before hydration.
  useEffect(() => {
    const data = formRef.current && new FormData(formRef.current);
    if (!data || props.mode !== "course") return;
    setOwn((o) => Object.fromEntries(GROUPS.map((g) => [g, data.get(`${g}.source`) ? data.get(`${g}.source`) === "custom" : o[g]])) as Record<Group, boolean>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result =
        props.mode === "study"
          ? await props.save({
              criteria: Object.fromEntries(GROUPS.map((g) => [g, fromForm(data, g)])) as Criteria,
              provisional: data.get("provisional") !== null
            })
          : await props.save(
              Object.fromEntries(GROUPS.map((g) => [g, own[g] ? fromForm(data, g) : null])) as Schemas["CourseCriteriaUpdate"]
            );
      setOutcome(result.ok ? "saved" : result.code === "validation_error" ? "invalid" : "failed");
      if (result.ok) router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} onChange={() => setOutcome(null)} noValidate className="flex max-w-3xl flex-col gap-6">
      {GROUPS.map((group) => {
        const editable = own[group];
        const shown = editable ? initial : studyDraft;
        return (
          <fieldset key={group} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
            <legend className="px-1 text-lg font-semibold text-fg">{t(`${group}.legend`)}</legend>
            <p className="text-sm text-fg-muted">{t(`${group}.help`)}</p>
            {props.mode === "course" && (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {([false, true] as const).map((custom) => (
                  <label key={String(custom)} className="inline-flex min-h-11 items-center gap-2 text-fg">
                    <input
                      type="radio"
                      name={`${group}.source`}
                      value={custom ? "custom" : "study"}
                      checked={own[group] === custom}
                      onChange={() => setOwn((o) => ({ ...o, [group]: custom }))}
                      className="size-5 accent-primary-600"
                    />
                    <span>{custom ? t("custom") : t("study")}</span>
                  </label>
                ))}
              </div>
            )}
            {/* Remounted when the source changes, so the fields show the right values. */}
            <div key={String(editable)} className="grid gap-4 sm:grid-cols-2">
              {FIELDS[group].map((field) => {
                const id = `${ids}-${group}-${field.key}`;
                const value = shown[group][field.key];
                return field.kind === "bool" ? (
                  <label key={field.key} htmlFor={id} className="inline-flex min-h-11 items-center gap-2 text-fg sm:col-span-2">
                    <input
                      id={id}
                      name={`${group}.${field.key}`}
                      type="checkbox"
                      defaultChecked={value === true}
                      disabled={!editable}
                      className="size-5 accent-primary-600"
                    />
                    <span>{t(`field.${field.label}`)}</span>
                  </label>
                ) : (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label htmlFor={id} className="text-sm font-semibold text-fg">
                      {t(`field.${field.label}`)}
                    </label>
                    <input
                      id={id}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={field.kind === "percent" ? 100 : 365}
                      name={`${group}.${field.key}`}
                      defaultValue={String(value)}
                      disabled={!editable}
                      className="min-h-11 w-full rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-muted"
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      {props.mode === "study" && (
        <label className="inline-flex min-h-11 items-start gap-2 text-fg">
          <input
            type="checkbox"
            name="provisional"
            defaultChecked={props.provisional}
            className="mt-1 size-5 accent-primary-600"
          />
          <span>{t("provisional")}</span>
        </label>
      )}
      {outcome === "invalid" && <Alert tone="danger">{t("invalid")}</Alert>}
      {outcome === "failed" && <Alert tone="danger">{t("failed")}</Alert>}
      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-end">
        <p role="status" className="text-sm text-success-800">
          {outcome === "saved" ? t("saved") : ""}
        </p>
        <Button type="submit" pending={pending} pendingLabel={t("saving")} className="w-full sm:w-auto">
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
