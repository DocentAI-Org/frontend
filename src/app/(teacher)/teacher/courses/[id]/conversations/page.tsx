import type { Metadata, Route } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { Button, buttonClass } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { ListFooter } from "@/components/ListFooter";
import { ListToolbar } from "@/components/ListToolbar";
import { NoMatches } from "@/components/NoMatches";
import { Select } from "@/components/Select";
import { listCourseStudents } from "@/lib/api/courses";
import { type ConversationFilters, listCourseConversations, listCourseSubmissions } from "@/lib/api/review";
import { apiQuery, listState } from "@/lib/list";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.conversations");
  return { title: t("pageTitle") };
}

const DAYS: Record<string, number> = { "7": 7, "30": 30 };
const SORTS = ["recent", "oldest"] as const;

/** Start of the "last N days" window chosen in the date filter. */
const windowStart = (option?: string) => {
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { student, since, noSource, corrected } = query as Record<string, string | undefined>;
  const list = listState(query, SORTS);
  const searched = apiQuery(list, SORTS);
  const t = await getTranslations("teacher.conversations");
  const tl = await getTranslations("common.list");
  const format = await getFormatter();

  const filters: ConversationFilters = {
    student_id: student || undefined,
    from: windowStart(since),
    has_no_source: noSource ? true : undefined,
    has_correction: corrected ? true : undefined
  };
  const filtered = Object.values(filters).some((v) => v !== undefined) || Boolean(list.q);
  // Both sources take the search and order; the merged list shows the first `shown` (spec 016).
  const [conversations, submissions, students] = await Promise.all([
    listCourseConversations(id, { ...filters, ...searched }, list.shown),
    listCourseSubmissions(id, { student_id: filters.student_id, from: filters.from, ...searched }, list.shown),
    listCourseStudents(id)
  ]);
  if (!conversations.ok) return <ErrorState code={conversations.code} />;
  if (!submissions.ok) return <ErrorState code={submissions.code} />;

  const exercises = submissions.data.items.filter(
    (s) => (!filters.has_no_source || s.explanation_kind === "no_source") && (!filters.has_correction || s.flag !== null)
  );
  // The flags are filtered here, so the exercises' total is what came back when one is on.
  const total =
    conversations.data.total + (filters.has_no_source || filters.has_correction ? exercises.length : submissions.data.total);
  const merged: Row[] = [
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
    ...exercises.map((s) => ({
      key: s.id,
      href: routes.teacherSubmission(id, s.id),
      student: s.student_name,
      at: s.created_at,
      exercise: true,
      noSource: s.explanation_kind === "no_source",
      corrected: s.flag !== null
    }))
  ].sort((a, b) => (list.sort === "oldest" ? a.at.localeCompare(b.at) : b.at.localeCompare(a.at)));
  const rows = merged.slice(0, list.shown);

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

      <ListToolbar
        searchLabel={t("search")}
        sorts={SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))}
      />
      <form method="get" aria-label={t("filtersLabel")} className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface p-4">
        {/* Applying the filters keeps the search and the order. */}
        {list.q && <input type="hidden" name="q" value={list.q} />}
        {searched.sort && <input type="hidden" name="sort" value={searched.sort} />}
        <div className="flex flex-col gap-1">
          <label id="filter-student-label" htmlFor="filter-student" className="text-sm font-semibold text-fg">
            {t("studentLabel")}
          </label>
          <Select
            id="filter-student"
            labelId="filter-student-label"
            name="student"
            defaultValue={student ?? ""}
            className="min-w-48"
            options={[
              { value: "", label: t("all") },
              ...(students.ok ? students.data.items.map((s) => ({ value: s.student_id, label: s.display_name })) : [])
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label id="filter-since-label" htmlFor="filter-since" className="text-sm font-semibold text-fg">
            {t("date")}
          </label>
          <Select
            id="filter-since"
            labelId="filter-since-label"
            name="since"
            defaultValue={since ?? ""}
            className="min-w-48"
            options={[
              { value: "", label: t("allTime") },
              { value: "7", label: t("last7") },
              { value: "30", label: t("last30") }
            ]}
          />
        </div>
        <label className="flex min-h-11 items-center gap-2 text-fg">
          <input type="checkbox" name="noSource" value="1" defaultChecked={!!noSource} className="size-5 accent-primary-600" />
          {t("noSourceLabel")}
        </label>
        <label className="flex min-h-11 items-center gap-2 text-fg">
          <input type="checkbox" name="corrected" value="1" defaultChecked={!!corrected} className="size-5 accent-primary-600" />
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
        list.q ? (
          <NoMatches q={list.q} />
        ) : filtered ? (
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
      {rows.length > 0 && (
        <ListFooter path={routes.teacherConversations(id)} params={query} shown={list.shown} total={total} />
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
