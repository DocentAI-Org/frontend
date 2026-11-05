import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { toSearch, withParams } from "@/lib/list";
import { TAG_STYLES, type TagColor } from "@/lib/tag-colors";

import { Icon } from "./Icon";
import { TagDialog } from "./TagDialog";
import { TagMenu } from "./TagMenu";

type Params = Record<string, string | string[] | undefined>;
type Tag = { id: string; name: string; color: TagColor; course_count: number };

const ROW =
  "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-3 text-sm text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus aria-[current=page]:bg-surface-sunken aria-[current=page]:font-medium aria-[current=page]:text-fg";

/**
 * The course lists' side filter, like a project list's (spec 016): all courses, the starred ones
 * and the user's own tags, each with its count; tags are created and managed here too (US4).
 */
export async function CourseScope({
  path,
  params,
  current,
  counts,
  tags
}: {
  path: string;
  params: Params;
  current: { favorites: boolean; tag?: string };
  counts: { all: number; favorites: number };
  tags: Tag[];
}) {
  const t = await getTranslations("common.list.scope");
  const tt = await getTranslations("common.tags");
  const link = (changes: { only?: string; tag?: string }) =>
    withParams(path, toSearch(params), { only: changes.only, tag: changes.tag, shown: undefined }) as Route;
  const count = (value: number) => <span className="ml-auto pl-2 text-xs text-fg-muted tabular-nums">{value}</span>;
  const onAll = !current.favorites && !current.tag;
  return (
    <nav aria-label={t("label")} className="flex flex-col gap-4" data-component="CourseScope">
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        <li className="flex">
          <Link href={link({})} aria-current={onAll ? "page" : undefined} className={ROW} scroll={false}>
            <Icon name="book-open" />
            <span>{t("all")}</span>
            {count(counts.all)}
          </Link>
        </li>
        <li className="flex">
          <Link
            href={link({ only: "favorites" })}
            aria-current={current.favorites ? "page" : undefined}
            className={ROW}
            scroll={false}
          >
            <Icon name="star" />
            <span>{t("favorites")}</span>
            {count(counts.favorites)}
          </Link>
        </li>
      </ul>
      <div className="flex flex-col gap-1">
        <p className="px-3 text-xs font-medium text-fg-muted">{tt("title")}</p>
        {tags.length > 0 && (
          <ul aria-label={tt("title")} className="flex flex-wrap gap-1 lg:flex-col">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center">
                <Link
                  href={link({ tag: tag.id })}
                  aria-current={current.tag === tag.id ? "page" : undefined}
                  className={ROW}
                  scroll={false}
                >
                  <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${TAG_STYLES[tag.color].dot}`} />
                  <span className="truncate">{tag.name}</span>
                  {count(tag.course_count)}
                </Link>
                <TagMenu tag={tag} />
              </li>
            ))}
          </ul>
        )}
        <TagDialog
          triggerLabel={tt("new")}
          triggerIcon="plus"
          triggerClassName="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
        />
      </div>
    </nav>
  );
}
