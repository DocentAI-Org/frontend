"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

import { Select } from "@/components/Select";
import { routes } from "@/lib/routes";

/** Topic filter of the question list; the choice lives in the URL, with the search. */
export function TopicFilter({ courseId, status, topic, topics }: { courseId: string; status: string; topic: string; topics: { id: string; name: string }[] }) {
  const t = useTranslations("teacher.questions");
  const router = useRouter();
  const params = useSearchParams();
  const ids = useId();
  return (
    <div className="flex flex-col gap-2 sm:w-64">
      <span id={`${ids}-label`} className="text-sm font-semibold text-fg">
        {t("filterLabel")}
      </span>
      <Select
        labelId={`${ids}-label`}
        options={[{ value: "", label: t("allTopics") }, ...topics.map((x) => ({ value: x.id, label: x.name }))]}
        value={topic}
        onValueChange={(value) => {
          const query = new URLSearchParams({ status });
          if (value) query.set("topic", value);
          // The search stays; "Show more" starts over (spec 016).
          const q = params.get("q");
          if (q) query.set("q", q);
          router.push(routes.teacherQuestions(courseId, `?${query.toString()}`));
        }}
      />
    </div>
  );
}
