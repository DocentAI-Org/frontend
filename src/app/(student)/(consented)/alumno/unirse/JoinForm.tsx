"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type JoinState, joinAction } from "./actions";

const CODE_MESSAGES: Record<string, string> = {
  class_code_invalid: "student.join.invalid",
  class_code_disabled: "student.join.disabled"
};

export function JoinForm({ code }: { code?: string }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState<JoinState, FormData>(joinAction, {});
  const message = state.error ? (CODE_MESSAGES[state.error] ?? errorMessageKey(state.error)) : null;
  return (
    <form action={action} noValidate className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
      {message && <Alert tone="danger">{t(message)}</Alert>}
      <TextField
        name="code"
        label={t("student.join.code")}
        hint={t("student.join.codeHelp")}
        defaultValue={state.code ?? code}
        autoComplete="off"
        autoCapitalize="characters"
        error={message ? t(message) : undefined}
        required
      />
      <p className="text-sm text-fg-muted">{t("student.join.privacy")}</p>
      <Button type="submit" pending={pending} pendingLabel={t("student.join.searching")} icon="check" className="w-full sm:w-auto sm:self-end">
        {t("student.join.confirm")}
      </Button>
    </form>
  );
}
