import type { Route } from "next";

/**
 * Dynamic routes of the app (contracts/routes.md), in one place so links stay consistent. The
 * casts are needed because typed routes cannot check template strings.
 */
export const routes = {
  teacherCourse: (id: string) => `/profesor/cursos/${id}` as Route,
  teacherMaterial: (id: string) => `/profesor/cursos/${id}/material` as Route,
  teacherDocument: (id: string, documentId: string) => `/profesor/cursos/${id}/material/${documentId}` as Route,
  teacherSettings: (id: string) => `/profesor/cursos/${id}/tutor` as Route,
  teacherTopics: (id: string) => `/profesor/cursos/${id}/temas` as Route,
  teacherTopicAssignment: (id: string) => `/profesor/cursos/${id}/temas/asignacion` as Route,
  teacherConversations: (id: string) => `/profesor/cursos/${id}/conversaciones` as Route,
  teacherConversation: (id: string, conversationId: string) =>
    `/profesor/cursos/${id}/conversaciones/${conversationId}` as Route,
  teacherSubmission: (id: string, submissionId: string) => `/profesor/cursos/${id}/ejercicios/${submissionId}` as Route,
  teacherFlags: (id: string) => `/profesor/cursos/${id}/correcciones` as Route,
  studentCourse: (id: string) => `/alumno/cursos/${id}` as Route,
  studentConversation: (id: string, conversationId: string) =>
    `/alumno/cursos/${id}/conversaciones/${conversationId}` as Route,
  studentExercise: (id: string) => `/alumno/cursos/${id}/ejercicio` as Route,
  studentSubmission: (id: string, submissionId: string) => `/alumno/cursos/${id}/ejercicios/${submissionId}` as Route,
  join: (code: string) => `/unirse/${encodeURIComponent(code)}` as Route
};
