// AI settings per course (backend specs/019): the server's values, the study's and each course's;
// the models of each source and of each stored key; messages per course and period, and the
// daily ceiling.
import { HttpError, type Route, requireRole } from "../http.ts";
import { type S, type State, id, now } from "../state.ts";
import { ownedCourse } from "./courses.ts";

type Task = "tutor" | "feedback" | "review" | "questions";
type Counted = S["Limits"]["counted_tasks"][number];
const TASKS: Task[] = ["tutor", "feedback", "review", "questions"];

const SERVER_MODEL = { provider: "ollama" as const, model: "qwen2.5:7b", temperature: null, effort: null, max_tokens: null, credential_id: null };
/** The models a stored key's account offers; a key starting with "bad" is rejected. */
const KEY_MODELS: Record<string, string[]> = { openai: ["gpt-mini", "gpt-test"], anthropic: ["claude-haiku-5-5"], openai_compatible: ["mistral-small"] };

export type Credential = S["Credential"] & { course_id: string | null };
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
    scope: "server",
    models: [
      { id: "gemma4:e4b-it-qat", size_bytes: 5_000_000_000, parameter_size: "7.5B", family: "gemma4" },
      { id: "qwen2.5:3b", size_bytes: 1_900_000_000, parameter_size: "3.1B", family: "qwen2" },
      { id: "qwen2.5:7b", size_bytes: 4_700_000_000, parameter_size: "7.6B", family: "qwen2" }
    ]
  },
  { provider: "anthropic", label: "Anthropic", reachable: true, scope: "server", models: [{ id: "claude-haiku-5-5", label: "Claude Haiku 5.5" }] }
];

function serverValues(): S["StudyValues"] {
  return {
    models: Object.fromEntries(TASKS.map((t) => [t, { ...SERVER_MODEL, origin: "server" }])) as S["StudyValues"]["models"],
    ...structuredClone(SERVER),
    instructions: { tutor: null, feedback: null, review: null, questions: null }
  };
}

type Overrides = Partial<S["StudyOverrides"]>;

function layer(base: S["StudyValues"], own: Overrides | undefined, origin: "study" | "course"): S["StudyValues"] {
  if (!own) return base;
  const models = { ...base.models };
  for (const task of TASKS) {
    const choice = own.models?.[task];
    if (choice) models[task] = { temperature: null, effort: null, max_tokens: null, credential_id: null, ...choice, origin };
  }
  return {
    models,
    limits: own.limits ?? base.limits,
    retrieval: own.retrieval ?? base.retrieval,
    ceiling: own.ceiling ?? base.ceiling,
    instructions: own.instructions ?? base.instructions
  };
}

const values = (v: S["StudyValues"]): S["Values"] => ({ models: v.models, limits: v.limits, retrieval: v.retrieval, instructions: v.instructions });
const study = (state: State) => layer(serverValues(), state.aiStudy, "study");

export function aiInEffect(state: State, courseId: string): S["StudyValues"] {
  const effective = layer(study(state), state.aiCourses.get(courseId), "course");
  return { ...effective, ceiling: study(state).ceiling };
}

function overrides(own: S["CourseOverrides"] | undefined): S["CourseOverrides"] {
  return {
    models: Object.fromEntries(TASKS.map((t) => [t, own?.models?.[t] ?? null])) as S["TaskModels"],
    limits: own?.limits ?? null,
    retrieval: own?.retrieval ?? null,
    instructions: own?.instructions ?? null
  };
}

const chatProvider = (provider: string) => (provider === "anthropic" ? "anthropic" : "openai") as S["ModelSource"]["provider"];

function keySource(credential: Credential, scope: "study" | "course", all = false): S["ModelSource"] {
  const offered = credential.offered_models;
  return {
    provider: chatProvider(credential.provider),
    label: credential.label,
    reachable: true,
    credential_id: credential.id,
    scope,
    models: KEY_MODELS[credential.provider].filter((m) => all || offered == null || offered.includes(m)).map((id) => ({ id }))
  };
}

function sources(state: State, courseId?: string): S["ModelSource"][] {
  const server = SOURCES.map((s) => ({ ...s, scope: "server" as const, credential_id: null })).map((s) =>
    state.faults.has(`${s.provider}_unreachable`) ? { ...s, reachable: false, models: [] } : s
  );
  const studyKeys = state.credentials.filter((c) => c.course_id === null).map((c) => keySource(c, "study"));
  const own =
    courseId && state.aiStudy.allow_teacher_keys ? state.credentials.filter((c) => c.course_id === courseId).map((c) => keySource(c, "course")) : [];
  return [...server, ...studyKeys, ...own];
}

