import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button, LinkButton } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { MathText } from "@/components/MathText";
import { getDocument, listAllFragments } from "@/lib/api/documents";
import { routes } from "@/lib/routes";

import { toggleFragmentAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.fragments");
  return { title: t("pageTitle") };
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Fragment review (#18): order, location, search over the whole document, exclusion (001 US2 AS4, AS6). */
export default async function FragmentsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; documentId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id, documentId } = await params;
  const { q = "" } = await searchParams;
  const t = await getTranslations("teacher.fragments");
  const path = { course_id: id, document_id: documentId };
  const [document, fragments] = await Promise.all([getDocument(path), listAllFragments(path)]);
  if (!document.ok) return <ErrorState code={document.code} />;
  if (!fragments.ok) return <ErrorState code={fragments.code} />;

  const query = q.trim();
  // Searches the section too: teachers look for parts by their heading.
  const shown = query
    ? fragments.data.filter((f) => normalize(`${f.location_label} ${f.text}`).includes(normalize(query)))
    : fragments.data;
  const excluded = fragments.data.filter((f) => f.excluded).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <Link
          href={routes.teacherMaterial(id)}
          className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Icon name="chevron-left" />
          <span>{t("backToMaterial")}</span>
        </Link>
        <h1 className="text-2xl font-semibold text-fg">{t("title")}</h1>
        <p className="font-medium text-fg">{document.data.file_name}</p>
        <p className="text-fg-muted">{t("lead")}</p>
        <p className="text-sm text-fg-muted tabular-nums">
          {t("meta", { fragments: fragments.data.length, pages: document.data.page_count ?? 0 })}
          {excluded > 0 && <> · {t("excludedCount", { count: excluded })}</>}
        </p>
      </div>

      <form role="search" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="fragment-search" className="text-sm font-semibold text-fg">
            {t("searchLabel")}
          </label>
          <input
            id="fragment-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={t("searchPlaceholder")}
            className="min-h-11 w-full rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
        </div>
        <Button type="submit" variant="secondary" icon="search">
          {t("searchLabel")}
        </Button>
      </form>

      {query && shown.length > 0 && (
        <p role="status" className="text-fg tabular-nums">
          {t("results", { count: shown.length, query })}
        </p>
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon="search"
          title={t("noResultsTitle", { query })}
          body={t("noResultsBody")}
          action={
            <LinkButton href={routes.teacherDocument(id, documentId)} variant="secondary">
              {t("clear")}
            </LinkButton>
          }
        />
      ) : (
        <ol aria-label={t("listLabel")} className="flex flex-col gap-4">
          {shown.map((fragment) => (
            <li
              key={fragment.id}
              className={`flex flex-col gap-2 rounded-xl border p-4 sm:p-6 ${fragment.excluded ? "border-dashed border-border-strong bg-surface" : "border-border bg-surface-raised"}`}
              data-component="FragmentCard"
              data-variant={fragment.excluded ? "excluded" : "included"}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-fg-muted tabular-nums">
                  {t("number", { n: fragment.position })} · <span className="text-fg">{fragment.location_label}</span>
                </p>
                <form action={toggleFragmentAction}>
                  <input type="hidden" name="course_id" value={id} />
                  <input type="hidden" name="document_id" value={documentId} />
                  <input type="hidden" name="fragment_id" value={fragment.id} />
                  <input type="hidden" name="excluded" value={String(!fragment.excluded)} />
                  <Button type="submit" variant="ghost" icon={fragment.excluded ? "check" : "eye-off"}>
                    {fragment.excluded ? t("include") : t("excludeFragment")}
                  </Button>
                </form>
              </div>
              {fragment.excluded && (
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted">
                  <Icon name="eye-off" />
                  <span>{t("excludedTag")}</span>
                </p>
              )}
              <p className={`font-serif ${fragment.excluded ? "text-fg-muted" : "text-fg"}`}><MathText text={fragment.text} /></p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
