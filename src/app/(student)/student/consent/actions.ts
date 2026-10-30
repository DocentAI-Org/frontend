"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { giveConsent } from "@/lib/api/consent";
import { safeNext } from "@/lib/auth/home";

export type ConsentState = { error?: boolean; unchecked?: boolean };

export async function giveConsentAction(_: ConsentState, form: FormData): Promise<ConsentState> {
  if (form.get("accept") !== "on") return { unchecked: true };
  const result = await giveConsent();
  if (!result.ok) return { error: true };
  const next = safeNext(String(form.get("next") ?? ""));
  const params = new URLSearchParams({ step: "2" });
  if (next) params.set("next", next);
  redirect(`/student/consent?${params}` as Route);
}
