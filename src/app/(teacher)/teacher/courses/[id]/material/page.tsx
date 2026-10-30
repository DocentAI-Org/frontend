import type { Metadata, Route } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { StatusPoller } from "@/components/StatusPoller";
import type { Schemas } from "@/lib/api/client";
import { listDocuments } from "@/lib/api/documents";
import { listTopics } from "@/lib/api/topics";
import { UnassignedWarning } from "@/components/UnassignedWarning";
import { errorMessageKey } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

import { deleteAction, excludeAction, validateAction } from "./actions";
import { Uploader } from "./Uploader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.material");
  return { title: t("pageTitle") };
}

const ROW_ACTION =
  "inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const ERROR_KEYS: Record<string, string> = {
  unsupported_format: "error.format",
  no_readable_text: "error.noText",
  processing_failed: "error.failed",
  processing_interrupted: "error.interrupted"
};

/** Course material (#17): upload, status, validation (001 US2). */
export default async function MaterialPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ validated?: string; excluded?: string; error?: string }>;
}) {
  const { id } = await params;
  const { validated: validatedName, excluded: excludedName, error } = await searchParams;
  const t = await getTranslations("teacher.material");
  const tAll = await getTranslations();
  const format = await getFormatter();
  const [documents, topics] = await Promise.all([listDocuments(id), listTopics(id)]);
  if (!documents.ok) return <ErrorState code={documents.code} />;

  const docs = documents.data.items;
  const ready = docs.filter((d) => d.processing_status === "ready");
  const validated = ready.filter((d) => d.validation_status === "validated");
  const processing = docs.some((d) => d.processing_status === "processing");
  const fields = (doc: Schemas["Document"]) => ({ course_id: id, document_id: doc.id });
  const date = (value: string) => format.dateTime(new Date(value), { dateStyle: "long" });

  const status = (doc: Schemas["Document"]) => {
    if (doc.processing_status === "processing") {
      return <Badge tone="neutral" icon="refresh-cw" label={t("status.processing")} spin />;
    }
    if (doc.processing_status === "error") return <Badge tone="danger" icon="triangle-alert" label={t("status.error")} />;
    if (doc.validation_status === "validated") return <Badge tone="teacher" icon="check" label={t("status.validated")} />;
    if (doc.validation_status === "excluded") return <Badge tone="neutral" icon="eye-off" label={t("status.excluded")} />;
    return <Badge tone="warning" icon="clock" label={t("status.pending")} />;
  };

  return (
    <div className="flex flex-col gap-6">
      <StatusPoller active={processing} />
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      {validatedName && <Alert tone="success">{t("validatedToast", { name: validatedName })}</Alert>}
      {excludedName && <Alert tone="info">{t("excludedToast", { name: excludedName })}</Alert>}
      {error && <Alert tone="danger">{tAll(errorMessageKey(error))}</Alert>}

      <UnassignedWarning courseId={id} hasTopics={topics.ok && topics.data.length > 0} />
      <Uploader
        courseId={id}
        uploadUrl={`${routes.teacherMaterial(id)}/upload`}
        existing={docs.map((d) => ({ id: d.id, name: d.file_name }))}
      />

      {docs.length === 0 ? (
        <EmptyState icon="file-text" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <section aria-labelledby="docs-title" className="flex flex-col gap-4">
          <div>
            <h2 id="docs-title" className="text-lg font-semibold text-fg">
              {t("documentsTitle")}
            </h2>
            <p className="text-sm text-fg-muted tabular-nums">
              {validated.length === 0 ? t("usingNone") : t("usingCount", { used: validated.length, total: docs.length })}
            </p>
          </div>
          {ready.length > 0 && validated.length === 0 && (
            <Alert tone="warning" icon="triangle-alert" title={t("noValidatedTitle")}>
              <span className="text-fg">{t("noValidatedBody")}</span>
            </Alert>
          )}
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6">
            {docs.map((doc) => (
              <li key={doc.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center" data-component="DocumentRow">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-teacher-600 text-teacher-700">
                  <Icon name="file-text" className="size-5 shrink-0" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p id={`doc-${doc.id}`} className="font-medium break-words text-fg">
                      {doc.file_name}
                    </p>
                    {status(doc)}
                  </div>
                  {doc.processing_status === "error" && (
                    <p className="text-sm text-danger-700">{t(ERROR_KEYS[doc.error_reason ?? ""] ?? "error.failed")}</p>
                  )}
                  {doc.validation_status === "validated" && doc.validated_by_name && doc.validated_at && (
                    <p className="text-sm text-fg-muted">{t("validatedBy", { name: doc.validated_by_name, date: date(doc.validated_at) })}</p>
                  )}
                  {doc.processing_status === "ready" && doc.validation_status === "pending_validation" && (
                    <p className="text-sm text-fg-muted">{t("pendingNote")}</p>
                  )}
                  {doc.processing_status === "ready" && doc.validation_status === "excluded" && (
                    <p className="text-sm text-fg-muted">{t("excludedNote")}</p>
                  )}
                  {doc.processing_status === "ready" && (
                    <p className="text-sm text-fg-muted tabular-nums">
                      {doc.page_count
                        ? t("meta", { pages: doc.page_count, fragments: doc.fragment_count, date: date(doc.uploaded_at) })
                        : t("metaNoPages", { fragments: doc.fragment_count, date: date(doc.uploaded_at) })}
                    </p>
                  )}
                  {doc.excluded_fragment_count > 0 && (
                    <p className="text-sm text-fg-muted tabular-nums">{t("excludedFragments", { count: doc.excluded_fragment_count })}</p>
                  )}
                  {doc.topics.length > 0 && (
                    <p className="text-sm text-fg">
                      <span className="text-fg-muted">{t("topicsLabel")}</span> {doc.topics.map((topic) => topic.name).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {doc.processing_status === "ready" && (
                    <>
                      <Link href={routes.teacherDocument(id, doc.id)} className={ROW_ACTION} aria-describedby={`doc-${doc.id}`}>
                        <Icon name="search" />
                        <span>{t("reviewFragments")}</span>
                      </Link>
                      <a href={`${routes.teacherDocument(id, doc.id)}/file` as Route} target="_blank" rel="noopener" className={ROW_ACTION}>
                        <Icon name="eye" />
                        <span>{t("openOriginal")}</span>
                      </a>
                      {doc.validation_status !== "validated" && (
                        <ConfirmDialog
                          trigger={t("validate")}
                          triggerVariant="secondary"
                          triggerIcon="check"
                          title={t("validateTitle", { name: doc.file_name })}
                          body={t("validateBody")}
                          confirmLabel={t("validateConfirm")}
                          cancelLabel={tAll("common.actions.cancel")}
                          action={validateAction}
                          fields={fields(doc)}
                        />
                      )}
                      {doc.validation_status !== "excluded" && (
                        <ConfirmDialog
                          trigger={t("excludeDocument")}
                          triggerVariant="ghost"
                          title={t("excludeTitle", { name: doc.file_name })}
                          body={t("excludeBody")}
                          confirmLabel={t("excludeConfirm")}
                          cancelLabel={tAll("common.actions.cancel")}
                          confirmVariant="danger"
                          action={excludeAction}
                          fields={fields(doc)}
                        />
                      )}
                    </>
                  )}
                  {doc.processing_status === "error" && (
                    <ConfirmDialog
                      trigger={t("delete")}
                      triggerVariant="ghost"
                      title={t("deleteTitle", { name: doc.file_name })}
                      body={t("deleteBody")}
                      confirmLabel={t("delete")}
                      cancelLabel={tAll("common.actions.cancel")}
                      confirmVariant="danger"
                      action={deleteAction}
                      fields={fields(doc)}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const BADGE_TONES = {
  teacher: "border-teacher-300 bg-teacher-50 text-teacher-800",
  warning: "border-warning-300 bg-warning-50 text-warning-900",
  danger: "border-danger-200 bg-danger-50 text-danger-700",
  neutral: "border-border-strong bg-surface text-fg-muted"
} as const;

/** The prototype's ValidationStatus badge. */
function Badge({ tone, icon, label, spin = false }: { tone: keyof typeof BADGE_TONES; icon: string; label: string; spin?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}
      data-component="ValidationStatus"
    >
      <Icon name={icon} className={`size-3.5 shrink-0 ${spin ? "motion-safe:animate-spin" : ""}`} />
      <span>{label}</span>
    </span>
  );
}
