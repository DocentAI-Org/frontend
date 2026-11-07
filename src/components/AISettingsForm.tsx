"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";

import { Alert } from "./Alert";
import { Button } from "./Button";
import { Select } from "./Select";

type Values = Schemas["Values"];
type Task = keyof Schemas["TaskModels"];
type Counted = Schemas["Limits"]["counted_tasks"][number];
type Choice = Schemas["ModelChoice"];
type Source = Schemas["ModelSource"];

const TASKS: Task[] = ["tutor", "feedback", "review", "questions"];
const COUNTED: Counted[] = ["tutor", "feedback", "review"];
const PERIODS: Schemas["Limits"]["period"][] = ["day", "week", "course"];
const EFFORTS = ["", "low", "medium", "high", "xhigh", "max"] as const;

const FIELD =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-muted";
const GROUP = "flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6";

export type SaveAISettings = { ok: true } | { ok: false; code: string };

type Props = { sources: Source[] } & (
  | {
      mode: "study";
      server: Schemas["StudyValues"];
      own: Schemas["StudyOverrides"];
      save: (body: Schemas["StudyOverrides"]) => Promise<SaveAISettings>;
    }
  | {
      mode: "course";
      inherited: Values;
      own: Schemas["CourseOverrides"];
      ceiling: Schemas["Ceiling"];
      save: (body: Schemas["CourseOverrides"]) => Promise<SaveAISettings>;
    }
);

const modelKey = (choice: Pick<Choice, "provider" | "model">) => `${choice.provider}::${choice.model}`;

/** A whole number from the form, or null when the field is empty. */
function number(data: FormData, name: string): number | null {
  const value = String(data.get(name) ?? "").trim();
  return value === "" ? null : Number(value);
}

/**
 * The AI settings (backend specs/019): the study's for the admin, a course's for its teacher.
 * Each group follows the inherited values (the server's, or the study's) until "Personalizar";
 * models are chosen per task. Numbers are uncontrolled and read from the form when saving.
 */
