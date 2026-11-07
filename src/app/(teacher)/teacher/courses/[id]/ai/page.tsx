import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { AISettingsForm } from "@/components/AISettingsForm";
import { ErrorState } from "@/components/ErrorState";
import { getCourseAIModels, getCourseAISettings } from "@/lib/api/ai";

import { saveCourseAISettingsAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.ai");
  return { title: t("pageTitle") };
}

/** The course's AI: message limit, model per task and retrieval, inherited or its own (019 US1, US3). */
export default async function CourseAIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("teacher.ai");
  const [settings, models] = await Promise.all([getCourseAISettings(id), getCourseAIModels(id)]);
  if (!settings.ok) return <ErrorState code={settings.code} />;
  if (!models.ok) return <ErrorState code={models.code} />;
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      <AISettingsForm
        mode="course"
        inherited={settings.data.inherited}
        own={settings.data.course}
        ceiling={settings.data.ceiling}
        sources={models.data.sources}
        save={saveCourseAISettingsAction.bind(null, id)}
      />
    </div>
  );
}
