"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button, LinkButton, buttonClass } from "@/components/Button";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type StudentsState, createStudentsAction } from "../../actions";

/** Pseudonymous accounts for the pilot (spec 002 US9, prototype #35): codes shown once. */
export function StudentsForm() {
  const t = useTranslations();
  const [state, action, pending] = useActionState<StudentsState, FormData>(createStudentsAction, {});

  if (state.accounts) {
    const csv = [`${t("admin.studentsNew.colCode")},${t("admin.studentsNew.colPassword")}`]
      .concat(state.accounts.map((a) => `${a.code},${a.initial_password}`))
      .join("\n");
    return (
      <section aria-labelledby="created-title" className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-success-600 text-success-800">
            <Icon name="check" className="size-5 shrink-0" />
          </span>
          <h2 id="created-title" className="text-2xl font-semibold text-fg">
            {t("admin.studentsNew.createdTitle")}
          </h2>
        </div>
        <Alert tone="warning" icon="triangle-alert">
          {t("admin.studentsNew.warning")}
        </Alert>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{t("admin.studentsNew.tableCaption")}</caption>
          <thead>
            <tr className="border-b-2 border-neutral-900">
              <th scope="col" className="pb-2 pr-4 text-left text-sm font-semibold text-fg-muted">
                {t("admin.studentsNew.colCode")}
              </th>
              <th scope="col" className="pb-2 text-left text-sm font-semibold text-fg-muted">
                {t("admin.studentsNew.colPassword")}
              </th>
            </tr>
          </thead>
          <tbody>
            {state.accounts.map((account) => (
              <tr key={account.user_id} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-2 pr-4 text-left font-mono font-semibold text-fg">
                  {account.code}
                </th>
                <td className="py-2 font-mono text-fg">{account.initial_password}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={csv} label={t("admin.studentsNew.copyAll")} copiedLabel={t("common.actions.copied")} />
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="docentai-cuentas.csv"
            className={buttonClass("secondary")}
          >
            <Icon name="file-text" />
            <span>{t("admin.studentsNew.download")}</span>
          </a>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <LinkButton href="/admin/users" icon="chevron-left">
            {t("admin.studentsNew.back")}
          </LinkButton>
        </div>
      </section>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      {state.countError && <Alert tone="danger">{t("admin.studentsNew.errorSummary")}</Alert>}
      {state.error && <Alert tone="danger">{t(errorMessageKey(state.error))}</Alert>}
      <TextField
        name="count"
        type="number"
        min={1}
        max={100}
        inputMode="numeric"
        label={t("admin.studentsNew.count")}
        hint={t("admin.studentsNew.countHelp")}
        error={state.countError ? t("admin.studentsNew.countError") : undefined}
        required
      />
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <LinkButton href="/admin/users" variant="ghost">
          {t("common.actions.cancel")}
        </LinkButton>
        <Button type="submit" icon="plus" pending={pending} pendingLabel={t("admin.studentsNew.creating")} className="w-full sm:w-auto">
          {t("admin.studentsNew.submit")}
        </Button>
      </div>
    </form>
  );
}
