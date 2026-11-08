import type { ReactNode } from "react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";
import { errorTypeLabel } from "./LearningRecord";

type Step = Schemas["NextSteps"]["steps"][number];
type Taxonomy = Schemas["ErrorTaxonomy"];

const ICON: Record<Step["kind"], string> = {
  test: "file-text",
  resume_quiz: "refresh-cw",
  review_mistake: "lightbulb",
  practice_topic: "chart-column",
  start_topic: "book-open"
};

/**
 * Recommended next steps (020, backend specs/020): each with its basis in one sentence built from
 * the data (§4.7). The teacher reads the same steps, worded for them; only the student gets actions.
 */
export async function NextStepsList({
  nextSteps,
  taxonomy,
  audience,
  action,
  headingLevel = 2
}: {
  nextSteps: Schemas["NextSteps"];
  taxonomy: Taxonomy | null;
  audience: "student" | "teacher";
  action?: (step: Step) => ReactNode;
  headingLevel?: 2 | 3;
}) {
  const t = await getTranslations(audience === "student" ? "student.nextSteps" : "teacher.student.nextSteps");
  const tc = await getTranslations("common.nextSteps");
  const ts = await getTranslations("student.nextSteps");
  const Heading = `h${headingLevel}` as const;
  const titleId = `next-steps-title-${audience}`;
  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-xl border border-primary-200 bg-primary-50 p-6"
      data-component="NextSteps"
    >
      <div className="flex flex-col gap-1">
        <Heading id={titleId} className="text-lg font-semibold text-fg">
          {t("title")}
        </Heading>
        <p className="text-fg-muted">{t("lead")}</p>
      </div>
      {nextSteps.steps.length === 0 ? (
        <p className="text-fg">{t("none")}</p>
      ) : (
        <ol aria-label={ts("listLabel")} className="flex flex-col gap-3">
          {nextSteps.steps.map((step, i) => (
            <StepItem key={`${step.kind}-${i}`} step={step} taxonomy={taxonomy} audience={audience} action={action?.(step)} />
          ))}
        </ol>
      )}
      {nextSteps.provisional && nextSteps.steps.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          <span>{tc("provisional")}</span>
        </p>
      )}
    </section>
  );
}

async function StepItem({
  step,
  taxonomy,
  audience,
  action
}: {
  step: Step;
  taxonomy: Taxonomy | null;
  audience: "student" | "teacher";
  action: ReactNode;
}) {
  const t = await getTranslations(audience === "student" ? "student.nextSteps" : "teacher.student.nextSteps");
  const tc = await getTranslations("common.nextSteps");
  const format = await getFormatter();
  const locale = await getLocale();
  const who = audience === "student" ? "Student" : "Teacher";

  let title: string;
  let reason: string;
  let extra: string | null = null;
  switch (step.kind) {
    case "test":
      title = t("test", { phase: tc(`phase.${step.phase}`) });
      reason = tc(`test.${audience}`);
      break;
    case "resume_quiz":
      title = step.topic_name ? t("resumeTopic", { topic: step.topic_name }) : t("resume");
      reason = tc(`resume.${audience}`, { answered: step.answered, total: step.total });
      break;
    case "review_mistake": {
      const values = {
        count: step.count,
        days: step.window_days,
        type: errorTypeLabel(taxonomy, step.error_type, locale),
        topic: step.topic_name ?? ""
      };
      title = t("review");
      reason = tc(`review.${audience}${step.topic_name ? "" : "NoTopic"}`, values);
      if (audience === "teacher" && step.reviewed) extra = tc("review.reviewed");
      break;
    }
    case "practice_topic":
      title = t("practice", { topic: step.topic_name });
      reason = tc(`practice.${audience}`, {
        score: format.number(step.score, { style: "percent", maximumFractionDigits: 0 }),
        count: step.items
      });
      break;
    case "start_topic":
      title = t("start", { topic: step.topic_name });
      reason =
        step.level === "not_started"
          ? tc(`start.notStarted${who}`)
          : tc(`start.insufficient${who}`, { items: step.items, min: step.min_items });
      break;
  }

  return (
    <li
      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-surface-raised p-4"
      data-component="NextStep"
      data-variant={step.kind}
    >
      <Icon name={ICON[step.kind]} className="size-6 shrink-0 text-primary-700" />
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <p className="font-semibold text-fg">{title}</p>
        <p className="text-fg-muted tabular-nums">{reason}</p>
        {extra && <p className="text-sm text-fg-muted">{extra}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </li>
  );
}
