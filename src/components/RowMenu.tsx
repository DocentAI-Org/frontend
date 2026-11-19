import type { ReactNode } from "react";

import { Icon } from "./Icon";

/** A list row's "more actions" menu: an ellipsis button that opens the row's actions below it. */
export function RowMenu({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  return (
    <details className="relative">
      <summary
        aria-label={label}
        title={label}
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="ellipsis" className="size-5 shrink-0" />
      </summary>
      <div className={`absolute right-0 z-20 mt-1 flex flex-col gap-1 rounded-lg border border-border bg-surface-raised p-2 shadow-lg ${className}`}>
        {children}
      </div>
    </details>
  );
}
