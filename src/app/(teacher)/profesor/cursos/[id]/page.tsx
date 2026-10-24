import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import { getTeacherCourse, listCourseStudents } from "@/lib/api/courses";
import { errorMessageKey } from "@/lib/api/errors";

import { regenerateCodeAction, revokeStudentAction, setCodeActiveAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.course");
  return { title: t("pageTitle") };
}

async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Course overview (#16): invitation code and link, students (001 US4 AS2–AS4). */
export default async function TeacherCoursePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ codigo?: string; error?: string }>;
}) {
  const { id } = await params;
  const { codigo, error } = await searchParams;
  const t = await getTranslations();
  const format = await getFormatter();
  const [course, students] = await Promise.all([getTeacherCourse(id), listCourseStudents(id)]);
  if (!course.ok) return null; // the layout shows the error
  const link = `${await appOrigin()}${course.data.invitation_path}`;
  const code = course.data.class_code;
  const fields = { course_id: id };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="invite-title" className="flex flex-col gap-4">
        <div>
          <h2 id="invite-title" className="text-lg font-semibold text-fg">
            {t("teacher.course.invite.title")}
          </h2>
          <p className="text-sm text-fg-muted">{t("teacher.course.invite.lead")}</p>
        </div>
        {codigo === "nuevo" && <Alert tone="success">{t("teacher.course.code.regenerated")}</Alert>}
        {error && <Alert tone="danger">{t(errorMessageKey(error))}</Alert>}
        <div
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6"
          data-component="ClassCode"
          data-variant={course.data.class_code_active ? "active" : "disabled"}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-fg">{t("teacher.course.code.label")}</p>
            <div className="flex flex-wrap items-center gap-4">
              <span
                data-testid="class-code"
                className={`rounded-md border border-border-strong bg-surface px-4 py-2 font-mono text-2xl font-semibold tracking-widest ${course.data.class_code_active ? "text-fg" : "text-fg-muted line-through"}`}
              >
                {code}
              </span>
              {course.data.class_code_active ? (
                <CopyButton value={code} label={t("teacher.course.code.copy")} copiedLabel={t("teacher.course.code.copied")} />
              ) : (
                <StatusBadge tone="neutral" icon="lock" label={t("teacher.course.code.disabled")} />
              )}
            </div>
          </div>
          {course.data.class_code_active ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="invitation-link" className="text-sm font-medium text-fg">
                {t("teacher.course.code.linkLabel")}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="invitation-link"
                  type="text"
                  readOnly
                  value={link}
                  className="min-h-11 w-full rounded-lg border border-border-strong bg-surface-raised px-4 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                />
                <CopyButton value={link} label={t("teacher.course.code.copyLink")} copiedLabel={t("teacher.course.code.copied")} />
              </div>
            </div>
          ) : (
            <p className="text-fg-muted">{t("teacher.course.code.disabledBody")}</p>
          )}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <ConfirmDialog
              trigger={t("teacher.course.code.regenerate")}
              triggerIcon="refresh-cw"
              title={t("teacher.course.regenTitle")}
              body={t("teacher.course.regenBody", { code })}
              confirmLabel={t("teacher.course.code.regenerate")}
              cancelLabel={t("common.actions.cancel")}
              action={regenerateCodeAction}
              fields={fields}
            />
            <form action={setCodeActiveAction}>
              <input type="hidden" name="course_id" value={id} />
              <input type="hidden" name="active" value={String(!course.data.class_code_active)} />
              <Button type="submit" variant="ghost" icon={course.data.class_code_active ? "lock" : "check"}>
                {course.data.class_code_active ? t("teacher.course.code.disable") : t("teacher.course.code.enable")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="students-title" className="flex flex-col gap-4">
        <h2 id="students-title" className="text-lg font-semibold text-fg">
          {t("teacher.course.students.title")}
        </h2>
        {!students.ok ? (
          <ErrorState code={students.code} />
        ) : students.data.items.length === 0 ? (
          <EmptyState
            icon="users"
            title={t("teacher.course.students.emptyTitle")}
            body={t("teacher.course.students.emptyBody", { code })}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6">
            {students.data.items.map((student) => (
              <li key={student.student_id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-fg">{student.display_name}</span>
                  <span className="text-sm text-fg-muted tabular-nums">
                    {t("teacher.course.students.joined", {
                      date: format.dateTime(new Date(student.joined_at), { dateStyle: "long" })
                    })}
                  </span>
                </div>
                {student.status === "active" ? (
                  <ConfirmDialog
                    trigger={t("teacher.course.students.revoke")}
                    triggerVariant="ghost"
                    title={t("teacher.course.students.revokeTitle", { name: student.display_name })}
                    body={t("teacher.course.students.revokeBody")}
                    confirmLabel={t("teacher.course.students.revoke")}
                    cancelLabel={t("common.actions.cancel")}
                    confirmVariant="danger"
                    action={revokeStudentAction}
                    fields={{ ...fields, student_id: student.student_id }}
                  />
                ) : (
                  <StatusBadge tone="neutral" icon="lock" label={t("teacher.course.students.revoked")} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
