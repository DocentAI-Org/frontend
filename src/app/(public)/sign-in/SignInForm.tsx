"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { type SignInState, signIn } from "@/app/actions/session";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";

const MESSAGES = {
  invalid: "common.auth.invalidIdentifier",
  missing: "common.auth.missing",
  unavailable: "errors.auth_unavailable"
} as const;

export function SignInForm({ next, expired }: { next: string | null; expired: boolean }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
      {state.error ? (
        <Alert tone="danger">{t(MESSAGES[state.error])}</Alert>
      ) : (
        expired && <Alert tone="warning">{t("common.auth.expired")}</Alert>
      )}
      <form action={action} noValidate className="flex flex-col gap-4">
        {next && <input type="hidden" name="next" value={next} />}
        <TextField
          name="identifier"
          label={t("common.auth.identifier")}
          hint={t("common.auth.identifierHint")}
          autoComplete="username"
          required
        />
        <TextField
          name="password"
          type="password"
          label={t("common.auth.password")}
          autoComplete="current-password"
          required
        />
        <Link
          href="/forgot-password"
          className="self-start rounded-sm text-sm text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t("common.auth.forgot")}
        </Link>
        <Button type="submit" pending={pending} pendingLabel={t("common.auth.signingIn")} className="w-full">
          {t("common.auth.signIn")}
        </Button>
      </form>
    </div>
  );
}
