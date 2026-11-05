"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CourseSection } from "./CourseTabs";

export type CourseGroup = { key: string; label: string; sections: CourseSection[] };

const GROUP =
  "relative flex h-11 shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent data-current:text-fg data-current:after:bg-neutral-900";

const SECTION =
  "flex min-h-9 shrink-0 items-center rounded-md px-3 text-sm whitespace-nowrap text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-current:bg-surface-sunken data-current:font-medium data-current:text-fg";

function isCurrent(pathname: string, base: string, section: CourseSection): boolean {
  const href = `${base}${section.path}`;
  return (
    pathname === href ||
    (section.path !== "" && pathname.startsWith(`${href}/`)) ||
    (section.also ?? []).some((extra) => pathname.startsWith(`${base}${extra}`))
  );
}

/**
 * A course's sections in two levels: the groups as tabs (each opens its first section) and, under
 * them, the current group's sections, always shown, so any section is one click away.
 */
export function CourseGroupTabs({ label, base, groups }: { label: string; base: string; groups: CourseGroup[] }) {
  const pathname = usePathname();
  const active = groups.find((group) => group.sections.some((section) => isCurrent(pathname, base, section))) ?? groups[0];
  return (
    <div className="flex flex-col gap-2" data-component="CourseGroupTabs">
      <nav aria-label={label} className="overflow-x-auto border-b border-border">
        <ul className="flex">
          {groups.map((group) => {
            const current = group.key === active.key;
            return (
              <li key={group.key} className="flex">
                <Link
                  href={`${base}${group.sections[0].path}` as Route}
                  aria-current={current ? "true" : undefined}
                  data-current={current ? "" : undefined}
                  className={GROUP}
                >
                  {group.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav aria-label={active.label} className="overflow-x-auto">
        <ul className="flex gap-1">
          {active.sections.map((section) => {
            const current = isCurrent(pathname, base, section);
            return (
              <li key={section.path} className="flex">
                <Link
                  href={`${base}${section.path}` as Route}
                  aria-current={current ? "page" : undefined}
                  data-current={current ? "" : undefined}
                  className={SECTION}
                >
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
