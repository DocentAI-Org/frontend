import { HttpError, type Route } from "../http.ts";
import type { S, User } from "../state.ts";

export function meView(user: User): S["Me"] {
  return {
    id: user.id,
    role: user.role,
    display_name: user.display_name,
    email: user.pseudonym_code ? null : user.email,
    is_pseudonymous: user.pseudonym_code !== null,
    preferred_language: user.preferred_language
  };
}

export const meRoutes: Route[] = [
  { method: "GET", path: "/v1/health", handler: () => ({ status: "ok", service: "mock", version: "0", database: "ok", llm: "ok" }) },
  {
    method: "GET",
    path: "/v1/me",
    handler: ({ user }) => {
      if (!user) throw new HttpError(401, "unauthenticated");
      return meView(user);
    }
  },
  {
    method: "PATCH",
    path: "/v1/me",
    handler: ({ user, body }) => {
      if (!user) throw new HttpError(401, "unauthenticated");
      const language = (body as { preferred_language?: string }).preferred_language;
      if (language !== "es" && language !== "en") {
        throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "preferred_language"] }] });
      }
      user.preferred_language = language;
      return meView(user);
    }
  }
];
