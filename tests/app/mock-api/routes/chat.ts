// Student chat with a deterministic tutor: it answers from validated, non-excluded fragments that
// share words with the question, follows the course's solution policy, and never improvises.
import { HttpError, type Route, page, requireRole } from "../http.ts";
import { type Conversation, DAILY_LIMIT, type Msg, type S, type State, id, now } from "../state.ts";
import { consentStatus } from "./consent.ts";
import { activeEnrolment } from "./courses.ts";

function words(text: string): Set<string> {
  return new Set(
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .match(/[a-z0-9]{4,}/g) ?? []
  );
}

function retrievable(state: State, courseId: string) {
  return state.fragments.filter((f) => {
    const doc = state.documents.find((d) => d.id === f.document_id)!;
    return doc.course_id === courseId && doc.processing_status === "ready" && doc.validation_status === "validated" && !f.excluded;
  });
}

export function citationView(state: State, fragmentId: string): S["Citation"] {
  const fragment = state.fragments.find((f) => f.id === fragmentId);
  const doc = fragment && state.documents.find((d) => d.id === fragment.document_id);
  const available = Boolean(fragment && doc && !fragment.excluded && doc.validation_status === "validated");
  return {
    fragment_id: fragment ? fragmentId : null,
    document_name: doc?.file_name ?? "documento",
    location_label: fragment?.location_label ?? "",
    passage: available ? fragment!.text : null,
    available
  };
}

export function messageView(state: State, message: Msg): S["StudentMessage"] {
  const flag = state.flags.find((f) => f.message_id === message.id);
  return {
    id: message.id,
    author: message.author,
    kind: message.kind,
    status: message.status,
    text: message.text,
    hint_number: message.hint_number,
    request_solution: message.request_solution,
    counts_toward_limit: message.counts_toward_limit,
    created_at: message.created_at,
    citations: message.cited.map((fid) => citationView(state, fid)),
    correction: flag ? { text: flag.correction, reviewed_at: flag.updated_at } : null,
    adaptation: message.adaptation ?? null
  };
}

function conversationView(state: State, conversation: Conversation): S["Conversation"] {
  return {
    id: conversation.id,
    started_at: conversation.started_at,
    last_message_at: conversation.last_message_at,
    messages: state.messages.filter((m) => m.conversation_id === conversation.id).map((m) => messageView(state, m))
  };
}

function allowance(state: State, studentId: string): S["Allowance"] {
  const used = state.usage.get(studentId) ?? 0;
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return { limit: DAILY_LIMIT, used, remaining: Math.max(DAILY_LIMIT - used, 0), resets_at: midnight.toISOString() };
}

function ownConversation(state: State, courseId: string, studentId: string, conversationId: string): Conversation {
  const conversation = state.conversations.find(
    (c) => c.id === conversationId && c.course_id === courseId && c.student_id === studentId
  );
  if (!conversation) throw new HttpError(404, "not_found");
  return conversation;
}

