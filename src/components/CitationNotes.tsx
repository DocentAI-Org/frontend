"use client";

import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";
import { MathText } from "./MathText";

type Citation = Schemas["Citation"];

/**
 * Margin notes for an answer's sources and the sheet that shows the cited passage, or that it is
 * no longer available (001 US1 AS3, FR-012).
 */
export function CitationNotes({ citations }: { citations: Citation[] }) {
  const t = useTranslations("student.chat");
  const tCommon = useTranslations("common.actions");
  const ids = useId();
  const sheet = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Citation | null>(null);

  return (
    <>
      {citations.map((item, index) => (
        <button
          key={`${item.fragment_id}-${index}`}
          type="button"
          onClick={() => {
            setOpen(item);
            sheet.current?.showModal();
          }}
          aria-label={t("citation.chipLabel", { doc: item.document_name, loc: item.location_label })}
          className="-mx-2 flex flex-col items-start gap-1 rounded-md px-2 py-2 text-left hover:bg-teacher-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          data-component="SourceCitation"
          data-variant={item.available ? "margin-note" : "unavailable"}
        >
          <span className="flex items-baseline gap-1 text-sm font-semibold text-teacher-700">
            <sup className="text-xs font-bold" aria-hidden="true">
              {index + 1}
            </sup>
            <span>{t("citation.chip", { doc: item.document_name, loc: item.location_label })}</span>
          </span>
          <span className="text-sm font-semibold text-teacher-700 underline decoration-teacher-300 underline-offset-2">
            {t("citation.open")}
          </span>
        </button>
      ))}
      <dialog
        ref={sheet}
        aria-labelledby={`${ids}-sheet`}
        className="mb-0 max-h-dvh w-full max-w-none overflow-y-auto rounded-t-2xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50 lg:my-0 lg:mr-0 lg:ml-auto lg:h-dvh lg:max-h-none lg:w-md lg:max-w-md lg:rounded-none lg:rounded-l-2xl"
        data-component="CitationSheet"
        onClose={() => setOpen(null)}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <h2 id={`${ids}-sheet`} className="text-xl font-semibold">
            {t("citation.sheetTitle")}
          </h2>
          <button
            type="button"
            onClick={() => sheet.current?.close()}
            aria-label={tCommon("close")}
            className="inline-flex size-11 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <Icon name="x" className="size-5 shrink-0" />
          </button>
        </div>
        {open && (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-teacher-600 text-teacher-700">
                <Icon name="file-text" className="size-5 shrink-0" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold break-words text-fg">{open.document_name}</p>
                <p className="text-sm text-fg-muted">{open.location_label}</p>
              </div>
            </div>
            {open.available && open.passage ? (
              <figure className="flex flex-col gap-2">
                <figcaption className="text-sm font-semibold text-teacher-700">{t("citation.passageLabel")}</figcaption>
                <blockquote className="border-l-2 border-margin bg-surface py-2 pr-2 pl-4 font-serif text-lg text-fg"><MathText text={open.passage} /></blockquote>
                <p className="text-sm text-fg-muted">{t("citation.validated")}</p>
              </figure>
            ) : (
              <p className="flex items-center gap-2 rounded-lg border border-dashed border-border-strong p-4 text-fg-muted">
                <Icon name="file-text" />
                <span>{open.fragment_id ? t("citation.fragmentUnavailable") : t("citation.unavailable")}</span>
              </p>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
