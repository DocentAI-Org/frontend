import "server-only";

import { type Schemas, request } from "./client";

export type TestPhase = "pre" | "post";

// --- Teacher (backend specs/008, P3) ---------------------------------------------------

export const getCourseTest = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/test", { params: { path: { course_id } } }));

export const addTestQuestion = (course_id: string, body: Schemas["TestQuestionCreate"]) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/test/questions", { params: { path: { course_id } }, body }));

export const copyQuizQuestion = (course_id: string, question_id: string) =>
  request((api) =>
    api.POST("/v1/teacher/courses/{course_id}/test/questions/from-quiz", { params: { path: { course_id } }, body: { question_id } })
  );

export const updateTestQuestion = (course_id: string, question_id: string, body: Schemas["TestQuestionUpdate"]) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/test/questions/{question_id}", { params: { path: { course_id, question_id } }, body })
  );

export const deleteTestQuestion = (course_id: string, question_id: string) =>
  request((api) =>
    api.DELETE("/v1/teacher/courses/{course_id}/test/questions/{question_id}", { params: { path: { course_id, question_id } } })
  );

export const setTestPhase = (course_id: string, phase: TestPhase, status: "open" | "closed") =>
  request((api) =>
    api.PUT("/v1/teacher/courses/{course_id}/test/phases/{phase}", { params: { path: { course_id, phase } }, body: { status } })
  );

export const getTestResults = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/test/results", { params: { path: { course_id } } }));

// --- Student -------------------------------------------------------------------------

export const listTestPhases = (course_id: string) =>
  request((api) => api.GET("/v1/student/courses/{course_id}/test", { params: { path: { course_id } } }));

export const getStudentTest = (course_id: string, phase: TestPhase) =>
  request((api) => api.GET("/v1/student/courses/{course_id}/test/{phase}", { params: { path: { course_id, phase } } }));

export const submitTest = (course_id: string, phase: TestPhase, answers: Schemas["TestAnswerIn"][]) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/test/{phase}", { params: { path: { course_id, phase } }, body: { answers } })
  );
