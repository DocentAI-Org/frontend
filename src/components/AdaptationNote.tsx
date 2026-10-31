import { useTranslations } from "next-intl";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";

/**
 * Why an answer or feedback was adapted, in one sentence built from the data, not by the model
 * (014, requirement S8 and §4.7). The student and the teacher read the same basis.
 */
export function AdaptationNote({
  adaptation,
  typeName,
  audience
}: {
  adaptation: Schemas["Adaptation"];
  typeName: string;
  audience: "student" | "teacher";
}) {
  const t = useTranslations("common.adaptation");
  return (
    <p className="mt-2 flex items-start gap-2 text-sm text-fg-muted" data-component="AdaptationNote">
      <Icon name="sparkles" className="mt-0.5 size-4 shrink-0 text-info-700" />
      <span>{t(audience, { count: adaptation.count, type: typeName, days: adaptation.window_days })}</span>
    </p>
  );
}
