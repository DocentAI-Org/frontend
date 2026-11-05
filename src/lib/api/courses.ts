import "server-only";

import { type Schemas, request } from "./client";
import { type ListQuery, upTo } from "./paging";

const PAGE = { limit: 100, offset: 0 };

// Teacher
export const listTeacherCourses = (query: ListQuery<"/v1/teacher/courses"> = {}, shown = PAGE.limit) =>
  upTo(shown, (limit, offset) => request((api) => api.GET("/v1/teacher/courses", { params: { query: { ...query, limit, offset } } })));

export const getTeacherCourse = (course_id: string) =>
  request((api) => api.GET("/v1/teacher/courses/{course_id}", { params: { path: { course_id } } }));

export const createCourse = (body: Schemas["CourseCreate"]) =>
  request((api) => api.POST("/v1/teacher/courses", { body }));

export const updateCourse = (course_id: string, body: Schemas["CourseUpdate"]) =>
  request((api) => api.PATCH("/v1/teacher/courses/{course_id}", { params: { path: { course_id } }, body }));

export const regenerateClassCode = (course_id: string) =>
  request((api) =>
    api.POST("/v1/teacher/courses/{course_id}/class-code/regenerate", { params: { path: { course_id } } })
  );

export const setClassCodeActive = (course_id: string, active: boolean) =>
  request((api) =>
    api.PATCH("/v1/teacher/courses/{course_id}/class-code", { params: { path: { course_id } }, body: { active } })
  );

export const listCourseStudents = (
  course_id: string,
  query: ListQuery<"/v1/teacher/courses/{course_id}/students"> = {},
  shown = PAGE.limit
) =>
  upTo(shown, (limit, offset) =>
    request((api) =>
      api.GET("/v1/teacher/courses/{course_id}/students", {
        params: { path: { course_id }, query: { ...query, limit, offset } }
      })
    )
  );

export const revokeStudent = (course_id: string, student_id: string) =>
  request((api) =>
    api.DELETE("/v1/teacher/courses/{course_id}/students/{student_id}", {
      params: { path: { course_id, student_id } }
    })
  );

// Student
export const listStudentCourses = (query: ListQuery<"/v1/student/courses"> = {}, shown = PAGE.limit) =>
  upTo(shown, (limit, offset) => request((api) => api.GET("/v1/student/courses", { params: { query: { ...query, limit, offset } } })));

export const getStudentCourse = (course_id: string) =>
  request((api) => api.GET("/v1/student/courses/{course_id}", { params: { path: { course_id } } }));

export const joinCourse = (class_code: string) =>
  request((api) => api.POST("/v1/student/enrolments", { body: { class_code } }));

export const acknowledgeDisclosure = (course_id: string) =>
  request((api) => api.POST("/v1/student/courses/{course_id}/disclosure", { params: { path: { course_id } } }));
