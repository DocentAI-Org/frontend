import { createHash } from "node:crypto";

import { HttpError, NO_CONTENT, type Route, requireRole } from "../http.ts";
import { type S, id, now } from "../state.ts";
import { consentStatus } from "./consent.ts";

const BASE = "/v1/admin/questionnaires";

function invalid(field: string): never {
  throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", field] }] });
}

function checked(body: Partial<S["QuestionnaireCreate"]>, partial: boolean) {
  const title = body.title?.trim();
  const url = body.url?.trim();
  if ((!partial || body.title !== undefined) && !title) invalid("title");
  if ((!partial || body.url !== undefined) && !/^https:\/\/[^/\s]+/.test(url ?? "")) invalid("url");
  if (!partial && body.audience !== "student" && body.audience !== "teacher") invalid("audience");
  return { title, url };
}

function find(questionnaires: S["Questionnaire"][], questionnaireId: string) {
  const found = questionnaires.find((q) => q.id === questionnaireId);
  if (!found) throw new HttpError(404, "not_found");
  return found;
}

export const questionnaireRoutes: Route[] = [
  {
    method: "GET",
    path: BASE,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return [...ctx.state.questionnaires].reverse();
    }
  },
  {
    method: "POST",
    path: BASE,
    status: 201,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const body = ctx.body as S["QuestionnaireCreate"];
      const { title, url } = checked(body, false);
      const created: S["Questionnaire"] = {
        id: id(),
        title: title!,
        url: url!,
        audience: body.audience,
        status: "open",
        created_at: now(),
        updated_at: now()
      };
      ctx.state.questionnaires.push(created);
      return created;
    }
  },
  {
    method: "PATCH",
    path: `${BASE}/{questionnaire_id}`,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const found = find(ctx.state.questionnaires, ctx.params.questionnaire_id);
      const body = ctx.body as S["QuestionnaireUpdate"];
      const { title, url } = checked(body as Partial<S["QuestionnaireCreate"]>, true);
      if (title) found.title = title;
      if (url) found.url = url;
      if (body.status) found.status = body.status;
      found.updated_at = now();
      return found;
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/{questionnaire_id}`,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const found = find(ctx.state.questionnaires, ctx.params.questionnaire_id);
      ctx.state.questionnaires = ctx.state.questionnaires.filter((q) => q !== found);
      return NO_CONTENT;
    }
  },
  {
    method: "GET",
    path: "/v1/me/questionnaires",
    handler: (ctx) => {
      const user = ctx.user;
      if (!user) throw new HttpError(401, "unauthenticated");
      if (user.role === "admin") return [];
      if (user.role === "student" && !consentStatus(ctx.state, user.id).given) return [];
      // Stand-in for the backend's keyed study_ref: 64 hex characters, stable per student.
      const code = user.role === "student" ? createHash("sha256").update(user.id).digest("hex") : "";
      return ctx.state.questionnaires
        .filter((q) => q.audience === user.role && q.status === "open")
        .reverse()
        .map((q) => ({ id: q.id, title: q.title, url: q.url.replaceAll("{study_ref}", code) }));
    }
  }
];
