import type { Schemas } from "@/lib/api/client";

type Allowance = Schemas["Allowance"];

/** Which wording applies (backend specs/019): the daily ceiling, or the course's period. */
export function allowanceKind(allowance: Allowance): "daily" | Allowance["period"] {
  return allowance.scope === "daily" ? "daily" : allowance.period;
}

/** The allowance once a message was refused with a 429, or null for any other error. */
export function reachedAllowance(current: Allowance, code: string, details: Record<string, unknown>): Allowance | null {
  if (code !== "daily_limit_reached" && code !== "course_limit_reached") return null;
  const scope = code === "daily_limit_reached" ? "daily" : "course";
  const period = scope === "daily" ? "day" : ((details.period as Allowance["period"] | undefined) ?? current.period);
  // The number is only known when the limit that refused is the one already shown.
  const limit = scope === current.scope && period === current.period ? current.limit : null;
  const resets_at = typeof details.resets_at === "string" ? details.resets_at : null;
  return { scope, period, limit, used: limit ?? current.used, remaining: 0, resets_at };
}
