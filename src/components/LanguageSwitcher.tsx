"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";

import { setLanguage } from "@/app/actions/session";
import { LOCALES, isLocale } from "@/i18n/locales";

import { Icon } from "./Icon";
import { Select } from "./Select";

function useSetLanguage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const choose = (locale: string) => {
    if (!isLocale(locale)) return;
    startTransition(async () => {
      await setLanguage(locale);
      router.refresh();
    });
  };
  return [pending, choose] as const;
}

/** A compact Select for headers, so adding a language to LOCALES needs no layout change. */
export function LanguageSwitcher() {
  const t = useTranslations("common");
  const active = useLocale();
  const [pending, choose] = useSetLanguage();

  return (
    <div data-component="LanguageSwitcher" className="w-32">
      <Select
        size="sm"
        aria-label={t("a11y.language")}
        value={active}
        disabled={pending}
        options={LOCALES.map((locale) => ({ value: locale, label: t(`language.${locale}`), lang: locale }))}
        onValueChange={choose}
      />
    </div>
  );
}

/** A user-menu row: "Language" and a compact Select, so more languages need no layout change. */
export function LanguageMenuRow() {
  const t = useTranslations("common");
  const active = useLocale();
  const [pending, choose] = useSetLanguage();
  const label = useId();

  return (
    <div className="flex min-h-9 items-center gap-2 px-3 text-sm text-fg" data-component="LanguageSwitcher" data-variant="menu">
      <Icon name="globe" />
      <span id={label}>{t("a11y.language")}</span>
      <Select
        size="sm"
        labelId={label}
        value={active}
        disabled={pending}
        options={LOCALES.map((locale) => ({ value: locale, label: t(`language.${locale}`), lang: locale }))}
        onValueChange={choose}
        className="ml-auto w-32 shrink-0"
      />
    </div>
  );
}
