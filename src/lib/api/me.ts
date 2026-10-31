import "server-only";

import { cache } from "react";

import { type Schemas, request } from "./client";

/** The signed-in user, once per request: role and language always come from the API. */
export const getMe = cache(() => request((api) => api.GET("/v1/me")));

export function updateLanguage(language: Schemas["MeUpdate"]["preferred_language"]) {
  return request((api) => api.PATCH("/v1/me", { body: { preferred_language: language } }));
}

/** Open study questionnaires for the caller's role (P4, backend specs/012). */
export const listMyQuestionnaires = () => request((api) => api.GET("/v1/me/questionnaires"));
