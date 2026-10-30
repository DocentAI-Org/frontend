import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BackLink } from "@/components/BackLink";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return { title: t("pageTitle") };
}

export default async function AboutPage() {
  const t = await getTranslations();
  const email = process.env.PRIVACY_CONTACT_EMAIL ?? "privacidad@example.org";
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <BackLink>{t("about.back")}</BackLink>
      <article className="flex flex-col gap-10 rounded-xl border border-border bg-surface-raised p-6 sm:p-10">
        <header className="border-b-2 border-neutral-900 pb-6">
          <h1 className="text-4xl font-semibold text-fg sm:text-5xl">{t("about.title")}</h1>
          <p className="mt-4 max-w-prose font-serif text-xl text-fg">{t("about.lead")}</p>
        </header>
        <section aria-labelledby="funding-title" className="flex flex-col gap-4">
          <h2 id="funding-title" className="text-2xl font-semibold text-fg">
            {t("about.fundingTitle")}
          </h2>
          <div
            className="flex flex-col items-start gap-6 border-y border-border py-6 sm:flex-row sm:items-center"
            data-component="ImfaheAcknowledgement"
            data-variant="about"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static prototype asset, decorative */}
            <img
              src="/prototype/assets/img/imfahe-logo-transparent.webp"
              alt=""
              width={145}
              height={64}
              className="h-16 w-auto shrink-0 dark:invert dark:hue-rotate-180"
            />
            <p className="font-serif text-lg text-fg">{t("common.imfahe.acknowledgement")}</p>
          </div>
        </section>
        <section id="privacy" aria-labelledby="privacy-title" className="flex scroll-mt-24 flex-col gap-4">
          <h2 id="privacy-title" className="text-2xl font-semibold text-fg">
            {t("about.privacyTitle")}
          </h2>
          <ul className="flex max-w-prose list-disc flex-col gap-2 pl-6 font-serif text-lg text-fg marker:text-fg-muted">
            <li>{t("about.privacy1")}</li>
            <li>{t("about.privacy2")}</li>
            <li>{t("about.privacy3")}</li>
          </ul>
          <p className="max-w-prose text-fg-muted">{t("about.contact", { email })}</p>
        </section>
      </article>
    </div>
  );
}