function reply(state: State, conversation: Conversation, question: Msg): Msg {
  const course = state.courses.find((c) => c.id === conversation.course_id)!;
  const history = state.messages.filter((m) => m.conversation_id === conversation.id && m.id !== question.id);
  const lastTutor = history.filter((m) => m.author === "tutor").at(-1);
  // A follow-up right after a hint continues the same problem (backend research R6).
  const previous = lastTutor?.kind === "hint" ? history.filter((m) => m.author === "student").at(-1)?.text ?? "" : "";
  const query = words(`${previous} ${question.text}`);
  const hits = retrievable(state, conversation.course_id)
    .map((f) => ({ f, score: [...words(`${f.location_label} ${f.text}`)].filter((w) => query.has(w)).length }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
  const base = { id: id(), conversation_id: conversation.id, author: "tutor" as const, status: "sent" as const, request_solution: false, counts_toward_limit: false, created_at: now() };
  if (!hits.length) {
    return { ...base, kind: "no_source", text: "El material del curso no cubre esta pregunta. Prueba a reformularla o pregúntale a tu profesor/a.", hint_number: null, cited: [] };
  }
  const policy = course.settings.solution_policy;
  const guided = policy === "hints_only" || (policy === "hints_first" && !question.request_solution);
  if (guided) {
    let hints = 0;
    for (const m of [...history].reverse()) {
      if (m.author === "student") continue;
      if (m.kind !== "hint") break;
      hints += 1;
    }
    return { ...base, kind: "hint", text: `Piensa en esto: ${hits[0].f.text}`, hint_number: hints + 1, cited: [hits[0].f.id], adaptation: state.adaptation };
  }
  return { ...base, kind: "answer", text: `Según el material: ${hits[0].f.text}`, hint_number: null, cited: hits.slice(0, 2).map((h) => h.f.id), adaptation: state.adaptation };
}

function exchange(state: State, conversation: Conversation, question: Msg, studentId: string) {
  const enrolment = state.enrolments.find((e) => e.course_id === conversation.course_id && e.student_id === studentId)!;
  if (!consentStatus(state, studentId).given) throw new HttpError(409, "consent_required");
  if (!enrolment.disclosure_acknowledged_at) throw new HttpError(409, "disclosure_not_acknowledged");
  const course = state.courses.find((c) => c.id === conversation.course_id)!;
  if (question.request_solution && course.settings.solution_policy === "hints_only") {
    throw new HttpError(409, "solution_not_allowed");
  }
  const used = state.usage.get(studentId) ?? 0;
  if (used >= DAILY_LIMIT) {
    throw new HttpError(429, "daily_limit_reached", { resets_at: allowance(state, studentId).resets_at });
  }
  if (!state.messages.includes(question)) state.messages.push(question);
  if (state.faults.has("tutor_unavailable")) {
    question.status = "failed";
    question.counts_toward_limit = false;
    throw new HttpError(503, "tutor_unavailable", { message_id: question.id });
  }
  question.status = "sent";
  question.counts_toward_limit = true;
  state.usage.set(studentId, used + 1);
  const answer = reply(state, conversation, question);
  state.messages.push(answer);
  conversation.last_message_at = now();
  return { student_message: messageView(state, question), tutor_message: messageView(state, answer), allowance: allowance(state, studentId) };
}

const BASE = "/v1/student/courses/{course_id}/conversations";

export const chatRoutes: Route[] = [
  {
    method: "POST",
    path: BASE,
    status: 201,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const conversation: Conversation = { id: id(), course_id: enrolment.course_id, student_id: enrolment.student_id, started_at: now(), last_message_at: now() };
      ctx.state.conversations.push(conversation);
      return conversationView(ctx.state, conversation);
    }
  },
  {
    method: "GET",
    path: BASE,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const mine = ctx.state.conversations
        .filter((c) => c.course_id === enrolment.course_id && c.student_id === enrolment.student_id)
        .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
      return page(
        mine.map((c) => ({
          id: c.id,
          started_at: c.started_at,
          last_message_at: c.last_message_at,
          preview: ctx.state.messages.find((m) => m.conversation_id === c.id && m.author === "student")?.text.slice(0, 120) ?? null
        })),
        ctx.url
      );
    }
  },
  {
    method: "GET",
    path: `${BASE}/{conversation_id}`,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      return conversationView(ctx.state, ownConversation(ctx.state, enrolment.course_id, enrolment.student_id, ctx.params.conversation_id));
    }
  },
  {
    method: "POST",
    path: `${BASE}/{conversation_id}/messages`,
    status: 201,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const conversation = ownConversation(ctx.state, enrolment.course_id, enrolment.student_id, ctx.params.conversation_id);
      const body = ctx.body as S["MessageCreate"];
      const text = String(body.text ?? "").replace(/\0/g, "").trim();
      if (!text || text.length > 4000) throw new HttpError(422, "validation_error");
      const question: Msg = {
        id: id(),
        conversation_id: conversation.id,
        author: "student",
        kind: "question",
        status: "sent",
        text,
        hint_number: null,
        request_solution: Boolean(body.request_solution),
        counts_toward_limit: false,
        created_at: now(),
        cited: []
      };
      return exchange(ctx.state, conversation, question, enrolment.student_id);
    }
  },
  {
    method: "POST",
    path: `${BASE}/{conversation_id}/messages/{message_id}/retry`,
    status: 201,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const conversation = ownConversation(ctx.state, enrolment.course_id, enrolment.student_id, ctx.params.conversation_id);
      const question = ctx.state.messages.find(
        (m) => m.id === ctx.params.message_id && m.conversation_id === conversation.id && m.author === "student" && m.status === "failed"
      );
      if (!question) throw new HttpError(404, "not_found");
      return exchange(ctx.state, conversation, question, enrolment.student_id);
    }
  }
];

