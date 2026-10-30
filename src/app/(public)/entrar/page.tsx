import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ImfaheAcknowledgement } from "@/components/ImfaheAcknowledgement";
import { safeNext } from "@/lib/auth/home";

import { SignInForm } from "./SignInForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.auth");
  return { title: t("signInPageTitle") };
}

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; expirada?: string }>;
}) {
  const { next, expirada } = await searchParams;
  const t = await getTranslations();
  return (
    <div className="mx-auto grid w-full max-w-md gap-10 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b-2 border-neutral-900 pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- static prototype asset, decorative */}
          <img src="/prototype/assets/img/docentai-logo-144.png" alt="" width={56} height={56} className="size-14 shrink-0" />
          <h1 className="text-3xl font-semibold text-fg sm:text-4xl lg:text-5xl">{t("common.auth.signInTitle")}</h1>
          <p className="w-fit bg-surface text-lg text-fg-muted">{t("common.auth.signInLead")}</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <SignInForm next={safeNext(next)} expired={expirada === "1"} />
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm text-fg-muted">
          <ImfaheAcknowledgement />
          <Link
            href="/acerca#privacidad"
            className="rounded-sm bg-surface text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t("common.privacy.link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
