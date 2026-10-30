import { getTranslations } from "next-intl/server";

import { Icon } from "./Icon";

export async function LoadingState() {
  const t = await getTranslations("common.states");
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-12 text-fg-muted" data-component="LoadingState">
      <Icon name="refresh-cw" className="size-5 shrink-0 motion-safe:animate-spin" />
      <span>{t("loading")}</span>
    </div>
  );
}
