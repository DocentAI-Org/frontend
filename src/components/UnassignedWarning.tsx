import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { listUnassigned } from "@/lib/api/topics";
import { routes } from "@/lib/routes";

import { Alert } from "./Alert";

/** Lists validated material without a confirmed topic (001 US14 AS4), on Temas and Material. */
export async function UnassignedWarning({ courseId, hasTopics }: { courseId: string; hasTopics: boolean }) {
  if (!hasTopics) return null;
  const t = await getTranslations("teacher.topics");
  const unassigned = await listUnassigned(courseId);
  if (!unassigned.ok) return null;
  const rows = unassigned.data.filter((doc) => doc.sections.length > 0);
  if (rows.length === 0) return null;
  return (
    <Alert tone="warning" icon="triangle-alert" title={t("unassignedTitle")}>
      <p className="text-fg">{t("unassignedBody")}</p>
      <ul className="mt-1 list-disc pl-5 text-fg">
        {rows.flatMap((doc) =>
          doc.sections.map((section) => (
            <li key={`${doc.document_id}-${section}`}>
              {doc.document_name}
              <span aria-hidden="true"> · </span>
              {section}
            </li>
          ))
        )}
      </ul>
      <Link
        href={routes.teacherTopicAssignment(courseId)}
        className="mt-1 inline-block w-fit rounded-sm text-sm font-medium text-fg underline decoration-neutral-400 underline-offset-2 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {t("assign")}
      </Link>
    </Alert>
  );
}
