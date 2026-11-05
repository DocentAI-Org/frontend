import "server-only";

import { cookies } from "next/headers";

import { THEME_COOKIE, type ThemeChoice, themeFromCookie } from "./theme";

/** The saved theme choice for this request, so switchers render it pressed from the first paint. */
export async function themeChoice(): Promise<ThemeChoice> {
  return themeFromCookie((await cookies()).get(THEME_COOKIE)?.value) ?? "system";
}
