"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { Schemas } from "@/lib/api/client";

import { saveFlagAction } from "./actions";

type Target = { kind: "message" | "submission"; id: string };

/**
 * Flag a tutor answer or feedback and write the student's correction, with a preview and a retry
 * that keeps the text (001 US8 AS2, AS6, AS7).
 */
export function FlagDialog({
  courseId,
  target,
  path,
  answer,
  existing
}: {
  courseId: string;
  target: Target;
  path: string;
  answer: string;
  existing?: Schemas["TeacherFlag"] | null;
}) {
  const t = useTranslations();
  const router = useRouter();
  const ids = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState<Schemas["FlagUpsert"]["category"]>(existing?.category ?? "incorrect");
  const [correction, setCorrection] = useState(existing?.correction ?? "");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [failed, setFailed] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [pending, startTransition] = useTransition();
  const title = existing ? t("teacher.flags.editTitle") : t("teacher.flags.dialogTitle");

  function save() {
    if (!correction.trim()) return setEmpty(true);
    startTransition(async () => {
      const ok = await saveFlagAction(courseId, target, { category, correction: correction.trim() }, path);
      setFailed(!ok);
      if (ok) {
        dialog.current?.close();
        router.replace(`${path}?saved=1` as never, { scroll: false });
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant={existing ? "ghost" : "secondary"}
        icon={existing ? undefined : "flag"}
        aria-label={existing ? undefined : t("teacher.flags.flagLabel", { text: answer.slice(0, 80) })}
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        {existing ? t("common.correction.edit") : t("teacher.flags.flag")}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={`${ids}-title`}
        className="m-auto w-full max-w-lg rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
        data-component="FlagDialog"
        onClose={() => {
          setOpen(false);
          setPreview(false);
        }}
      >
        {/* Mounted only while open, so the closed dialog leaves no duplicate text in the page. */}
        {open && (
          <div className="flex flex-col gap-4 p-6">
            <h2 id={`${ids}-title`} className="text-xl font-semibold text-fg">
              {title}
            </h2>
            {preview ? (
              <section aria-labelledby={`${ids}-preview`} className="flex flex-col gap-2">
                <h3 id={`${ids}-preview`} className="font-semibold text-fg">
                  {t("teacher.flags.previewTitle")}
                </h3>
                <p className="text-sm text-fg-muted">{t("teacher.flags.previewLead")}</p>
                <p className="font-serif text-fg-muted line-through decoration-teacher-600 decoration-1">{answer}</p>
                <div
                  className="flex flex-col gap-1 border-l-2 border-margin pl-4"
                  data-component="TeacherCorrection"
                  data-variant="preview"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-teacher-700">
                    <Icon name="graduation-cap" />
                    <span>{t("common.correction.reviewed")}</span>
                  </p>
                  <p className="font-serif text-fg">{correction}</p>
                </div>
              </section>
            ) : (
              <>
                <p className="text-fg-muted">{t("teacher.flags.dialogLead")}</p>
                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-semibold text-fg">{t("teacher.flags.category")}</legend>
                  {(
                    [
                      ["incorrect", "incorrect", "incorrectHelp"],
                      ["poor", "improve", "improveHelp"]
                    ] as const
                  ).map(([value, label, help]) => (
                    <label key={value} className="flex cursor-pointer items-start gap-4 rounded-lg p-2 hover:bg-surface-sunken">
                      <input
                        type="radio"
                        name={`${ids}-category`}
                        checked={category === value}
                        onChange={() => setCategory(value)}
                        aria-describedby={`${ids}-${value}`}
                        className="mt-1 size-5 shrink-0 accent-primary-600"
                      />
                      <span className="flex flex-col">
                        <span className="font-medium text-fg">{t(`teacher.flags.${label}`)}</span>
                        <span id={`${ids}-${value}`} className="text-sm text-fg-muted">
                          {t(`teacher.flags.${help}`)}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${ids}-correction`} className="text-sm font-semibold text-fg">
                    {t("teacher.flags.correction")}
                  </label>
                  <textarea
                    id={`${ids}-correction`}
                    rows={4}
                    maxLength={1000}
                    value={correction}
                    aria-invalid={empty || undefined}
                    aria-describedby={`${ids}-help`}
                    onChange={(event) => {
                      setCorrection(event.target.value);
                      setEmpty(false);
                    }}
                    className="w-full rounded-lg border border-border-strong bg-surface-raised px-4 py-2 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger-600"
                  />
                  <p id={`${ids}-help`} className="text-sm text-fg-muted">
                    {t("teacher.flags.correctionHelp")}
                  </p>
                </div>
              </>
            )}
            {failed && <Alert tone="danger">{t("teacher.flags.saveFailed")}</Alert>}
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => (preview ? setPreview(false) : dialog.current?.close())}>
                {preview ? t("teacher.flags.backToEdit") : t("common.actions.cancel")}
              </Button>
              {!preview && (
                <Button
                  type="button"
                  variant="secondary"
                  icon="eye"
                  onClick={() => (correction.trim() ? setPreview(true) : setEmpty(true))}
                >
                  {t("teacher.flags.preview")}
                </Button>
              )}
              <Button type="button" icon="check" pending={pending} onClick={save}>
                {existing ? t("teacher.flags.saveChanges") : t("teacher.flags.saveCorrection")}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
