// Exercise feedback as the backend's real feedback (backend specs/003) with a scripted model:
// /__test/feedback picks a mistake, a correct answer or an unavailable tutor; uncovered exercises
// are not assessed. Also the error taxonomy and the learning record.
import { HttpError, type Route, page, requireRole } from "../http.ts";
import { DAILY_LIMIT, type S, type State, type Submission, id, now } from "../state.ts";
import { citationView } from "./chat.ts";
import { consentStatus } from "./consent.ts";
import { activeEnrolment } from "./courses.ts";

function words(text: string): Set<string> {
  return new Set(text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
}

export function submissionView(state: State, s: Submission): S["StudentSubmission"] {
  const flag = state.flags.find((f) => f.submission_id === s.id);
  return {
    id: s.id,
    problem_statement: s.problem_statement,
    worked_answer: s.worked_answer,
    verdict: s.verdict,
    mistake_location: s.mistake_location,
    error_type: s.error_type,
    topic_name: s.topic_name,
    explanation: s.explanation,
    explanation_kind: s.explanation_kind,
    citations: s.cited.map((fid) => citationView(state, fid)),
    saved_to_record: s.saved,
    is_stub: false,
    correction: flag ? { text: flag.correction, reviewed_at: flag.updated_at } : null,
    created_at: s.created_at
  };
}

const BASE = "/v1/student/courses/{course_id}/submissions";

export const exerciseRoutes: Route[] = [
  {
    method: "POST",
    path: BASE,
    status: 201,
    handler: async (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      const body = ctx.body as S["SubmissionCreate"];
      const problem = String(body.problem_statement ?? "").trim();
      const answer = String(body.worked_answer ?? "").trim();
      if (!problem || !answer) throw new HttpError(422, "validation_error");
      if (!consentStatus(state, enrolment.student_id).given) throw new HttpError(409, "consent_required");
      if (!enrolment.disclosure_acknowledged_at) throw new HttpError(409, "disclosure_not_acknowledged");
      const used = state.usage.get(enrolment.student_id) ?? 0;
      if (used >= DAILY_LIMIT) {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        throw new HttpError(429, "daily_limit_reached", { resets_at: midnight.toISOString() });
      }
      state.usage.set(enrolment.student_id, used + 1);
      const query = words(problem);
      const hit = state.fragments.find((f) => {
        const doc = state.documents.find((d) => d.id === f.document_id)!;
        return (
          doc.course_id === enrolment.course_id &&
          doc.validation_status === "validated" &&
          !f.excluded &&
          [...words(`${f.location_label} ${f.text}`)].some((w) => query.has(w))
        );
      });
      const mode = state.feedback;
      if (mode.delay_ms) await new Promise((resolve) => setTimeout(resolve, mode.delay_ms));
      if (mode.mode === "fail") {
        state.usage.set(enrolment.student_id, used);
        throw new HttpError(503, "tutor_unavailable");
      }
      const topic = state.topics
        .filter((t) => t.course_id === enrolment.course_id)
        .sort((a, b) => a.position - b.position)[0];
      const mistake = hit !== undefined && mode.mode === "mistake";
      const submission: Submission = {
        id: id(),
        course_id: enrolment.course_id,
        student_id: enrolment.student_id,
        problem_statement: problem,
        worked_answer: answer,
        verdict: !hit ? "not_assessed" : mistake ? "incorrect" : "correct",
        mistake_location: mistake ? "Paso 2: x = 4 - 2" : null,
        error_type: mistake ? "procedural" : null,
        topic_id: mistake ? (topic?.id ?? null) : null,
        topic_name: mistake ? (topic?.name ?? null) : null,
        explanation: !hit
          ? "El material del curso no cubre esta pregunta. Prueba a reformularla o pregúntale a tu profesor/a."
          : mistake
            ? "Cuando la incógnita está multiplicada por un número, se divide entre ese número en ambos miembros: x = 4 / 2."
            : "Correcto: has despejado bien la incógnita.",
        explanation_kind: hit ? "answer" : "no_source",
        cited: hit ? [hit.id] : [],
        saved: mistake,
        created_at: now()
      };
      state.submissions.push(submission);
      return submissionView(state, submission);
    }
  },
  {
    method: "GET",
    path: BASE,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const mine = ctx.state.submissions.filter((s) => s.course_id === enrolment.course_id && s.student_id === enrolment.student_id).reverse();
      return page(mine.map((s) => submissionView(ctx.state, s)), ctx.url);
    }
  },
  {
    method: "GET",
    path: `${BASE}/{submission_id}`,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const submission = ctx.state.submissions.find(
        (s) => s.id === ctx.params.submission_id && s.course_id === enrolment.course_id && s.student_id === enrolment.student_id
      );
      if (!submission) throw new HttpError(404, "not_found");
      return submissionView(ctx.state, submission);
    }
  }
];

const TAXONOMY: S["ErrorTaxonomy"] = {
  provisional: true,
  items: [
    ["comprehension", "Comprensión del enunciado", "Understanding the task"],
    ["conceptual", "Error conceptual", "Conceptual error"],
    ["procedural", "Error de procedimiento", "Procedural error"],
    ["execution", "Error de ejecución", "Slip"],
    ["incomplete", "Respuesta incompleta", "Incomplete answer"],
    ["expression", "Expresión o notación", "Expression or notation"]
  ].map(([code, es, en]) => ({ code, label: { es, en }, description: { es: `${es}.`, en: `${en}.` } }))
};

function recordOf(state: State, courseId: string, studentId: string): S["LearningRecordEntry"][] {
  return state.submissions
    .filter((s) => s.saved && s.course_id === courseId && s.student_id === studentId)
    .reverse()
    .map((s) => {
      const topicExists = state.topics.some((t) => t.id === s.topic_id);
      return {
        id: `entry-${s.id}`,
        submission_id: s.id,
        error_type: s.error_type!,
        topic_id: topicExists ? s.topic_id : null,
        topic_name: s.topic_name,
        topic_deleted: !topicExists && s.topic_name !== null,
        created_at: s.created_at
      };
    });
}

export const recordRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/error-types",
    handler: (ctx) => {
      if (!ctx.user) throw new HttpError(401, "unauthenticated");
      return TAXONOMY;
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/learning-record",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      return page(recordOf(ctx.state, enrolment.course_id, enrolment.student_id), ctx.url);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/students/{student_id}/learning-record",
    handler: (ctx) => {
      const teacher = requireRole(ctx, "teacher");
      const course = ctx.state.courses.find((c) => c.id === ctx.params.course_id && c.teacher_id === teacher.id);
      const enrolled = ctx.state.enrolments.some((e) => e.course_id === ctx.params.course_id && e.student_id === ctx.params.student_id);
      if (!course || !enrolled) throw new HttpError(404, "not_found");
      return page(recordOf(ctx.state, course.id, ctx.params.student_id), ctx.url);
    }
  },
  {
    method: "POST",
    path: "/__test/feedback",
    handler: (ctx) => {
      const body = ctx.body as { mode?: "mistake" | "correct" | "fail"; delay_ms?: number };
      ctx.state.feedback = { mode: body.mode ?? "mistake", delay_ms: body.delay_ms ?? 0 };
      return { ok: true };
    }
  }
];
