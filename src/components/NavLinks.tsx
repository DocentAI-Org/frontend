"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "./Icon";

export type NavItem = { href: Route; label: string; icon: string };

const STYLES = {
  sidebar:
    "relative flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus before:absolute before:inset-y-2 before:-left-4 before:w-1 before:rounded-r-sm before:bg-neutral-900 before:opacity-0 data-current:bg-surface data-current:font-semibold data-current:text-fg data-current:before:opacity-100",
  tabs: "flex h-11 items-center gap-2 rounded-t-lg border border-transparent px-4 text-sm font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-current:border-border-strong data-current:border-b-surface data-current:bg-surface data-current:font-semibold data-current:text-fg",
  tabbar:
    "relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus before:absolute before:inset-x-6 before:top-0 before:h-1 before:rounded-b-sm before:bg-neutral-900 before:opacity-0 data-current:font-semibold data-current:text-fg data-current:before:opacity-100",
  menu: "flex min-h-11 items-center gap-2 rounded-lg px-4 text-base font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-current:bg-neutral-900 data-current:font-semibold data-current:text-fg-inverse"
};

const LISTS: Record<keyof typeof STYLES, string> = {
  sidebar: "flex flex-col gap-1",
  menu: "flex flex-col gap-1",
  tabs: "-mb-px flex items-end gap-1",
  tabbar: "grid h-16 grid-flow-col auto-cols-fr"
};

const ICONS: Record<keyof typeof STYLES, string> = {
  sidebar: "size-4 shrink-0",
  menu: "size-5 shrink-0",
  tabs: "size-4 shrink-0",
  tabbar: "size-6 shrink-0"
};

/** Marks the current section (aria-current) like the prototype's data-current. */
export function NavLinks({ items, variant }: { items: NavItem[]; variant: keyof typeof STYLES }) {
  const pathname = usePathname();
  return (
    <ul className={LISTS[variant]}>
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              data-current={current ? "" : undefined}
              className={STYLES[variant]}
            >
              <Icon name={item.icon} className={ICONS[variant]} />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
