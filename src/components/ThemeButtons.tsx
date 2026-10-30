"use client";

import { useState } from "react";

import { THEMES, THEME_COOKIE, type Theme } from "@/lib/theme";

import { Icon } from "./Icon";

const ICONS: Record<Theme, string> = { system: "monitor", light: "sun", dark: "moon" };
const YEAR = 60 * 60 * 24 * 365;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } else {
    root.setAttribute("data-theme", theme);
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${YEAR}; samesite=lax`;
  }
}

/** Applies the choice at once on <html>; the root layout reads the cookie on the next request. */
export function ThemeButtons({
  initial,
  stretch,
  labels
}: {
  initial: Theme;
  stretch: boolean;
  labels: Record<Theme | "group", string>;
}) {
  const [theme, setTheme] = useState(initial);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div
      role="group"
      aria-label={labels.group}
      className={`${stretch ? "flex" : "inline-flex"} rounded-lg border border-border-strong p-1`}
      data-component="ThemeSwitcher"
    >
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-label={labels[option]}
          title={labels[option]}
          aria-pressed={option === theme}
          onClick={() => choose(option)}
          className={`${stretch ? "flex-1" : ""} inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:bg-neutral-900 aria-pressed:text-fg-inverse`}
        >
          <Icon name={ICONS[option]} />
        </button>
      ))}
    </div>
  );
}
