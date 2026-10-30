import "server-only";

import { type Schemas, request } from "./client";

const path = (course_id: string) => ({ params: { path: { course_id } } });

export const listTopics = (course_id: string) => request((api) => api.GET("/v1/teacher/courses/{course_id}/topics", path(course_id)));

export const createTopic = (course_id: string, name: string) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/topics", { ...path(course_id), body: { name } }));

export const renameTopic = (course_id: string, topic_id: string, name: string) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/topics/{topic_id}", { params: { path: { course_id, topic_id } }, body: { name } })
  );

export const deleteTopic = (course_id: string, topic_id: string) =>
  request((api) => api.DELETE("/v1/teacher/courses/{course_id}/topics/{topic_id}", { params: { path: { course_id, topic_id } } }));

export const reorderTopics = (course_id: string, topic_ids: string[]) =>
  request((api) => api.PUT("/v1/teacher/courses/{course_id}/topics/order", { ...path(course_id), body: { topic_ids } }));

export const listAssignments = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/topic-assignments", path(course_id)));

export const createAssignment = (course_id: string, body: Schemas["TopicAssignmentCreate"]) =>
  request((api) => api.POST("/v1/teacher/courses/{course_id}/topic-assignments", { ...path(course_id), body }));

export const confirmAssignment = (course_id: string, assignment_id: string, topic_id?: string) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/topic-assignments/{assignment_id}", {
      params: { path: { course_id, assignment_id } },
      body: { topic_id: topic_id ?? null, status: "confirmed" }
    })
  );

export const deleteAssignment = (course_id: string, assignment_id: string) =>
  request((api) =>
    api.DELETE("/v1/teacher/courses/{course_id}/topic-assignments/{assignment_id}", {
      params: { path: { course_id, assignment_id } }
    })
  );

export const listUnassigned = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}/unassigned-material", path(course_id)));
