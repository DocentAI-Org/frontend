// Teacher dashboard and student risk (backend specs/004) with scripted data: /__test/dashboard
// enrols EST-DEMO1 next to Lucas Herrera and picks "busy" (enough data, Lucas flagged), "quiet"
// (too little activity) or "calm" (enough data, nobody flagged). Default: "quiet" with no data.
// "live" (the demo) computes it from the course's messages and exercises, as the backend does.
import { HttpError, type Route, requireRole } from "../http.ts";
import { type S, type State, id, now } from "../state.ts";
import { ownedCourse } from "./courses.ts";
import { effectiveCriteria } from "./pedagogy.ts";

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

const ERROR_TYPES = ["comprehension", "conceptual", "procedural", "execution", "incomplete", "expression"];
const ENOUGH = { messages: 20, exercises: 5 };

/** Activity of the course's active students: sent questions and exercises, with their dates. */
function activityOf(state: State, courseId: string) {
  const students = new Set(state.enrolments.filter((e) => e.course_id === courseId && e.status === "active").map((e) => e.student_id));
  const conversations = new Map(state.conversations.filter((c) => c.course_id === courseId).map((c) => [c.id, c.student_id]));
  const messages = state.messages
    .filter((m) => m.author === "student" && m.status === "sent" && students.has(conversations.get(m.conversation_id) ?? ""))
    .map((m) => ({ student_id: conversations.get(m.conversation_id)!, at: m.created_at }));
  const submissions = state.submissions.filter((s) => s.course_id === courseId && students.has(s.student_id));
  return { students, messages, submissions };
}

function liveReasons(state: State, courseId: string, studentId: string): { reasons: S["StudentRisk"]["reasons"]; last: string | null } {
  const { inactive, error_rate } = effectiveCriteria(state, courseId);
  const { messages, submissions } = activityOf(state, courseId);
  const own = submissions.filter((s) => s.student_id === studentId);
  const last = [...messages.filter((m) => m.student_id === studentId).map((m) => m.at), ...own.map((s) => s.created_at)].sort().at(-1) ?? null;
  const reasons: S["StudentRisk"]["reasons"] = [];
  const joined = state.enrolments.find((e) => e.course_id === courseId && e.student_id === studentId)!.joined_at;
  const since = last ?? joined;
  const days = Math.floor((Date.now() - Date.parse(since)) / DAY);
  if (inactive.enabled && days >= inactive.days) {
    reasons.push({ criterion: "inactive", days_inactive: days, threshold_days: inactive.days, since, never_active: last === null });
  }
  const assessed = own.filter((s) => s.verdict !== "not_assessed" && s.created_at >= ago(error_rate.window_days));
  const mistakes = assessed.filter((s) => s.verdict !== "correct").length;
  if (error_rate.enabled && assessed.length > 0 && assessed.length >= error_rate.min_exercises && mistakes / assessed.length >= error_rate.rate) {
    reasons.push({
      criterion: "error_rate",
      mistakes,
      assessed: assessed.length,
      window_days: error_rate.window_days,
      min_exercises: error_rate.min_exercises,
      threshold_rate: error_rate.rate
    });
  }
  return { reasons, last };
}

/** The most frequent key; ties go to the first in `order`. */
function top(counts: Map<string, number>, order: (key: string) => number): string {
  return [...counts].sort((a, b) => b[1] - a[1] || order(a[0]) - order(b[0]))[0][0];
}

