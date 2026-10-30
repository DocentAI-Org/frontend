"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef } from "react";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { errorMessageKey } from "@/lib/api/errors";

import { type TopicFormState, addTopicAction, renameTopicAction } from "./actions";

function useErrorText() {
  const t = useTranslations();
  return (code?: string) =>
    !code ? undefined : code === "validation_error" ? t("teacher.topics.nameHelp") : t(errorMessageKey(code));
}

export function AddTopicForm({ courseId, first }: { courseId: string; first: boolean }) {
  const t = useTranslations("teacher.topics");
  const errorText = useErrorText();
  const [state, action, pending] = useActionState<TopicFormState, FormData>(addTopicAction, {});
  return (
    <form action={action} noValidate className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-4 sm:flex-row sm:items-end sm:p-6">
      <input type="hidden" name="course_id" value={courseId} />
      <TextField
        name="name"
        maxLength={60}
        className="flex-1"
        label={t("newLabel")}
        hint={state.error ? undefined : t("nameHelp")}
        error={errorText(state.error)}
        defaultValue={state.name}
      />
      <Button type="submit" icon="plus" pending={pending}>
        {first ? t("addFirst") : t("add")}
      </Button>
    </form>
  );
}

export function RenameTopic({ courseId, topicId, name }: { courseId: string; topicId: string; name: string }) {
  const t = useTranslations();
  const errorText = useErrorText();
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<TopicFormState, FormData>(renameTopicAction, {});
  return (
    <>
      <Button type="button" variant="ghost" onClick={() => dialog.current?.showModal()}>
        {t("teacher.topics.rename")}
      </Button>
      <dialog
        ref={dialog}
        aria-label={t("teacher.topics.rename")}
        className="m-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
      >
        <form action={action} noValidate className="flex flex-col gap-4 p-6">
          <input type="hidden" name="course_id" value={courseId} />
          <input type="hidden" name="topic_id" value={topicId} />
          <TextField name="name" maxLength={60} label={t("teacher.topics.nameLabel")} defaultValue={state.name ?? name} error={errorText(state.error)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => dialog.current?.close()}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" pending={pending}>
              {t("teacher.topics.saveName")}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
