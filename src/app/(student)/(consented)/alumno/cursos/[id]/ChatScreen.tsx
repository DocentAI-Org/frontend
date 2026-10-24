"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { CitationNotes } from "@/components/CitationNotes";
import { Icon } from "@/components/Icon";
import type { Schemas } from "@/lib/api/client";
import { errorMessageKey } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

import { type ChatResult, acknowledgeAction, retryAction, sendAction } from "./actions";

type Message = Schemas["StudentMessage"];

const POLICY_HELP = {
  direct: "policy.directHelp",
  hints_first: "policy.hintsFirstHelp",
  hints_only: "policy.hintsOnlyHelp"
} as const;
const LEVEL = { basic: "level.basic", intermediate: "level.intermediate", advanced: "level.advanced" } as const;
const TONE = { friendly: "tone.friendly", neutral: "tone.neutral", formal: "tone.formal" } as const;

const DIALOG =
  "m-auto w-full max-w-md rounded-xl border border-border bg-surface-raised p-0 text-fg shadow-lg backdrop:bg-neutral-900/50";
const AI_TAG = "rounded-sm border border-info-300 px-1 text-xs font-bold text-info-800 no-underline";

/**
 * The course chat (#8, #10; 001 US1, US5): AI disclosure on first use, answers with citations,
 * hints, "not covered", failures with retry, the daily allowance and the tutor's settings.
 */
