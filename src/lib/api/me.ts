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

/** Stars or unstars a course the caller teaches or is in (backend specs/016). */
export function setFavoriteCourse(course_id: string, favorite: boolean) {
  const path = { params: { path: { course_id } } };
  return request((api) =>
    favorite ? api.PUT("/v1/me/favorite-courses/{course_id}", path) : api.DELETE("/v1/me/favorite-courses/{course_id}", path)
  );
}
