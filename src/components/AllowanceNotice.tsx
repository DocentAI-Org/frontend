"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId } from "react";

import type { Schemas } from "@/lib/api/client";
import { allowanceKind } from "@/lib/allowance";

import { Icon } from "./Icon";

type Allowance = Schemas["Allowance"];

function useWhen(allowance: Allowance) {
  const format = useFormatter();
  const at = allowance.resets_at ? new Date(allowance.resets_at) : null;
  return {
    time: at ? format.dateTime(at, { timeStyle: "short" }) : "",
    date: at ? format.dateTime(at, { weekday: "long", day: "numeric", month: "long" }) : ""
  };
}

/** Messages left in the course or today (backend specs/019); nothing when there is no limit. */
export function AllowanceLine({ allowance }: { allowance: Allowance }) {
  const t = useTranslations("student.allowance");
  const when = useWhen(allowance);
  if (allowance.remaining === null) return null;
  const kind = allowanceKind(allowance);
  const low = allowance.remaining <= 5;
  return (
    <p className={`inline-flex items-center gap-2 text-sm ${low ? "text-warning-900" : "text-fg-muted"}`} data-component="MessageAllowance" data-variant={low ? "low" : "normal"}>
      <Icon name="message-circle" />
      <span className="tabular-nums">
        {t(`remaining.${kind}`, { count: allowance.remaining })}
        {low && allowance.period !== "course" && <> {t(`renews.${allowance.period}`, when)}</>}
      </span>
    </p>
  );
}

/** The limit is reached: what was used up and when the student can write again. */
export function LimitReachedBanner({ allowance, variant }: { allowance: Allowance; variant: "chat" | "exercise" }) {
  const t = useTranslations("student.allowance");
  const ids = useId();
  const when = useWhen(allowance);
  const kind = allowanceKind(allowance);
  return (
    <section aria-labelledby={`${ids}-limit`} className="rounded-xl border border-warning-300 bg-warning-50 p-4" data-component="LimitReachedBanner" data-variant={variant}>
      <div className="flex gap-4">
        <Icon name="clock" className="mt-1 size-6 shrink-0 text-warning-800" />
        <div className="min-w-0 flex-1">
          <h2 id={`${ids}-limit`} className="font-semibold text-fg tabular-nums">
            {allowance.limit === null ? t(`titleAll.${kind}`) : t(`title.${kind}`, { limit: allowance.limit })}
          </h2>
          <p className="mt-1 text-fg">{t(`${variant}Body.${allowance.resets_at ? allowance.period : "course"}`, when)}</p>
        </div>
      </div>
    </section>
  );
}
