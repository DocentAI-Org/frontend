"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLanguage } from "@/app/actions/session";
import { LOCALES } from "@/i18n/locales";

export function LanguageSwitcher({ stretch = false }: { stretch?: boolean }) {
  const t = useTranslations("common");
  const active = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t("a11y.language")}
      className={`${stretch ? "flex" : "inline-flex"} rounded-lg border border-border-strong p-1`}
      data-component="LanguageSwitcher"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === active}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setLanguage(locale);
              router.refresh();
            })
          }
          className={`${stretch ? "min-h-9 flex-1" : "min-h-8"} rounded-md px-4 text-sm font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:bg-neutral-900 aria-pressed:text-fg-inverse`}
        >
          {t(`language.${locale}`)}
        </button>
      ))}
    </div>
  );
}
