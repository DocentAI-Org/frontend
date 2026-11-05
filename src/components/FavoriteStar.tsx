"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setFavorite } from "@/app/actions/favorites";

import { Icon } from "./Icon";

/**
 * The favourite toggle of a course (spec 016): pressed at once, then the list is refreshed so the
 * course moves to the top; if saving fails it goes back and says so.
 */
export function FavoriteStar({ courseId, name, initial }: { courseId: string; name: string; initial: boolean }) {
  const t = useTranslations("common.list");
  const router = useRouter();
  const [pressed, setPressed] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  // A refreshed list may bring a new value from the server.
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    setPressed(initial);
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-pressed={pressed}
        aria-label={t("favorite", { name })}
        title={t("favorite", { name })}
        onClick={() => {
          const next = !pressed;
          setPressed(next);
          setFailed(false);
          startTransition(async () => {
            const result = await setFavorite(courseId, next);
            if (!result.ok) {
              setPressed(!next);
              setFailed(true);
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:text-warning-700"
      >
        <Icon name={pressed ? "star-filled" : "star"} className="size-5 shrink-0" />
      </button>
      {failed && (
        <span role="alert" className="absolute top-full right-0 z-10 mt-1 w-56 rounded-md border border-border bg-surface-raised p-2 text-xs text-danger-700 shadow-md">
          {t("favoriteError")}
        </span>
      )}
    </span>
  );
}
