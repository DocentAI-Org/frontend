"use client";

import type { Route } from "next";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { withParams } from "@/lib/list";

import { Icon } from "./Icon";
import { Select, type SelectOption } from "./Select";

/** A list filter shown as a compact Select; the first option (value "") means "all". */
export type ListFilter = { name: string; label: string; options: SelectOption[] };

const DEBOUNCE_MS = 300;

/**
 * Search, filters and sort above a list (spec 016). Each change goes to the URL, so the server
 * renders the list again and reload or back keep it; "Show more" starts over from the first page.
 */
export function ListToolbar({
  searchLabel,
  sorts,
  filters = []
}: {
  searchLabel: string;
  sorts?: SelectOption[];
  filters?: ListFilter[];
}) {
  const t = useTranslations("common.list");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const inUrl = params.get("q") ?? "";
  const [q, setQ] = useState(inUrl);

  // The URL can change from elsewhere (the "clear the search" button, back).
  const [seen, setSeen] = useState(inUrl);
  if (inUrl !== seen) {
    setSeen(inUrl);
    setQ(inUrl);
  }

  const go = (changes: Record<string, string | undefined>) =>
    router.replace(withParams(pathname, params, { ...changes, shown: undefined }) as Route, { scroll: false });

  useEffect(() => {
    if (q.trim() === inUrl) return;
    const timer = setTimeout(() => go({ q: q.trim() || undefined }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `go` reads the latest params
  }, [q, inUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2" data-component="ListToolbar">
      <div className="relative min-w-48 flex-1">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted" />
        <input
          type="search"
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-9 w-full rounded-md border border-border-strong bg-surface-raised pr-3 pl-9 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
      </div>
      {filters.map((filter) => (
        <Select
          key={filter.name}
          size="sm"
          aria-label={filter.label}
          value={params.get(filter.name) ?? ""}
          options={filter.options}
          onValueChange={(value) => go({ [filter.name]: value || undefined })}
          className="w-44"
        />
      ))}
      {sorts && (
        <Select
          size="sm"
          aria-label={t("sort")}
          value={params.get("sort") ?? sorts[0].value}
          options={sorts}
          onValueChange={(value) => go({ sort: value === sorts[0].value ? undefined : value })}
          className="w-44"
        />
      )}
    </div>
  );
}
