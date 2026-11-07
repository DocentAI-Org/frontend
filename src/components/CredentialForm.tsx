"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { errorMessageKey } from "@/lib/api/errors";
import type { CredentialState } from "@/lib/credentials";

import { Alert } from "./Alert";
import { Button } from "./Button";
import { Select } from "./Select";
import { TextField } from "./TextField";

/**
 * Adds a key for a commercial model (backend specs/019). The key is typed in a password field,
 * checked by the provider and never shown again; after an error it has to be typed again.
 */
export function CredentialForm({ action }: { action: (state: CredentialState, form: FormData) => Promise<CredentialState> }) {
  const t = useTranslations("common.credentials");
  const tAll = useTranslations();
  const [state, formAction, pending] = useActionState(action, {});
  const values = state.values;
  const [provider, setProvider] = useState(values?.provider ?? "openai");
  return (
    <form key={state.created ?? 0} action={formAction} noValidate className="flex flex-col gap-4">
      {state.error && <Alert tone="danger">{tAll(errorMessageKey(state.error))}</Alert>}
      {state.created && (
        <p role="status" className="text-sm text-success-800">
          {t("added")}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span id="credential-provider" className="text-sm font-semibold text-fg">
            {t("provider")}
          </span>
          <Select
            name="provider"
            labelId="credential-provider"
            defaultValue={provider}
            onValueChange={setProvider}
            options={(["openai", "anthropic", "openai_compatible"] as const).map((p) => ({ value: p, label: t(`providers.${p}`) }))}
          />
        </div>
        <TextField
          name="label"
          label={t("label")}
          hint={t("labelHint")}
          defaultValue={values?.label}
          error={state.labelError ? t("labelError") : undefined}
          maxLength={80}
          required
        />
      </div>
      {provider === "openai_compatible" && (
        <TextField
          name="base_url"
          type="url"
          inputMode="url"
          label={t("baseUrl")}
          hint={t("baseUrlHint")}
          defaultValue={values?.base_url}
          error={state.urlError ? t("baseUrlError") : undefined}
          required
        />
      )}
      <TextField
        name="api_key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        label={t("key")}
        hint={t("keyHint")}
        error={state.keyError ? t("keyError") : undefined}
        required
      />
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" icon="lock" pending={pending} pendingLabel={t("checking")} className="w-full sm:w-auto">
          {t("add")}
        </Button>
      </div>
    </form>
  );
}