chatRoutes.push({
  method: "GET",
  path: "/v1/student/allowance",
  handler: (ctx) => allowance(ctx.state, requireRole(ctx, "student").id)
});

/** Test helper: use up a student's daily messages. */
chatRoutes.push({
  method: "POST",
  path: "/__test/usage",
  handler: (ctx) => {
    const { email, used } = ctx.body as { email: string; used: number };
    const student = ctx.state.users.find((u) => u.email === email);
    if (!student) throw new HttpError(404, "not_found");
    ctx.state.usage.set(student.id, used);
    return { ok: true };
  }
});

/**
 * Test helper: a course of the seeded teacher with one validated document, and the seeded
 * student enrolled (consent and AI disclosure optional). Keeps chat tests on the chat.
 */
chatRoutes.push({
  method: "POST",
  path: "/__test/classroom",
  handler: (ctx) => {
    const input = ctx.body as { policy?: S["TutorSettings"]["solution_policy"]; consent?: boolean; disclosure?: boolean };
    const state = ctx.state;
    const teacher = state.users.find((u) => u.email === "profesora@docentai.local")!;
    const student = state.users.find((u) => u.email === "alumno@docentai.local")!;
    const course = {
      id: id(),
      teacher_id: teacher.id,
      name: "Álgebra",
      description: null,
      class_code: "ALG-7K3P",
      class_code_active: true,
      created_at: now(),
      settings: { level: "intermediate" as const, tone: "friendly" as const, solution_policy: input.policy ?? "direct", updated_at: now() }
    };
    state.courses.push(course);
    const doc = {
      id: id(),
      course_id: course.id,
      file_name: "ecuaciones.md",
      file_type: "markdown" as const,
      size_bytes: 400,
      page_count: 2,
      processing_status: "ready" as const,
      error_reason: null,
      validation_status: "validated" as const,
      validated_by: teacher.id,
      validated_at: now(),
      uploaded_at: now()
    };
    state.documents.push(doc);
    [
      ["3.1 Transponer términos", "Un término que suma en un miembro pasa restando al otro: en 2x + 3 = 7 se resta 3 y queda 2x = 4."],
      ["3.2 Despejar la incógnita", "Para despejar la incógnita se divide entre el número que la multiplica: de 2x = 4 se obtiene x = 2."]
    ].forEach(([section, text], i) =>
      state.fragments.push({ id: id(), document_id: doc.id, position: i + 1, section, location_label: `§ ${section}`, text, excluded: false })
    );
    if (input.consent !== false) state.consent.push({ student_id: student.id, action: "given", version: "2026-10", created_at: now() });
    state.enrolments.push({
      course_id: course.id,
      student_id: student.id,
      status: "active",
      joined_at: now(),
      disclosure_acknowledged_at: input.disclosure ? now() : null
    });
    return { course_id: course.id, document_id: doc.id };
  }
});

/** Test helper: exclude every document, so earlier citations become unavailable. */
chatRoutes.push({
  method: "POST",
  path: "/__test/exclude-all",
  handler: (ctx) => {
    for (const doc of ctx.state.documents) doc.validation_status = "excluded";
    return { ok: true };
  }
});
