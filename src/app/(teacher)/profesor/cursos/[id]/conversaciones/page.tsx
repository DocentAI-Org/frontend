import type { Metadata, Route } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { Button, buttonClass } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { listCourseStudents } from "@/lib/api/courses";
import { type ConversationFilters, listCourseConversations, listCourseSubmissions } from "@/lib/api/review";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.conversations");
  return { title: t("pageTitle") };
}

const FIELD =
  "min-h-11 rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const DAYS: Record<string, number> = { "7": 7, "30": 30 };

/** Start of the "last N days" window chosen in the date filter. */
const since = (option?: string) => {
  const days = option ? DAYS[option] : undefined;
  return days ? new Date(Date.now() - days * 86_400_000).toISOString() : undefined;
};

type Row = {
  key: string;
  href: Route;
  student: string;
  at: string;
  exercise: boolean;
  messages?: number;
  noSource: boolean;
  corrected: boolean;
};

/** Conversations and exercise feedback of a course for review (#23, 001 US8 AS1, AS4). */
export default async function ConversationsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ estudiante?: string; desde?: string; sinFuente?: string; corregida?: string }>;
}) {
  const { id } = await params;
  const { estudiante, desde, sinFuente, corregida } = await searchParams;
  const t = await getTranslations("teacher.conversations");
  const format = await getFormatter();

  const filters: ConversationFilters = {
    student_id: estudiante || undefined,
    from: since(desde),
    has_no_source: sinFuente ? true : undefined,
    has_correction: corregida ? true : undefined
  };
  const filtered = Object.values(filters).some((v) => v !== undefined);
  const [conversations, submissions, students] = await Promise.all([
    listCourseConversations(id, filters),
    listCourseSubmissions(id, { student_id: filters.student_id, from: filters.from }),
    listCourseStudents(id)
  ]);
  if (!conversations.ok) return <ErrorState code={conversations.code} />;
  if (!submissions.ok) return <ErrorState code={submissions.code} />;

  const rows: Row[] = [
    ...conversations.data.items.map((c) => ({
      key: c.id,
      href: routes.teacherConversation(id, c.id),
      student: c.student_name,
      at: c.last_message_at,
      exercise: false,
      messages: c.message_count,
      noSource: c.has_no_source,
      corrected: c.has_correction
    })),
    ...submissions.data.items
      .map((s) => ({
        key: s.id,
        href: routes.teacherSubmission(id, s.id),
        student: s.student_name,
        at: s.created_at,
        exercise: true,
        noSource: s.explanation_kind === "no_source",
        corrected: s.flag !== null
      }))
      .filter((r) => (!filters.has_no_source || r.noSource) && (!filters.has_correction || r.corrected))
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
        <Link
          href={routes.teacherFlags(id)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-teacher-700 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Icon name="flag" />
          <span>{t("flagsLink")}</span>
        </Link>
      </div>

      <form method="get" aria-label={t("filtersLabel")} className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-fg">
          {t("studentLabel")}
          <select name="estudiante" defaultValue={estudiante ?? ""} className={FIELD}>
            <option value="">{t("all")}</option>
            {students.ok &&
              students.data.items.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.display_name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-fg">
          {t("date")}
          <select name="desde" defaultValue={desde ?? ""} className={FIELD}>
            <option value="">{t("allTime")}</option>
            <option value="7">{t("last7")}</option>
            <option value="30">{t("last30")}</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-fg">
          <input type="checkbox" name="sinFuente" value="1" defaultChecked={!!sinFuente} className="size-5 accent-primary-600" />
          {t("noSourceLabel")}
        </label>
        <label className="flex min-h-11 items-center gap-2 text-fg">
          <input type="checkbox" name="corregida" value="1" defaultChecked={!!corregida} className="size-5 accent-primary-600" />
          {t("correctedLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary">
            {t("apply")}
          </Button>
          {filtered && (
            <Link href={routes.teacherConversations(id)} className={buttonClass("ghost")}>
              {t("clear")}
            </Link>
          )}
        </div>
      </form>

      {rows.length === 0 ? (
        filtered ? (
          <EmptyState icon="search" title={t("noResultsTitle")} body={t("noResultsBody")} />
        ) : (
          <EmptyState icon="message-circle" title={t("emptyTitle")} body={t("emptyBody")} />
        )
      ) : (
        <ul aria-label={t("listLabel")} className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-wrap items-center justify-between gap-4 p-4" data-component="ConversationRow">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold text-fg">{row.student}</p>
                <p className="flex flex-wrap items-center gap-2 text-sm text-fg-muted tabular-nums">
                  {row.exercise ? (
                    <Tag icon="file-text" label={t("exercise")} />
                  ) : (
                    <span>{t("messages", { count: row.messages ?? 0 })}</span>
                  )}
                  <span>{t("last", { date: format.dateTime(new Date(row.at), { dateStyle: "medium", timeStyle: "short" }) })}</span>
                  {row.noSource && <Tag icon="info" label={t("noSource")} />}
                  {row.corrected && <Tag icon="flag" label={t("corrected")} />}
                </p>
              </div>
              <Link
                href={row.href}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <span>{t("open")}</span>
                <Icon name="chevron-right" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tag({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-border-strong px-2 py-0.5 text-xs font-semibold text-fg">
      <Icon name={icon} />
      <span>{label}</span>
    </span>
  );
}
