import "server-only";

import { request } from "./client";

export const submitExercise = (course_id: string, problem_statement: string, worked_answer: string) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/submissions", {
      params: { path: { course_id } },
      body: { problem_statement, worked_answer }
    })
  );

export const getSubmission = (course_id: string, submission_id: string) =>
  request((api) =>
    api.GET("/v1/student/courses/{course_id}/submissions/{submission_id}", {
      params: { path: { course_id, submission_id } }
    })
  );
