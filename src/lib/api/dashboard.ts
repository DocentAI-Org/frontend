import "server-only";

import { type Schemas, request } from "./client";

export type Period = Schemas["TeacherDashboard"]["period"];
export const PERIODS: Period[] = ["7d", "30d", "all"];

/** Recurring errors and students who may need help (backend specs/004). */
export const getDashboard = (course_id: string, period: Period) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/dashboard", {
      params: { path: { course_id }, query: { period } }
    })
  );

export const getStudentRisk = (course_id: string, student_id: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/students/{student_id}/risk", {
      params: { path: { course_id, student_id } }
    })
  );
