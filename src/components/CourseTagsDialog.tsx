"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { setTagOnCourse } from "@/app/actions/tags";
import { TAG_STYLES, type TagColor } from "@/lib/tag-colors";

import { Button } from "./Button";
import { Icon } from "./Icon";

type Tag = { id: string; name: string; color: TagColor };

/**
 * A course's tags (spec 016 US4): every tag of the user as a checkbox, saved as it is ticked;
 * closing refreshes the list so chips and counts follow.
 */
export function CourseTagsDialog({
  courseId,
  courseName,
  tags,
  selected,
  triggerClassName
}: {
  courseId: string;
  courseName: string;
  tags: Tag[];
  selected: string[];
  triggerClassName: string;
}) {
  const t = useTranslations("common.tags");
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const ids = useId();
  const [checked, setChecked] = useState(() => new Set(selected));
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  const toggle = (tagId: string, on: boolean) => {
    setChecked((current) => {
      const next = new Set(current);
      if (on) next.add(tagId);
      else next.delete(tagId);
      return next;
    });
    setFailed(false);
    startTransition(async () => {
      const result = await setTagOnCourse(tagId, courseId, on);
      if (!result.ok) {
        setFailed(true);
        setChecked((current) => {
          const next = new Set(current);
          if (on) next.delete(tagId);
          else next.add(tagId);
          return next;
        });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          setChecked(new Set(selected));
          dialog.current?.showModal();
        }}
      >
        <Icon name="tag" />
        <span>{t("courseAction")}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={`${ids}-title`}
        onClose={() => router.refresh()}
        className="m-auto w-full max-w-sm rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
        data-component="CourseTagsDialog"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h2 id={`${ids}-title`} className="text-lg font-semibold text-fg">
              {t("courseTitle", { course: courseName })}
            </h2>
            <p className="text-sm text-fg-muted">{t("courseLead")}</p>
          </div>
          {failed && (
            <p role="alert" className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-800">
              {t("failed")}
            </p>
          )}
          {tags.length === 0 ? (
            <p className="text-sm text-fg-muted">{t("none")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-fg hover:bg-surface-sunken">
                    <input
                      type="checkbox"
                      checked={checked.has(tag.id)}
                      onChange={(event) => toggle(tag.id, event.target.checked)}
                      className="size-4 accent-primary-600"
                    />
                    <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${TAG_STYLES[tag.color].dot}`} />
                    <span>{tag.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>
              {t("close")}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
