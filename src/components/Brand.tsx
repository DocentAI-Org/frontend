import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** The DocentAI icon and name: one link home, not selectable as text (spec 004 FR-003). */
export async function Brand({ href = "/" as Route }: { href?: Route }) {
  const t = await getTranslations("common");
  return (
    <Link
      href={href}
      aria-label={t("a11y.homeLink")}
      className="flex shrink-0 select-none items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static prototype asset, decorative */}
      <img src="/prototype/assets/img/docentai-logo-96.png" alt="" width={32} height={32} draggable={false} className="size-8 shrink-0" />
      <span className="font-serif text-xl font-semibold text-fg">{t("brand.name")}</span>
    </Link>
  );
}
