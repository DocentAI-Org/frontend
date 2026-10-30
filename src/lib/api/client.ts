import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import createClient from "openapi-fetch";

import { getAccessToken } from "@/lib/auth/supabase";
import { env } from "@/lib/env";
import { PATHNAME_HEADER } from "@/lib/request-path";

import { errorCodeOf } from "./errors";
import type { components, paths } from "./schema";

export type Schemas = components["schemas"];

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; status: number; details?: Record<string, unknown> | null };

type FetchResult<T> = { data?: T; error?: unknown; response: Response };

/** The only way the app talks to the DocentAI API (Constitution VI). */
export async function apiClient() {
  const token = await getAccessToken();
  return createClient<paths>({
    baseUrl: env.apiBaseUrl,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store"
  });
}

async function signInAgain(): Promise<never> {
  const current = (await headers()).get(PATHNAME_HEADER) ?? "/";
  redirect(`/sign-in?expired=1&next=${encodeURIComponent(current)}`);
}

/**
 * Runs one API call and turns every outcome into an `ApiResult`: pages render their error state
 * from `code` (FR-006). An expired session sends the user to sign in and back (001 US7 AS7).
 */
export async function request<T>(
  call: (client: Awaited<ReturnType<typeof apiClient>>) => Promise<FetchResult<T>>
): Promise<ApiResult<T>> {
  let result: FetchResult<T>;
  try {
    result = await call(await apiClient());
  } catch {
    return { ok: false, code: "api_unreachable", status: 0 };
  }
  const { data, error, response } = result;
  if (response.status === 401) return signInAgain();
  if (error !== undefined || !response.ok) {
    const details =
      typeof error === "object" && error && "error" in error
        ? ((error as { error: { details?: Record<string, unknown> | null } }).error.details ?? null)
        : null;
    return { ok: false, code: errorCodeOf(error) ?? "unknown", status: response.status, details };
  }
  return { ok: true, data: data as T };
}
