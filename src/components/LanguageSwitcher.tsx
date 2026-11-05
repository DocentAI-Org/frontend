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

/** A Select, so adding a language to LOCALES needs no layout change. */
export function LanguageSwitcher({ stretch = false }: { stretch?: boolean }) {
  const t = useTranslations("common");
  const active = useLocale();
  const [pending, choose] = useSetLanguage();

  return (
    <div data-component="LanguageSwitcher" className={stretch ? "min-w-0 flex-1" : "w-40"}>
      <Select
        aria-label={t("a11y.language")}
        value={active}
        disabled={pending}
        options={LOCALES.map((locale) => ({ value: locale, label: t(`language.${locale}`), lang: locale }))}
        onValueChange={choose}
      />
    </div>
  );
}

/** A user-menu row: the languages as small pressed/unpressed text buttons, lighter than a Select. */
export function LanguageMenuRow() {
  const t = useTranslations("common");
  const active = useLocale();
  const [pending, choose] = useSetLanguage();
  const label = useId();

  return (
    <div className="flex min-h-9 items-center gap-2 px-3 text-sm text-fg" data-component="LanguageSwitcher" data-variant="menu">
      <Icon name="globe" />
      <span id={label}>{t("a11y.language")}</span>
      <div role="group" aria-labelledby={label} className="ml-auto flex gap-1">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            lang={locale}
            aria-pressed={locale === active}
            disabled={pending}
            onClick={() => locale !== active && choose(locale)}
            className="min-h-8 rounded-md px-2 text-xs font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-pressed:bg-neutral-900 aria-pressed:text-fg-inverse"
          >
            {t(`language.${locale}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
