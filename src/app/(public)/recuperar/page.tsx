import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Icon } from "@/components/Icon";

import { RecoveryForm } from "./RecoveryForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.auth");
  return { title: t("recoveryPageTitle") };
}

export default async function RecoveryPage() {
  const t = await getTranslations("common.auth");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Link
        href="/entrar"
        className="inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="chevron-left" />
        <span>{t("backToSignIn")}</span>
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-fg">{t("recoveryTitle")}</h1>
          <p className="text-fg-muted">{t("recoveryLead")}</p>
        </div>
        <RecoveryForm />
      </div>
    </div>
  );
}
