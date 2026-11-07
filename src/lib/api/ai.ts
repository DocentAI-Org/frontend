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
