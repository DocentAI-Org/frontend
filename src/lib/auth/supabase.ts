import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

/** Supabase Auth with HttpOnly cookie sessions (research R1); never used in the browser. */
export async function createSupabase() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session instead.
        }
      }
    }
  });
}

/**
 * The access token sent to the DocentAI API. It is read from the session cookie without a
 * round trip: the API verifies every token itself (backend constitution II).
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
