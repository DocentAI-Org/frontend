import "server-only";

import { type Schemas, request } from "./client";
import { type ListQuery, upTo } from "./paging";

const PAGE = { limit: 100, offset: 0 };

export const listUsers = (query: ListQuery<"/v1/admin/users"> = {}, shown = PAGE.limit) =>
  upTo(shown, (limit, offset) => request((api) => api.GET("/v1/admin/users", { params: { query: { ...query, limit, offset } } })));
export const listAllCourses = (query: ListQuery<"/v1/admin/courses"> = {}, shown = PAGE.limit) =>
  upTo(shown, (limit, offset) => request((api) => api.GET("/v1/admin/courses", { params: { query: { ...query, limit, offset } } })));
export const createTeacher = (body: Schemas["TeacherCreate"]) =>
  request((api) => api.POST("/v1/admin/teachers", { body }));
export const createPseudonymousStudents = (count: number) =>
  request((api) => api.POST("/v1/admin/students/pseudonymous", { body: { count } }));
/** Erasure on request (backend specs/017): the student and everything linked to them. */
export const eraseStudent = (studentId: string) =>
  request((api) => api.DELETE("/v1/admin/students/{student_id}", { params: { path: { student_id: studentId } } }));

/** The study data ZIP (P5, backend specs/011): consenting students only, no free text. */
export const exportStudyData = (courseId?: string) =>
  request((api) =>
    api.GET("/v1/admin/study-export", {
      params: { query: courseId ? { course_id: courseId } : {} },
      parseAs: "arrayBuffer"
    })
  );

export const listQuestionnaires = () => request((api) => api.GET("/v1/admin/questionnaires"));
export const createQuestionnaire = (body: Schemas["QuestionnaireCreate"]) =>
  request((api) => api.POST("/v1/admin/questionnaires", { body }));
export const updateQuestionnaire = (id: string, body: Schemas["QuestionnaireUpdate"]) =>
  request((api) => api.PATCH("/v1/admin/questionnaires/{questionnaire_id}", { params: { path: { questionnaire_id: id } }, body }));
export const deleteQuestionnaire = (id: string) =>
  request((api) => api.DELETE("/v1/admin/questionnaires/{questionnaire_id}", { params: { path: { questionnaire_id: id } } }));

/** The study's pedagogical criteria (backend specs/015). */
export const getStudyCriteria = () => request((api) => api.GET("/v1/admin/pedagogy-criteria"));
export const updateStudyCriteria = (body: Schemas["StudyCriteriaUpdate"]) =>
  request((api) => api.PUT("/v1/admin/pedagogy-criteria", { body }));
