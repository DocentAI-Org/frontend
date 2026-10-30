import { getTranslations } from "next-intl/server";

import { getStudentCourse } from "@/lib/api/courses";
import { routes } from "@/lib/routes";

import { LinkButton } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";

import { JoinForm } from "./JoinForm";

/** Join with a code or invitation link (001 US4 AS5–AS6; deviation D7: confirmation after joining). */
export async function JoinScreen({ code, joinedCourseId }: { code?: string; joinedCourseId?: string }) {
  const t = await getTranslations("student.join");
  const joined = joinedCourseId ? await getStudentCourse(joinedCourseId) : null;
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={t("title")} lead={joined?.ok ? undefined : t("lead")} />
      {joined?.ok ? (
        <section aria-labelledby="joined-title" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6 sm:p-8" role="status">
          <h2 id="joined-title" className="text-xl font-semibold text-fg">
            {t("joined")}
          </h2>
          <div className="flex flex-col gap-2 border-l-4 border-primary-600 pl-4">
            <p className="font-serif text-2xl font-semibold text-fg">{joined.data.name}</p>
            <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
              <Icon name="graduation-cap" />
              <span>
                {t("teacher")}: {joined.data.teacher_name}
              </span>
            </p>
            {joined.data.description && <p className="text-fg">{joined.data.description}</p>}
          </div>
          <LinkButton href={routes.studentCourse(joined.data.id)} iconEnd="chevron-right" className="self-start">
            {t("goToCourse")}
          </LinkButton>
        </section>
      ) : (
        <JoinForm code={code} />
      )}
    </div>
  );
}
