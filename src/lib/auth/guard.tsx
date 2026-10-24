import "server-only";

import type { ReactNode } from "react";

import { AccessDenied } from "@/components/AccessDenied";
import { ErrorState } from "@/components/ErrorState";
import { PublicFrame } from "@/components/PublicFrame";
import type { Schemas } from "@/lib/api/client";
import { getMe } from "@/lib/api/me";

import { ROLE_HOME } from "./home";

type Me = Schemas["Me"];

/**
 * Server-side role check for a route group (Constitution II, spec FR-005). Returns the user, or
 * the screen to render instead: the API's error state or access denied with a link home.
 */
export async function requireRole(role: Me["role"]): Promise<{ me: Me } | { screen: ReactNode }> {
  const me = await getMe();
  if (!me.ok) {
    return { screen: <PublicFrame><ErrorState code={me.code} /></PublicFrame> };
  }
  if (me.data.role !== role) {
    return { screen: <PublicFrame><AccessDenied home={ROLE_HOME[me.data.role]} /></PublicFrame> };
  }
  return { me: me.data };
}
