import { type Ctx, HttpError, type Route, noContent } from "../http.ts";
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
  },
  {
    // Backend specs/016: a course the caller teaches or is actively in, else 404.
    method: "PUT",
    path: "/v1/me/favorite-courses/{course_id}",
    handler: (ctx) => {
      ctx.state.favorites.add(favoriteKey(ctx));
      return noContent();
    }
  },
  {
    method: "DELETE",
    path: "/v1/me/favorite-courses/{course_id}",
    handler: (ctx) => {
      ctx.state.favorites.delete(favoriteKey(ctx));
      return noContent();
    }
  }
];

function favoriteKey(ctx: Ctx): string {
  const user = ctx.user;
  if (!user) throw new HttpError(401, "unauthenticated");
  if (user.role !== "teacher" && user.role !== "student") throw new HttpError(403, "forbidden");
  const courseId = ctx.params.course_id;
  const mine =
    user.role === "teacher"
      ? ctx.state.courses.some((c) => c.id === courseId && c.teacher_id === user.id)
      : ctx.state.enrolments.some((e) => e.course_id === courseId && e.student_id === user.id && e.status === "active");
  if (!mine) throw new HttpError(404, "not_found");
  return `${user.id}:${courseId}`;
}
