"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { deleteTagAction } from "@/app/actions/tags";
import type { TagColor } from "@/lib/tag-colors";

import { ConfirmDialog } from "./ConfirmDialog";
import { Icon } from "./Icon";
import { TagDialog } from "./TagDialog";

const MENU_ROW =
  "flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

/** A tag's options in the side filter (spec 016 US4): edit it, or delete it after confirming. */
export function TagMenu({ tag }: { tag: { id: string; name: string; color: TagColor } }) {
  const t = useTranslations("common.tags");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      // Clicks inside an opened dialog (top layer) are not "away".
      const target = event.target as Node;
      if (!root.current?.contains(target) && !(target instanceof Element && target.closest("dialog"))) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={t("menu", { name: tag.name })}
        title={t("menu", { name: tag.name })}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="ellipsis" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 flex w-52 flex-col gap-1 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
          <TagDialog
            tag={tag}
            triggerLabel={t("editAction")}
            triggerIcon="settings"
            triggerClassName={MENU_ROW}
            onSaved={() => setOpen(false)}
          />
          <ConfirmDialog
            trigger={t("delete")}
            triggerIcon="trash-2"
            triggerClassName={MENU_ROW.replace("text-fg", "text-danger-700")}
            title={t("deleteTitle", { name: tag.name })}
            body={t("deleteBody")}
            confirmLabel={t("deleteConfirm")}
            cancelLabel={t("cancel")}
            confirmVariant="danger"
            action={deleteTagAction}
            fields={{ tag_id: tag.id }}
          />
        </div>
      )}
    </div>
  );
}
