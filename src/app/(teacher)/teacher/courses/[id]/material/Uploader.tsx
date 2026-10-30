"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { errorMessageKey } from "@/lib/api/errors";

import { deleteSilently } from "./actions";

const ACCEPTED = /\.(pdf|docx|md|markdown)$/i;
const MAX_BYTES = 20 * 1024 * 1024;

type Item = { key: string; name: string; percent: number; error?: string };
type Existing = { id: string; name: string };

function send(url: string, file: File, onProgress: (percent: number) => void): Promise<{ ok: boolean; code?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch {
        resolve({ ok: false, code: "unknown" });
      }
    };
    xhr.onerror = () => resolve({ ok: false, code: "api_unreachable" });
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

/**
 * Upload with per-file progress (001 US2 AS2), early type/size checks (AS3) and the
 * duplicate-name choice. The list of documents refreshes once each upload is accepted.
 */
export function Uploader({ courseId, uploadUrl, existing }: { courseId: string; uploadUrl: string; existing: Existing[] }) {
  const t = useTranslations("teacher.material");
  const tAll = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [duplicate, setDuplicate] = useState<{ file: File; existing: Existing } | null>(null);

  const update = (key: string, patch: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  async function upload(file: File, replacing?: Existing) {
    const key = `${file.name}-${Date.now()}-${Math.random()}`;
    setItems((current) => [...current, { key, name: file.name, percent: 0 }]);
    if (!ACCEPTED.test(file.name)) return update(key, { error: t("error.format") });
    if (file.size > MAX_BYTES) return update(key, { error: t("error.size") });
    const result = await send(uploadUrl, file, (percent) => update(key, { percent }));
    if (!result.ok) {
      const code = result.code ?? "unknown";
      return update(key, {
        error:
          code === "unsupported_file_type" ? t("error.format") : code === "file_too_large" ? t("error.size") : tAll(errorMessageKey(code))
      });
    }
    if (replacing) await deleteSilently(courseId, replacing.id);
    setItems((current) => current.filter((item) => item.key !== key));
    router.refresh();
  }

  function choose(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      const same = existing.find((doc) => doc.name === file.name);
      if (same) {
        setDuplicate({ file, existing: same });
        dialog.current?.showModal();
      } else {
        void upload(file);
      }
    }
    if (input.current) input.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border-strong bg-surface p-6 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          choose(event.dataTransfer.files);
        }}
        data-component="FileDropzone"
      >
        <Icon name="upload" className="size-6 shrink-0 text-fg-muted" />
        <p className="text-fg">{t("dropzone")}</p>
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-fg-inverse hover:bg-primary-700 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
        >
          {t("dropzoneButton")}
          <input
            ref={input}
            id={inputId}
            type="file"
            multiple
            accept=".pdf,.docx,.md,.markdown"
            className="sr-only"
            onChange={(event) => choose(event.target.files)}
          />
        </label>
        <p className="text-sm text-fg-muted">{t("formats")}</p>
      </div>

      {items.length > 0 && (
        <section aria-labelledby="uploads-title" className="flex flex-col gap-4">
          <h2 id="uploads-title" className="text-lg font-semibold text-fg">
            {t("uploadsTitle")}
          </h2>
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.key} className="flex gap-4 rounded-xl border border-border bg-surface-raised p-4" data-component="FileUploadItem">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-fg">
                  <Icon name="file-text" className="size-5 shrink-0" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="font-medium break-words text-fg">{item.name}</p>
                  {item.error ? (
                    <p role="alert" className="flex items-center gap-2 text-sm text-danger-700">
                      <Icon name="triangle-alert" />
                      <span>{item.error}</span>
                    </p>
                  ) : (
                    <>
                      <p id={`${item.key}-label`} className="text-sm text-fg-muted tabular-nums">
                        {item.percent < 1
                          ? t("status.uploading", { percent: format.number(item.percent, { style: "percent" }) })
                          : t("status.processing")}
                      </p>
                      <progress
                        value={Math.round(item.percent * 100)}
                        max={100}
                        aria-labelledby={`${item.key}-label`}
                        className="h-2 w-full overflow-hidden rounded-sm accent-primary-600"
                      />
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <dialog
        ref={dialog}
        aria-labelledby={`${inputId}-dup`}
        className="m-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50"
        onClose={() => setDuplicate(null)}
      >
        {duplicate && (
          <div className="flex flex-col gap-4 p-6">
            <h2 id={`${inputId}-dup`} className="text-xl font-semibold text-fg">
              {t("duplicateTitle")}
            </h2>
            <p className="text-fg-muted">{t("duplicateBody", { name: duplicate.file.name })}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  dialog.current?.close();
                  void upload(duplicate.file);
                }}
              >
                {t("keepBoth")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  dialog.current?.close();
                  void upload(duplicate.file, duplicate.existing);
                }}
              >
                {t("replace")}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
