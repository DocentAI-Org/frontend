import "server-only";

import { type Schemas, request } from "./client";

const path = "/v1/teacher/courses/{course_id}/pedagogy-criteria" as const;

/** A course's pedagogical criteria: the study's, its own groups, those in effect (spec 015). */
export const getCourseCriteria = (courseId: string) =>
  request((api) => api.GET(path, { params: { path: { course_id: courseId } } }));

export const updateCourseCriteria = (courseId: string, body: Schemas["CourseCriteriaUpdate"]) =>
  request((api) => api.PUT(path, { params: { path: { course_id: courseId } }, body }));