/** Tasks whose model `keep` rejects go back to the inherited one, with a notice. */
function reset(state: State, keep: (choice: S["ModelChoice"]) => boolean, reason: S["Notice"]["reason"]) {
  const rows: { own: Overrides; key: string }[] = [
    { own: state.aiStudy, key: "study" },
    ...[...state.aiCourses].map(([key, own]) => ({ own, key }))
  ];
  for (const { own, key } of rows) {
    for (const task of TASKS) {
      const choice = own.models?.[task];
      if (!choice || keep(choice)) continue;
      own.models = { ...own.models, [task]: null };
      const notices = state.aiNotices.get(key) ?? [];
      state.aiNotices.set(key, [...notices, { task, model: choice.model, reason, at: now() }]);
    }
  }
}

/** The backend's checks (specs/019), enough for the E2E. */
function check(state: State, body: Overrides, courseId?: string) {
  const invalid = () => {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body"] }] });
  };
  const { limits, retrieval, ceiling } = body;
  if (limits && ((limits.messages !== null && limits.messages < 1) || !["day", "week", "course"].includes(limits.period))) invalid();
  if (retrieval && (retrieval.top_k < 1 || retrieval.top_k > 10 || retrieval.history_messages > 20)) invalid();
  if (retrieval && [retrieval.min_similarity, retrieval.min_similarity_exercises].some((v) => v < 0 || v > 1)) invalid();
  if (ceiling && ceiling.messages !== null && ceiling.messages < 1) invalid();
  if (Object.values(body.instructions ?? {}).some((text) => (text ?? "").length > 2000)) invalid();
  for (const task of TASKS) {
    const choice = body.models?.[task];
    if (!choice) continue;
    const source = sources(state, courseId).find((s) => s.provider === choice.provider && (s.credential_id ?? null) === (choice.credential_id ?? null));
    if (!source && choice.credential_id) throw new HttpError(422, "credential_unavailable", { task });
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
    study: { ...overrides(own), ceiling: own.ceiling ?? null, allow_teacher_keys: own.allow_teacher_keys ?? false },
    effective: study(state),
    notices: state.aiNotices.get("study") ?? [],
    updated_at: state.aiStudyUpdatedAt
  };
}

