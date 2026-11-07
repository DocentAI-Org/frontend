// AI settings per course (backend specs/019): the server's values, the study's and each course's;
// the models of each source; messages per course and period, and the daily ceiling.
import { HttpError, type Route, requireRole } from "../http.ts";
import { type S, type State, now } from "../state.ts";
import { ownedCourse } from "./courses.ts";

type Task = "tutor" | "feedback" | "review" | "questions";
type Counted = S["Limits"]["counted_tasks"][number];
const TASKS: Task[] = ["tutor", "feedback", "review", "questions"];

const SERVER_MODEL = { provider: "ollama" as const, model: "qwen2.5:7b", temperature: null, effort: null, max_tokens: null };
const SERVER = {
  limits: { messages: null, period: "day" as const, counted_tasks: ["tutor", "feedback", "review"] as Counted[] },
  retrieval: { top_k: 4, min_similarity: 0.55, min_similarity_exercises: 0.4, history_messages: 6 },
  ceiling: { messages: 30 }
};

export const SOURCES: S["ModelSource"][] = [
  {
    provider: "ollama",
    label: "Ollama (local)",
    reachable: true,
    models: [
      { id: "gemma4:e4b-it-qat", size_bytes: 5_000_000_000, parameter_size: "7.5B", family: "gemma4" },
      { id: "qwen2.5:3b", size_bytes: 1_900_000_000, parameter_size: "3.1B", family: "qwen2" },
      { id: "qwen2.5:7b", size_bytes: 4_700_000_000, parameter_size: "7.6B", family: "qwen2" }
    ]
  },
  { provider: "anthropic", label: "Anthropic", reachable: true, models: [{ id: "claude-haiku-5-5", label: "Claude Haiku 5.5" }] }
];

function serverValues(): S["StudyValues"] {
  return {
    models: Object.fromEntries(TASKS.map((t) => [t, { ...SERVER_MODEL, origin: "server" }])) as S["StudyValues"]["models"],
    ...structuredClone(SERVER)
  };
}

function layer(base: S["StudyValues"], own: S["StudyOverrides"] | undefined, origin: "study" | "course"): S["StudyValues"] {
  if (!own) return base;
  const models = { ...base.models };
  for (const task of TASKS) {
    const choice = own.models?.[task];
    if (choice) models[task] = { temperature: null, effort: null, max_tokens: null, ...choice, origin };
  }
  return {
    models,
    limits: own.limits ?? base.limits,
    retrieval: own.retrieval ?? base.retrieval,
    ceiling: own.ceiling ?? base.ceiling
  };
}

const values = (v: S["StudyValues"]): S["Values"] => ({ models: v.models, limits: v.limits, retrieval: v.retrieval });
const study = (state: State) => layer(serverValues(), state.aiStudy, "study");

export function aiInEffect(state: State, courseId: string): S["StudyValues"] {
  const effective = layer(study(state), state.aiCourses.get(courseId), "course");
  return { ...effective, ceiling: study(state).ceiling };
}

function overrides(own: S["CourseOverrides"] | undefined): S["CourseOverrides"] {
  return {
    models: Object.fromEntries(TASKS.map((t) => [t, own?.models?.[t] ?? null])) as S["TaskModels"],
    limits: own?.limits ?? null,
    retrieval: own?.retrieval ?? null
  };
}

function sources(state: State): S["ModelSource"][] {
  return SOURCES.map((s) => (state.faults.has(`${s.provider}_unreachable`) ? { ...s, reachable: false, models: [] } : s));
}

/** The backend's checks (specs/019), enough for the E2E. */
function check(state: State, body: S["StudyOverrides"]) {
  const invalid = () => {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body"] }] });
  };
  const { limits, retrieval, ceiling } = body;
  if (limits && ((limits.messages !== null && limits.messages < 1) || !["day", "week", "course"].includes(limits.period))) invalid();
  if (retrieval && (retrieval.top_k < 1 || retrieval.top_k > 10 || retrieval.history_messages > 20)) invalid();
  if (retrieval && [retrieval.min_similarity, retrieval.min_similarity_exercises].some((v) => v < 0 || v > 1)) invalid();
  if (ceiling && ceiling.messages !== null && ceiling.messages < 1) invalid();
  for (const task of TASKS) {
    const choice = body.models?.[task];
    if (!choice) continue;
    const source = sources(state).find((s) => s.provider === choice.provider);
    if (!source) throw new HttpError(422, "provider_unavailable", { task });
    if (!source.reachable) throw new HttpError(422, "provider_unreachable", { task });
    if (!source.models.some((m) => m.id === choice.model)) throw new HttpError(422, "model_unavailable", { task });
    if (choice.provider === "anthropic" && choice.temperature != null) throw new HttpError(422, "temperature_not_supported", { task });
  }
}

function studyView(state: State): S["StudyAISettings"] {
  const own = state.aiStudy;
  return {
    server: serverValues(),
    study: { ...overrides(own), ceiling: own.ceiling ?? null },
    effective: study(state),
    updated_at: state.aiStudyUpdatedAt
  };
}

