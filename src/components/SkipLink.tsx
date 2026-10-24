import { getTranslations } from "next-intl/server";

export async function SkipLink() {
  const t = await getTranslations("common.a11y");
  return (
    <a
      href="#main"
      className="sr-only rounded-lg bg-primary-700 px-4 py-2 text-fg-inverse focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      {t("skipToContent")}
    </a>
  );
}
