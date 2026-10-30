import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Icon } from "@/components/Icon";

import { TeacherForm } from "./TeacherForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.teacherNew");
  return { title: t("pageTitle") };
}

export default async function Page() {
  const t = await getTranslations("admin.teacherNew");
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Link
        href="/admin/users"
        className="inline-flex w-fit items-center gap-1 rounded-sm bg-surface text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon name="chevron-left" />
        <span>{t("back")}</span>
      </Link>
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface-raised p-6 sm:p-8">
        <div className="border-b-2 border-neutral-900 pb-4">
          <h1 className="text-3xl font-semibold text-fg">{t("title")}</h1>
          <p className="mt-2 text-fg-muted">{t("lead")}</p>
        </div>
        <TeacherForm />
      </div>
    </div>
  );
}
