import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { LOCALE_COOKIE, isLocale, matchLocale } from "./locales";

export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  // The cookie (the user's choice or profile) wins; otherwise the browser's language (003 FR-002).
  const locale = isLocale(stored) ? stored : matchLocale((await headers()).get("accept-language"));
  return {
    locale,
    // Fixed so dates render the same on the server (UTC on Vercel) and in the browser.
    timeZone: "Europe/Madrid",
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
