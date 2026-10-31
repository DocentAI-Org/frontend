// Teacher review of conversations and feedback, flags and corrections (001 US8, backend 002).
import { HttpError, type Route, noContent, page } from "../http.ts";
import { type Flag, type S, type State, id, now } from "../state.ts";
import { messageView } from "./chat.ts";
import { ownedCourse } from "./courses.ts";
import { submissionView } from "./exercises.ts";

function flagView(state: State, flag: Flag): S["TeacherFlag"] {
  return {
    id: flag.id,
    category: flag.category,
    correction: flag.correction,
    author_name: state.users.find((u) => u.id === flag.author_id)?.display_name ?? null,
    created_at: flag.created_at,
    updated_at: flag.updated_at
  };
}

function summary(state: State, conversationId: string): S["ConversationSummary"] {
  const c = state.conversations.find((x) => x.id === conversationId)!;
  const messages = state.messages.filter((m) => m.conversation_id === c.id);
  return {
    id: c.id,
    student_id: c.student_id,
    student_name: state.users.find((u) => u.id === c.student_id)!.display_name,
    started_at: c.started_at,
    last_message_at: c.last_message_at,
    message_count: messages.length,
    has_no_source: messages.some((m) => m.kind === "no_source"),
    has_correction: messages.some((m) => state.flags.some((f) => f.message_id === m.id))
  };
}

function teacherSubmission(state: State, submissionId: string): S["TeacherSubmission"] {
  const s = state.submissions.find((x) => x.id === submissionId)!;
  const flag = state.flags.find((f) => f.submission_id === s.id);
  return {
    ...submissionView(state, s),
    student_id: s.student_id,
    student_name: state.users.find((u) => u.id === s.student_id)!.display_name,
    flag: flag ? flagView(state, flag) : null
  };
}

function upsertFlag(state: State, courseId: string, authorId: string, target: { message_id?: string; submission_id?: string }, body: S["FlagUpsert"]) {
  if (state.faults.has("save_flag_fails")) throw new HttpError(503, "api_unreachable");
  const correction = String(body.correction ?? "").trim();
  if (!correction || !["incorrect", "poor"].includes(body.category)) throw new HttpError(422, "validation_error");
  let flag = state.flags.find((f) => (target.message_id ? f.message_id === target.message_id : f.submission_id === target.submission_id));
  if (!flag) {
    flag = { id: id(), course_id: courseId, message_id: target.message_id ?? null, submission_id: target.submission_id ?? null, category: body.category, correction, author_id: authorId, created_at: now(), updated_at: now() };
    state.flags.push(flag);
  }
  flag.category = body.category;
  flag.correction = correction;
  flag.updated_at = now();
  return flagView(state, flag);
}

function courseMessage(state: State, courseId: string, messageId: string) {
  const message = state.messages.find((m) => m.id === messageId);
  const conversation = message && state.conversations.find((c) => c.id === message.conversation_id && c.course_id === courseId);
  if (!message || !conversation) throw new HttpError(404, "not_found");
  if (message.author !== "tutor") throw new HttpError(400, "not_a_tutor_message");
  return message;
}

function courseSubmission(state: State, courseId: string, submissionId: string) {
  const submission = state.submissions.find((s) => s.id === submissionId && s.course_id === courseId);
  if (!submission) throw new HttpError(404, "not_found");
  return submission;
}

const BASE = "/v1/teacher/courses/{course_id}";

