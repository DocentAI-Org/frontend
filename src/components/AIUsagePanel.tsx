import { getFormatter, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

/** The course's AI usage (backend specs/019): per task for 7 and 30 days, and who used most. */
export async function AIUsagePanel({ usage }: { usage: Schemas["AIUsage"] }) {
  const t = await getTranslations("common.ai");
  const format = await getFormatter();
  const money = (value: number) => format.number(value, { style: "currency", currency: "USD", maximumFractionDigits: 4 });
  return (
    <section aria-labelledby="ai-usage" className="flex max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
      <h2 id="ai-usage" className="text-xl font-semibold text-fg">
        {t("usage.title")}
      </h2>
      <p className="text-sm text-fg-muted">{t("usage.help")}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{t("usage.caption")}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="pb-2 pr-4 text-left font-semibold text-fg-muted">
                {t("usage.task")}
              </th>
              {usage.windows.map((window) => (
                <th key={window.days} scope="col" className="pb-2 pr-4 text-right font-semibold text-fg-muted">
                  {t("usage.lastDays", { days: window.days })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usage.windows[0].tasks.map((row, index) => (
              <tr key={row.task} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-2 pr-4 text-left font-semibold text-fg">
                  {t(`task.${row.task}`)}
                </th>
                {usage.windows.map((window) => {
                  const cell = window.tasks[index];
                  return (
                    <td key={window.days} className="py-2 pr-4 text-right text-fg tabular-nums">
                      {t("usage.cell", { messages: cell.messages, cost: money(cell.estimated_cost_usd) })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="font-semibold text-fg">
          {usage.limit === null ? t("usage.topNoLimit", { period: usage.period }) : t("usage.top", { period: usage.period, limit: usage.limit })}
        </h3>
        {usage.top_students.length ? (
          <ol className="mt-2 flex list-inside list-decimal flex-col gap-1 text-fg">
            {usage.top_students.map((student) => (
              <li key={student.student_id} className="tabular-nums">
                {t("usage.student", { name: student.display_name, used: student.used })}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-fg-muted">{t("usage.noStudents")}</p>
        )}
      </div>
    </section>
  );
}
