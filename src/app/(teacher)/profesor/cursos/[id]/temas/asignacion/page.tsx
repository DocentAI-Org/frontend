import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import type { Schemas } from "@/lib/api/client";
import { listAllFragments, listDocuments } from "@/lib/api/documents";
import { listAssignments, listTopics } from "@/lib/api/topics";

import { saveAssignmentsAction } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.topicAssignment");
  return { title: t("pageTitle") };
}

/** Topic assignment per section (#34, 001 US14 AS3, AS5; no AI suggestions yet, deviation D5). */
export default async function TopicAssignmentPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string; error?: string }>;
}) {
  const { id } = await params;
  const { guardado, error } = await searchParams;
  const t = await getTranslations("teacher.topicAssignment");
  const tAll = await getTranslations();
  const [topics, documents, assignments] = await Promise.all([listTopics(id), listDocuments(id), listAssignments(id)]);
  if (!topics.ok) return <ErrorState code={topics.code} />;
  if (!documents.ok) return <ErrorState code={documents.code} />;

  const validated = documents.data.items.filter((d) => d.processing_status === "ready" && d.validation_status === "validated");
  const sections = await Promise.all(
    validated.map(async (doc) => {
      const fragments = await listAllFragments({ course_id: id, document_id: doc.id });
      return { doc, sections: fragments.ok ? [...new Set(fragments.data.map((f) => f.section))] : [] };
    })
  );
  const current = (documentId: string, section: string): Schemas["TopicAssignment"] | undefined =>
    assignments.ok ? assignments.data.find((a) => a.document_id === documentId && a.section === section) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("lead")}</p>
      {guardado && <Alert tone="success">{t("saved")}</Alert>}
      {error && <Alert tone="danger">{tAll("errors.unknown")}</Alert>}
      {!assignments.ok && <Alert tone="danger">{t("suggestionsError")}</Alert>}
      {topics.data.length === 0 || sections.every((s) => s.sections.length === 0) ? (
        <EmptyState icon="book-open" title={tAll("teacher.topics.emptyTitle")} body={tAll("teacher.topics.emptyBody")} />
      ) : (
        <form action={saveAssignmentsAction} className="flex flex-col gap-6">
          <input type="hidden" name="course_id" value={id} />
          {sections.map(({ doc, sections: list }) => (
            <section key={doc.id} aria-labelledby={`doc-${doc.id}`} className="flex flex-col gap-2">
              <h2 id={`doc-${doc.id}`} className="text-lg font-semibold text-fg">
                {doc.file_name}
              </h2>
              <ul aria-label={t("listLabel")} className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6">
                {list.map((section) => {
                  const key = `${doc.id}::${section}`;
                  const assignment = current(doc.id, section);
                  return (
                    <li key={key} className="py-4">
                      <fieldset className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <legend className="float-left font-medium text-fg sm:w-1/2">{section}</legend>
                        <input type="hidden" name="key" value={key} />
                        <input
                          type="hidden"
                          name={`current:${key}`}
                          value={assignment ? `${assignment.id}|${assignment.status}|${assignment.topic_id}` : ""}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="sr-only" htmlFor={`select-${key}`}>
                            {t("topicFor")}
                          </label>
                          <select
                            id={`select-${key}`}
                            name={`topic:${key}`}
                            defaultValue={assignment?.topic_id ?? ""}
                            className="min-h-11 rounded-lg border border-border-strong bg-surface-raised px-4 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                          >
                            <option value="">{t("none")}</option>
                            {topics.data.map((topic) => (
                              <option key={topic.id} value={topic.id}>
                                {topic.name}
                              </option>
                            ))}
                          </select>
                          {assignment && (
                            <span
                              className={`rounded-sm border px-2 py-0.5 text-xs font-semibold ${assignment.status === "suggested" ? "border-warning-300 bg-warning-50 text-warning-900" : "border-teacher-300 bg-teacher-50 text-teacher-800"}`}
                            >
                              {assignment.status === "suggested" ? t("suggested") : t("confirmed")}
                            </span>
                          )}
                        </div>
                      </fieldset>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <Button type="submit" icon="check" className="self-end">
            {t("save")}
          </Button>
        </form>
      )}
    </div>
  );
}
