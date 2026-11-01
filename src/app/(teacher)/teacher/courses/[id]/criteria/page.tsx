import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CriteriaForm } from "@/components/CriteriaForm";
import { ErrorState } from "@/components/ErrorState";
import { getCourseCriteria } from "@/lib/api/pedagogy";

import { saveCourseCriteriaAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.criteria");
  return { title: t("pageTitle") };
}

/** The course's pedagogical criteria: the study's, or the teacher's own per group (015 US2). */
export default async function CourseCriteriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("teacher.criteria");
  const criteria = await getCourseCriteria(id);
  if (!criteria.ok) return <ErrorState code={criteria.code} />;
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      <CriteriaForm
        mode="course"
        study={criteria.data.study}
        initial={criteria.data.effective}
        custom={criteria.data.custom}
        save={saveCourseCriteriaAction.bind(null, id)}
      />
    </div>
  );
}
