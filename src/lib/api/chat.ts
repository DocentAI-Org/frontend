import "server-only";

import { request } from "./client";

const PAGE = { limit: 50, offset: 0 };

export const getAllowance = () => request((api) => api.GET("/v1/student/allowance"));

export const listConversations = (course_id: string) =>
  request((api) =>
    api.GET("/v1/student/courses/{course_id}/conversations", { params: { path: { course_id }, query: PAGE } })
  );

export const getConversation = (course_id: string, conversation_id: string) =>
  request((api) =>
    api.GET("/v1/student/courses/{course_id}/conversations/{conversation_id}", {
      params: { path: { course_id, conversation_id } }
    })
  );

export const createConversation = (course_id: string) =>
  request((api) => api.POST("/v1/student/courses/{course_id}/conversations", { params: { path: { course_id } } }));

export const sendMessage = (course_id: string, conversation_id: string, text: string, request_solution: boolean) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/conversations/{conversation_id}/messages", {
      params: { path: { course_id, conversation_id } },
      body: { text, request_solution }
    })
  );

export const retryMessage = (course_id: string, conversation_id: string, message_id: string) =>
  request((api) =>
    api.POST("/v1/student/courses/{course_id}/conversations/{conversation_id}/messages/{message_id}/retry", {
      params: { path: { course_id, conversation_id, message_id } }
    })
  );
