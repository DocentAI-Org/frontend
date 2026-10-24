// Exercise feedback as the backend v1 stub (backend research R17): fixed content, real storage,
// allowance and learning record.
import { HttpError, type Route, page } from "../http.ts";
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
    saved_to_record: true,
    is_stub: true,
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
    handler: (ctx) => {
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
      const topic = state.topics
        .filter((t) => t.course_id === enrolment.course_id)
        .sort((a, b) => a.position - b.position)[0];
      const submission: Submission = {
        id: id(),
        course_id: enrolment.course_id,
        student_id: enrolment.student_id,
        problem_statement: problem,
        worked_answer: answer,
        verdict: "incorrect",
        mistake_location: "Paso 1",
        error_type: "placeholder",
        topic_id: topic?.id ?? null,
        topic_name: topic?.name ?? null,
        explanation: hit
          ? "Respuesta de ejemplo: la corrección automática de ejercicios aún no está disponible. Revisa el primer paso con el material citado."
          : "El material del curso no cubre esta pregunta. Prueba a reformularla o pregúntale a tu profesor/a.",
        explanation_kind: hit ? "answer" : "no_source",
        cited: hit ? [hit.id] : [],
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
