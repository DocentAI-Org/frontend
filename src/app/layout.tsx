import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

import { NavigationTracker } from "@/components/NavigationTracker";
import { THEME_COOKIE, themeFromCookie } from "@/lib/theme";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: { default: "DocentAI", template: "%s · DocentAI" }, description: t("brand.tagline") };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const theme = themeFromCookie((await cookies()).get(THEME_COOKIE)?.value);
  return (
    // A saved choice is set before the first paint; without one theme.css follows the system.
    <html lang={locale} data-theme={theme}>
      <body suppressHydrationWarning>
        <NavigationTracker />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
