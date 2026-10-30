import type { Route } from "next";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "./Button";
import { Icon } from "./Icon";

export type DeniedReason = "denied" | "not-found" | "course-removed";

const COPY: Record<DeniedReason, { icon: string; title: string; body: string }> = {
  denied: { icon: "lock", title: "deniedTitle", body: "deniedBody" },
  "not-found": { icon: "search", title: "notFoundTitle", body: "notFoundBody" },
  "course-removed": { icon: "book-open", title: "courseRemovedTitle", body: "courseRemovedBody" }
};

/** Explains why a page is not available and links back home (001 US7 AS5). */
export async function AccessDenied({ reason = "denied", home = "/" }: { reason?: DeniedReason; home?: Route }) {
  const t = await getTranslations("common.errors");
  const copy = COPY[reason];
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <section
        className={`flex flex-col items-start gap-4 rounded-xl border bg-surface-raised p-6 sm:p-10 ${reason === "denied" ? "border-border" : "border-dashed border-border-strong"}`}
        data-component="AccessDenied"
        data-variant={reason}
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full border border-border-strong text-fg">
          <Icon name={copy.icon} className="size-6 shrink-0" />
        </span>
        <h1 className="text-3xl font-semibold text-fg sm:text-4xl">{t(copy.title)}</h1>
        <p className="max-w-prose font-serif text-lg text-fg">{t(copy.body)}</p>
        <LinkButton href={home} icon="chevron-left" className="mt-2">
          {t("goHome")}
        </LinkButton>
      </section>
    </div>
  );
}

/** Maps an API error code on a page to the reason shown. */
export function deniedReasonFor(code: string): DeniedReason {
  if (code === "enrolment_revoked") return "course-removed";
  if (code === "forbidden") return "denied";
  return "not-found";
}