function liveDashboard(state: State, courseId: string, period: Period): S["TeacherDashboard"] {
  const since = period === "all" ? null : ago(period === "7d" ? 7 : 30);
  const { students, messages, submissions } = activityOf(state, courseId);
  const inPeriod = <T>(at: (x: T) => string) => (x: T) => since === null || at(x) >= since;
  const activity = { messages: messages.filter(inPeriod((m) => m.at)).length, exercises: submissions.filter(inPeriod((s) => s.created_at)).length };
  const mistakes = submissions.filter((s) => s.saved && s.error_type && ERROR_TYPES.includes(s.error_type)).filter(inPeriod((s) => s.created_at));
  const byTopic = new Map<string | null, { name: string | null; types: Map<string, number>; students: Set<string> }>();
  const byStudent = new Map<string, { types: Map<string, number>; topics: Map<string, number> }>();
  const bump = (counts: Map<string, number>, key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);
  for (const s of mistakes) {
    const topic = byTopic.get(s.topic_id) ?? { name: s.topic_name, types: new Map(), students: new Set() };
    byTopic.set(s.topic_id, topic);
    bump(topic.types, s.error_type!);
    topic.students.add(s.student_id);
    const student = byStudent.get(s.student_id) ?? { types: new Map(), topics: new Map() };
    byStudent.set(s.student_id, student);
    bump(student.types, s.error_type!);
    bump(student.topics, s.topic_name ?? "");
  }
  const sum = (counts: Map<string, number>) => [...counts.values()].reduce((a, b) => a + b, 0);
  const rank = (code: string) => ERROR_TYPES.indexOf(code);
  const name = (studentId: string) => state.users.find((u) => u.id === studentId)!.display_name;
  const atRisk = [...students]
    .map((studentId) => ({ studentId, ...liveReasons(state, courseId, studentId) }))
    .filter((r) => r.reasons.length > 0)
    .sort((a, b) => name(a.studentId).localeCompare(name(b.studentId)));
  return {
    period,
    since,
    activity,
    enough_data: activity.messages >= ENOUGH.messages || activity.exercises >= ENOUGH.exercises,
    thresholds: ENOUGH,
    errors_by_topic: [...byTopic]
      .map(([topicId, t]) => ({ topic_id: topicId, topic_name: t.name, topic_deleted: false, errors: sum(t.types), students: t.students.size, top_error_type: top(t.types, rank) }))
      .sort((a, b) => b.errors - a.errors || (a.topic_name ?? "\uffff").localeCompare(b.topic_name ?? "\uffff")),
    errors_by_student: [...byStudent]
      .map(([studentId, s]) => ({
        student_id: studentId,
        display_name: name(studentId),
        errors: sum(s.types),
        top_error_type: top(s.types, rank),
        top_topic_name: top(s.topics, () => 0) || null
      }))
      .sort((a, b) => b.errors - a.errors || a.display_name.localeCompare(b.display_name)),
    at_risk: atRisk.map((r) => ({ student_id: r.studentId, display_name: name(r.studentId), last_activity_at: r.last, reasons: r.reasons })),
    criteria_provisional: state.studyCriteria.provisional
  };
}

/** Messages, exercises and quizzes per week, the last 8 weeks (backend weekly_activity). */
function liveWeeks(state: State, courseId: string, studentId: string): S["WeekActivity"][] {
  const { messages, submissions } = activityOf(state, courseId);
  const quizzes = state.quizzes.filter((q) => q.course_id === courseId && q.student_id === studentId && q.completed_at).map((q) => q.completed_at!);
  return weeks(false).map((week) => {
    const start = `${week.week_start}T00:00:00.000Z`;
    const end = new Date(Date.parse(start) + 7 * DAY).toISOString();
    const within = (at: string) => at >= start && at < end;
    return {
      week_start: week.week_start,
      messages: messages.filter((m) => m.student_id === studentId && within(m.at)).length,
      exercises: submissions.filter((s) => s.student_id === studentId && within(s.created_at)).length,
      quizzes: quizzes.filter(within).length
    };
  });
}

function dashboardOf(state: State, courseId: string, period: Period): S["TeacherDashboard"] {
  const mode = state.dashboard.get(courseId) ?? "quiet";
  if (mode === "live") return liveDashboard(state, courseId, period);
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
      if (ctx.state.dashboard.get(course.id) === "live") {
        const { reasons, last } = enrolment.status === "active" ? liveReasons(ctx.state, course.id, user.id) : { reasons: [], last: null };
        return {
          student_id: user.id,
          display_name: user.display_name,
          at_risk: reasons.length > 0,
          reasons,
          last_activity_at: last,
          weekly_activity: liveWeeks(ctx.state, course.id, user.id),
          criteria_provisional: ctx.state.studyCriteria.provisional
        };
      }
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
