"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { QuestionOptionsFields } from "@/components/QuestionOptionsFields";
import { Select } from "@/components/Select";
import { TextArea } from "@/components/TextArea";
import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";
import { optionsProblem } from "@/lib/quiz/options";

import { addQuestionAction, editQuestionAction } from "./actions";

type Question = Schemas["TestQuestion"];
type Errors = { statement?: string; options?: string; form?: string };

const OPTIONS = [0, 1, 2, 3];

/**
 * Add or edit a test question (010 US1 AS2, AS4): statement, four options, the right one and the
 * topic; checked here first so the teacher sees what to fix next to the field. The fields are
 * uncontrolled and read on submit, so nothing typed before hydration is lost.
 */
export function TestQuestionForm({
  courseId,
  topics,
  question,
  onCancel
}: {
  courseId: string;
  topics: { id: string; name: string }[];
  question?: Question;
  onCancel?: () => void;
}) {
  const t = useTranslations("teacher.test");
  const tq = useTranslations("teacher.questions");
  const tAll = useTranslations();
  const ids = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  const submit = (form: FormData) => {
    const statement = String(form.get("statement") ?? "").trim();
    const options = OPTIONS.map((i) => String(form.get(`option${i}`) ?? "").trim());
    const found: Errors = {};
    if (!statement) found.statement = tq("required");
    const problem = optionsProblem(options);
    if (problem) found.options = tq(problem);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const body = {
      topic_id: String(form.get("topic_id") ?? topics[0]?.id ?? ""),
      statement,
      options,
      correct_option: Number(form.get("correct") ?? 0)
    };
    startTransition(async () => {
      const result = question ? await editQuestionAction(courseId, question.id, body) : await addQuestionAction(courseId, body);
      // Only reached on failure: success redirects.
      setErrors({ form: tAll(errorMessageKey(result.code)) });
    });
  };

  return (
    <form
      aria-label={question ? tq("editTitle") : t("addTitle")}
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit(new FormData(event.currentTarget));
      }}
    >
      <div className="flex flex-col gap-2 sm:max-w-sm">
        <span id={`${ids}-topic`} className="text-sm font-semibold text-fg">
          {t("topicLabel")}
        </span>
        <Select
          name="topic_id"
          labelId={`${ids}-topic`}
          options={topics.map((x) => ({ value: x.id, label: x.name }))}
          defaultValue={question?.topic_id ?? topics[0]?.id}
        />
      </div>
      <TextArea name="statement" label={tq("statement")} defaultValue={question?.statement ?? ""} rows={2} error={errors.statement} />
      <QuestionOptionsFields
        count={OPTIONS.length}
        error={errors.options}
        field={(i) => ({ name: `option${i}`, defaultValue: question?.options[i] ?? "" })}
        radio={(i) => ({ name: "correct", value: i, defaultChecked: (question?.correct_option ?? 0) === i })}
      />
      {errors.form && <Alert tone="danger">{errors.form}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            {tq("cancel")}
          </Button>
        )}
        <Button type="submit" icon={question ? "check" : "plus"} pending={pending}>
          {question ? tq("save") : t("add")}
        </Button>
      </div>
    </form>
  );
}
