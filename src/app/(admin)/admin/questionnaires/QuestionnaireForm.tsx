"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type QuestionnaireState, createQuestionnaireAction } from "../actions";

/** Publishes a questionnaire; field errors next to each field (013 US1 AS2). */
export function QuestionnaireForm() {
  const t = useTranslations();
  const [state, action, pending] = useActionState<QuestionnaireState, FormData>(createQuestionnaireAction, {});
  const values = state.values;
  return (
    // A new key after each success clears the fields.
    <form key={state.created ?? 0} action={action} noValidate className="flex flex-col gap-4">
      {state.error && <Alert tone="danger">{t(errorMessageKey(state.error))}</Alert>}
      <TextField
        name="title"
        label={t("admin.questionnaires.titleLabel")}
        defaultValue={values?.title}
        error={state.titleError ? t("admin.questionnaires.titleError") : undefined}
        required
      />
      <TextField
        name="url"
        type="url"
        inputMode="url"
        label={t("admin.questionnaires.urlLabel")}
        hint={t("admin.questionnaires.urlHint")}
        defaultValue={values?.url}
        error={state.urlError ? t("admin.questionnaires.urlError") : undefined}
        required
      />
      <div className="flex flex-col gap-2 sm:w-72">
        <label id="questionnaire-audience" htmlFor="questionnaire-audience-select" className="text-sm font-semibold text-fg">
          {t("admin.questionnaires.audienceLabel")}
        </label>
        <Select
          id="questionnaire-audience-select"
          labelId="questionnaire-audience"
          name="audience"
          defaultValue={values?.audience ?? "student"}
          options={[
            { value: "student", label: t("admin.questionnaires.audienceStudent") },
            { value: "teacher", label: t("admin.questionnaires.audienceTeacher") }
          ]}
        />
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" icon="plus" pending={pending} pendingLabel={t("admin.questionnaires.publishing")} className="w-full sm:w-auto">
          {t("admin.questionnaires.submit")}
        </Button>
      </div>
    </form>
  );
}
