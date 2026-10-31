import { getTranslations } from "next-intl/server";

import type { Schemas } from "@/lib/api/client";

import { Icon } from "./Icon";

/** Open study questionnaires as external links (013 US2); nothing when there are none. */
export async function StudyQuestionnaires({ items }: { items: Schemas["MyQuestionnaire"][] }) {
  if (items.length === 0) return null;
  const t = await getTranslations("common.questionnaires");
  return (
    <section
      aria-labelledby="study-questionnaires"
      className="flex flex-col gap-2 rounded-xl border border-info-200 bg-info-50 p-4 sm:p-6"
      data-component="StudyQuestionnaires"
    >
      <h2 id="study-questionnaires" className="font-semibold text-fg">
        {t("title")}
      </h2>
      <p className="text-sm text-fg">{t("lead")}</p>
      <ul className="flex flex-col gap-1">
        {items.map((q) => (
          <li key={q.id}>
            <a
              href={q.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-info-800 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Icon name="circle-help" />
              <span>{q.title}</span>
              <span className="sr-only">{t("newTab")}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
