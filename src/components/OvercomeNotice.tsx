import { getLocale, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";
import { errorTypeLabel } from "./LearningRecord";

/**
 * The repeated mistakes this correct exercise overcame (022, backend specs/022), with their basis;
 * the student reads it in the feedback and the teacher in their view of the exercise (023).
 */
export async function OvercomeNotice({
  overcome,
  taxonomy,
  audience
}: {
  overcome: Schemas["OvercomePattern"][];
  taxonomy: Schemas["ErrorTaxonomy"] | null;
  audience: "student" | "teacher";
}) {
  const t = await getTranslations("common.overcome");
  const locale = await getLocale();
  if (overcome.length === 0) return null;
  return (
    <section
      aria-labelledby="overcome-title"
      className="flex items-start gap-4 rounded-xl border border-success-300 bg-success-50 p-6"
      data-component="OvercomeNotice"
      data-variant={audience}
    >
      <Icon name="check" className="mt-1 size-6 shrink-0 text-success-800" />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id="overcome-title" className="text-lg font-semibold text-fg">
          {t(`title.${audience}`)}
        </h2>
        {overcome.map((o) => (
          <p key={o.error_type} className="text-fg tabular-nums">
            {t(`${audience}${o.topic_name ? "" : "NoTopic"}`, {
              correct: o.correct,
              count: o.count,
              type: errorTypeLabel(taxonomy, o.error_type, locale),
              topic: o.topic_name ?? ""
            })}
          </p>
        ))}
        <p className="text-sm text-fg-muted">{t("provisional")}</p>
      </div>
    </section>
  );
}
