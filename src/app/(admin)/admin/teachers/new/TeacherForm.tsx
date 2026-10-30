"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type TeacherState, createTeacherAction } from "../../actions";

export function TeacherForm() {
  const t = useTranslations();
  const [state, action, pending] = useActionState<TeacherState, FormData>(createTeacherAction, {});

  if (state.created) {
    return (
      <section aria-labelledby="created-title" className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-success-600 text-success-800">
            <Icon name="check" className="size-5 shrink-0" />
          </span>
          <h2 id="created-title" className="text-2xl font-semibold text-fg">
            {t("admin.teacherNew.createdTitle")}
          </h2>
        </div>
        <p className="text-fg">{t("admin.teacherNew.createdBody", state.created)}</p>
        <div className="flex flex-col gap-2 border-y border-border py-4">
          <p className="text-sm font-semibold text-fg">{t("admin.teacherNew.passwordLabel")}</p>
          <div className="flex flex-wrap items-center gap-4">
            <code data-testid="initial-password" className="rounded-md border border-border-strong bg-surface px-4 py-2 font-mono text-lg text-fg">
              {state.created.password}
            </code>
            <CopyButton value={state.created.password} label={t("common.actions.copy")} copiedLabel={t("common.actions.copied")} />
          </div>
          <p className="text-sm text-warning-900">{t("admin.teacherNew.passwordWarning")}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <LinkButton href="/admin/users" icon="chevron-left">
            {t("admin.teacherNew.back")}
          </LinkButton>
        </div>
      </section>
    );
  }

  const invalid = state.nameError || state.emailError;
  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      {invalid && <Alert tone="danger">{t("admin.teacherNew.errorSummary")}</Alert>}
      {state.error && <Alert tone="danger">{t(errorMessageKey(state.error))}</Alert>}
      <TextField
        name="name"
        label={t("admin.teacherNew.name")}
        autoComplete="name"
        defaultValue={state.values?.name}
        error={state.nameError ? t("admin.teacherNew.nameError") : undefined}
        required
      />
      <TextField
        name="email"
        type="email"
        label={t("admin.teacherNew.email")}
        hint={t("admin.teacherNew.emailHelp")}
        placeholder={t("common.auth.emailPlaceholder")}
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.emailError ? t("admin.teacherNew.emailError") : undefined}
        required
      />
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <LinkButton href="/admin/users" variant="ghost">
          {t("common.actions.cancel")}
        </LinkButton>
        <Button type="submit" icon="plus" pending={pending} pendingLabel={t("admin.teacherNew.sending")} className="w-full sm:w-auto">
          {t("admin.teacherNew.submit")}
        </Button>
      </div>
    </form>
  );
}
