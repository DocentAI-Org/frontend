import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "./Icon";

/** Notebook-style page title: optional back link, title, lead and actions. */
export function PageHeader({
  title,
  lead,
  back,
  actions
}: {
  title: ReactNode;
  lead?: ReactNode;
  back?: { href: Route; label: string };
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b-2 border-neutral-900 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Icon name="chevron-left" />
            <span>{back.label}</span>
          </Link>
        )}
        <h1 className="text-3xl font-semibold text-fg sm:text-4xl">{title}</h1>
        {lead && <p className="mt-2 max-w-3xl text-fg-muted">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
