import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { STEP, withParams } from "@/lib/list";

type Params = Record<string, string | string[] | undefined>;

function search(params: Params): URLSearchParams {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) result.append(key, item);
  }
  return result;
}

/** "Showing 20 of 143" and, while some are hidden, a link that shows 20 more (spec 016). */
export async function ListFooter({
  path,
  params,
  shown,
  total
}: {
  path: string;
  params: Params;
  shown: number;
  total: number;
}) {
  const t = await getTranslations("common.list");
  const visible = Math.min(shown, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-fg-muted" data-component="ListFooter">
      <p role="status" className="tabular-nums">
        {t("shown", { shown: visible, total })}
      </p>
      {visible < total && (
        <Link
          href={withParams(path, search(params), { shown: String(shown + STEP) }) as Route}
          scroll={false}
          className="inline-flex min-h-9 items-center rounded-md border border-border bg-surface-raised px-3 font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("more")}
        </Link>
      )}
    </div>
  );
}
