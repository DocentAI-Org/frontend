import type { Metadata, Route } from "next";
import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { errorTypeLabel } from "@/components/LearningRecord";
import { RiskReasons } from "@/components/RiskReasons";
import { PERIODS, type Period, getDashboard } from "@/lib/api/dashboard";
import { getErrorTypes } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.dashboard");
  return { title: t("pageTitle") };
}

type View = "topic" | "student";

const LINK =
  "inline-flex min-h-11 items-center rounded-sm font-medium text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/** Links that set one search parameter, the current one marked with aria-current (a segmented control). */
function Segmented({ label, options }: { label: string; options: { href: Route; label: string; current: boolean }[] }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-border-strong bg-surface-raised p-1">
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          aria-current={option.current ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${option.current ? "bg-neutral-900 text-fg-inverse" : "text-fg-muted hover:text-fg"}`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

/** A count with a decorative bar for its share of the largest one; the number is the data (006 FR-004). */
function Count({ value, max }: { value: number; max: number }) {
  return (
    <span className="flex items-center gap-3">
      <span className="w-8 text-right tabular-nums">{value}</span>
      <span aria-hidden="true" className="hidden h-2 w-24 overflow-hidden rounded-full bg-surface-sunken sm:block">
        <span className="block h-full rounded-full bg-fg-muted" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      </span>
    </span>
  );
}

const TH = "pb-2 pr-4 text-left text-sm font-semibold text-fg-muted";
const TD = "py-3 pr-4 text-fg";

/** Course dashboard (#F12, spec 006): recurring errors by topic or student, and who may need help. */
export default async function DashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; view?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const period: Period = PERIODS.includes(query.period as Period) ? (query.period as Period) : "30d";
  const view: View = query.view === "student" ? "student" : "topic";
  const t = await getTranslations("teacher.dashboard");
  const tr = await getTranslations("common.record");
  const format = await getFormatter();
  const locale = await getLocale();
  const [dashboard, taxonomy] = await Promise.all([getDashboard(id, period), getErrorTypes()]);
  if (!dashboard.ok) return <ErrorState code={dashboard.code} />;
  const data = dashboard.data;
  const types = taxonomy.ok ? taxonomy.data : null;
  const href = (p: Period, v: View) => routes.teacherDashboard(id, `?period=${p}&view=${v}`);
  const periodLabel = { "7d": t("last7"), "30d": t("last30"), all: t("all") };
  const rows = view === "topic" ? data.errors_by_topic : data.errors_by_student;
  const max = Math.max(1, ...rows.map((r) => r.errors));
  const tableTitle = view === "topic" ? t("errorsTitleTopic") : t("errorsTitleStudent");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="max-w-2xl text-fg-muted">{t("lead")}</p>
        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          <span>{t("provisional")}</span>
        </p>
      </div>

      <section aria-labelledby="errors-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Segmented
            label={t("period")}
            options={PERIODS.map((p) => ({ href: href(p, view), label: periodLabel[p], current: p === period }))}
          />
          <Segmented
            label={t("viewLabel")}
            options={[
              { href: href(period, "topic"), label: t("byTopic"), current: view === "topic" },
              { href: href(period, "student"), label: t("byStudent"), current: view === "student" }
            ]}
          />
        </div>
        <div>
          <h2 id="errors-title" className="text-lg font-semibold text-fg">
            {tableTitle}
          </h2>
          <p className="text-sm text-fg-muted">{t("errorsBasis", { period })}</p>
        </div>
        {!data.enough_data ? (
          <EmptyState
            icon="chart-column"
            title={t("emptyTitle")}
            body={`${t("emptyBody", data.thresholds)} ${t("emptyNow", {
              messages: data.activity.messages,
              messagesNeeded: data.thresholds.messages,
              exercises: data.activity.exercises,
              exercisesNeeded: data.thresholds.exercises
            })}`}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised px-4 pt-4 sm:px-6">
            <table aria-labelledby="errors-title" className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th scope="col" className={TH}>
                    {view === "topic" ? t("colTopic") : t("colStudent")}
                  </th>
                  <th scope="col" className={TH}>
                    {t("colErrors")}
                  </th>
                  <th scope="col" className={TH}>
                    {view === "topic" ? t("colStudents") : t("colTopTopic")}
                  </th>
                  <th scope="col" className={TH}>
                    {t("colTop")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {view === "topic"
                  ? data.errors_by_topic.map((row) => (
                      <tr key={`${row.topic_id}-${row.topic_name}`} className="border-b border-border last:border-b-0">
                        <th scope="row" className={`${TD} text-left font-semibold`}>
                          {row.topic_name ?? tr("noTopic")}
                          {row.topic_deleted && <span className="ml-2 font-normal text-fg-muted">{tr("topicDeleted")}</span>}
                        </th>
                        <td className={TD}>
                          <Count value={row.errors} max={max} />
                        </td>
                        <td className={`${TD} tabular-nums`}>{format.number(row.students)}</td>
                        <td className={TD}>{errorTypeLabel(types, row.top_error_type, locale)}</td>
                      </tr>
                    ))
                  : data.errors_by_student.map((row) => (
                      <tr key={row.student_id} className="border-b border-border last:border-b-0">
                        <th scope="row" className={`${TD} text-left`}>
                          <Link href={routes.teacherStudent(id, row.student_id)} className={`${LINK} font-semibold`}>
                            {row.display_name}
                          </Link>
                        </th>
                        <td className={TD}>
                          <Count value={row.errors} max={max} />
                        </td>
                        <td className={TD}>{row.top_topic_name ?? tr("noTopic")}</td>
                        <td className={TD}>{errorTypeLabel(types, row.top_error_type, locale)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="at-risk-title" className="flex flex-col gap-4">
        <div>
          <h2 id="at-risk-title" className="text-lg font-semibold text-fg">
            {t("atRiskTitle")}
          </h2>
          <p className="text-sm text-fg-muted">{t("atRiskBasis")}</p>
        </div>
        {data.at_risk.length === 0 ? (
          <p className="flex items-center gap-2 text-fg">
            <Icon name="check" className="size-4 shrink-0 text-fg-muted" />
            {t("atRiskNone")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6">
            {data.at_risk.map((student) => (
              <li key={student.student_id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="font-semibold text-fg">{student.display_name}</span>
                  <RiskReasons reasons={student.reasons} />
                </div>
                <Link
                  href={routes.teacherStudent(id, student.student_id, "?from=dashboard")}
                  aria-label={`${t("why")}: ${student.display_name}`}
                  className={`${LINK} text-sm`}
                >
                  {t("why")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
