import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { Select } from "@/components/Select";
import { listAllCourses } from "@/lib/api/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.studyExport");
  return { title: t("pageTitle") };
}

/** Study data export for the study team (012 US1, requirement P5). */
export default async function StudyExportPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = await getTranslations("admin.studyExport");
  const { error } = await searchParams;
  const courses = await listAllCourses();
  const options = [
    { value: "", label: t("allCourses") },
    ...(courses.ok ? courses.data.items.map((course) => ({ value: course.id, label: course.name })) : [])
  ];
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      {error && <Alert tone="danger">{t("downloadError")}</Alert>}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
        <div>
          <h2 className="font-semibold text-fg">{t("includedTitle")}</h2>
          <p className="text-fg">{t("included")}</p>
        </div>
        <div>
          <h2 className="font-semibold text-fg">{t("excludedTitle")}</h2>
          <p className="text-fg">{t("excluded")}</p>
        </div>
      </section>
      <form method="get" action="/admin/study-export/download" className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2 sm:w-72">
          <label id="study-export-course" htmlFor="study-export-course-select" className="font-semibold text-fg">
            {t("courseLabel")}
          </label>
          <Select id="study-export-course-select" labelId="study-export-course" name="course_id" options={options} defaultValue="" />
        </div>
        <Button type="submit">{t("download")}</Button>
      </form>
      {courses.ok && courses.data.items.length === 0 && <p className="text-sm text-fg-muted">{t("emptyCourses")}</p>}
    </div>
  );
}
