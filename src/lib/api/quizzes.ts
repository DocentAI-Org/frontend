import "server-only";

import { type Schemas, request } from "./client";

export type QuestionStatus = Schemas["TeacherQuestion"]["status"];

// --- Teacher: questions drafted by the AI and reviewed (backend specs/006, T7) ----------

export const listQuestions = (course_id: string, status: QuestionStatus, topic_id?: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/questions", {
      params: { path: { course_id }, query: { status, topic_id, limit: 100, offset: 0 } }
    })
  );

export const generateQuestions = (course_id: string, topic_id: string, count: number) =>
  request((api) =>
    api.POST("/v1/teacher/courses/{course_id}/topics/{topic_id}/questions/generate", {
      params: { path: { course_id, topic_id } },
      body: { count }
    })
  );

export const updateQuestion = (course_id: string, question_id: string, body: Schemas["QuestionUpdate"]) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/questions/{question_id}", {
      params: { path: { course_id, question_id } },
      body
    })
  );

// --- Student: adaptive quizzes (S6) -----------------------------------------------------

export const startQuiz = (course_id: string, topic_id?: string) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/quizzes", {
      params: { path: { course_id } },
      body: { topic_id: topic_id ?? null }
    })
  );

export const listQuizzes = (course_id: string) =>
  request((api) =>
    api.GET("/v1/student/courses/{course_id}/quizzes", {
      params: { path: { course_id }, query: { limit: 20, offset: 0 } }
    })
  );

export const getQuiz = (course_id: string, quiz_id: string) =>
  request((api) =>
    api.GET("/v1/student/courses/{course_id}/quizzes/{quiz_id}", {
      params: { path: { course_id, quiz_id } }
    })
  );

export const answerQuestion = (course_id: string, quiz_id: string, question_id: string, choice: number) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/quizzes/{quiz_id}/answers", {
      params: { path: { course_id, quiz_id } },
      body: { question_id, choice }
    })
  );

export const listQuizTopics = (course_id: string) =>
  request((api) => api.GET("/v1/student/courses/{course_id}/quiz-topics", { params: { path: { course_id } } }));
