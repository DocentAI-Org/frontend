import { type Ctx, HttpError, type Route, noContent } from "../http.ts";
import { type S, type User, id } from "../state.ts";
import { courseTags } from "./courses.ts";

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
,
  // Course tags of one's own (backend specs/016 US4).
  { method: "GET", path: "/v1/me/course-tags", handler: (ctx) => myTags(ctx).map((t) => tagView(ctx, t)) },
  {
    method: "POST",
    path: "/v1/me/course-tags",
    status: 201,
    handler: (ctx) => {
      const user = tagUser(ctx);
      const { name, color } = validTag(ctx, ctx.body as { name?: string; color?: string }, true);
      const tag = { id: id(), user_id: user.id, name: name!, color: color! };
      ctx.state.tags.push(tag);
      return tagView(ctx, tag);
    }
  },
  {
    method: "PATCH",
    path: "/v1/me/course-tags/{tag_id}",
    handler: (ctx) => {
      const tag = ownTag(ctx);
      const { name, color } = validTag(ctx, ctx.body as { name?: string; color?: string }, false, tag.id);
      if (name) tag.name = name;
      if (color) tag.color = color;
      return tagView(ctx, tag);
    }
  },
  {
    method: "DELETE",
    path: "/v1/me/course-tags/{tag_id}",
    handler: (ctx) => {
      const tag = ownTag(ctx);
      ctx.state.tags = ctx.state.tags.filter((t) => t.id !== tag.id);
      for (const link of [...ctx.state.tagLinks]) if (link.startsWith(`${tag.id}:`)) ctx.state.tagLinks.delete(link);
      return noContent();
    }
  },
  {
    method: "PUT",
    path: "/v1/me/course-tags/{tag_id}/courses/{course_id}",
    handler: (ctx) => {
      const tag = ownTag(ctx);
      favoriteKey(ctx); // the same "course of yours, else 404" check
      ctx.state.tagLinks.add(`${tag.id}:${ctx.params.course_id}`);
      return noContent();
    }
  },
  {
    method: "DELETE",
    path: "/v1/me/course-tags/{tag_id}/courses/{course_id}",
    handler: (ctx) => {
      const tag = ownTag(ctx);
      favoriteKey(ctx);
      ctx.state.tagLinks.delete(`${tag.id}:${ctx.params.course_id}`);
      return noContent();
    }
  }];

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

const COLORS = ["violet", "green", "blue", "amber", "red", "gray"] as const;
type Tag = { id: string; user_id: string; name: string; color: S["CourseTagRef"]["color"] };

function tagUser(ctx: Ctx): User {
  if (!ctx.user) throw new HttpError(401, "unauthenticated");
  if (ctx.user.role !== "teacher" && ctx.user.role !== "student") throw new HttpError(403, "forbidden");
  return ctx.user;
}

function myTags(ctx: Ctx): Tag[] {
  const user = tagUser(ctx);
  return ctx.state.tags
    .filter((t) => t.user_id === user.id)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

function ownTag(ctx: Ctx): Tag {
  const tag = myTags(ctx).find((t) => t.id === ctx.params.tag_id);
  if (!tag) throw new HttpError(404, "not_found");
  return tag;
}

function validTag(ctx: Ctx, body: { name?: string; color?: string }, create: boolean, except?: string) {
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const color = body.color as Tag["color"] | undefined;
  if ((create || body.name !== undefined) && (!name || name.length > 40)) {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "name"] }] });
  }
  if ((create || color !== undefined) && !COLORS.includes(color!)) {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "color"] }] });
  }
  if (name && myTags(ctx).some((t) => t.id !== except && t.name.toLowerCase() === name.toLowerCase())) {
    throw new HttpError(409, "tag_name_taken");
  }
  return { name, color };
}

/** The tag with how many of the user's visible courses carry it. */
function tagView(ctx: Ctx, tag: Tag): S["CourseTag"] {
  const user = ctx.user!;
  const visible =
    user.role === "teacher"
      ? ctx.state.courses.filter((c) => c.teacher_id === user.id).map((c) => c.id)
      : ctx.state.enrolments.filter((e) => e.student_id === user.id && e.status === "active").map((e) => e.course_id);
  const count = visible.filter((courseId) => courseTags(ctx.state, user.id, courseId).some((t) => t.id === tag.id)).length;
  return { id: tag.id, name: tag.name, color: tag.color, course_count: count };
}
