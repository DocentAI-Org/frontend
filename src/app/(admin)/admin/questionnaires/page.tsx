import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { listQuestionnaires } from "@/lib/api/admin";

import { deleteQuestionnaireAction, setQuestionnaireStatusAction } from "../actions";
import { QuestionnaireForm } from "./QuestionnaireForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.questionnaires");
  return { title: t("pageTitle") };
}

/** Study questionnaires for the study team (013 US1, requirement P4). */
export default async function QuestionnairesPage() {
  const t = await getTranslations("admin.questionnaires");
  const questionnaires = await listQuestionnaires();
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader title={t("title")} lead={t("lead")} />
      <p className="max-w-2xl text-sm text-fg-muted">{t("codeHelp", { code: "{study_ref}" })}</p>
      {!questionnaires.ok ? (
        <ErrorState code={questionnaires.code} />
      ) : questionnaires.data.length === 0 ? (
        <EmptyState icon="circle-help" title={t("emptyTitle")} body={t("emptyBody")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr className="border-b-2 border-neutral-900">
                {(["colTitle", "colAudience", "colStatus", "colActions"] as const).map((col) => (
                  <th key={col} scope="col" className="pb-2 pr-4 text-left text-sm font-semibold text-fg-muted">
                    {t(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questionnaires.data.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-b-0">
                  <th scope="row" className="py-4 pr-4 text-left font-semibold break-words text-fg">
                    {q.title}
                  </th>
                  <td className="py-4 pr-4 text-fg">
                    {q.audience === "student" ? t("audienceStudent") : t("audienceTeacher")}
                  </td>
                  <td className="py-4 pr-4 text-fg">{q.status === "open" ? t("statusOpen") : t("statusClosed")}</td>
                  <td className="py-4">
                    <div role="group" aria-label={t("actionsFor", { title: q.title })} className="flex flex-wrap gap-2">
                      <form action={setQuestionnaireStatusAction}>
                        <input type="hidden" name="id" value={q.id} />
                        <input type="hidden" name="status" value={q.status === "open" ? "closed" : "open"} />
                        <Button type="submit" variant="secondary">
                          {q.status === "open" ? t("close") : t("reopen")}
                        </Button>
                      </form>
                      <form action={deleteQuestionnaireAction}>
                        <input type="hidden" name="id" value={q.id} />
                        <Button type="submit" variant="ghost">
                          {t("delete")}
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <section aria-labelledby="questionnaire-form" className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 sm:p-6">
        <h2 id="questionnaire-form" className="text-xl font-semibold text-fg">
          {t("formTitle")}
        </h2>
        <QuestionnaireForm />
      </section>
    </div>
  );
}