export function ChatScreen({
  courseId,
  conversationId: initialConversationId,
  acknowledged: initiallyAcknowledged,
  settings,
  initialAllowance,
  initialMessages
}: {
  courseId: string;
  conversationId: string | null;
  acknowledged: boolean;
  settings: Schemas["StudentTutorSettings"];
  initialAllowance: Schemas["Allowance"];
  initialMessages: Message[];
}) {
  const t = useTranslations("student");
  const tAll = useTranslations();
  const tSettings = useTranslations("teacher.tutorSettings");
  const format = useFormatter();
  const router = useRouter();
  const ids = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);

  const [acknowledged, setAcknowledged] = useState(initiallyAcknowledged);
  const [ackChecked, setAckChecked] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [allowance, setAllowance] = useState(initialAllowance);
  // Uncontrolled on purpose: text typed before hydration (slow phones) must not be wiped.
  const [hasDraft, setHasDraft] = useState(false);
  useEffect(() => setHasDraft(Boolean(input.current?.value.trim())), []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const guided = settings.solution_policy !== "direct";
  const reached = allowance.remaining === 0;
  const time = (iso: string) => format.dateTime(new Date(iso), { timeStyle: "short" });

  function handle(result: ChatResult, optimisticId?: string) {
    if (result.conversationId && result.conversationId !== conversationId) {
      setConversationId(result.conversationId);
      // Keeps the conversation in the address bar without reloading what is on screen.
      window.history.replaceState(null, "", routes.studentConversation(courseId, result.conversationId));
    }
    if (result.ok) {
      const { student_message, tutor_message } = result.exchange;
      setMessages((current) => [
        ...current.filter((m) => m.id !== optimisticId && m.id !== student_message.id),
        student_message,
        tutor_message
      ]);
      setAllowance(result.exchange.allowance);
      setError(null);
      return;
    }
    const details = result.details ?? {};
    if (result.code === "tutor_unavailable" && typeof details.message_id === "string") {
      const failedId = details.message_id;
      setMessages((current) =>
        current.map((m) => (m.id === optimisticId || m.id === failedId ? { ...m, id: failedId, status: "failed" } : m))
      );
      return;
    }
    setMessages((current) => current.filter((m) => m.id !== optimisticId));
    if (result.code === "daily_limit_reached") {
      setAllowance((current) => ({
        ...current,
        used: current.limit,
        remaining: 0,
        resets_at: typeof details.resets_at === "string" ? details.resets_at : current.resets_at
      }));
    } else if (result.code === "consent_required") {
      router.push(`/alumno/consentimiento?next=${encodeURIComponent(routes.studentCourse(courseId))}` as never);
    } else if (result.code === "disclosure_not_acknowledged") {
      setAcknowledged(false);
    } else {
      setError(result.code);
    }
  }

  function send(text: string, requestSolution = false) {
    const clean = text.trim();
    if (!clean || pending || reached) return;
    const optimisticId = `pending-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: optimisticId,
        author: "student",
        kind: "question",
        status: "sent",
        text: clean,
        hint_number: null,
        request_solution: requestSolution,
        counts_toward_limit: false,
        created_at: new Date().toISOString(),
        citations: [],
        correction: null
      }
    ]);
    if (input.current) input.current.value = "";
    setHasDraft(false);
    startTransition(async () => handle(await sendAction(courseId, conversationId, clean, requestSolution), optimisticId));
  }

  function retry(messageId: string) {
    if (!conversationId) return;
    setMessages((current) => current.map((m) => (m.id === messageId ? { ...m, status: "sent" } : m)));
    startTransition(async () => handle(await retryAction(courseId, conversationId, messageId), messageId));
  }

  const last = messages.at(-1);
  const awaitingHint = !pending && last?.author === "tutor" && last.kind === "hint";

  if (!acknowledged) {
    return (
      <section aria-labelledby={`${ids}-ack`} className="max-w-2xl rounded-xl border border-border bg-surface-raised p-6 sm:p-8" data-component="AIDisclosure" data-variant="chat">
        <h2 id={`${ids}-ack`} className="text-2xl font-semibold text-fg">
          {t("chat.disclosure.title")}
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {(
            [
              ["sparkles", t("chat.disclosure.ai")],
              ["book-open", t("chat.disclosure.material")],
              ["eye", t("chat.disclosure.review")],
              ["message-circle", t("chat.disclosure.limit", { limit: allowance.limit })]
            ] as const
          ).map(([icon, text]) => (
            <li key={icon} className="flex gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-fg">
                <Icon name={icon} className="size-5 shrink-0" />
              </span>
              <span className="pt-2 text-fg">{text}</span>
            </li>
          ))}
        </ul>
        <form
          className="mt-6 flex flex-col gap-4 border-t border-border pt-6"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              if (await acknowledgeAction(courseId)) setAcknowledged(true);
              else setError("unknown");
            });
          }}
        >
          {error && <Alert tone="danger">{tAll(errorMessageKey(error))}</Alert>}
          <label className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(event) => setAckChecked(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <span className="text-fg">{t("chat.disclosure.ack")}</span>
          </label>
          <Button type="submit" disabled={!ackChecked} pending={pending} className="self-end">
            {t("chat.disclosure.start")}
          </Button>
        </form>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {guided ? (
          <p className="flex items-center gap-2 text-sm" data-component="GuidedModeIndicator">
            <span className="inline-flex items-center gap-1 rounded-sm border border-primary-300 bg-primary-50 px-2 py-0.5 font-semibold text-primary-800">
              <Icon name="lightbulb" />
              <span>{t("guided.indicator")}</span>
            </span>
            <span className="text-fg-muted">{t("guided.indicatorBody")}</span>
          </p>
        ) : (
          <span />
        )}
        <Button type="button" variant="ghost" icon="info" onClick={() => infoDialog.current?.showModal()}>
          {t("chat.tutorInfo.open")}
        </Button>
      </div>

      <ol aria-label={t("chat.conversation")} className="flex flex-col gap-8">
        <li className="grid gap-x-6 lg:grid-cols-12" data-component="ChatMessage" data-variant="tutor-welcome">
          <div className="min-w-0 rounded-lg bg-surface px-4 py-4 lg:col-span-9">
            <TutorLabel name={t("chat.tutorName")} tag={t("chat.aiTag")} tagLabel={t("chat.aiTagLabel")} />
            <p className="font-serif text-lg text-fg">{guided ? t("guided.welcome") : t("chat.welcome")}</p>
          </div>
        </li>

        {messages.map((message) =>
          message.author === "student" ? (
            <li key={message.id} className="grid lg:grid-cols-12" data-component="ChatMessage" data-variant="student">
              <div className="flex flex-col items-end gap-2 lg:col-span-9">
                <p className="sr-only">{t("chat.you")}</p>
                <p className="max-w-md rounded-r-md border-l-4 border-primary-600 bg-surface-raised px-4 py-2 text-fg shadow-sm">
                  {message.text}
                </p>
                {message.status === "failed" && (
                  <div role="alert" className="flex max-w-md flex-col gap-2 rounded-lg border border-danger-200 bg-danger-50 p-4">
                    <p className="font-semibold text-danger-700">{t("chat.failed.title")}</p>
                    <p className="text-fg">{t("chat.failed.body")}</p>
                    <Button type="button" variant="secondary" icon="refresh-cw" onClick={() => retry(message.id)} className="self-start">
                      {tAll("common.actions.retry")}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ) : message.kind === "no_source" ? (
            <li key={message.id} className="grid gap-x-6 lg:grid-cols-12" data-component="ChatMessage" data-variant="tutor-no-source">
              <div className="min-w-0 rounded-lg border border-info-200 bg-info-50 px-4 py-4 lg:col-span-9" data-component="NoSourceNotice">
                <TutorLabel name={t("chat.tutorName")} tag={t("chat.aiTag")} tagLabel={t("chat.aiTagLabel")} />
                <div className="flex gap-4">
                  <Icon name="info" className="mt-1 size-6 shrink-0 text-info-700" />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-fg">{t("chat.noSource.heading")}</h3>
                    <p className="font-serif text-fg">{t("chat.noSource.body")}</p>
                    <p className="text-fg-muted">{t("chat.noSource.teacherTip")}</p>
                    <div className="mt-2">
                      <Button type="button" variant="secondary" icon="refresh-cw" onClick={() => input.current?.focus()}>
                        {t("chat.noSource.rephrase")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ) : (
            <li
              key={message.id}
              className="grid gap-x-6 lg:grid-cols-12"
              data-component="ChatMessage"
              data-variant={message.kind === "hint" ? "tutor-hint" : "tutor-answer"}
            >
              <div className="min-w-0 rounded-lg bg-surface px-4 py-4 lg:col-span-9">
                <TutorLabel
                  name={t("chat.tutorName")}
                  tag={t("chat.aiTag")}
                  tagLabel={t("chat.aiTagLabel")}
                  corrected={message.correction ? tAll("common.correction.correctedTag") : undefined}
                />
                {message.kind === "hint" && message.hint_number && (
                  <p className="mb-1 text-sm font-semibold text-primary-800">{t("chat.hint", { n: message.hint_number })}</p>
                )}
                <p
                  className={`font-serif text-lg ${message.correction ? "text-fg-muted line-through decoration-teacher-600 decoration-1" : "text-fg"}`}
                >
                  {message.text}
                </p>
              </div>
              <aside className="mt-2 flex flex-col gap-2 lg:col-span-3 lg:mt-0" aria-label={t("chat.sources")}>
                {message.correction && (
                  <div className="flex flex-col gap-1 border-l-2 border-margin bg-surface pl-4" data-component="TeacherCorrection" data-variant="student">
                    <p className="flex items-center gap-2 text-sm font-semibold text-teacher-700">
                      <Icon name="graduation-cap" />
                      <span>{tAll("common.correction.reviewed")}</span>
                    </p>
                    <p className="text-xs text-fg-muted tabular-nums">
                      {tAll("common.correction.date", { date: format.dateTime(new Date(message.correction.reviewed_at), { dateStyle: "long" }) })}
                    </p>
                    <p className="mt-1 font-serif text-fg">{message.correction.text}</p>
                  </div>
                )}
                <CitationNotes citations={message.citations} />
              </aside>
            </li>
          )
        )}

        {pending && (
          <li className="grid lg:grid-cols-12">
            <div role="status" className="flex items-center gap-4 rounded-lg bg-surface px-4 py-4 text-fg-muted lg:col-span-9">
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-2 rounded-full bg-neutral-400 motion-safe:animate-bounce" />
                <span className="size-2 rounded-full bg-neutral-400 motion-safe:animate-bounce" />
                <span className="size-2 rounded-full bg-neutral-400 motion-safe:animate-bounce" />
              </span>
              <span>{t("chat.writing")}</span>
            </div>
          </li>
        )}
      </ol>

      {awaitingHint && !reached && (
        <div className="flex flex-col gap-2 lg:w-3/4">
          <p className="text-sm text-fg-muted">{t("guided.nextSteps")}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" icon="lightbulb" onClick={() => send(t("guided.anotherHint"))}>
              {t("guided.anotherHint")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => input.current?.focus()}>
              {t("guided.tryMyself")}
            </Button>
            {settings.solution_policy === "hints_first" && (
              <Button type="button" variant="ghost" onClick={() => send(t("guided.showSolution"), true)}>
                {t("guided.showSolution")}
              </Button>
            )}
          </div>
          {settings.solution_policy === "hints_only" && <p className="text-sm text-fg-muted">{t("guided.hintsOnly")}</p>}
        </div>
      )}

      {error && <Alert tone="danger">{tAll(errorMessageKey(error))}</Alert>}

      {reached ? (
        <section aria-labelledby={`${ids}-limit`} className="rounded-xl border border-warning-300 bg-warning-50 p-4" data-component="LimitReachedBanner" data-variant="chat">
          <div className="flex gap-4">
            <Icon name="clock" className="mt-1 size-6 shrink-0 text-warning-800" />
            <div className="min-w-0 flex-1">
              <h2 id={`${ids}-limit`} className="font-semibold text-fg tabular-nums">
                {t("chat.limit.title", { limit: allowance.limit })}
              </h2>
              <p className="mt-1 text-fg">{t("chat.limit.body", { time: time(allowance.resets_at) })}</p>
            </div>
          </div>
        </section>
      ) : (
        <p
          className={`inline-flex items-center gap-2 text-sm ${allowance.remaining <= 5 ? "text-warning-900" : "text-fg-muted"}`}
          data-component="MessageAllowance"
          data-variant={allowance.remaining <= 5 ? "low" : "normal"}
        >
          <Icon name="message-circle" />
          <span className="tabular-nums">
            {t("chat.remaining", { count: allowance.remaining })}
            {allowance.remaining <= 5 && <> {t("chat.lowWarning", { time: time(allowance.resets_at) })}</>}
          </span>
        </p>
      )}

      <form
        className="flex items-end gap-2 rounded-lg border border-border-strong bg-surface-raised p-2 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus"
        data-component="ChatComposer"
        onSubmit={(event) => {
          event.preventDefault();
          send(input.current?.value ?? "");
        }}
      >
        <label htmlFor={`${ids}-input`} className="sr-only">
          {t("chat.composer.label")}
        </label>
        <textarea
          ref={input}
          id={`${ids}-input`}
          rows={2}
          maxLength={4000}
          defaultValue=""
          disabled={reached}
          placeholder={t("chat.composer.placeholder")}
          onInput={(event) => setHasDraft(Boolean(event.currentTarget.value.trim()))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(event.currentTarget.value);
            }
          }}
          className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-base text-fg placeholder:text-fg-muted focus-visible:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={reached || pending || !hasDraft}
          aria-label={tAll("common.actions.send")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-fg-inverse hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-600"
        >
          <Icon name="send" className="size-5 shrink-0" />
        </button>
      </form>

      <dialog ref={infoDialog} aria-labelledby={`${ids}-info`} className={DIALOG}>
        <div className="flex flex-col gap-4 p-6">
          <h2 id={`${ids}-info`} className="text-xl font-semibold text-fg">
            {t("chat.tutorInfo.title")}
          </h2>
          <p className="text-fg-muted">{t("chat.tutorInfo.lead")}</p>
          <dl className="grid gap-2 sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="text-sm font-semibold text-fg-muted">{t("chat.tutorInfo.levelLabel")}</dt>
            <dd className="text-fg">{tSettings(LEVEL[settings.level])}</dd>
            <dt className="text-sm font-semibold text-fg-muted">{t("chat.tutorInfo.toneLabel")}</dt>
            <dd className="text-fg">{tSettings(TONE[settings.tone])}</dd>
            <dt className="text-sm font-semibold text-fg-muted">{t("chat.tutorInfo.policyLabel")}</dt>
            <dd className="text-fg">{tSettings(POLICY_HELP[settings.solution_policy])}</dd>
          </dl>
          <Button type="button" onClick={() => infoDialog.current?.close()} className="self-end">
            {t("chat.tutorInfo.ok")}
          </Button>
        </div>
      </dialog>

    </div>
  );
}

function TutorLabel({ name, tag, tagLabel, corrected }: { name: string; tag: string; tagLabel: string; corrected?: string }) {
  return (
    <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-fg-muted">
      <span>{name}</span>
      <abbr title={tagLabel} className={AI_TAG}>
        {tag}
      </abbr>
      {corrected && (
        <span className="inline-flex items-center gap-1 rounded-sm border border-teacher-300 bg-teacher-50 px-2 py-0.5 text-xs font-semibold text-teacher-800">
          <Icon name="flag" />
          <span>{corrected}</span>
        </span>
      )}
    </p>
  );
}
