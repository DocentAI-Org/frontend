"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { errorMessageKey } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

import { type GenerateResult, generateAction } from "./actions";

const COUNTS = ["3", "5", "10"];

/** Ask the tutor for draft questions on a topic (#30 questions.html, 008 US1 AS2, AS3). */
export function RequestQuestions({ courseId, topics }: { courseId: string; topics: { id: string; name: string }[] }) {
  const t = useTranslations("teacher.questions");
  const tAll = useTranslations();
  const router = useRouter();
  const ids = useId();
  const [topic, setTopic] = useState(topics[0]?.id ?? "");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [pending, startTransition] = useTransition();

  const request = () => {
    setResult(null);
    startTransition(async () => {
      const outcome = await generateAction(courseId, topic, Number(count));
      setResult(outcome);
      if ("kind" in outcome && outcome.kind === "answer") router.refresh();
    });
  };

  return (
    <section aria-labelledby={`${ids}-title`} className="flex flex-col gap-4 rounded-xl border border-border bg-surface-raised p-6">
      <div>
        <h3 id={`${ids}-title`} className="text-lg font-semibold text-fg">
          {t("requestTitle")}
        </h3>
        <p className="text-fg-muted">{t("requestLead")}</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span id={`${ids}-topic`} className="text-sm font-semibold text-fg">
            {t("topic")}
          </span>
          <Select
            labelId={`${ids}-topic`}
            options={topics.map((x) => ({ value: x.id, label: x.name }))}
            value={topic}
            onValueChange={setTopic}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2 sm:w-32">
          <span id={`${ids}-count`} className="text-sm font-semibold text-fg">
            {t("countLabel")}
          </span>
          <Select labelId={`${ids}-count`} options={COUNTS.map((c) => ({ value: c, label: c }))} value={count} onValueChange={setCount} disabled={pending} />
        </div>
        <Button type="button" icon="sparkles" onClick={request} pending={pending} pendingLabel={t("generating")} disabled={!topic}>
          {t("requestButton")}
        </Button>
      </div>
      {result && "kind" in result && result.kind === "answer" && <Alert tone="success">{t("arrived", { count: result.count })}</Alert>}
      {result && "kind" in result && result.kind === "no_source" && (
        <Alert tone="info">
          {t("noSource")}{" "}
          <Link href={routes.teacherTopics(courseId)} className="font-semibold underline">
            {tAll("teacher.course.tab.topics")}
          </Link>
          .
        </Alert>
      )}
      {result && "code" in result && (
        <Alert tone="danger">{result.code === "tutor_unavailable" ? t("unavailable") : tAll(errorMessageKey(result.code))}</Alert>
      )}
    </section>
  );
}
