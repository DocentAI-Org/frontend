"use client";

import { type ReactNode, useId, useRef } from "react";

import { Button, type ButtonVariant } from "./Button";

/**
 * The prototype's confirmation dialog on the native <dialog> (focus trap, Escape, top layer).
 * The confirm button submits `action` (a Server Action) with the hidden `fields`.
 */
export function ConfirmDialog({
  trigger,
  triggerVariant = "secondary",
  triggerIcon,
  title,
  body,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  action,
  fields = {}
}: {
  trigger: ReactNode;
  triggerVariant?: ButtonVariant;
  triggerIcon?: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  action: (form: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <Button type="button" variant={triggerVariant} icon={triggerIcon} onClick={() => dialog.current?.showModal()}>
        {trigger}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
        data-component="ConfirmDialog"
      >
        <form action={action} className="flex flex-col gap-4 p-6">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <h2 id={titleId} className="text-xl font-semibold text-fg">
            {title}
          </h2>
          <div className="text-fg-muted">{body}</div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => dialog.current?.close()}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant={confirmVariant} onClick={() => queueMicrotask(() => dialog.current?.close())}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
