"use client";

import { type ReactNode, useId, useRef, useState } from "react";

import { samePhrase } from "@/lib/phrase";

import { Button, type ButtonVariant } from "./Button";
import { Icon } from "./Icon";
import { TextField } from "./TextField";

/**
 * The prototype's confirmation dialog on the native <dialog> (focus trap, Escape, top layer).
 * The confirm button submits `action` (a Server Action) with the hidden `fields`.
 * With `confirmPhrase`, the user must type it (any case) before confirming; it is sent as
 * `confirm` so the action can check it again (spec 017).
 */
export function ConfirmDialog({
  trigger,
  triggerVariant = "secondary",
  triggerIcon,
  triggerClassName,
  triggerLabel,
  title,
  body,
  confirmLabel,
  cancelLabel,
  confirmVariant = "primary",
  action,
  fields = {},
  confirmPhrase,
  confirmPhraseLabel
}: {
  trigger: ReactNode;
  triggerVariant?: ButtonVariant;
  triggerIcon?: string;
  /** Replaces the Button look, e.g. a left-aligned menu row. */
  triggerClassName?: string;
  /** Accessible name of the trigger when its text alone is ambiguous, e.g. one per table row. */
  triggerLabel?: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  action: (form: FormData) => void | Promise<void>;
  fields?: Record<string, string>;
  confirmPhrase?: string;
  confirmPhraseLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [typed, setTyped] = useState("");
  const blocked = confirmPhrase !== undefined && !samePhrase(typed, confirmPhrase);
  return (
    <>
      {triggerClassName ? (
        <button type="button" className={triggerClassName} aria-label={triggerLabel} onClick={() => dialog.current?.showModal()}>
          {triggerIcon && <Icon name={triggerIcon} />}
          <span>{trigger}</span>
        </button>
      ) : (
        <Button type="button" variant={triggerVariant} icon={triggerIcon} aria-label={triggerLabel} onClick={() => dialog.current?.showModal()}>
          {trigger}
        </Button>
      )}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => setTyped("")}
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
          {confirmPhrase !== undefined && (
            <TextField
              label={confirmPhraseLabel ?? confirmPhrase}
              name="confirm"
              autoComplete="off"
              spellCheck={false}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => dialog.current?.close()}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant={confirmVariant} disabled={blocked} onClick={() => queueMicrotask(() => dialog.current?.close())}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
