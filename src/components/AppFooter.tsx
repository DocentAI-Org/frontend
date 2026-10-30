import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ImfaheAcknowledgement } from "./ImfaheAcknowledgement";

const LINK =
  "rounded-sm text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export async function AppFooter() {
  const t = await getTranslations("common");
  return (
    <footer className="mt-auto border-t border-border-strong bg-surface-raised" data-component="AppFooter">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-fg-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <ImfaheAcknowledgement />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/about" className={LINK}>
            {t("imfahe.aboutLink")}
          </Link>
          <Link href="/about#privacy" className={LINK}>
            {t("privacy.link")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
