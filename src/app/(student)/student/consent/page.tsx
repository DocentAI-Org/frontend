import type { Metadata, Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LinkButton, buttonClass } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { getAllowance } from "@/lib/api/chat";
import { getConsent, getConsentHistory } from "@/lib/api/consent";
import { safeNext } from "@/lib/auth/home";

import { ConsentForm } from "./ConsentForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.consent");
  return { title: t("pageTitle") };
}

const BULLET = "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-fg";

/** Study consent (001 US7 AS4, #5): information and acceptance, then how the tutor works. */
export default async function ConsentPage({
  searchParams
}: {
  searchParams: Promise<{ step?: string; next?: string }>;
}) {
  const { step, next: rawNext } = await searchParams;
  const next = safeNext(rawNext);
  const t = await getTranslations("student");
  const [consent, history] = await Promise.all([getConsent(), getConsentHistory()]);
  if (!consent.ok) return <ErrorState code={consent.code} />;

  if (step === "2" && consent.data.given) {
    const allowance = await getAllowance();
    const limit = allowance.ok ? allowance.data.limit : 30;
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <section aria-labelledby="how-title" className="rounded-xl border border-border bg-surface-raised p-6 sm:p-8" data-component="AIDisclosure" data-variant="consent-step">
          <p className="text-sm font-semibold text-fg-muted tabular-nums">{t("consent.step", { step: 2, total: 2 })}</p>
          <h1 id="how-title" className="mt-1 text-3xl font-semibold text-fg">{t("consent.howTitle")}</h1>
          <p className="mt-2 text-fg-muted">{t("consent.howIntro")}</p>
          <ul className="mt-6 flex flex-col gap-4">
            {(
              [
                ["sparkles", t("chat.disclosure.ai")],
                ["book-open", t("chat.disclosure.material")],
                ["eye", t("chat.disclosure.review")],
                ["message-circle", t("chat.disclosure.limit", { limit })]
              ] as const
            ).map(([icon, text]) => (
              <li key={icon} className="flex gap-4">
                <span className={BULLET}>
                  <Icon name={icon} className="size-5 shrink-0" />
                </span>
                <span className="pt-2 text-fg tabular-nums">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
            <Link href="/student/consent?step=1" className={buttonClass("ghost")}>
              <Icon name="chevron-left" />
              <span>{t("consent.back")}</span>
            </Link>
            <LinkButton href={(next ?? "/student/courses") as Route} iconEnd="chevron-right">
              {t("consent.understood")}
            </LinkButton>
          </div>
        </section>
      </div>
    );
  }

  const events = history.ok ? history.data : [];
  const revoked = !consent.data.given && events.at(-1)?.action === "revoked";
  if (revoked && step !== "1") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <section aria-labelledby="revoked-title" className="flex flex-col items-start gap-4 rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
          <span className={BULLET}>
            <Icon name="lock" className="size-5 shrink-0" />
          </span>
          <h1 id="revoked-title" className="text-3xl font-semibold text-fg">{t("consent.revokedTitle")}</h1>
          <p className="text-fg">{t("consent.revokedBody")}</p>
          <p className="text-fg-muted">{t("consent.revokedAgain")}</p>
          <LinkButton href="/student/consent?step=1">{t("consent.giveAgain")}</LinkButton>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <section aria-labelledby="consent-title" className="rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
        <p className="text-sm font-semibold text-fg-muted tabular-nums">{t("consent.step", { step: 1, total: 2 })}</p>
        <h1 id="consent-title" className="mt-1 text-3xl font-semibold text-fg">{t("consent.title")}</h1>
        <p className="mt-2 text-fg-muted">{t("consent.intro")}</p>
        <ul className="mt-6 flex flex-col gap-6">
          {(
            [
              ["lightbulb", "purpose"],
              ["file-text", "data"],
              ["eye", "who"],
              ["lock", "rights"]
            ] as const
          ).map(([icon, key]) => (
            <li key={key} className="flex gap-4">
              <span className={`${BULLET} bg-surface`}>
                <Icon name={icon} className="size-5 shrink-0" />
              </span>
              <div>
                <h2 className="font-semibold text-fg">{t(`consent.${key}Title`)}</h2>
                <p className="mt-1 text-fg-muted">{t(`consent.${key}Body`)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/about#privacy"
          className="mt-6 inline-block rounded-sm text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("consent.privacyLink")}
        </Link>
        <ConsentForm next={next} />
      </section>
    </div>
  );
}
