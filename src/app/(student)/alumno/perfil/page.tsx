import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";

import { LinkButton } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Alert } from "@/components/Alert";
import { getConsent, getConsentHistory } from "@/lib/api/consent";
import { getMe } from "@/lib/api/me";

import { revokeConsentAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.profile");
  return { title: t("pageTitle") };
}

const SECTION = "flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6";

/** Profile, language and study consent with revocation (001 US7 AS4, FR-015, #13). */
export default async function ProfilePage() {
  const t = await getTranslations();
  const format = await getFormatter();
  const [me, consent, history] = await Promise.all([getMe(), getConsent(), getConsentHistory()]);
  if (!me.ok || !consent.ok) return <ErrorState code={!me.ok ? me.code : !consent.ok ? consent.code : "unknown"} />;

  const last = history.ok ? history.data.at(-1) : undefined;
  const date = (value: string) => format.dateTime(new Date(value), { dateStyle: "long" });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("student.profile.title")} />
      <section aria-labelledby="account-title" className={SECTION}>
        <h2 id="account-title" className="text-xl font-semibold text-fg">
          {t("student.profile.accountTitle")}
        </h2>
        <dl className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-x-8">
          <dt className="text-sm font-semibold text-fg-muted">{t("student.profile.name")}</dt>
          <dd className="text-fg">{me.data.display_name}</dd>
          {me.data.email && (
            <>
              <dt className="text-sm font-semibold text-fg-muted">{t("student.profile.email")}</dt>
              <dd className="break-all text-fg">{me.data.email}</dd>
            </>
          )}
          <dt className="text-sm font-semibold text-fg-muted">{t("student.profile.language")}</dt>
          <dd>
            <LanguageSwitcher />
          </dd>
        </dl>
      </section>
      <section aria-labelledby="consent-title" className={SECTION}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="consent-title" className="text-xl font-semibold text-fg">
            {t("student.profile.consentTitle")}
          </h2>
          {consent.data.given && consent.data.given_at ? (
            <StatusBadge tone="success" icon="check" label={t("student.profile.consentAccepted", { date: date(consent.data.given_at) })} />
          ) : (
            last?.action === "revoked" && (
              <StatusBadge tone="neutral" icon="lock" label={t("student.profile.consentRevoked", { date: date(last.created_at) })} />
            )
          )}
        </div>
        {consent.data.given ? (
          <p className="text-fg-muted">{t("student.profile.consentBody")}</p>
        ) : (
          <Alert tone="info">{t("student.profile.revokedNotice")}</Alert>
        )}
        <div className="flex flex-wrap gap-2">
          {consent.data.given ? (
            <>
              <LinkButton href="/alumno/consentimiento?paso=2" variant="secondary" icon="file-text">
                {t("student.profile.review")}
              </LinkButton>
              <ConfirmDialog
                trigger={t("student.profile.revoke")}
                triggerVariant="danger"
                title={t("student.profile.revokeTitle")}
                body={t("student.profile.revokeBody")}
                confirmLabel={t("student.profile.revoke")}
                cancelLabel={t("common.actions.cancel")}
                confirmVariant="danger"
                action={revokeConsentAction}
              />
            </>
          ) : (
            <LinkButton href="/alumno/consentimiento?paso=1" icon="check">
              {t("student.profile.giveAgain")}
            </LinkButton>
          )}
        </div>
      </section>
    </div>
  );
}
