"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "./Icon";

export type NavItem = { href: Route; label: string; icon: string };

const TAB =
  "relative flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent data-current:font-medium data-current:text-fg data-current:after:bg-neutral-900 md:h-14";

/**
 * The role's sections as tabs in the header, like a dashboard's top level; a course's own sections
 * are tabs inside the course pages (CourseTabs).
 */
export function ShellNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-stretch gap-1">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href} className="flex">
            <Link href={item.href} aria-current={current ? "page" : undefined} data-current={current ? "" : undefined} className={TAB}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
