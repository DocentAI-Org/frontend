import "server-only";

import { cache } from "react";

import { type ApiResult, type Schemas, request } from "./client";

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

/** The error taxonomy (backend specs/003); fetched once per request. */
export const getErrorTypes = cache(() => request((api) => api.GET("/v1/error-types")));

type Entry = Schemas["LearningRecordEntry"];

/** Every page of a learning record (spec 005 FR-003). */
async function allEntries(page: (offset: number) => Promise<ApiResult<{ items: Entry[]; total: number }>>) {
  const items: Entry[] = [];
  for (let offset = 0; ; offset += 100) {
    const result = await page(offset);
    if (!result.ok) return result;
    items.push(...result.data.items);
    if (items.length >= result.data.total || result.data.items.length === 0) return { ok: true as const, data: items };
  }
}

export const getLearningRecord = (course_id: string) =>
  allEntries((offset) =>
    request((api) =>
      api.GET("/v1/student/courses/{course_id}/learning-record", {
        params: { path: { course_id }, query: { limit: 100, offset } }
      })
    )
  );

export const getStudentLearningRecord = (course_id: string, student_id: string) =>
  allEntries((offset) =>
    request((api) =>
      api.GET("/v1/teacher/courses/{course_id}/students/{student_id}/learning-record", {
        params: { path: { course_id, student_id }, query: { limit: 100, offset } }
      })
    )
  );