function courseView(state: State, courseId: string): S["CourseAISettings"] {
  const inherited = study(state);
  return {
    inherited: values(inherited),
    course: overrides(state.aiCourses.get(courseId)),
    effective: values(layer(inherited, state.aiCourses.get(courseId), "course")),
    ceiling: inherited.ceiling,
    allow_teacher_keys: state.aiStudy.allow_teacher_keys ?? false,
    notices: state.aiNotices.get(courseId) ?? []
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

// --- Stored keys ---------------------------------------------------------------------------

function view(c: Credential): S["Credential"] {
  const { id, provider, label, base_url, key_hint, scope, offered_models, created_at } = c;
  return { id, provider, label, base_url, key_hint, scope, offered_models, created_at };
}

function studyKey(state: State, id: string): Credential {
  const credential = state.credentials.find((c) => c.id === id && c.course_id === null);
  if (!credential) throw new HttpError(404, "not_found");
  return credential;
}

function addKey(state: State, body: S["CredentialCreate"], courseId: string | null): Credential {
  if (!body.label?.trim() || !body.api_key || body.api_key.length < 8) throw new HttpError(422, "validation_error");
  if (body.provider === "openai_compatible" && !body.base_url) throw new HttpError(422, "validation_error");
  if (body.api_key.startsWith("bad")) throw new HttpError(422, "key_rejected");
  const credential: Credential = {
    id: id(),
    course_id: courseId,
    provider: body.provider,
    label: body.label.trim(),
    base_url: body.base_url ?? null,
    key_hint: `…${body.api_key.slice(-4)}`,
    scope: courseId ? "course" : "study",
    offered_models: null,
    created_at: now()
  };
  state.credentials.push(credential);
  return credential;
}

function removeKey(state: State, credential: Credential) {
  reset(state, (c) => c.credential_id !== credential.id, "credential_removed");
  state.credentials = state.credentials.filter((c) => c.id !== credential.id);
}

// --- Test messages and usage --------------------------------------------------------------

/** A scripted reply (no model): it says which model and instructions it would use. */
function testReply(state: State, course: { id: string }, body: S["AITestRequest"]): S["AITestResult"] {
  const settings = body.settings ? layer(study(state), body.settings, "course") : aiInEffect(state, course.id);
  const task = body.task;
  const model = settings.models[task];
  const instruction = settings.instructions[task];
  const text = instruction ? `Respuesta de prueba siguiendo: «${instruction}»` : "Respuesta de prueba según el material.";
  return {
    kind: task === "tutor" ? "answer" : "incorrect",
    text,
    model: model.model,
    latency_ms: 1200,
    input_tokens: 900,
    output_tokens: 120,
    estimated_cost_usd: model.provider === "ollama" ? 0 : 0.0012,
    fragments: 3
  };
}

function usageOf(state: State, courseId: string): S["AIUsage"] {
  const conversations = new Set(state.conversations.filter((c) => c.course_id === courseId).map((c) => c.id));
  const asked = state.messages.filter((m) => conversations.has(m.conversation_id) && m.author === "student" && m.status === "sent");
  const exercises = state.submissions.filter((s) => s.course_id === courseId);
  const counts: Record<string, number> = { tutor: asked.length, feedback: exercises.length, review: 0, questions: 0 };
  const window = (days: number) => ({
    days,
    tasks: TASKS.map((task) => ({ task, messages: counts[task], input_tokens: counts[task] * 900, output_tokens: counts[task] * 120, estimated_cost_usd: 0 }))
  });
  const { messages: limit, period } = aiInEffect(state, courseId).limits;
  const top = state.users
    .filter((u) => u.role === "student")
    .map((u) => ({ student_id: u.id, display_name: u.display_name, used: state.courseUsage.get(usageKey(u.id, courseId, period)) ?? 0 }))
    .filter((u) => u.used > 0)
    .sort((a, b) => b.used - a.used)
    .slice(0, 5);
  return { windows: [window(7), window(30)], limit, period, top_students: top };
}

export const aiRoutes: Route[] = [
  {
    method: "POST",
    path: "/v1/teacher/courses/{course_id}/ai-test",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const body = ctx.body as S["AITestRequest"];
      const missing = body.task === "tutor" ? !body.message : !(body.problem_statement && body.worked_answer);
      if (missing) throw new HttpError(422, "validation_error");
      if (body.settings) check(ctx.state, body.settings, course.id);
      if (ctx.state.faults.has("tutor_unavailable")) throw new HttpError(503, "tutor_unavailable");
      return testReply(ctx.state, course, body);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/ai-usage",
    handler: (ctx) => usageOf(ctx.state, ownedCourse(ctx).id)
  },
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
      if (ctx.state.aiStudy.allow_teacher_keys && !body.allow_teacher_keys) {
        const own = new Set(ctx.state.credentials.filter((c) => c.course_id !== null).map((c) => c.id));
        reset(ctx.state, (c) => !c.credential_id || !own.has(c.credential_id), "teacher_keys_disabled");
      }
      ctx.state.aiStudy = body;
      ctx.state.aiNotices.delete("study");
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
    path: "/v1/admin/llm-credentials",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return {
        server: sources(ctx.state).filter((s) => s.scope === "server").map((s) => ({ provider: s.provider, label: s.label })),
        items: ctx.state.credentials.filter((c) => c.course_id === null).map(view)
      };
    }
  },
  {
    method: "POST",
    path: "/v1/admin/llm-credentials",
    status: 201,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return view(addKey(ctx.state, ctx.body as S["CredentialCreate"], null));
    }
  },
  {
    method: "PATCH",
    path: "/v1/admin/llm-credentials/{credential_id}",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const credential = studyKey(ctx.state, ctx.params.credential_id);
      const body = ctx.body as S["CredentialUpdate"];
      if (body.label) credential.label = body.label;
      if ("offered_models" in body) {
        credential.offered_models = body.offered_models ?? null;
        const offered = body.offered_models;
        if (offered) reset(ctx.state, (c) => c.credential_id !== credential.id || offered.includes(c.model), "model_withdrawn");
      }
      return view(credential);
    }
  },
  {
    method: "DELETE",
    path: "/v1/admin/llm-credentials/{credential_id}",
    status: 204,
    handler: (ctx) => {
      requireRole(ctx, "admin");
      removeKey(ctx.state, studyKey(ctx.state, ctx.params.credential_id));
      return null;
    }
  },
  {
    method: "GET",
    path: "/v1/admin/llm-credentials/{credential_id}/models",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return keySource(studyKey(ctx.state, ctx.params.credential_id), "study", true);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/llm-credentials",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      return ctx.state.credentials.filter((c) => c.course_id === course.id).map(view);
    }
  },
  {
    method: "POST",
    path: "/v1/teacher/courses/{course_id}/llm-credentials",
    status: 201,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      if (!ctx.state.aiStudy.allow_teacher_keys) throw new HttpError(403, "teacher_keys_disabled");
      return view(addKey(ctx.state, ctx.body as S["CredentialCreate"], course.id));
    }
  },
  {
    method: "DELETE",
    path: "/v1/teacher/courses/{course_id}/llm-credentials/{credential_id}",
    status: 204,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const credential = ctx.state.credentials.find((c) => c.id === ctx.params.credential_id && c.course_id === course.id);
      if (!credential) throw new HttpError(404, "not_found");
      removeKey(ctx.state, credential);
      return null;
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
      check(ctx.state, body, course.id);
      ctx.state.aiCourses.set(course.id, body);
      ctx.state.aiNotices.delete(course.id);
      return courseView(ctx.state, course.id);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/ai-models",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      return { sources: sources(ctx.state, course.id) };
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
