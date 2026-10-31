"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";

import { Button } from "@/components/Button";
import { Select } from "@/components/Select";

import { copyQuestionAction } from "./actions";

/** Copy an approved quiz question into the test (010 US1 AS3). */
export function CopyQuestion({ courseId, questions }: { courseId: string; questions: { id: string; statement: string }[] }) {
  const t = useTranslations("teacher.test");
  const ids = useId();
  const [question, setQuestion] = useState(questions[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <section aria-labelledby={`${ids}-title`} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
      <h4 id={`${ids}-title`} className="text-lg font-semibold text-fg">
        {t("copyTitle")}
      </h4>
      <div className="flex flex-col gap-2">
        <span id={`${ids}-label`} className="text-sm font-semibold text-fg">
          {t("copyLabel")}
        </span>
        <Select labelId={`${ids}-label`} options={questions.map((q) => ({ value: q.id, label: q.statement }))} value={question} onValueChange={setQuestion} />
      </div>
      <div>
        <Button
          type="button"
          variant="secondary"
          icon="copy"
          pending={pending}
          onClick={() =>
            startTransition(() => {
              const form = new FormData();
              form.set("course_id", courseId);
              form.set("question_id", question);
              return copyQuestionAction(form);
            })
          }
        >
          {t("copy")}
        </Button>
      </div>
    </section>
  );
}
