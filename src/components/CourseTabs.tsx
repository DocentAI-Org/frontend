"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** A section of a course; `path` is appended to the course URL ("" is the course itself). */
export type CourseSection = { path: string; label: string; also?: string[] };

const TAB =
  "relative flex h-11 shrink-0 items-center gap-2 px-3 text-sm whitespace-nowrap text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent data-current:font-medium data-current:text-fg data-current:after:bg-neutral-900";

/**
 * A course's sections as tabs inside the course pages, like a project's tabs in a dashboard; the
 * header keeps the role's own sections. They scroll sideways when they do not fit.
 */
export function CourseTabs({ label, base, sections }: { label: string; base: string; sections: CourseSection[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="overflow-x-auto border-b border-border" data-component="CourseTabs">
      <ul className="flex">
        {sections.map((section) => {
          const href = `${base}${section.path}`;
          const current =
            pathname === href ||
            (section.path !== "" && pathname.startsWith(`${href}/`)) ||
            (section.also ?? []).some((extra) => pathname.startsWith(`${base}${extra}`));
          return (
            <li key={section.path} className="flex">
              <Link
                href={href as Route}
                aria-current={current ? "page" : undefined}
                data-current={current ? "" : undefined}
                className={TAB}
              >
                <span>{section.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
