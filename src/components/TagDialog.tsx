"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { saveTag } from "@/app/actions/tags";
import { TAG_COLORS, TAG_STYLES, type TagColor } from "@/lib/tag-colors";

import { Button } from "./Button";
import { Icon } from "./Icon";

type Tag = { id: string; name: string; color: TagColor };

/**
 * Creates a course tag or edits one (spec 016 US4): a name and a colour from the palette, on the
 * native <dialog>, opened by its own button; a name in use is said in the dialog.
 */
export function TagDialog({
  tag,
  triggerLabel,
  triggerIcon,
  triggerClassName
}: {
  tag?: Tag;
  triggerLabel: string;
  triggerIcon: string;
  triggerClassName: string;
}) {
  const t = useTranslations("common.tags");
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const ids = useId();
  const [error, setError] = useState<"taken" | "invalid" | "failed" | null>(null);
  const [pending, startTransition] = useTransition();
  const title = tag ? t("edit") : t("new");

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          setError(null);
          dialog.current?.showModal();
        }}
      >
        <Icon name={triggerIcon} />
        <span>{triggerLabel}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${ids}-title`}
        className="m-auto w-full max-w-sm rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
        data-component="TagDialog"
      >
        <form
          className="flex flex-col gap-4 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            // Kept: currentTarget is gone once the async save resumes.
            const element = event.currentTarget;
            const form = new FormData(element);
            const name = String(form.get("name") ?? "");
            const color = String(form.get("color") ?? "violet") as TagColor;
            startTransition(async () => {
              const result = await saveTag(tag?.id ?? null, name, color);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              dialog.current?.close();
              if (!tag) element.reset();
              router.refresh();
            });
          }}
        >
          <h2 id={`${ids}-title`} className="text-lg font-semibold text-fg">
            {title}
          </h2>
          {error && (
            <p role="alert" className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-800">
              {t(error)}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor={`${ids}-name`} className="text-sm font-semibold text-fg">
              {t("name")}
            </label>
            <input
              id={`${ids}-name`}
              name="name"
              required
              maxLength={40}
              defaultValue={tag?.name}
              autoComplete="off"
              className="h-10 rounded-md border border-border-strong bg-surface-raised px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-fg">{t("color")}</legend>
            <div className="grid grid-cols-3 gap-2">
              {TAG_COLORS.map((color) => (
                <label
                  key={color}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-border px-2 text-sm text-fg has-checked:border-neutral-900 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
                >
                  <input type="radio" name="color" value={color} defaultChecked={(tag?.color ?? "violet") === color} className="sr-only" />
                  <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${TAG_STYLES[color].dot}`} />
                  <span>{t(`colors.${color}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => dialog.current?.close()}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {tag ? t("save") : t("create")}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
