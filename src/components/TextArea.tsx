import { type ComponentProps, useId } from "react";

export function TextArea({
  label,
  optional,
  hint,
  error,
  id,
  ...props
}: ComponentProps<"textarea"> & { label: string; optional?: string; hint?: string; error?: string }) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-2" data-component="TextArea">
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">
        {label} {optional && <span className="font-normal text-fg-muted">{optional}</span>}
      </label>
      <textarea
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className="w-full rounded-lg border border-border-strong bg-surface-raised px-4 py-2 text-base text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger-600"
      />
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
