import { type ComponentProps, useId } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
  error?: string;
};

/** The prototype's TextField: label, input, optional hint and error tied with aria. */
export function TextField({ label, hint, error, id, className = "", ...props }: TextFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`flex flex-col gap-2 ${className}`} data-component="TextField">
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className="min-h-11 w-full rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-muted aria-invalid:border-danger-600"
      />
      {error && (
        <p id={errorId} className="text-sm text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
