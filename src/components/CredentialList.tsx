import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import type { Schemas } from "@/lib/api/client";

import { ConfirmDialog } from "./ConfirmDialog";

/** Stored keys (backend specs/019): label, provider and last characters; deleting asks first. */
export async function CredentialList({
  credentials,
  remove,
  extra
}: {
  credentials: Schemas["Credential"][];
  remove: (form: FormData) => Promise<void>;
  /** More controls for a key, e.g. the models it offers. */
  extra?: (credential: Schemas["Credential"]) => ReactNode;
}) {
  const t = await getTranslations("common.credentials");
  if (!credentials.length) return <p className="text-fg-muted">{t("none")}</p>;
  return (
    <ul className="flex flex-col gap-4">
      {credentials.map((credential) => (
        <li key={credential.id} className="flex flex-col gap-4 rounded-lg border border-border p-4" data-testid="credential">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold break-words text-fg">{credential.label}</p>
              <p className="text-sm text-fg-muted">
                {t(`providers.${credential.provider}`)} · <span className="font-mono">{credential.key_hint}</span>
                {credential.base_url && <> · {credential.base_url}</>}
              </p>
            </div>
            <ConfirmDialog
              trigger={t("delete")}
              triggerVariant="ghost"
              triggerIcon="trash-2"
              triggerLabel={t("deleteFor", { label: credential.label })}
              title={t("deleteTitle", { label: credential.label })}
              body={t("deleteBody")}
              confirmLabel={t("deleteConfirm")}
              cancelLabel={t("cancel")}
              confirmVariant="danger"
              action={remove}
              fields={{ id: credential.id }}
            />
          </div>
          {extra?.(credential)}
        </li>
      ))}
    </ul>
  );
}
