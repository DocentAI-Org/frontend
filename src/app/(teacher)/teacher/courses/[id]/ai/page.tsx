import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AINotices } from "@/components/AINotices";
import { AISettingsForm } from "@/components/AISettingsForm";
import { CredentialForm } from "@/components/CredentialForm";
import { CredentialList } from "@/components/CredentialList";
import { ErrorState } from "@/components/ErrorState";
import { getCourseAIModels, getCourseAISettings, listOwnCredentials } from "@/lib/api/ai";

import { createOwnCredentialAction, deleteOwnCredentialAction, saveCourseAISettingsAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.ai");
  return { title: t("pageTitle") };
}

/** The course's AI: message limit, model per task and retrieval, inherited or its own (019 US1, US3). */
export default async function CourseAIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("teacher.ai");
  const [settings, models, own] = await Promise.all([getCourseAISettings(id), getCourseAIModels(id), listOwnCredentials(id)]);
  if (!settings.ok) return <ErrorState code={settings.code} />;
  if (!models.ok) return <ErrorState code={models.code} />;
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      <div className="max-w-3xl">
        <AINotices notices={settings.data.notices} />
      </div>
      <AISettingsForm
        mode="course"
        inherited={settings.data.inherited}
        own={settings.data.course}
        ceiling={settings.data.ceiling}
        sources={models.data.sources}
        save={saveCourseAISettingsAction.bind(null, id)}
      />
      {settings.data.allow_teacher_keys && (
        <section aria-labelledby="own-keys" className="flex max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
          <h2 id="own-keys" className="text-xl font-semibold text-fg">
            {t("ownKeys.title")}
          </h2>
          <p className="text-sm text-fg-muted">{t("ownKeys.help")}</p>
          {own.ok ? (
            <CredentialList credentials={own.data} remove={deleteOwnCredentialAction.bind(null, id)} />
          ) : (
            <ErrorState code={own.code} />
          )}
          <CredentialForm action={createOwnCredentialAction.bind(null, id)} />
        </section>
      )}
    </div>
  );
}
