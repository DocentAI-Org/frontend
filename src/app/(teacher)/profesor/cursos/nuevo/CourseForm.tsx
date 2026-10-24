"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { TextArea } from "@/components/TextArea";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type CreateCourseState, createCourseAction } from "../actions";

export function CourseForm() {
  const t = useTranslations();
  const [state, action, pending] = useActionState<CreateCourseState, FormData>(createCourseAction, {});
  return (
    <form action={action} noValidate className="flex max-w-2xl flex-col gap-6">
      {state.nameError && <Alert tone="danger">{t("teacher.courseNew.errorSummary")}</Alert>}
      {state.error && <Alert tone="danger">{t(errorMessageKey(state.error))}</Alert>}
      <TextField
        name="name"
        label={t("teacher.courseNew.name")}
        hint={t("teacher.courseNew.nameHelp")}
        placeholder={t("teacher.courseNew.namePlaceholder")}
        maxLength={80}
        defaultValue={state.values?.name}
        error={state.nameError ? t("teacher.courseNew.nameError") : undefined}
        required
      />
      <TextArea
        name="description"
        rows={3}
        maxLength={500}
        label={t("teacher.courseNew.description")}
        optional={t("teacher.courseNew.optional")}
        hint={t("teacher.courseNew.descriptionHelp")}
        defaultValue={state.values?.description}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <LinkButton href="/profesor/cursos" variant="ghost">
          {t("common.actions.cancel")}
        </LinkButton>
        <Button type="submit" icon="check" pending={pending} pendingLabel={t("teacher.courseNew.creating")}>
          {t("teacher.courseNew.submit")}
        </Button>
      </div>
    </form>
  );
}
