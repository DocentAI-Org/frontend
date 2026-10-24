export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
/** Mirrors the signed-in user's `preferred_language`; also used on public pages. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
