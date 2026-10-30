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
  teacherTopics: (id: string) => `/teacher/courses/${id}/topics` as Route,
  teacherTopicAssignment: (id: string) => `/teacher/courses/${id}/topics/assignment` as Route,
  teacherConversations: (id: string) => `/teacher/courses/${id}/conversations` as Route,
  teacherConversation: (id: string, conversationId: string) =>
    `/teacher/courses/${id}/conversations/${conversationId}` as Route,
  teacherSubmission: (id: string, submissionId: string) => `/teacher/courses/${id}/exercises/${submissionId}` as Route,
  teacherFlags: (id: string) => `/teacher/courses/${id}/corrections` as Route,
  studentCourse: (id: string) => `/student/courses/${id}` as Route,
  studentConversation: (id: string, conversationId: string) =>
    `/student/courses/${id}/conversations/${conversationId}` as Route,
  studentExercise: (id: string) => `/student/courses/${id}/exercise` as Route,
  studentSubmission: (id: string, submissionId: string) => `/student/courses/${id}/exercises/${submissionId}` as Route,
  join: (code: string) => `/join/${encodeURIComponent(code)}` as Route
};
