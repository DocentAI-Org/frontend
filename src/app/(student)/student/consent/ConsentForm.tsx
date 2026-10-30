"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";

import { type ConsentState, giveConsentAction } from "./actions";

export function ConsentForm({ next }: { next: string | null }) {
  const t = useTranslations("student.consent");
  const [state, action, pending] = useActionState<ConsentState, FormData>(giveConsentAction, {});
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 border-t border-border pt-6">
      {state.error && <Alert tone="danger">{t("error")}</Alert>}
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex items-start gap-4">
        <input
          type="checkbox"
          name="accept"
          required
          aria-invalid={state.unchecked ? true : undefined}
          className="mt-1 size-5 shrink-0 accent-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        <span className="text-fg">{t("accept")}</span>
      </label>
      <div className="flex justify-end">
        <Button type="submit" pending={pending}>
          {t("continue")}
        </Button>
      </div>
    </form>
  );
}
