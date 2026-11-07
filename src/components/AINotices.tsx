import { getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Alert } from "./Alert";

/** Tasks that went back to the inherited model, and why (backend specs/019). */
export async function AINotices({ notices }: { notices: Schemas["Notice"][] }) {
  const t = await getTranslations("common.ai");
  if (!notices.length) return null;
  return (
    <Alert tone="warning" title={t("notices.title")}>
      <ul className="list-inside list-disc">
        {notices.map((notice) => (
          <li key={`${notice.task}-${notice.at}`}>
            {t(`notices.${notice.reason}`, { task: t(`task.${notice.task}`), model: notice.model })}
          </li>
        ))}
      </ul>
      <p className="mt-1">{t("notices.clear")}</p>
    </Alert>
  );
}
