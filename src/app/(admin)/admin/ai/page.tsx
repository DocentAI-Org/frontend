import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AISettingsForm } from "@/components/AISettingsForm";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getServerAIModels, getStudyAISettings } from "@/lib/api/admin";

import { saveStudyAISettingsAction } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.ai");
  return { title: t("pageTitle") };
}

/** The study's AI settings, used by every course without its own (019 US6). */
export default async function StudyAIPage() {
  const t = await getTranslations("admin.ai");
  const [settings, models] = await Promise.all([getStudyAISettings(), getServerAIModels()]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {!settings.ok ? (
        <ErrorState code={settings.code} />
      ) : !models.ok ? (
        <ErrorState code={models.code} />
      ) : (
        <AISettingsForm
          mode="study"
          server={settings.data.server}
          own={settings.data.study}
          sources={models.data.sources}
          save={saveStudyAISettingsAction}
        />
      )}
    </div>
  );
}
