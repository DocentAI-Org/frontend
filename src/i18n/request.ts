import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./locales";

export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  return {
    locale,
    // Fixed so dates render the same on the server (UTC on Vercel) and in the browser.
    timeZone: "Europe/Madrid",
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
