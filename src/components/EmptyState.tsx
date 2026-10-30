import type { ReactNode } from "react";

import { Icon } from "./Icon";

export function EmptyState({
  icon,
  title,
  body,
  action
}: {
  icon: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-12 text-center"
      data-component="EmptyState"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full border border-border-strong text-fg">
        <Icon name={icon} className="size-6 shrink-0" />
      </span>
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {body && <p className="max-w-md text-fg-muted">{body}</p>}
      {action}
    </div>
  );
}
