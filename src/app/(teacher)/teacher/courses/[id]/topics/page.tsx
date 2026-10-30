import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { UnassignedWarning } from "@/components/UnassignedWarning";
import { listTopics } from "@/lib/api/topics";

import { deleteTopicAction, moveTopicAction } from "./actions";
import { AddTopicForm, RenameTopic } from "./TopicForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("teacher.topics");
  return { title: t("pageTitle") };
}

/** Course topics (#33, 001 US14 AS1, AS2, AS4). */
export default async function TopicsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ added?: string; moved?: string }>;
}) {
  const { id } = await params;
  const { added, moved } = await searchParams;
  const t = await getTranslations();
  const topics = await listTopics(id);
  if (!topics.ok) return <ErrorState code={topics.code} />;
  const order = topics.data.map((topic) => topic.id).join(",");

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("teacher.topics.lead")}</p>
      {added && <Alert tone="success">{t("teacher.topics.added", { name: added })}</Alert>}
      {moved && <Alert tone="info">{t("teacher.topics.reordered", { name: moved })}</Alert>}
      <UnassignedWarning courseId={id} hasTopics={topics.data.length > 0} />
      {topics.data.length === 0 ? (
        <EmptyState icon="book-open" title={t("teacher.topics.emptyTitle")} body={t("teacher.topics.emptyBody")} />
      ) : (
        <ol aria-label={t("teacher.topics.listLabel")} className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface-raised px-4 sm:px-6">
          {topics.data.map((topic, index) => (
            <li key={topic.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-baseline gap-4">
                <span className="w-6 text-right text-sm font-semibold text-fg-muted tabular-nums">{topic.position}</span>
                <div>
                  <p className="font-medium text-fg">{topic.name}</p>
                  <p className="text-sm text-fg-muted tabular-nums">{t("teacher.topics.sections", { count: topic.assignment_count })}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {(["up", "down"] as const).map((direction) => (
                  <form key={direction} action={moveTopicAction}>
                    <input type="hidden" name="course_id" value={id} />
                    <input type="hidden" name="order" value={order} />
                    <input type="hidden" name="index" value={index} />
                    <input type="hidden" name="name" value={topic.name} />
                    <input type="hidden" name="direction" value={direction} />
                    <Button
                      type="submit"
                      variant="ghost"
                      disabled={direction === "up" ? index === 0 : index === topics.data.length - 1}
                      aria-label={`${t(`teacher.topics.${direction}`)}: ${topic.name}`}
                    >
                      {t(`teacher.topics.${direction}`)}
                    </Button>
                  </form>
                ))}
                <RenameTopic courseId={id} topicId={topic.id} name={topic.name} />
                <ConfirmDialog
                  trigger={t("teacher.topics.delete")}
                  triggerVariant="ghost"
                  title={t("teacher.topics.deleteTitle", { name: topic.name })}
                  body={t("teacher.topics.deleteBody", { count: topic.assignment_count })}
                  confirmLabel={t("teacher.topics.deleteConfirm")}
                  cancelLabel={t("common.actions.cancel")}
                  confirmVariant="danger"
                  action={deleteTopicAction}
                  fields={{ course_id: id, topic_id: topic.id }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
      <AddTopicForm courseId={id} first={topics.data.length === 0} />
    </div>
  );
}
