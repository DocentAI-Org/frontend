"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon } from "@/components/Icon";
import type { Schemas } from "@/lib/api/client";

import { deleteQuestionAction } from "./actions";
import { TestQuestionForm } from "./TestQuestionForm";

/** One test question, with edit and delete while the test is not locked (010 US1 AS4). */
export function TestQuestionItem({
  courseId,
  question,
  topics,
  locked
}: {
  courseId: string;
  question: Schemas["TestQuestion"];
  topics: { id: string; name: string }[];
  locked: boolean;
}) {
  const t = useTranslations("teacher.test");
  const tQuiz = useTranslations("common.quiz");
  const tc = useTranslations("common.actions");
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-xl border border-border bg-surface-raised p-6">
        <TestQuestionForm courseId={courseId} topics={topics} question={question} onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-fg-muted tabular-nums">
          {question.position}. {t("topic", { topic: question.topic_name })}
        </p>
        <p className="font-serif text-lg font-semibold text-fg">{question.statement}</p>
      </div>
      {/* Not a list: the questions are the list items (010 US1). */}
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const right = i === question.correct_option;
          return (
            <div key={i} className={`flex min-h-11 flex-wrap items-center gap-x-4 rounded-lg border px-4 py-2 ${right ? "border-success-300 bg-success-50" : "border-border"}`}>
              <span className="text-fg">{option}</span>
              {right && (
                <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-success-800">
                  <Icon name="check" />
                  {tQuiz("correctAnswer")}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!locked && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" icon="settings" onClick={() => setEditing(true)}>
            {tQuiz("edit")}
          </Button>
          <ConfirmDialog
            trigger={t("delete")}
            triggerVariant="ghost"
            triggerIcon="x"
            title={t("deleteTitle")}
            body={t("deleteBody")}
            confirmLabel={t("delete")}
            cancelLabel={tc("cancel")}
            confirmVariant="danger"
            action={deleteQuestionAction}
            fields={{ course_id: courseId, question_id: question.id }}
          />
        </div>
      )}
    </li>
  );
}