export function AISettingsForm(props: Props) {
  const t = useTranslations("common.ai");
  const tAll = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const ids = useId();
  const base: Values = props.mode === "study" ? props.server : props.inherited;
  const { own } = props;
  const [custom, setCustom] = useState({
    limits: Boolean(own.limits),
    retrieval: Boolean(own.retrieval),
    ceiling: props.mode === "study" && Boolean(props.own.ceiling)
  });
  const [limited, setLimited] = useState((own.limits ?? base.limits).messages !== null);
  const ceilingBase = props.mode === "study" ? (props.own.ceiling ?? props.server.ceiling) : props.ceiling;
  const [ceilingLimited, setCeilingLimited] = useState(ceilingBase.messages !== null);
  const [models, setModels] = useState<Record<Task, string>>(
    () => Object.fromEntries(TASKS.map((task) => [task, own.models[task] ? modelKey(own.models[task]!) : ""])) as Record<Task, string>
  );
  const [outcome, setOutcome] = useState<{ kind: "saved" | "invalid" | "failed" | "code"; code?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const inheritLabel = props.mode === "study" ? t("server") : t("study");

  const offered = props.sources.flatMap((source) =>
    source.models.map((m) => ({
      value: modelKey({ provider: source.provider, model: m.id }),
      label: [m.label ?? m.id, m.parameter_size, source.label].filter(Boolean).join(" · ")
    }))
  );
  // A saved model the source no longer lists (or that does not answer) stays selectable.
  const saved = TASKS.flatMap((task) => (own.models[task] ? [own.models[task]!] : []))
    .filter((choice) => !offered.some((o) => o.value === modelKey(choice)))
    .map((choice) => ({ value: modelKey(choice), label: `${choice.model} · ${choice.provider}` }));
  const unreachable = props.sources.filter((s) => !s.reachable);

  const taskName = (task: Task) => t(`task.${task}`);
  const limitsSentence = (limits: Schemas["Limits"]) =>
    t("limits.summary", {
      messages: limits.messages === null ? "none" : String(limits.messages),
      period: limits.period,
      tasks: limits.counted_tasks.length ? format.list(limits.counted_tasks.map(taskName)) : t("limits.noTasks")
    });

  function choiceOf(data: FormData, task: Task): Choice | null {
    const key = models[task];
    if (!key) return null;
    const [provider, ...rest] = key.split("::");
    const effort = String(data.get(`${task}.effort`) ?? "");
    return {
      provider: provider as Choice["provider"],
      model: rest.join("::"),
      temperature: provider === "anthropic" ? null : number(data, `${task}.temperature`),
      effort: effort ? (effort as Choice["effort"]) : null,
      max_tokens: number(data, `${task}.max_tokens`)
    };
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      models: Object.fromEntries(TASKS.map((task) => [task, choiceOf(data, task)])) as Schemas["TaskModels"],
      limits: custom.limits
        ? {
            messages: limited ? number(data, "limits.messages") : null,
            period: String(data.get("limits.period")) as Schemas["Limits"]["period"],
            counted_tasks: COUNTED.filter((task) => data.get(`limits.counted.${task}`) !== null)
          }
        : null,
      retrieval: custom.retrieval
        ? {
            top_k: number(data, "retrieval.top_k") ?? 0,
            min_similarity: (number(data, "retrieval.min_similarity") ?? -1) / 100,
            min_similarity_exercises: (number(data, "retrieval.min_similarity_exercises") ?? -1) / 100,
            history_messages: number(data, "retrieval.history_messages") ?? -1
          }
        : null
    };
    startTransition(async () => {
      const result =
        props.mode === "study"
          ? await props.save({
              ...body,
              ceiling: custom.ceiling ? { messages: ceilingLimited ? number(data, "ceiling.messages") : null } : null
            })
          : await props.save(body);
      if (result.ok) {
        setOutcome({ kind: "saved" });
        router.refresh();
      } else if (result.code === "validation_error") setOutcome({ kind: "invalid" });
      else if (["provider_unavailable", "provider_unreachable", "model_unavailable", "temperature_not_supported"].includes(result.code)) {
        setOutcome({ kind: "code", code: result.code });
      } else setOutcome({ kind: "failed" });
    });
  }

  function sourceRadios(group: "limits" | "retrieval" | "ceiling") {
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {([false, true] as const).map((value) => (
          <label key={String(value)} className="inline-flex min-h-11 items-center gap-2 text-fg">
            <input
              type="radio"
              name={`${group}.source`}
              checked={custom[group] === value}
              onChange={() => setCustom((c) => ({ ...c, [group]: value }))}
              className="size-6 accent-primary-600"
            />
            <span>{value ? t("custom") : inheritLabel}</span>
          </label>
        ))}
      </div>
    );
  }

  function numberField(name: string, label: string, value: number, min: number, max: number, disabled = false) {
    const id = `${ids}-${name}`;
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-fg">
          {label}
        </label>
        <input id={id} name={name} type="number" inputMode="numeric" min={min} max={max} defaultValue={String(value)} disabled={disabled} className={FIELD} />
      </div>
    );
  }

  const limits = own.limits ?? base.limits;
  const retrieval = own.retrieval ?? base.retrieval;

  return (
    <form onSubmit={submit} onChange={() => setOutcome(null)} noValidate className="flex max-w-3xl flex-col gap-6">
      <fieldset className={GROUP}>
        <legend className="px-1 text-lg font-semibold text-fg">{t("limits.legend")}</legend>
        <p className="text-sm text-fg-muted">{t("limits.help")}</p>
        {sourceRadios("limits")}
        {!custom.limits ? (
          <p className="text-fg" data-testid="limits-summary">
            {limitsSentence(base.limits)}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2" role="radiogroup" aria-label={t("limits.kind")}>
              {([false, true] as const).map((value) => (
                <label key={String(value)} className="inline-flex min-h-11 items-center gap-2 text-fg">
                  <input type="radio" name="limits.kind" checked={limited === value} onChange={() => setLimited(value)} className="size-6 accent-primary-600" />
                  <span>{value ? t("limits.some") : t("limits.none")}</span>
                </label>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {numberField("limits.messages", t("limits.messages"), limits.messages ?? 30, 1, 10000, !limited)}
              <div className="flex flex-col gap-2">
                <span id={`${ids}-period`} className="text-sm font-semibold text-fg">
                  {t("limits.period")}
                </span>
                <Select
                  name="limits.period"
                  labelId={`${ids}-period`}
                  defaultValue={limits.period}
                  options={PERIODS.map((p) => ({ value: p, label: t(`period.${p}`) }))}
                />
              </div>
            </div>
            <fieldset className="flex flex-col gap-1">
              <legend className="text-sm font-semibold text-fg">{t("limits.counted")}</legend>
              {COUNTED.map((task) => (
                <label key={task} className="inline-flex min-h-11 items-center gap-2 text-fg">
                  <input type="checkbox" name={`limits.counted.${task}`} defaultChecked={limits.counted_tasks.includes(task)} className="size-5 accent-primary-600" />
                  <span>{taskName(task)}</span>
                </label>
              ))}
            </fieldset>
          </div>
        )}
        {props.mode === "course" && props.ceiling.messages !== null && (
          <p className="text-sm text-fg-muted">{t("limits.ceilingNote", { count: props.ceiling.messages })}</p>
        )}
      </fieldset>

      {props.mode === "study" && (
        <fieldset className={GROUP}>
          <legend className="px-1 text-lg font-semibold text-fg">{t("ceiling.legend")}</legend>
          <p className="text-sm text-fg-muted">{t("ceiling.help")}</p>
          {sourceRadios("ceiling")}
          {!custom.ceiling ? (
            <p className="text-fg">
              {props.server.ceiling.messages === null ? t("ceiling.none") : t("ceiling.summary", { count: props.server.ceiling.messages })}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2" role="radiogroup" aria-label={t("ceiling.legend")}>
                {([false, true] as const).map((value) => (
                  <label key={String(value)} className="inline-flex min-h-11 items-center gap-2 text-fg">
                    <input
                      type="radio"
                      name="ceiling.kind"
                      checked={ceilingLimited === value}
                      onChange={() => setCeilingLimited(value)}
                      className="size-6 accent-primary-600"
                    />
                    <span>{value ? t("ceiling.some") : t("ceiling.noCeiling")}</span>
                  </label>
                ))}
              </div>
              {numberField("ceiling.messages", t("ceiling.messages"), ceilingBase.messages ?? 30, 1, 10000, !ceilingLimited)}
            </div>
          )}
        </fieldset>
      )}

      <fieldset className={GROUP}>
        <legend className="px-1 text-lg font-semibold text-fg">{t("models.legend")}</legend>
        <p className="text-sm text-fg-muted">{t("models.help")}</p>
        {unreachable.map((source) => (
          <Alert key={source.provider} tone="info">
            {t("models.unreachable", { source: source.label })}
          </Alert>
        ))}
        {TASKS.map((task) => {
          const inherited = base.models[task];
          const selected = models[task];
          const anthropic = selected.startsWith("anthropic::");
          const choice = own.models[task];
          const labelId = `${ids}-${task}-model`;
          return (
            <div key={task} className="flex flex-col gap-2 border-t border-border pt-4 first-of-type:border-t-0 first-of-type:pt-0" data-testid={`model-${task}`}>
              <span id={labelId} className="font-semibold text-fg">
                {taskName(task)}
              </span>
              <Select
                labelId={labelId}
                value={selected}
                onValueChange={(value) => setModels((m) => ({ ...m, [task]: value }))}
                options={[{ value: "", label: t("models.inherit", { source: inheritLabel, model: inherited.model }) }, ...offered, ...saved]}
              />
              <details className="group" key={selected}>
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-primary-700 underline-offset-4 hover:underline">
                  {t("models.advanced")}
                </summary>
                {!selected ? (
                  <p className="text-sm text-fg-muted">{t("models.advancedInherit")}</p>
                ) : (
                  <div className="grid gap-4 pt-2 sm:grid-cols-3">
                    {!anthropic && (
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`${ids}-${task}-temperature`} className="text-sm font-semibold text-fg">
                          {t("models.temperature")}
                        </label>
                        <input
                          id={`${ids}-${task}-temperature`}
                          name={`${task}.temperature`}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          min={0}
                          max={2}
                          placeholder={t("models.default")}
                          defaultValue={choice?.temperature ?? ""}
                          aria-describedby={`${ids}-${task}-temperature-help`}
                          className={FIELD}
                        />
                        <p id={`${ids}-${task}-temperature-help`} className="text-xs text-fg-muted">
                          {t("models.temperatureHelp")}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <span id={`${ids}-${task}-effort`} className="text-sm font-semibold text-fg">
                        {t("models.effort")}
                      </span>
                      <Select
                        name={`${task}.effort`}
                        labelId={`${ids}-${task}-effort`}
                        defaultValue={choice?.effort ?? ""}
                        options={EFFORTS.map((e) => ({ value: e, label: e ? t(`effort.${e}`) : t("models.default") }))}
                      />
                      <p className="text-xs text-fg-muted">{t("models.effortHelp")}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`${ids}-${task}-max_tokens`} className="text-sm font-semibold text-fg">
                        {t("models.maxTokens")}
                      </label>
                      <input
                        id={`${ids}-${task}-max_tokens`}
                        name={`${task}.max_tokens`}
                        type="number"
                        inputMode="numeric"
                        min={64}
                        max={32000}
                        placeholder={t("models.default")}
                        defaultValue={choice?.max_tokens ?? ""}
                        className={FIELD}
                      />
                      <p className="text-xs text-fg-muted">{t("models.maxTokensHelp")}</p>
                    </div>
                  </div>
                )}
              </details>
            </div>
          );
        })}
      </fieldset>

      <fieldset className={GROUP}>
        <legend className="px-1 text-lg font-semibold text-fg">{t("retrieval.legend")}</legend>
        <p className="text-sm text-fg-muted">{t("retrieval.help")}</p>
        {sourceRadios("retrieval")}
        {/* Remounted when the source changes, so the fields show the right values. */}
        <div key={String(custom.retrieval)} className="grid gap-4 sm:grid-cols-2">
          {numberField("retrieval.top_k", t("retrieval.topK"), (custom.retrieval ? retrieval : base.retrieval).top_k, 1, 10, !custom.retrieval)}
          {numberField(
            "retrieval.history_messages",
            t("retrieval.history"),
            (custom.retrieval ? retrieval : base.retrieval).history_messages,
            0,
            20,
            !custom.retrieval
          )}
          {numberField(
            "retrieval.min_similarity",
            t("retrieval.minSimilarity"),
            Math.round((custom.retrieval ? retrieval : base.retrieval).min_similarity * 100),
            0,
            100,
            !custom.retrieval
          )}
          {numberField(
            "retrieval.min_similarity_exercises",
            t("retrieval.minSimilarityExercises"),
            Math.round((custom.retrieval ? retrieval : base.retrieval).min_similarity_exercises * 100),
            0,
            100,
            !custom.retrieval
          )}
        </div>
      </fieldset>

      {outcome?.kind === "invalid" && <Alert tone="danger">{t("invalid")}</Alert>}
      {outcome?.kind === "code" && <Alert tone="danger">{tAll(errorMessageKey(outcome.code!))}</Alert>}
      {outcome?.kind === "failed" && <Alert tone="danger">{t("failed")}</Alert>}
      <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-end">
        <p role="status" className="text-sm text-success-800">
          {outcome?.kind === "saved" ? t("saved") : ""}
        </p>
        <Button type="submit" pending={pending} pendingLabel={t("saving")} className="w-full sm:w-auto">
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
