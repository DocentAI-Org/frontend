import "server-only";

import { type Schemas, request } from "./client";

const path = "/v1/teacher/courses/{course_id}/ai-settings" as const;

/** A course's AI settings: inherited, its own and those in effect (backend specs/019). */
export const getCourseAISettings = (courseId: string) =>
  request((api) => api.GET(path, { params: { path: { course_id: courseId } } }));

export const updateCourseAISettings = (courseId: string, body: Schemas["CourseOverrides"]) =>
  request((api) => api.PUT(path, { params: { path: { course_id: courseId } }, body }));

/** The models the course can use, by source. */
export const getCourseAIModels = (courseId: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/ai-models", { params: { path: { course_id: courseId } } }));

const own = "/v1/teacher/courses/{course_id}/llm-credentials" as const;

/** The teacher's own keys for the course, if the study allows them. */
export const listOwnCredentials = (courseId: string) =>
  request((api) => api.GET(own, { params: { path: { course_id: courseId } } }));

export const createOwnCredential = (courseId: string, body: Schemas["CredentialCreate"]) =>
  request((api) => api.POST(own, { params: { path: { course_id: courseId } }, body }));

export const deleteOwnCredential = (courseId: string, credentialId: string) =>
  request((api) =>
    api.DELETE("/v1/teacher/courses/{course_id}/llm-credentials/{credential_id}", {
      params: { path: { course_id: courseId, credential_id: credentialId } }
    })
  );

/** Tries a message with the given (unsaved) settings; not a student interaction. */
export const testCourseAI = (courseId: string, body: Schemas["AITestRequest"]) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/ai-test", { params: { path: { course_id: courseId } }, body }));

/** Messages, tokens and cost per task, and who used most. */
export const getCourseAIUsage = (courseId: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/ai-usage", { params: { path: { course_id: courseId } } }));
