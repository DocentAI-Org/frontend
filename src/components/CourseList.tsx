import type { ComponentProps, ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import type { CourseScope as Scope, ListState } from "@/lib/list";

import { CourseScope } from "./CourseScope";
import { EmptyState } from "./EmptyState";
import { ListFooter } from "./ListFooter";
import { ListToolbar } from "./ListToolbar";
import { NoMatches } from "./NoMatches";

type Params = Record<string, string | string[] | undefined>;

export const COURSE_SORTS = ["recent", "name"] as const;

/**
 * A role's course list (spec 016): the side filter, search and sort, then the rows the page renders
 * as `children`, or why there are none (no favourites yet, or nothing matches), and the footer.
 */
export async function CourseList({
  path,
  params,
  scope,
  list,
  counts,
  tags,
  searchLabel,
  total,
  empty,
  children
}: {
  path: string;
  params: Params;
  /** The scope the page queried with, so the filter shows exactly that. */
  scope: Scope;
  list: ListState<(typeof COURSE_SORTS)[number]>;
  counts: { all: number; favorites: number };
  tags: ComponentProps<typeof CourseScope>["tags"];
  searchLabel: string;
  total: number;
  empty: boolean;
  children: ReactNode;
}) {
  const tl = await getTranslations("common.list");
  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
      <CourseScope path={path} params={params} current={scope} counts={counts} tags={tags} />
      <div className="flex min-w-0 flex-col gap-4">
        <ListToolbar searchLabel={searchLabel} sorts={COURSE_SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))} />
        {empty ? (
          scope.favorites && !list.q ? (
            <EmptyState icon="star" title={tl("noFavorites")} body={tl("noFavoritesBody")} />
          ) : (
            <NoMatches q={list.q} />
          )
        ) : (
          children
        )}
        {!empty && <ListFooter path={path} params={params} shown={list.shown} total={total} />}
      </div>
    </div>
  );
}
