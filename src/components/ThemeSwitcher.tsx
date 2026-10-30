"use client";

import { useTranslations } from "next-intl";

import { THEME_COOKIE } from "@/lib/theme";

import { Icon } from "./Icon";

const YEAR = 60 * 60 * 24 * 365;

function isDark() {
  const chosen = document.documentElement.getAttribute("data-theme");
  return chosen ? chosen === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Saves the opposite of what is shown as the user's preference and applies it at once. */
function toggleTheme() {
  const next = isDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${YEAR}; samesite=lax`;
}

/**
 * ThemeSwitcher (spec 004): one button that switches between light and dark. Until the user picks
 * one it follows the system. Icon and label come from the `dark:` variant, so the server renders
 * the right ones whatever the system theme is.
 */
export function ThemeSwitcher() {
  const t = useTranslations("common.theme");
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border-strong bg-surface-raised text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      data-component="ThemeSwitcher"
    >
      <Icon name="moon" className="size-5 shrink-0 dark:hidden" />
      <Icon name="sun" className="hidden size-5 shrink-0 dark:block" />
      <span className="sr-only dark:hidden">{t("toDark")}</span>
      <span className="sr-only hidden dark:inline">{t("toLight")}</span>
    </button>
  );
}
