import "server-only";

import { type Schemas, request } from "./client";

const PAGE = { limit: 100, offset: 0 };

export type ConversationFilters = { student_id?: string; from?: string; has_no_source?: boolean; has_correction?: boolean };

export const listCourseConversations = (course_id: string, filters: ConversationFilters) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/conversations", {
      params: { path: { course_id }, query: { ...PAGE, ...filters } }
    })
  );

export const getCourseConversation = (course_id: string, conversation_id: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/conversations/{conversation_id}", {
      params: { path: { course_id, conversation_id } }
    })
  );

export const listCourseSubmissions = (course_id: string, filters: { student_id?: string; from?: string }) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/submissions", { params: { path: { course_id }, query: { ...PAGE, ...filters } } })
  );

export const getCourseSubmission = (course_id: string, submission_id: string) =>
  request((api) =>
    api.GET("/v1/teacher/courses/{course_id}/submissions/{submission_id}", {
      params: { path: { course_id, submission_id } }
    })
  );

export type FlagTarget = { kind: "message" | "submission"; id: string };

export const saveFlag = (course_id: string, target: FlagTarget, body: Schemas["FlagUpsert"]) =>
  request((api) =>
    target.kind === "message"
      ? api.PUT("/v1/teacher/courses/{course_id}/messages/{message_id}/flag", {
          params: { path: { course_id, message_id: target.id } },
          body
        })
      : api.PUT("/v1/teacher/courses/{course_id}/submissions/{submission_id}/flag", {
          params: { path: { course_id, submission_id: target.id } },
          body
        })
  );

export const removeFlag = (course_id: string, target: FlagTarget) =>
  request((api) =>
    target.kind === "message"
      ? api.DELETE("/v1/teacher/courses/{course_id}/messages/{message_id}/flag", {
          params: { path: { course_id, message_id: target.id } }
        })
      : api.DELETE("/v1/teacher/courses/{course_id}/submissions/{submission_id}/flag", {
          params: { path: { course_id, submission_id: target.id } }
        })
  );

export const listCourseFlags = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/flags", { params: { path: { course_id }, query: PAGE } }));
