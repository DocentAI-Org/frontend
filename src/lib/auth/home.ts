import type { Route } from "next";

import type { Schemas } from "@/lib/api/client";

export const ROLE_HOME: Record<Schemas["Me"]["role"], Route> = {
  admin: "/admin/users",
  teacher: "/teacher/courses",
  student: "/student/courses"
};

/** Only same-site paths are followed after sign-in (no open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
