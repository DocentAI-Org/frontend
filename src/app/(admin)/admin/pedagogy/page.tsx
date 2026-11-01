import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CriteriaForm } from "@/components/CriteriaForm";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { getStudyCriteria } from "@/lib/api/admin";

import { saveStudyCriteriaAction } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.criteria");
  return { title: t("pageTitle") };
}

/** The study's pedagogical criteria, the defaults of every course (015 US1). */
export default async function StudyCriteriaPage() {
  const t = await getTranslations("admin.criteria");
  const criteria = await getStudyCriteria();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {!criteria.ok ? (
        <ErrorState code={criteria.code} />
      ) : (
        <CriteriaForm mode="study" initial={criteria.data.criteria} provisional={criteria.data.provisional} save={saveStudyCriteriaAction} />
      )}
    </div>
  );
}
