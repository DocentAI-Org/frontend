"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "./Icon";

export type NavItem = { href: Route; label: string; icon: string };

const STYLES = {
  sidebar:
    "relative flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus before:absolute before:inset-y-2 before:-left-4 before:w-1 before:rounded-r-sm before:bg-neutral-900 before:opacity-0 data-current:bg-surface data-current:font-semibold data-current:text-fg data-current:before:opacity-100",
  menu: "flex min-h-11 items-center gap-2 rounded-lg px-4 text-base font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-current:bg-neutral-900 data-current:font-semibold data-current:text-fg-inverse"
};

/** Marks the current section (aria-current) like the prototype's data-current. */
export function NavLinks({ items, variant }: { items: NavItem[]; variant: keyof typeof STYLES }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-1">
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
              <Icon name={item.icon} className={variant === "menu" ? "size-5 shrink-0" : "size-4 shrink-0"} />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
