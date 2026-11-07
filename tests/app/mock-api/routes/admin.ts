import { HttpError, RawBody, type Route, byName, page, requireRole, search, sortParam } from "../http.ts";
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

// An empty ZIP archive: only the end-of-central-directory record.
const EMPTY_ZIP = Buffer.concat([Buffer.from("PK\x05\x06"), Buffer.alloc(18)]);

export const adminRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/admin/study-export",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      if (ctx.state.faults.has("study_export_fails")) throw new HttpError(503, "api_unreachable");
      return new RawBody("application/zip", EMPTY_ZIP, {
        "content-disposition": 'attachment; filename="docentai-study-export.zip"'
      });
    }
  },
  {
    method: "GET",
    path: "/v1/admin/users",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const sort = sortParam(ctx.url, ["recent", "name"] as const);
      const role = ctx.url.searchParams.get("role");
      const status = ctx.url.searchParams.get("status");
      const users = [...ctx.state.users].reverse().filter((u) => (!role || u.role === role) && (!status || u.status === status));
      const rows = search(users.map(adminUser), ctx.url, (u) => [u.display_name, u.email]);
      return page(sort === "name" ? rows.sort(byName((u) => u.display_name)) : rows, ctx.url);
    }
  },
  {
    // Backend specs/017: the student and every row linked to them; counts of what went.
    method: "DELETE",
    path: "/v1/admin/students/{student_id}",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      if (ctx.state.faults.has("student_erasure_fails")) throw new HttpError(503, "auth_unavailable");
      const sid = ctx.params.student_id;
      const student = ctx.state.users.find((u) => u.id === sid);
      if (!student) throw new HttpError(404, "not_found");
      if (student.role !== "student") throw new HttpError(409, "not_a_student");
      const s = ctx.state;
      const mine = <T extends { student_id: string }>(rows: T[]) => rows.filter((r) => r.student_id === sid);
      const others = <T extends { student_id: string }>(rows: T[]) => rows.filter((r) => r.student_id !== sid);
      const conversations = new Set(mine(s.conversations).map((c) => c.id));
      const messages = new Set(s.messages.filter((m) => conversations.has(m.conversation_id)).map((m) => m.id));
      const submissions = new Set(mine(s.submissions).map((x) => x.id));
      const erased: S["StudentErasure"] = {
        student_id: sid,
        courses: mine(s.enrolments).length,
        conversations: conversations.size,
        messages: messages.size,
        exercise_submissions: submissions.size,
        quizzes: mine(s.quizzes).length,
        test_attempts: mine(s.testAttempts).length,
        // The mock keeps no interaction logs: one per tutor answer and per feedback.
        interaction_logs: s.messages.filter((m) => messages.has(m.id) && m.author === "tutor").length + submissions.size
      };
      s.users = s.users.filter((u) => u.id !== sid);
      s.enrolments = others(s.enrolments);
      s.conversations = others(s.conversations);
      s.messages = s.messages.filter((m) => !messages.has(m.id));
      s.flags = s.flags.filter((f) => !(f.message_id && messages.has(f.message_id)) && !(f.submission_id && submissions.has(f.submission_id)));
      s.submissions = others(s.submissions);
      s.reviews = s.reviews.filter((r) => !submissions.has(r.submission_id));
      s.quizzes = others(s.quizzes);
      s.testAttempts = others(s.testAttempts);
      s.consent = others(s.consent);
      s.usage.delete(sid);
      s.favorites = new Set([...s.favorites].filter((key) => !key.startsWith(`${sid}:`)));
      const tags = new Set(s.tags.filter((t) => t.user_id === sid).map((t) => t.id));
      s.tags = s.tags.filter((t) => !tags.has(t.id));
      s.tagLinks = new Set([...s.tagLinks].filter((key) => !tags.has(key.split(":")[0])));
      return erased;
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
      const sort = sortParam(ctx.url, ["recent", "name"] as const);
      const found = search(rows.reverse(), ctx.url, (c) => [c.name, c.teacher_name]);
      return page(sort === "name" ? found.sort(byName((c) => c.name)) : found, ctx.url);
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