function courseView(state: State, courseId: string): S["CourseAISettings"] {
  const inherited = study(state);
  return {
    inherited: values(inherited),
    course: overrides(state.aiCourses.get(courseId)),
    effective: values(layer(inherited, state.aiCourses.get(courseId), "course")),
    ceiling: inherited.ceiling
  };
}

// --- Messages per course and the daily ceiling -------------------------------------------------

function nextMidnight(days = 1): string {
  const date = new Date();
  date.setHours(24 * days, 0, 0, 0);
  return date.toISOString();
}

function nextMonday(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((8 - date.getDay()) % 7 || 7));
  return date.toISOString();
}

function resetsAt(period: S["Limits"]["period"]): string | null {
  return period === "day" ? nextMidnight() : period === "week" ? nextMonday() : null;
}

const usageKey = (studentId: string, courseId: string, period: string) => `${studentId}:${courseId}:${period}`;

export function dailyAllowance(state: State, studentId: string): S["Allowance"] {
  const limit = study(state).ceiling.messages;
  const used = state.usage.get(studentId) ?? 0;
  return { scope: "daily", limit, used, remaining: limit === null ? null : Math.max(limit - used, 0), period: "day", resets_at: nextMidnight() };
}

/** The course's allowance for the task, or the daily ceiling when tighter or the task is not counted. */
export function courseAllowance(state: State, studentId: string, courseId: string, task: Counted = "tutor"): S["Allowance"] {
  const ai = aiInEffect(state, courseId);
  const daily = dailyAllowance(state, studentId);
  if (!ai.limits.counted_tasks.includes(task)) return daily;
  const { messages: limit, period } = ai.limits;
  const used = state.courseUsage.get(usageKey(studentId, courseId, period)) ?? 0;
  const course: S["Allowance"] = {
    scope: "course",
    limit,
    used,
    remaining: limit === null ? null : Math.max(limit - used, 0),
    period,
    resets_at: resetsAt(period)
  };
  return daily.remaining !== null && (course.remaining === null || daily.remaining < course.remaining) ? daily : course;
}

/** Takes one message, or throws the backend's 429. Returns how to give it back. */
export function reserveMessage(state: State, studentId: string, courseId: string, task: Counted): () => void {
  const ai = aiInEffect(state, courseId);
  const counted = ai.limits.counted_tasks.includes(task);
  const key = usageKey(studentId, courseId, ai.limits.period);
  const used = state.courseUsage.get(key) ?? 0;
  if (counted && ai.limits.messages !== null && used >= ai.limits.messages) {
    throw new HttpError(429, "course_limit_reached", { period: ai.limits.period, resets_at: resetsAt(ai.limits.period) });
  }
  const daily = state.usage.get(studentId) ?? 0;
  if (ai.ceiling.messages !== null && daily >= ai.ceiling.messages) {
    throw new HttpError(429, "daily_limit_reached", { resets_at: nextMidnight() });
  }
  if (counted) state.courseUsage.set(key, used + 1);
  state.usage.set(studentId, daily + 1);
  return () => {
    if (counted) state.courseUsage.set(key, used);
    state.usage.set(studentId, daily);
  };
}

export const aiRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/admin/ai-settings",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return studyView(ctx.state);
    }
  },
  {
    method: "PUT",
    path: "/v1/admin/ai-settings",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const body = ctx.body as S["StudyOverrides"];
      check(ctx.state, body);
      ctx.state.aiStudy = body;
      ctx.state.aiStudyUpdatedAt = now();
      return studyView(ctx.state);
    }
  },
  {
    method: "GET",
    path: "/v1/admin/ai-models",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return { sources: sources(ctx.state) };
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/ai-settings",
    handler: (ctx) => courseView(ctx.state, ownedCourse(ctx).id)
  },
  {
    method: "PUT",
    path: "/v1/teacher/courses/{course_id}/ai-settings",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const body = ctx.body as S["CourseOverrides"];
      check(ctx.state, body);
      ctx.state.aiCourses.set(course.id, body);
      return courseView(ctx.state, course.id);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/ai-models",
    handler: (ctx) => {
      ownedCourse(ctx);
      return { sources: sources(ctx.state) };
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/allowance",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      const enrolled = ctx.state.enrolments.some(
        (e) => e.course_id === ctx.params.course_id && e.student_id === student.id && e.status === "active"
      );
      if (!enrolled) throw new HttpError(404, "not_found");
      const task = (ctx.url.searchParams.get("task") ?? "tutor") as Counted;
      return courseAllowance(ctx.state, student.id, ctx.params.course_id, task);
    }
  },
  {
    method: "POST",
    path: "/__test/course-limit",
    handler: (ctx) => {
      // Test helper: a course's own limit, and the messages the seeded student already used.
      const { course_id, limits, used = 0 } = ctx.body as { course_id: string; limits: S["Limits"]; used?: number };
      const student = ctx.state.users.find((u) => u.email === "alumno@docentai.local")!;
      const own = ctx.state.aiCourses.get(course_id);
      ctx.state.aiCourses.set(course_id, { ...overrides(own), limits });
      ctx.state.courseUsage.set(usageKey(student.id, course_id, limits.period), used);
      return { ok: true };
    }
  }
];