export const reviewRoutes: Route[] = [
  {
    method: "GET",
    path: `${BASE}/conversations`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const q = ctx.url.searchParams;
      let rows = ctx.state.conversations.filter((c) => c.course_id === course.id).map((c) => summary(ctx.state, c.id));
      if (q.get("student_id")) rows = rows.filter((r) => r.student_id === q.get("student_id"));
      if (q.get("from")) rows = rows.filter((r) => r.last_message_at >= q.get("from")!);
      if (q.get("has_no_source")) rows = rows.filter((r) => r.has_no_source === (q.get("has_no_source") === "true"));
      if (q.get("has_correction")) rows = rows.filter((r) => r.has_correction === (q.get("has_correction") === "true"));
      return page(rows.sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)), ctx.url);
    }
  },
  {
    method: "GET",
    path: `${BASE}/conversations/{conversation_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const conversation = ctx.state.conversations.find((c) => c.id === ctx.params.conversation_id && c.course_id === course.id);
      if (!conversation) throw new HttpError(404, "not_found");
      return {
        ...summary(ctx.state, conversation.id),
        messages: ctx.state.messages
          .filter((m) => m.conversation_id === conversation.id)
          .map((m) => {
            const flag = ctx.state.flags.find((f) => f.message_id === m.id);
            return { ...messageView(ctx.state, m), flag: flag ? flagView(ctx.state, flag) : null };
          })
      };
    }
  },
  {
    method: "GET",
    path: `${BASE}/submissions`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const q = ctx.url.searchParams;
      let rows = ctx.state.submissions.filter((s) => s.course_id === course.id);
      if (q.get("student_id")) rows = rows.filter((s) => s.student_id === q.get("student_id"));
      if (q.get("from")) rows = rows.filter((s) => s.created_at >= q.get("from")!);
      return page(rows.reverse().map((s) => teacherSubmission(ctx.state, s.id)), ctx.url);
    }
  },
  {
    method: "GET",
    path: `${BASE}/submissions/{submission_id}`,
    handler: (ctx) => teacherSubmission(ctx.state, courseSubmission(ctx.state, ownedCourse(ctx).id, ctx.params.submission_id).id)
  },
  {
    method: "PUT",
    path: `${BASE}/messages/{message_id}/flag`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const message = courseMessage(ctx.state, course.id, ctx.params.message_id);
      return upsertFlag(ctx.state, course.id, ctx.user!.id, { message_id: message.id }, ctx.body as S["FlagUpsert"]);
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/messages/{message_id}/flag`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const message = courseMessage(ctx.state, course.id, ctx.params.message_id);
      ctx.state.flags = ctx.state.flags.filter((f) => f.message_id !== message.id);
      return noContent();
    }
  },
  {
    method: "PUT",
    path: `${BASE}/submissions/{submission_id}/flag`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const submission = courseSubmission(ctx.state, course.id, ctx.params.submission_id);
      return upsertFlag(ctx.state, course.id, ctx.user!.id, { submission_id: submission.id }, ctx.body as S["FlagUpsert"]);
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/submissions/{submission_id}/flag`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const submission = courseSubmission(ctx.state, course.id, ctx.params.submission_id);
      ctx.state.flags = ctx.state.flags.filter((f) => f.submission_id !== submission.id);
      return noContent();
    }
  },
  {
    method: "GET",
    path: `${BASE}/flags`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const rows = ctx.state.flags
        .filter((f) => f.course_id === course.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((flag) => {
          const message = flag.message_id ? ctx.state.messages.find((m) => m.id === flag.message_id)! : null;
          const submission = flag.submission_id ? ctx.state.submissions.find((s) => s.id === flag.submission_id)! : null;
          const conversation = message ? ctx.state.conversations.find((c) => c.id === message.conversation_id)! : null;
          const studentId = conversation?.student_id ?? submission!.student_id;
          return {
            ...flagView(ctx.state, flag),
            student_id: studentId,
            student_name: ctx.state.users.find((u) => u.id === studentId)!.display_name,
            original_text: message?.text ?? submission!.explanation,
            target: message ? ("message" as const) : ("submission" as const),
            conversation_id: conversation?.id ?? null,
            message_id: message?.id ?? null,
            submission_id: submission?.id ?? null
          };
        });
      return page(rows, ctx.url);
    }
  }
];

/** Test helper: the seeded student's conversation (covered + uncovered answers) and an exercise. */
reviewRoutes.push({
  method: "POST",
  path: "/__test/activity",
  handler: (ctx) => {
    const { course_id } = ctx.body as { course_id: string };
    const state = ctx.state;
    const student = state.users.find((u) => u.email === "alumno@docentai.local")!;
    const fragment = state.fragments.find((f) => state.documents.find((d) => d.id === f.document_id)?.course_id === course_id)!;
    const conversation = { id: id(), course_id, student_id: student.id, started_at: now(), last_message_at: now() };
    state.conversations.push(conversation);
    const base = { conversation_id: conversation.id, status: "sent" as const, request_solution: false, created_at: now(), hint_number: null };
    state.messages.push(
      { ...base, id: id(), author: "student", kind: "question", text: "¿Cómo despejo la incógnita?", counts_toward_limit: true, cited: [] },
      { ...base, id: id(), author: "tutor", kind: "answer", text: "Se suma el número que la multiplica.", counts_toward_limit: false, cited: [fragment.id], adaptation: state.adaptation },
      { ...base, id: id(), author: "student", kind: "question", text: "¿Quién ganó el mundial?", counts_toward_limit: true, cited: [] },
      { ...base, id: id(), author: "tutor", kind: "no_source", text: "El material del curso no cubre esta pregunta.", counts_toward_limit: false, cited: [] }
    );
    const submission = {
      id: id(),
      course_id,
      student_id: student.id,
      problem_statement: "Resuelve 2x = 4",
      worked_answer: "x = 4 - 2",
      verdict: "incorrect" as const,
      mistake_location: "Paso 1",
      error_type: "procedural",
      topic_id: null,
      topic_name: null,
      explanation: "Al pasar el 2 al otro miembro, divide en lugar de restar.",
      explanation_kind: "answer" as const,
      cited: [fragment.id],
      saved: true,
      adaptation: state.adaptation,
      created_at: now()
    };
    state.submissions.push(submission);
    return { conversation_id: conversation.id, submission_id: submission.id, student_id: student.id };
  }
});
