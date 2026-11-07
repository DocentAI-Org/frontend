import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/Button";
import { CredentialForm } from "@/components/CredentialForm";
import { CredentialList } from "@/components/CredentialList";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getCredentialModels, listStudyCredentials } from "@/lib/api/admin";
import type { Schemas } from "@/lib/api/client";

import { createStudyCredentialAction, deleteStudyCredentialAction, saveOfferedModelsAction } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.providers");
  return { title: t("pageTitle") };
}

/** The models of a study key that courses may use (019 US3). */
async function OfferedModels({ credential }: { credential: Schemas["Credential"] }) {
  const t = await getTranslations("admin.providers");
  const models = await getCredentialModels(credential.id);
  if (!models.ok || !models.data.reachable) return <p className="text-sm text-fg-muted">{t("modelsUnreachable")}</p>;
  const offered = credential.offered_models;
  return (
    <form action={saveOfferedModelsAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={credential.id} />
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-semibold text-fg">{t("offered", { label: credential.label })}</legend>
        <label className="inline-flex min-h-11 items-center gap-2 text-fg">
          <input type="checkbox" name="all" defaultChecked={offered === null} className="size-5 accent-primary-600" />
          <span>{t("allModels")}</span>
        </label>
        <div className="grid gap-x-6 sm:grid-cols-2">
          {models.data.models.map((model) => (
            <label key={model.id} className="inline-flex min-h-11 items-center gap-2 text-fg">
              <input
                type="checkbox"
                name="model"
                value={model.id}
                defaultChecked={offered === null || offered.includes(model.id)}
                className="size-5 accent-primary-600"
              />
              <span className="break-all">{model.label ?? model.id}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-sm text-fg-muted">{t("offeredHelp")}</p>
      <div>
        <Button type="submit" variant="secondary">
          {t("saveOffered")}
        </Button>
      </div>
    </form>
  );
}

/** Keys for commercial models: the server's and the study's (019 US3). */
export default async function AIProvidersPage() {
  const t = await getTranslations("admin.providers");
  const credentials = await listStudyCredentials();
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {!credentials.ok ? (
        <ErrorState code={credentials.code} />
      ) : (
        <>
          <section aria-labelledby="server-keys" className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
            <h2 id="server-keys" className="text-xl font-semibold text-fg">
              {t("serverTitle")}
            </h2>
            <p className="text-sm text-fg-muted">{t("serverHelp")}</p>
            <ul className="list-inside list-disc text-fg">
              {credentials.data.server.map((key) => (
                <li key={key.provider}>{key.label}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="study-keys" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
            <h2 id="study-keys" className="text-xl font-semibold text-fg">
              {t("studyTitle")}
            </h2>
            <p className="text-sm text-fg-muted">{t("studyHelp")}</p>
            <CredentialList
              credentials={credentials.data.items}
              remove={deleteStudyCredentialAction}
              extra={(credential) => <OfferedModels credential={credential} />}
            />
          </section>
          <section aria-labelledby="add-key" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
            <h2 id="add-key" className="text-xl font-semibold text-fg">
              {t("addTitle")}
            </h2>
            <p className="text-sm text-fg-muted">{t("addHelp")}</p>
            <CredentialForm action={createStudyCredentialAction} />
          </section>
        </>
      )}
    </div>
  );
}
