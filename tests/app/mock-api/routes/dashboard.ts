// Teacher dashboard and student risk (backend specs/004) with scripted data: /__test/dashboard
// enrols EST-DEMO1 next to Lucas Herrera and picks "busy" (enough data, Lucas flagged), "quiet"
// (too little activity) or "calm" (enough data, nobody flagged). Default: "quiet" with no data.
import { HttpError, type Route, requireRole } from "../http.ts";
import { type S, type State, id, now } from "../state.ts";
import { ownedCourse } from "./courses.ts";

const DAY = 24 * 60 * 60 * 1000;
const PERIODS = ["7d", "30d", "all"] as const;
type Period = (typeof PERIODS)[number];

const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

function student(state: State, email: string) {
  return state.users.find((u) => u.email === email)!;
}

/** Lucas: no activity in 9 days and 6 of 10 exercises with mistakes. */
function lucasReasons(): S["StudentRisk"]["reasons"] {
  return [
    { criterion: "inactive", days_inactive: 9, threshold_days: 7, since: ago(9), never_active: false },
    { criterion: "error_rate", mistakes: 6, assessed: 10, window_days: 14, min_exercises: 5, threshold_rate: 0.6 }
  ];
}

function dashboardOf(state: State, courseId: string, period: Period): S["TeacherDashboard"] {
  const mode = state.dashboard.get(courseId) ?? "quiet";
  const lucas = student(state, "alumno@docentai.local");
  const demo = student(state, "est-demo1@students.docentai.invalid");
  // The 7-day view has about half the mistakes of the 30-day one.
  const n = (count: number) => (period === "7d" ? Math.ceil(count / 2) : count);
  const busy = mode !== "quiet";
  const topics = state.topics.filter((t) => t.course_id === courseId);
  const topicId = (name: string) => topics.find((t) => t.name === name)?.id ?? null;
  return {
    period,
    since: period === "all" ? null : ago(period === "7d" ? 7 : 30),
    activity: busy ? { messages: 46, exercises: n(18) } : { messages: 12, exercises: 2 },
    enough_data: busy,
    thresholds: { messages: 20, exercises: 5 },
    errors_by_topic: busy
      ? [
          { topic_id: topicId("Paréntesis"), topic_name: "Paréntesis", topic_deleted: false, errors: n(7), students: 2, top_error_type: "procedural" },
          { topic_id: topicId("Despejar la incógnita"), topic_name: "Despejar la incógnita", topic_deleted: false, errors: n(3), students: 1, top_error_type: "execution" },
          { topic_id: null, topic_name: null, topic_deleted: false, errors: 1, students: 1, top_error_type: "conceptual" }
        ]
      : [],
    errors_by_student: busy
      ? [
          { student_id: lucas.id, display_name: lucas.display_name, errors: n(8), top_error_type: "procedural", top_topic_name: "Paréntesis" },
          { student_id: demo.id, display_name: demo.display_name, errors: n(3), top_error_type: "execution", top_topic_name: "Despejar la incógnita" }
        ]
      : [],
    at_risk:
      mode === "busy"
        ? [{ student_id: lucas.id, display_name: lucas.display_name, last_activity_at: ago(9), reasons: lucasReasons() }]
        : [],
    criteria_provisional: true
  };
}

function weeks(flagged: boolean, quizzesOn: string[] = []): S["WeekActivity"][] {
  const today = new Date();
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - ((today.getUTCDay() + 6) % 7)));
  return Array.from({ length: 8 }, (_, i) => {
    const start = new Date(monday.getTime() - (7 - i) * 7 * DAY);
    // A flagged student was active until two weeks ago.
    const active = !flagged || i < 6;
    const end = new Date(start.getTime() + 7 * DAY).toISOString();
    const quizzes = quizzesOn.filter((at) => at >= start.toISOString() && at < end).length;
    return { week_start: start.toISOString().slice(0, 10), messages: active ? 5 + i : 0, exercises: active ? 2 : 0, quizzes };
  });
}

export const dashboardRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/dashboard",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const period = (ctx.url.searchParams.get("period") ?? "30d") as Period;
      if (!PERIODS.includes(period)) throw new HttpError(422, "validation_error");
      return dashboardOf(ctx.state, course.id, period);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/students/{student_id}/risk",
    handler: (ctx): S["StudentRisk"] => {
      const course = ownedCourse(ctx);
      const enrolment = ctx.state.enrolments.find((e) => e.course_id === course.id && e.student_id === ctx.params.student_id);
      if (!enrolment) throw new HttpError(404, "not_found");
      const user = ctx.state.users.find((u) => u.id === enrolment.student_id)!;
      const flagged = ctx.state.dashboard.get(course.id) === "busy" && user.email === "alumno@docentai.local";
      return {
        student_id: user.id,
        display_name: user.display_name,
        at_risk: flagged,
        reasons: flagged ? lucasReasons() : [],
        last_activity_at: flagged ? ago(9) : ago(1),
        weekly_activity: weeks(
          flagged,
          ctx.state.quizzes.filter((q) => q.course_id === course.id && q.student_id === user.id && q.completed_at).map((q) => q.completed_at!)
        ),
        criteria_provisional: true
      };
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/risk-criteria",
    handler: (ctx): S["RiskCriteriaList"] => {
      requireRole(ctx, "teacher");
      return {
      provisional: true,
      items: [
        { code: "inactive", enabled: true, thresholds: { days: 7 } },
        { code: "error_rate", enabled: true, thresholds: { window_days: 14, min_exercises: 5, rate: 0.6 } }
      ]
      };
    }
  },
  {
    method: "POST",
    path: "/__test/dashboard",
    handler: (ctx) => {
      const body = ctx.body as { course_id: string; mode: "busy" | "quiet" | "calm" };
      const state = ctx.state;
      const demo = student(state, "est-demo1@students.docentai.invalid");
      if (!state.enrolments.some((e) => e.course_id === body.course_id && e.student_id === demo.id)) {
        state.enrolments.push({ course_id: body.course_id, student_id: demo.id, status: "active", joined_at: now(), disclosure_acknowledged_at: now() });
      }
      for (const [position, name] of ["Paréntesis", "Despejar la incógnita"].entries()) {
        if (!state.topics.some((t) => t.course_id === body.course_id && t.name === name)) {
          state.topics.push({ id: id(), course_id: body.course_id, name, position });
        }
      }
      state.dashboard.set(body.course_id, body.mode);
      return { ok: true };
    }
  }
];
