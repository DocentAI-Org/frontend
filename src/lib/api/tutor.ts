import "server-only";

import { type Schemas, request } from "./client";

export const getTutorSettings = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/tutor-settings", { params: { path: { course_id } } }));

export const saveTutorSettings = (course_id: string, body: Schemas["TutorSettingsUpdate"]) =>
  request((api) => api.PUT("/v1/teacher/courses/{course_id}/tutor-settings", { params: { path: { course_id } }, body }));

export const getStudentTutorSettings = (course_id: string) =>
  request((api) => api.GET("/v1/student/courses/{course_id}/tutor-settings", { params: { path: { course_id } } }));
