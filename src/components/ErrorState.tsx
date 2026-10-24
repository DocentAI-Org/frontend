import { getTranslations } from "next-intl/server";

import { errorMessageKey } from "@/lib/api/errors";

import { Icon } from "./Icon";
import { RetryButton } from "./RetryButton";

/** The designed error state of a data-driven view (001 FR-001): what happened and a retry. */
export async function ErrorState({ code }: { code: string }) {
  const t = await getTranslations();
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-xl border border-danger-200 bg-danger-50 px-6 py-12 text-center"
      data-component="ErrorState"
    >
      <Icon name="triangle-alert" className="size-6 shrink-0 text-danger-700" />
      <h2 className="text-lg font-semibold text-fg">{t("common.states.errorTitle")}</h2>
      <p className="max-w-md text-fg">{t(errorMessageKey(code))}</p>
      <RetryButton label={t("common.actions.retry")} />
    </div>
  );
}
