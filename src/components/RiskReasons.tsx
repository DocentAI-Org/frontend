import { getFormatter, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";

type Reason = Schemas["StudentRisk"]["reasons"][number];

/** Why a student is flagged, one plain sentence per reason, from the API's values (006 FR-002). */
export async function RiskReasons({ reasons }: { reasons: Reason[] }) {
  const t = await getTranslations("teacher.dashboard.reason");
  const format = await getFormatter();
  const sentence = (reason: Reason) => {
    if (reason.criterion === "error_rate") {
      return t("errorRate", { mistakes: reason.mistakes, assessed: reason.assessed, days: reason.window_days });
    }
    if (reason.never_active) return t("inactiveNever", { days: reason.days_inactive });
    return t("inactive", {
      days: reason.days_inactive,
      date: format.dateTime(new Date(reason.since), { day: "numeric", month: "long" })
    });
  };
  return (
    <ul className="flex flex-col gap-1">
      {reasons.map((reason) => (
        <li key={reason.criterion} className="flex items-start gap-2 text-fg">
          <Icon name={reason.criterion === "inactive" ? "clock" : "triangle-alert"} className="mt-1 size-4 shrink-0 text-fg-muted" />
          <span>{sentence(reason)}</span>
        </li>
      ))}
    </ul>
  );
}
