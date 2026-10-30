"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { type RecoveryState, requestPasswordReset } from "@/app/actions/session";
import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { TextField } from "@/components/TextField";

export function RecoveryForm() {
  const t = useTranslations("common.auth");
  const [state, action, pending] = useActionState<RecoveryState, FormData>(requestPasswordReset, {});
  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">{t("sent")}</Alert>
        <LinkButton href="/entrar" variant="secondary" icon="chevron-left">
          {t("backToSignIn")}
        </LinkButton>
      </div>
    );
  }
  return (
    <>
      {state.error && <Alert tone="danger">{t("recoveryError")}</Alert>}
      <form action={action} noValidate className="flex flex-col gap-4">
        <TextField name="email" type="email" label={t("email")} autoComplete="username" required />
        <Button type="submit" pending={pending} pendingLabel={t("sending")} className="w-full">
          {t("sendLink")}
        </Button>
      </form>
    </>
  );
}
