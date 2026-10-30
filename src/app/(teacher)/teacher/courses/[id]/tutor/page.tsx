import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/ErrorState";
import { getTutorSettings } from "@/lib/api/tutor";

import { SettingsForm } from "./SettingsForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.tutorSettings");
  return { title: t("pageTitle") };
}

export default async function TutorSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("teacher.tutorSettings");
  const settings = await getTutorSettings(id);
  if (!settings.ok) return <ErrorState code={settings.code} />;
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      <SettingsForm courseId={id} initial={settings.data} />
    </div>
  );
}
