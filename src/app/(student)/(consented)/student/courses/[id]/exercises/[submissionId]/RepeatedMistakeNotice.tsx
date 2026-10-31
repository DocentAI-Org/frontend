"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId, useState, useSyncExternalStore, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { errorMessageKey } from "@/lib/api/errors";

import { type ReviewResult, reviewAction } from "./actions";

/** "Ahora no" lasts for the browser session only (007 FR-002); storage may be unavailable. */
function dismissedKey(courseId: string, type: string, topic: string | null) {
  return `docentai.repeated.${courseId}.${type}.${topic ?? ""}`;
}

function readDismissed(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

// sessionStorage has no change event within a tab; the component's own dismissal is local state.
const subscribe = () => () => {};

/** Repeated mistake notice (#12 "repeated-mistake", 001 US12 AS1, AS3; spec 007 US1). */
export function RepeatedMistakeNotice({
  courseId,
  submissionId,
  count,
  days,
  pattern,
  errorType,
  topic
}: {
  courseId: string;
  submissionId: string;
  count: number;
  days: number;
  pattern: string;
  errorType: string;
  topic: string | null;
}) {
  const t = useTranslations("student.errorPatterns");
  const tAll = useTranslations();
  const format = useFormatter();
  const ids = useId();
  const key = dismissedKey(courseId, errorType, topic);
  // Shown on the server; hidden after hydration if dismissed earlier in this session.
  const dismissedBefore = useSyncExternalStore(subscribe, () => readDismissed(key), () => false);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState<ReviewResult | null>(null);
  const [pending, setPending] = useState<"explain" | "practice" | null>(null);
  const [, startTransition] = useTransition();

  if (hidden || dismissedBefore) return null;

  const open = (which: "explain" | "practice") => {
    setError(null);
    setPending(which);
    startTransition(async () => {
      const result = await reviewAction(courseId, submissionId, which === "practice");
      // Only reached on failure: success redirects.
      setError(result);
      setPending(null);
    });
  };

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Without storage the notice just comes back on the next page.
    }
    setHidden(true);
  };

  return (
    <section
      aria-labelledby={`${ids}-title`}
      className="flex flex-col gap-4 rounded-xl border border-warning-300 bg-warning-50 p-6"
      data-component="RepeatedMistakeNotice"
    >
      <div className="flex items-start gap-4">
        <Icon name="lightbulb" className="mt-1 size-6 shrink-0 text-warning-800" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 id={`${ids}-title`} className="text-lg font-semibold text-fg tabular-nums">
            {t("timesIn", { count, days })}
          </h2>
          <p className="font-medium text-fg">{pattern}</p>
          <p className="text-fg">{t("lead")}</p>
          <p className="text-sm text-fg-muted">{t("provisional")}</p>
        </div>
      </div>
      {error && (
        <Alert tone="danger">
          {error.code === "daily_limit_reached" && error.resetsAt
            ? t("limit", { time: format.dateTime(new Date(error.resetsAt), { timeStyle: "short" }) })
            : tAll(errorMessageKey(error.code))}
        </Alert>
      )}
      <div className="flex flex-wrap gap-2 sm:pl-10">
        <Button
          type="button"
          icon="book-open"
          onClick={() => open("explain")}
          pending={pending === "explain"}
          pendingLabel={t("preparing")}
          disabled={pending !== null}
        >
          {t("explain")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          icon="lightbulb"
          onClick={() => open("practice")}
          pending={pending === "practice"}
          pendingLabel={t("preparing")}
          disabled={pending !== null}
        >
          {t("practice")}
        </Button>
        <Button type="button" variant="ghost" icon="x" onClick={dismiss} title={t("dismissLabel")} disabled={pending !== null}>
          {t("dismiss")}
        </Button>
      </div>
    </section>
  );
}
