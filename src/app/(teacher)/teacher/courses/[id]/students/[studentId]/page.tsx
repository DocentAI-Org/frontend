import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { AccessDenied } from "@/components/AccessDenied";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { LearningRecord } from "@/components/LearningRecord";
import { PageHeader } from "@/components/PageHeader";
import { RiskReasons } from "@/components/RiskReasons";
import type { Schemas } from "@/lib/api/client";
import { listCourseStudents } from "@/lib/api/courses";
import { getStudentRisk } from "@/lib/api/dashboard";
import { getErrorTypes, getStudentLearningRecord } from "@/lib/api/exercises";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.student");
  return { title: t("pageTitle") };
}

const TH = "pb-2 pr-4 text-left text-sm font-semibold text-fg-muted";

/** Why a flagged student appears on the dashboard (spec 006 US2 AS2): reasons and weekly activity. */
async function WhyFlagged({ risk }: { risk: Schemas["StudentRisk"] }) {
  const t = await getTranslations("teacher.risk");
  const td = await getTranslations("teacher.dashboard");
  const format = await getFormatter();
  const day = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "long" });
  // Weeks are calendar dates (Mondays, UTC): formatted in UTC so they never shift a day.
  const monday = (date: string) => format.dateTime(new Date(date), { day: "numeric", month: "long", timeZone: "UTC" });
  return (
    <section
      aria-labelledby="why-title"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6"
      data-component="RiskWhy"
    >
      <div className="flex flex-col gap-1">
        <h2 id="why-title" className="text-lg font-semibold text-fg">
          {t("whyTitle")}
        </h2>
        <p className="text-sm text-fg-muted">{td("atRiskBasis")}</p>
      </div>
      <RiskReasons reasons={risk.reasons} />
      <p className="text-sm text-fg-muted">
        {risk.last_activity_at ? t("lastSeen", { date: day(risk.last_activity_at) }) : t("noActivity")}
      </p>
      <div className="flex flex-col gap-2">
        <h3 id="weeks-title" className="font-semibold text-fg">
          {t("activityTitle")}
        </h3>
        <p className="text-sm text-fg-muted">{t("activityBasis")}</p>
        <div className="overflow-x-auto">
          <table aria-labelledby="weeks-title" className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-900">
                <th scope="col" className={TH}>
                  {t("colWeek")}
                </th>
                <th scope="col" className={TH}>
                  {t("colMessages")}
                </th>
                <th scope="col" className={TH}>
                  {t("colExercises")}
                </th>
              </tr>
            </thead>
            <tbody>
              {risk.weekly_activity.map((week) => (
                <tr key={week.week_start} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-2 pr-4 text-left font-normal text-fg">
                    {t("week", { date: monday(week.week_start) })}
                  </th>
                  <td className="py-2 pr-4 text-fg tabular-nums">{format.number(week.messages)}</td>
                  <td className="py-2 pr-4 text-fg tabular-nums">{format.number(week.exercises)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="flex items-start gap-2 text-sm text-fg-muted">
        <Icon name="info" className="mt-0.5 size-4 shrink-0" />
        <span>{td("provisional")}</span>
      </p>
    </section>
  );
}

/**
 * A student's learning record (#28, spec 005 US3) and, when they are flagged, why (spec 006 US2).
 * Mastery and quizzes are P2 stories not defined yet.
 */
export default async function StudentRecordPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; studentId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id, studentId } = await params;
  const { from } = await searchParams;
  const t = await getTranslations("teacher.student");
  const tr = await getTranslations("teacher.risk");
  const [students, record, taxonomy, risk] = await Promise.all([
    listCourseStudents(id),
    getStudentLearningRecord(id, studentId),
    getErrorTypes(),
    getStudentRisk(id, studentId)
  ]);
  if (!students.ok) return <ErrorState code={students.code} />;
  const student = students.data.items.find((s) => s.student_id === studentId);
  if (!student) return <AccessDenied reason="not-found" home={routes.teacherCourse(id)} />;
  const back =
    from === "dashboard"
      ? { href: routes.teacherDashboard(id), label: tr("back") }
      : { href: routes.teacherCourse(id), label: t("backToCourse") };
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={student.display_name} lead={t("mistakesLead")} back={back} />
      {risk.ok && risk.data.at_risk && <WhyFlagged risk={risk.data} />}
      {!record.ok ? (
        <ErrorState code={record.code} />
      ) : record.data.length === 0 ? (
        <EmptyState
          icon="chart-column"
          title={t("noMistakesTitle", { name: student.display_name })}
          body={t("noMistakesBody")}
        />
      ) : (
        <LearningRecord
          entries={record.data}
          taxonomy={taxonomy.ok ? taxonomy.data : null}
          exampleHref={(submissionId) => routes.teacherSubmission(id, submissionId)}
        />
      )}
    </div>
  );
}
