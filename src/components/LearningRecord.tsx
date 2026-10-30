import type { Route } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";

type Entry = Schemas["LearningRecordEntry"];
type Taxonomy = Schemas["ErrorTaxonomy"];

/** An error type's name in the active locale; the code only if it is not in the taxonomy (005 FR-001). */
export function errorTypeLabel(taxonomy: Taxonomy | null, code: string, locale: string): string {
  const type = taxonomy?.items.find((t) => t.code === code);
  if (!type) return code;
  return locale === "es" ? type.label.es : type.label.en;
}

type Group = { topic: string | null; deleted: boolean; types: { code: string; count: number; latest: string }[] };

/** By topic (in order of the latest mistake), then by type (most frequent first). */
function group(entries: Entry[]): Group[] {
  const groups = new Map<string, Group>();
  for (const entry of entries) {
    const key = entry.topic_name ?? "";
    const g = groups.get(key) ?? { topic: entry.topic_name, deleted: entry.topic_deleted, types: [] };
    const type = g.types.find((t) => t.code === entry.error_type);
    if (type) type.count += 1;
    else g.types.push({ code: entry.error_type, count: 1, latest: entry.submission_id });
    groups.set(key, g);
  }
  const ordered = [...groups.values()];
  for (const g of ordered) g.types.sort((a, b) => b.count - a.count);
  // Mistakes without a topic go last.
  return ordered.sort((a, b) => Number(a.topic === null) - Number(b.topic === null));
}

/**
 * The mistakes in a learning record (spec 005 US2–US3): prototype ProgressByTopic with its
 * ErrorTypeList, without mastery levels (P2, not defined yet). Entries come newest first.
 */
export async function LearningRecord({
  entries,
  taxonomy,
  exampleHref
}: {
  entries: Entry[];
  taxonomy: Taxonomy | null;
  exampleHref: (submissionId: string) => Route;
}) {
  const t = await getTranslations("common.record");
  const locale = await getLocale();
  return (
    <div className="flex flex-col gap-4">
      {taxonomy?.provisional && (
        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          <span>{t("provisional")}</span>
        </p>
      )}
      <ul aria-label={t("byTopic")} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-raised">
        {group(entries).map((g) => {
          const headingId = `topic-${g.topic ?? "none"}`.replace(/\s+/g, "-");
          return (
            <li key={g.topic ?? ""} className="flex flex-col gap-4 border-b border-border p-6 last:border-b-0" data-component="ProgressByTopic">
              <h2 id={headingId} className="font-semibold text-fg">
                {g.topic ?? t("noTopic")}
                {g.deleted && <span className="ml-2 text-sm font-normal text-fg-muted">{t("topicDeleted")}</span>}
              </h2>
              <ul aria-labelledby={headingId} className="flex flex-col divide-y divide-border rounded-xl border border-border" data-component="ErrorTypeList">
                {g.types.map((type) => {
                  const labelId = `${headingId}-${type.code}`;
                  return (
                    <li key={type.code} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-1">
                      <span id={labelId} className="min-w-0 font-medium text-fg">
                        {errorTypeLabel(taxonomy, type.code, locale)}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-sm text-fg-muted tabular-nums">{t("times", { count: type.count })}</span>
                        <Link
                          href={exampleHref(type.latest)}
                          aria-describedby={labelId}
                          className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        >
                          {t("seeExample")}
                        </Link>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
