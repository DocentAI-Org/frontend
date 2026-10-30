"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLanguage } from "@/app/actions/session";
import { LOCALES, isLocale } from "@/i18n/locales";

import { Select } from "./Select";

/** A Select, so adding a language to LOCALES needs no layout change. */
export function LanguageSwitcher({ stretch = false }: { stretch?: boolean }) {
  const t = useTranslations("common");
  const active = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div data-component="LanguageSwitcher" className={stretch ? "w-full" : "w-40"}>
      <Select
        aria-label={t("a11y.language")}
        value={active}
        disabled={pending}
        options={LOCALES.map((locale) => ({ value: locale, label: t(`language.${locale}`), lang: locale }))}
        onValueChange={(locale) => {
          if (!isLocale(locale)) return;
          startTransition(async () => {
            await setLanguage(locale);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
