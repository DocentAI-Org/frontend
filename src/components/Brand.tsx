import { getTranslations } from "next-intl/server";

export async function Brand() {
  const t = await getTranslations("common.brand");
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static prototype asset, decorative */}
      <img src="/prototype/assets/img/docentai-logo-96.png" alt="" width={32} height={32} className="size-8 shrink-0" />
      <span className="font-serif text-xl font-semibold text-fg">{t("name")}</span>
    </>
  );
}
