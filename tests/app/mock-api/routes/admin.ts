import { HttpError, type Route, page, requireRole } from "../http.ts";
import { type S, type User, id, now } from "../state.ts";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function adminUser(user: User): S["AdminUser"] {
  return {
    id: user.id,
    role: user.role,
    display_name: user.display_name,
    email: user.pseudonym_code ? null : user.email,
    is_pseudonymous: user.pseudonym_code !== null,
    status: user.status,
    created_at: user.created_at
  };
}

function password(): string {
  return `pw-${Math.random().toString(36).slice(2, 12)}`;
}

export const adminRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/admin/users",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return page([...ctx.state.users].reverse().map(adminUser), ctx.url);
    }
  },
  {
    method: "GET",
    path: "/v1/admin/courses",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const rows = ctx.state.courses.map((course) => ({
        id: course.id,
        name: course.name,
        teacher_name: ctx.state.users.find((u) => u.id === course.teacher_id)!.display_name,
        student_count: ctx.state.enrolments.filter((e) => e.course_id === course.id && e.status === "active").length,
        created_at: course.created_at
      }));
      return page(rows, ctx.url);
    }
  },
  {
    method: "POST",
    path: "/v1/admin/teachers",
    status: 201,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const body = ctx.body as S["TeacherCreate"];
      const email = String(body.email ?? "").toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !body.display_name?.trim()) {
        throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "email"] }] });
      }
      if (ctx.state.users.some((u) => u.email === email)) throw new HttpError(409, "email_taken");
      const initial = body.password ?? password();
      const user: User = {
        id: id(),
        email,
        password: initial,
        role: "teacher",
        display_name: body.display_name.trim(),
        pseudonym_code: null,
        status: "active",
        preferred_language: "es",
        created_at: now()
      };
      ctx.state.users.push(user);
      return { user: adminUser(user), initial_password: initial };
    }
  },
  {
    method: "POST",
    path: "/v1/admin/students/pseudonymous",
    status: 201,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const count = Number((ctx.body as S["PseudonymousBatchCreate"]).count);
      if (!Number.isInteger(count) || count < 1 || count > 100) {
        throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "count"] }] });
      }
      const accounts = Array.from({ length: count }, () => {
        const code = `EST-${Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("")}`;
        const initial = password();
        const user: User = {
          id: id(),
          email: `${code.toLowerCase()}@students.docentai.invalid`,
          password: initial,
          role: "student",
          display_name: code,
          pseudonym_code: code,
          status: "active",
          preferred_language: "es",
          created_at: now()
        };
        ctx.state.users.push(user);
        return { user_id: user.id, code, initial_password: initial };
      });
      return { accounts };
    }
  }
];


