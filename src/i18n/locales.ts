/** English is the base language; every other locale is an add-on (003). */
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
/** Mirrors the signed-in user's `preferred_language`; also used on public pages. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** The best supported match of an `Accept-Language` header, or the default locale. */
export function matchLocale(header: string | null): Locale {
  const ranked = (header ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag, ...params] = entry.trim().split(";");
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { base: tag.trim().toLowerCase().split("-")[0], quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(({ base, quality }) => base && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return ranked.map(({ base }) => base).find(isLocale) ?? DEFAULT_LOCALE;
}
