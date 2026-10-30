import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

import { THEME_COOKIE, themeFromCookie } from "@/lib/theme";

import { ThemeButtons } from "./ThemeButtons";

/** ThemeSwitcher (prototype › Settings): system, light or dark, stored in a cookie (spec 004). */
export async function ThemeSwitcher({ stretch = false }: { stretch?: boolean }) {
  const t = await getTranslations("common.theme");
  const initial = themeFromCookie((await cookies()).get(THEME_COOKIE)?.value);
  return (
    <ThemeButtons
      initial={initial}
      stretch={stretch}
      labels={{ group: t("label"), system: t("system"), light: t("light"), dark: t("dark") }}
    />
  );
}
