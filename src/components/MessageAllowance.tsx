import { getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";

/** Remaining daily messages, shared across courses (001 FR-014): normal, low (≤ 5) or reached. */
export async function MessageAllowance({ allowance }: { allowance: Schemas["Allowance"] }) {
  const t = await getTranslations("student.chat");
  const variant = allowance.remaining === 0 ? "reached" : allowance.remaining <= 5 ? "low" : "normal";
  const tone = variant === "normal" ? "text-fg-muted" : variant === "low" ? "text-warning-900" : "text-danger-700";
  return (
    <p className={`inline-flex items-center gap-2 text-sm ${tone}`} data-component="MessageAllowance" data-variant={variant}>
      <Icon name="message-circle" />
      <span className="tabular-nums">{t("remaining", { count: allowance.remaining })}</span>
    </p>
  );
}
