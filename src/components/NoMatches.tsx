"use client";

import type { Route } from "next";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { withParams } from "@/lib/list";

import { Icon } from "./Icon";

/** A search or filter that matched nothing, with a way back to the whole list (spec 016). */
export function NoMatches({ q }: { q: string }) {
  const t = useTranslations("common.list");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center"
      data-component="EmptyState"
      data-variant="no-matches"
    >
      <Icon name="search" className="size-6 shrink-0 text-fg-muted" />
      <p className="font-semibold text-fg">{t("noMatches", { q })}</p>
      <p className="text-sm text-fg-muted">{t("noMatchesBody")}</p>
      {q && (
        <button
          type="button"
          onClick={() => router.replace(withParams(pathname, params, { q: undefined, shown: undefined }) as Route, { scroll: false })}
          className="inline-flex min-h-9 items-center rounded-md border border-border bg-surface-raised px-3 text-sm font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("clear")}
        </button>
      )}
    </div>
  );
}
