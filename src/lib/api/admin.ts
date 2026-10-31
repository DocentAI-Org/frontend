import "server-only";

import { type Schemas, request } from "./client";

const PAGE = { limit: 100, offset: 0 };

export const listUsers = () => request((api) => api.GET("/v1/admin/users", { params: { query: PAGE } }));
export const listAllCourses = () => request((api) => api.GET("/v1/admin/courses", { params: { query: PAGE } }));
export const createTeacher = (body: Schemas["TeacherCreate"]) =>
  request((api) => api.POST("/v1/admin/teachers", { body }));
export const createPseudonymousStudents = (count: number) =>
  request((api) => api.POST("/v1/admin/students/pseudonymous", { body: { count } }));

/** The study data ZIP (P5, backend specs/011): consenting students only, no free text. */
export const exportStudyData = (courseId?: string) =>
  request((api) =>
    api.GET("/v1/admin/study-export", {
      params: { query: courseId ? { course_id: courseId } : {} },
      parseAs: "arrayBuffer"
    })
  );
