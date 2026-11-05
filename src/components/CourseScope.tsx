import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { toSearch, withParams } from "@/lib/list";

import { Icon } from "./Icon";

type Params = Record<string, string | string[] | undefined>;

const ROW =
  "flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus aria-[current=page]:bg-surface-sunken aria-[current=page]:font-medium aria-[current=page]:text-fg";

/** "All" or only the starred courses, with their counts, like a project list's side filter (spec 016). */
export async function CourseScope({
  path,
  params,
  favoritesOnly,
  counts
}: {
  path: string;
  params: Params;
  favoritesOnly: boolean;
  counts: { all: number; favorites: number };
}) {
  const t = await getTranslations("common.list.scope");
  const link = (only?: string) => withParams(path, toSearch(params), { only, shown: undefined }) as Route;
  const items = [
    { key: "all", href: link(undefined), icon: "book-open", label: t("all"), count: counts.all, current: !favoritesOnly },
    { key: "favorites", href: link("favorites"), icon: "star", label: t("favorites"), count: counts.favorites, current: favoritesOnly }
  ];
  return (
    <nav aria-label={t("label")} data-component="CourseScope">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} aria-current={item.current ? "page" : undefined} className={ROW} scroll={false}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              <span className="ml-auto pl-2 text-xs text-fg-muted tabular-nums">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
