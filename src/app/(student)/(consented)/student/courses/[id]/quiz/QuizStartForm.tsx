"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { type ButtonVariant } from "@/components/Button";
import { Select } from "@/components/Select";
import type { Schemas } from "@/lib/api/client";

import { StartQuiz } from "./StartQuiz";

/** "Todos los temas" or one topic with approved questions, then start (008 US2 AS7). */
export function QuizStartForm({ courseId, topics, variant }: { courseId: string; topics: Schemas["QuizTopic"][]; variant: ButtonVariant }) {
  const t = useTranslations("student.quiz");
  const ids = useId();
  const [topic, setTopic] = useState("");
  const total = topics.reduce((sum, x) => sum + x.question_count, 0);

  return (
    <div className="flex flex-col gap-4">
      {topics.length > 0 && (
        <div className="flex flex-col gap-2 sm:max-w-sm">
          <span id={`${ids}-topic`} className="text-sm font-semibold text-fg">
            {t("topicLabel")}
          </span>
          <Select
            labelId={`${ids}-topic`}
            options={[
              { value: "", label: t("topicOption", { topic: t("allTopics"), count: total }) },
              ...topics.map((x) => ({ value: x.topic_id, label: t("topicOption", { topic: x.topic_name, count: x.question_count }) }))
            ]}
            value={topic}
            onValueChange={setTopic}
          />
        </div>
      )}
      <StartQuiz courseId={courseId} topicId={topic || undefined} label={t("start")} variant={variant} />
    </div>
  );
}
