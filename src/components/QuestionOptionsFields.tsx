import { useTranslations } from "next-intl";
import { type ComponentProps, useId } from "react";

import { TextField } from "./TextField";

/**
 * The answer options of a question the teacher writes or edits, and the radio that marks the right
 * one. `field` and `radio` give each option's input its value and handlers, so the form decides
 * whether they are controlled.
 */
export function QuestionOptionsFields({
  count,
  error,
  field,
  radio
}: {
  count: number;
  error?: string;
  field: (i: number) => Omit<ComponentProps<typeof TextField>, "label">;
  radio: (i: number) => ComponentProps<"input">;
}) {
  const t = useTranslations("teacher.questions");
  const ids = useId();
  const indexes = Array.from({ length: count }, (_, i) => i);
  return (
    <>
      <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${ids}-options-error` : undefined}>
        <legend className="mb-2 text-sm font-semibold text-fg">{t("optionsLabel")}</legend>
        {indexes.map((i) => (
          <TextField key={i} label={t("option", { n: i + 1 })} {...field(i)} aria-invalid={error ? true : undefined} />
        ))}
        {error && (
          <p id={`${ids}-options-error`} className="text-sm text-danger-700">
            {error}
          </p>
        )}
      </fieldset>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-fg">{t("correct")}</legend>
        <div className="flex flex-wrap gap-2">
          {indexes.map((i) => (
            <label
              key={i}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border-strong px-4 has-checked:border-neutral-900 has-checked:bg-surface-sunken"
            >
              <input
                type="radio"
                {...radio(i)}
                className="size-6 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
              <span className="text-fg">{t("correctOption", { n: i + 1 })}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
