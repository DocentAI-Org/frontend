import { getTranslations } from "next-intl/server";

import { routes } from "@/lib/routes";

import { LinkButton } from "./Button";
import { EmptyState } from "./EmptyState";

/** A course with no topics yet: questions hang from a topic, so the teacher creates one first. */
export async function NoTopics({ courseId }: { courseId: string }) {
  const t = await getTranslations("teacher.questions");
  return (
    <EmptyState
      icon="book-open"
      title={t("noTopicsTitle")}
      body={t("noTopicsBody")}
      action={
        <LinkButton href={routes.teacherTopics(courseId)} icon="chevron-right">
          {t("goTopics")}
        </LinkButton>
      }
    />
  );
}
