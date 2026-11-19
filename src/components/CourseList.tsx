import type { ComponentProps, ReactNode } from "react";
import { getTranslations } from "next-intl/server";

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
  current,
  counts,
  tags,
  searchLabel,
  q,
  shown,
  total,
  empty,
  children
}: {
  path: string;
  params: Params;
  current: { favorites: boolean; tag?: string };
  counts: { all: number; favorites: number };
  tags: ComponentProps<typeof CourseScope>["tags"];
  searchLabel: string;
  q: string;
  shown: number;
  total: number;
  empty: boolean;
  children: ReactNode;
}) {
  const tl = await getTranslations("common.list");
  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
      <CourseScope path={path} params={params} current={current} counts={counts} tags={tags} />
      <div className="flex min-w-0 flex-col gap-4">
        <ListToolbar searchLabel={searchLabel} sorts={COURSE_SORTS.map((value) => ({ value, label: tl(`sorts.${value}`) }))} />
        {empty ? (
          current.favorites && !q ? (
            <EmptyState icon="star" title={tl("noFavorites")} body={tl("noFavoritesBody")} />
          ) : (
            <NoMatches q={q} />
          )
        ) : (
          children
        )}
        {!empty && <ListFooter path={path} params={params} shown={shown} total={total} />}
      </div>
    </div>
  );
}
