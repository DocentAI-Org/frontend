import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/PageHeader";

import { CourseForm } from "./CourseForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.courseNew");
  return { title: t("pageTitle") };
}

export default async function NewCoursePage() {
  const t = await getTranslations("teacher.courseNew");
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} back={{ href: "/profesor/cursos", label: t("back") }} />
      <CourseForm />
    </div>
  );
}
