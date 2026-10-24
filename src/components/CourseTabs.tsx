"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type CourseTab = { href: Route; label: string; exact?: boolean };

/** Course sections (teacher): the current one is marked with aria-current. */
export function CourseTabs({ label, tabs }: { label: string; tabs: CourseTab[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="overflow-x-auto border-b border-border">
      <ul className="flex gap-1">
        {tabs.map((tab) => {
          const current = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${current ? "border-neutral-900 text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
