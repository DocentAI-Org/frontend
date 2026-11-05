"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { THEME_COOKIE, type ThemeChoice } from "@/lib/theme";

import { Icon } from "./Icon";

const YEAR = 60 * 60 * 24 * 365;

const OPTIONS: { value: ThemeChoice; icon: string }[] = [
  { value: "system", icon: "monitor" },
  { value: "light", icon: "sun" },
  { value: "dark", icon: "moon" }
];

/** Applies the choice at once and remembers it; "system" forgets it, so theme.css follows the system. */
function apply(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    root.setAttribute("data-theme", choice);
    document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=${YEAR}; samesite=lax`;
  }
}

/**
 * ThemeSwitcher (spec 004): system, light and dark as a small segmented pill, like Geist's. `initial`
 * is the saved choice the server rendered the page with (no cookie means the system theme).
 */
export function ThemeSwitcher({ initial }: { initial: ThemeChoice }) {
  const t = useTranslations("common.theme");
  const [choice, setChoice] = useState(initial);
  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-surface-raised p-0.5"
      data-component="ThemeSwitcher"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={t(option.value)}
          aria-pressed={choice === option.value}
          title={t(option.value)}
          onClick={() => {
            apply(option.value);
            setChoice(option.value);
          }}
          className="inline-flex size-7 items-center justify-center rounded-full text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:bg-surface-sunken aria-pressed:text-fg"
        >
          <Icon name={option.icon} className="size-4 shrink-0" />
        </button>
      ))}
    </div>
  );
}

/** A row of the account menu: "Theme" and the switcher, shaped like the language row. */
export function ThemeMenuRow({ initial }: { initial: ThemeChoice }) {
  const t = useTranslations("common.theme");
  return (
    <div className="flex min-h-9 items-center gap-2 px-3 text-sm text-fg">
      <Icon name="sun" />
      <span>{t("label")}</span>
      <span className="ml-auto">
        <ThemeSwitcher initial={initial} />
      </span>
    </div>
  );
}
