import type { Route } from "next";

/**
 * Dynamic routes of the app (contracts/routes.md), in one place so links stay consistent. The
 * casts are needed because typed routes cannot check template strings.
 */
export const routes = {
  teacherCourse: (id: string) => `/teacher/courses/${id}` as Route,
  teacherMaterial: (id: string) => `/teacher/courses/${id}/material` as Route,
  teacherDocument: (id: string, documentId: string) => `/teacher/courses/${id}/material/${documentId}` as Route,
  teacherSettings: (id: string) => `/teacher/courses/${id}/tutor` as Route,
  teacherCriteria: (id: string) => `/teacher/courses/${id}/criteria` as Route,
  teacherTopics: (id: string) => `/teacher/courses/${id}/topics` as Route,
  teacherTopicAssignment: (id: string) => `/teacher/courses/${id}/topics/assignment` as Route,
  teacherConversations: (id: string) => `/teacher/courses/${id}/conversations` as Route,
  teacherConversation: (id: string, conversationId: string) =>
    `/teacher/courses/${id}/conversations/${conversationId}` as Route,
  teacherSubmission: (id: string, submissionId: string) => `/teacher/courses/${id}/exercises/${submissionId}` as Route,
  teacherFlags: (id: string) => `/teacher/courses/${id}/corrections` as Route,
  teacherQuestions: (id: string, query = "") => `/teacher/courses/${id}/questions${query}` as Route,
  teacherTest: (id: string, query = "") => `/teacher/courses/${id}/test${query}` as Route,
  teacherDashboard: (id: string, query = "") => `/teacher/courses/${id}/dashboard${query}` as Route,
  studentCourse: (id: string) => `/student/courses/${id}` as Route,
  studentConversation: (id: string, conversationId: string) =>
    `/student/courses/${id}/conversations/${conversationId}` as Route,
  studentProgress: (id: string) => `/student/courses/${id}/progress` as Route,
  teacherStudent: (id: string, studentId: string, query = "") =>
    `/teacher/courses/${id}/students/${studentId}${query}` as Route,
  studentExercise: (id: string) => `/student/courses/${id}/exercise` as Route,
  studentSubmission: (id: string, submissionId: string) => `/student/courses/${id}/exercises/${submissionId}` as Route,
  studentReview: (id: string, submissionId: string) => `/student/courses/${id}/exercises/${submissionId}/review` as Route,
  studentQuizStart: (id: string) => `/student/courses/${id}/quiz` as Route,
  studentTest: (id: string, phase: "pre" | "post") => `/student/courses/${id}/test/${phase}` as Route,
  studentQuiz: (id: string, quizId: string) => `/student/courses/${id}/quizzes/${quizId}` as Route,
  join: (code: string) => `/join/${encodeURIComponent(code)}` as Route
};
