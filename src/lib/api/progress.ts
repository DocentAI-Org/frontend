import "server-only";

import { request } from "./client";

/** Progress and mastery by topic (backend specs/007): the same for the student and the teacher. */
export const getProgress = (course_id: string) =>
  request((api) => api.GET("/v1/student/courses/{course_id}/progress", { params: { path: { course_id } } }));

export const getStudentProgress = (course_id: string, student_id: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/students/{student_id}/progress", {
      params: { path: { course_id, student_id } }
    })
  );
