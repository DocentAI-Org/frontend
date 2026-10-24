import { getTranslations } from "next-intl/server";

/** Grant requirement (001 FR-005): logo and acknowledgement on sign-in, About and every footer. */
export async function ImfaheAcknowledgement() {
  const t = await getTranslations("common.imfahe");
  return (
    <div className="flex items-center gap-4" data-component="ImfaheAcknowledgement">
      {/* eslint-disable-next-line @next/next/no-img-element -- static prototype asset, decorative */}
      <img
        src="/prototype/assets/img/imfahe-logo-transparent.webp"
        alt=""
        width={90}
        height={40}
        className="h-10 w-auto shrink-0 dark:invert dark:hue-rotate-180"
      />
      <p>{t("acknowledgement")}</p>
    </div>
  );
}
