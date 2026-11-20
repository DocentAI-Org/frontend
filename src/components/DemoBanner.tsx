import { getTranslations } from "next-intl/server";

import { Icon } from "./Icon";

/** The demo deployment's notice on every page: sample data, shared and reset every hour. */
export async function DemoBanner() {
  const t = await getTranslations("common.demo");
  return (
    <p
      className="flex items-center justify-center gap-2 border-b border-info-200 bg-info-50 px-4 py-2 text-center text-sm text-info-800"
      data-component="DemoBanner"
    >
      <Icon name="info" />
      <span>{t("banner")}</span>
    </p>
  );
}
