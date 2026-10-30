"use server";

import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getMe, updateLanguage } from "@/lib/api/me";
import { ROLE_HOME, safeNext } from "@/lib/auth/home";
import { toAuthEmail } from "@/lib/auth/identifier";
import { createSupabase, getAccessToken } from "@/lib/auth/supabase";
import { env } from "@/lib/env";
import { LOCALE_COOKIE, type Locale, isLocale } from "@/i18n/locales";

const YEAR = 60 * 60 * 24 * 365;

async function setLocaleCookie(locale: Locale) {
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: YEAR, sameSite: "lax" });
}

export type SignInState = { error?: "invalid" | "missing" | "unavailable" };

export async function signIn(_: SignInState, form: FormData): Promise<SignInState> {
  const email = toAuthEmail(String(form.get("identifier") ?? ""), env.pseudonymEmailDomain);
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "missing" };

  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.status && error.status >= 500 ? "unavailable" : "invalid" };

  const me = await getMe();
  if (!me.ok) return { error: "unavailable" };
  // The language comes from the profile (spec 002 US1 AS5).
  await setLocaleCookie(me.data.preferred_language);
  redirect((safeNext(String(form.get("next") ?? "")) ?? ROLE_HOME[me.data.role]) as Route);
}

export async function signOut() {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export type RecoveryState = { sent?: boolean; error?: boolean };

export async function requestPasswordReset(_: RecoveryState, form: FormData): Promise<RecoveryState> {
  const email = toAuthEmail(String(form.get("email") ?? ""), env.pseudonymEmailDomain);
  if (!email) return { error: true };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/sign-in` });
  // The same answer whether or not the account exists (no account enumeration).
  return error && (error.status ?? 0) >= 500 ? { error: true } : { sent: true };
}

/** Applies a language now and, for a signed-in user, saves it to their profile. */
export async function setLanguage(locale: string) {
  if (!isLocale(locale)) return;
  await setLocaleCookie(locale);
  if (await getAccessToken()) await updateLanguage(locale);
}
