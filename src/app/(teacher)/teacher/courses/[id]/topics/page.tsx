import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Alert } from "@/components/Alert";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { UnassignedWarning } from "@/components/UnassignedWarning";
import { listTopics } from "@/lib/api/topics";

import { SortableTopics } from "./SortableTopics";
import { AddTopicForm } from "./TopicForms";

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
  searchParams: Promise<{ added?: string }>;
}) {
  const { id } = await params;
  const { added } = await searchParams;
  const t = await getTranslations();
  const topics = await listTopics(id);
  if (!topics.ok) return <ErrorState code={topics.code} />;

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-fg-muted">{t("teacher.topics.lead")}</p>
      {added && <Alert tone="success">{t("teacher.topics.added", { name: added })}</Alert>}
      <UnassignedWarning courseId={id} hasTopics={topics.data.length > 0} />
      {topics.data.length === 0 ? (
        <EmptyState icon="book-open" title={t("teacher.topics.emptyTitle")} body={t("teacher.topics.emptyBody")} />
      ) : (
        <SortableTopics
          courseId={id}
          label={t("teacher.topics.listLabel")}
          topics={topics.data.map(({ id: topicId, name, assignment_count }) => ({ id: topicId, name, assignment_count }))}
        />
      )}
      <AddTopicForm courseId={id} first={topics.data.length === 0} />
    </div>
  );
}
