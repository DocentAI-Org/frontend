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
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { next, expired } = await searchParams;
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
        {/* A page of the notebook: what a tutor answer looks like. Decorative, so hidden from AT. */}
        <div className="hidden grid-cols-12 gap-x-4 rounded-xl border border-border bg-surface-raised p-6 lg:grid" aria-hidden="true">
          <div className="col-span-8 flex flex-col gap-4">
            <p className="ml-auto max-w-xs rounded-r-md border-l-4 border-primary-600 bg-surface-raised px-4 py-2 text-sm text-fg shadow-sm">
              {t("common.auth.preview.question")}
            </p>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg-muted">
                <span>{t("student.chat.tutorName")}</span>
                <span className="rounded-sm border border-info-300 px-1 text-xs font-bold text-info-800">{t("student.chat.aiTag")}</span>
              </p>
              <p className="font-serif text-fg">
                {t("common.auth.preview.answer")}
                <sup className="ml-1 font-sans text-xs font-bold text-teacher-700">1</sup>
              </p>
              <p className="bg-grid mt-2 rounded-md border border-border px-4 py-2 font-serif text-fg italic">
                {t("common.auth.preview.equation")}
              </p>
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-1 border-l-2 border-margin pl-4">
            <p className="text-xs font-bold text-teacher-700">{t("student.chat.sources")}</p>
            <p className="text-sm font-semibold text-teacher-700">
              <sup className="text-xs font-bold">1</sup> {t("common.auth.preview.source")}
            </p>
            <p className="line-clamp-4 font-serif text-sm text-fg-muted italic">{t("common.auth.preview.passage")}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <SignInForm next={safeNext(next)} expired={expired === "1"} />
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm text-fg-muted">
          <ImfaheAcknowledgement />
          <Link
            href="/about#privacy"
            className="rounded-sm bg-surface text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t("common.privacy.link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
