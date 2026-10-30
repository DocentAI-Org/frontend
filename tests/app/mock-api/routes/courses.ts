import { type Ctx, HttpError, type Route, noContent, page, requireRole } from "../http.ts";
import { type Course, type Enrolment, type S, type State, id, now } from "../state.ts";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function code(): string {
  const pick = (n: number) => Array.from({ length: n }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  return `${pick(3)}-${pick(4)}`;
}

function studentCount(state: State, course: Course): number {
  return state.enrolments.filter((e) => e.course_id === course.id && e.status === "active").length;
}

export function teacherCourse(state: State, course: Course): S["TeacherCourse"] {
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    class_code: course.class_code,
    class_code_active: course.class_code_active,
    invitation_path: `/unirse/${course.class_code}`,
    student_count: studentCount(state, course),
    created_at: course.created_at
  };
}

export function studentCourse(state: State, enrolment: Enrolment): S["StudentCourse"] {
  const course = state.courses.find((c) => c.id === enrolment.course_id)!;
  const teacher = state.users.find((u) => u.id === course.teacher_id)!;
  return {
    id: course.id,
    name: course.name,
    description: course.description,
    teacher_name: teacher.display_name,
    joined_at: enrolment.joined_at,
    disclosure_acknowledged: enrolment.disclosure_acknowledged_at !== null
  };
}

/** The teacher's own course or 404 (backend: other tenants' data is not found). */
export function ownedCourse(ctx: Ctx): Course {
  const teacher = requireRole(ctx, "teacher");
  const course = ctx.state.courses.find((c) => c.id === ctx.params.course_id && c.teacher_id === teacher.id);
  if (!course) throw new HttpError(404, "not_found");
  return course;
}

/** The student's active enrolment in the course or 404/403. */
export function activeEnrolment(ctx: Ctx): Enrolment {
  const student = requireRole(ctx, "student");
  const enrolment = ctx.state.enrolments.find((e) => e.course_id === ctx.params.course_id && e.student_id === student.id);
  if (!enrolment) throw new HttpError(404, "not_found");
  if (enrolment.status !== "active") throw new HttpError(403, "enrolment_revoked");
  return enrolment;
}

function validName(value: unknown): string {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 80) {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "name"] }] });
  }
  return name;
}

export const courseRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/teacher/courses",
    handler: (ctx) => {
      const teacher = requireRole(ctx, "teacher");
      const mine = ctx.state.courses.filter((c) => c.teacher_id === teacher.id).reverse();
      return page(mine.map((c) => teacherCourse(ctx.state, c)), ctx.url);
    }
  },
  {
    method: "POST",
    path: "/v1/teacher/courses",
    status: 201,
    handler: (ctx) => {
      const teacher = requireRole(ctx, "teacher");
      const body = ctx.body as S["CourseCreate"];
      const course: Course = {
        id: id(),
        teacher_id: teacher.id,
        name: validName(body.name),
        description: body.description ?? null,
        class_code: code(),
        class_code_active: true,
        created_at: now(),
        settings: { level: "intermediate", tone: "friendly", solution_policy: "hints_first", updated_at: now() }
      };
      ctx.state.courses.push(course);
      return teacherCourse(ctx.state, course);
    }
  },
  { method: "GET", path: "/v1/teacher/courses/{course_id}", handler: (ctx) => teacherCourse(ctx.state, ownedCourse(ctx)) },
  {
    method: "PATCH",
    path: "/v1/teacher/courses/{course_id}",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const body = ctx.body as S["CourseUpdate"];
      if (body.name !== undefined && body.name !== null) course.name = validName(body.name);
      if (body.description !== undefined) course.description = body.description;
      return teacherCourse(ctx.state, course);
    }
  },
  {
    method: "POST",
    path: "/v1/teacher/courses/{course_id}/class-code/regenerate",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      course.class_code = code();
      course.class_code_active = true;
      return teacherCourse(ctx.state, course);
    }
  },
  {
    method: "PATCH",
    path: "/v1/teacher/courses/{course_id}/class-code",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      course.class_code_active = Boolean((ctx.body as S["ClassCodeUpdate"]).active);
      return teacherCourse(ctx.state, course);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/students",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const rows = ctx.state.enrolments
        .filter((e) => e.course_id === course.id)
        .map((e) => ({
          student_id: e.student_id,
          display_name: ctx.state.users.find((u) => u.id === e.student_id)!.display_name,
          joined_at: e.joined_at,
          status: e.status
        }));
      return page(rows, ctx.url);
    }
  },
  {
    method: "DELETE",
    path: "/v1/teacher/courses/{course_id}/students/{student_id}",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const enrolment = ctx.state.enrolments.find((e) => e.course_id === course.id && e.student_id === ctx.params.student_id);
      if (!enrolment) throw new HttpError(404, "not_found");
      enrolment.status = "revoked";
      return noContent();
    }
  },
  {
    method: "POST",
    path: "/v1/student/enrolments",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      const value = String((ctx.body as S["JoinCourse"]).class_code ?? "").trim().toUpperCase();
      const course = ctx.state.courses.find((c) => c.class_code === value);
      if (!course) throw new HttpError(400, "class_code_invalid");
      if (!course.class_code_active) throw new HttpError(400, "class_code_disabled");
      let enrolment = ctx.state.enrolments.find((e) => e.course_id === course.id && e.student_id === student.id);
      if (enrolment?.status === "revoked") throw new HttpError(403, "enrolment_revoked");
      if (!enrolment) {
        enrolment = { course_id: course.id, student_id: student.id, status: "active", joined_at: now(), disclosure_acknowledged_at: null };
        ctx.state.enrolments.push(enrolment);
      }
      return studentCourse(ctx.state, enrolment);
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      const mine = ctx.state.enrolments.filter((e) => e.student_id === student.id && e.status === "active");
      return page(mine.map((e) => studentCourse(ctx.state, e)), ctx.url);
    }
  },
  { method: "GET", path: "/v1/student/courses/{course_id}", handler: (ctx) => studentCourse(ctx.state, activeEnrolment(ctx)) },
  {
    method: "POST",
    path: "/v1/student/courses/{course_id}/disclosure",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      enrolment.disclosure_acknowledged_at ??= now();
      return studentCourse(ctx.state, enrolment);
    }
  }
];
