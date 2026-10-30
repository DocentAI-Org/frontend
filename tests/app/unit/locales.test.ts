import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, matchLocale } from "@/i18n/locales";

describe("matchLocale", () => {
  it("defaults to English", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(matchLocale(null)).toBe("en");
    expect(matchLocale("")).toBe("en");
    expect(matchLocale(";;q=,")).toBe("en");
  });

  it("picks a supported browser language, regional tags included", () => {
    expect(matchLocale("es")).toBe("es");
    expect(matchLocale("es-MX,es;q=0.9")).toBe("es");
    expect(matchLocale("en-GB")).toBe("en");
  });

  it("follows quality values and skips unsupported languages", () => {
    expect(matchLocale("de;q=1, es;q=0.8, en;q=0.5")).toBe("es");
    expect(matchLocale("en;q=0.2, es;q=0.9")).toBe("es");
    expect(matchLocale("es;q=0, en")).toBe("en");
    expect(matchLocale("de-DE, fr")).toBe("en");
  });
});
