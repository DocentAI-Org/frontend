// Mistake reviews (backend specs/005) with a scripted model: /__test/review picks a grounded
// review, a "not covered" one, an unavailable tutor or the daily limit. /__test/mistakes seeds
// Lucas's mistakes of the same type and topic, so the third one repeats a pattern.
import { HttpError, type Route } from "../http.ts";
import { DAILY_LIMIT, type Review, type S, type State, id, now } from "../state.ts";
import { citationView } from "./chat.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";
import { repeatedOf } from "./exercises.ts";

function reviewView(state: State, r: Review): S["MistakeReview"] {
  const { cited, ...rest } = r;
  return { ...rest, citations: cited.map((fid) => citationView(state, fid)) };
}

function submissionOf(state: State, courseId: string, submissionId: string, studentId?: string) {
  const s = state.submissions.find((x) => x.id === submissionId && x.course_id === courseId && (!studentId || x.student_id === studentId));
  if (!s) throw new HttpError(404, "not_found");
  return s;
}

const PATH = "/v1/student/courses/{course_id}/submissions/{submission_id}/review";

export const mistakeReviewRoutes: Route[] = [
  {
    method: "POST",
    path: PATH,
    status: 201,
    handler: async (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      const s = submissionOf(state, enrolment.course_id, ctx.params.submission_id, enrolment.student_id);
      const existing = state.reviews.find((r) => r.submission_id === s.id);
      if (existing) return reviewView(state, existing);
      const repeated = repeatedOf(state, s);
      if (!repeated) throw new HttpError(409, "no_repeated_mistake");
      const mode = state.review;
      if (mode.delay_ms) await new Promise((resolve) => setTimeout(resolve, mode.delay_ms));
      if (mode.mode === "limit") {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        throw new HttpError(429, "daily_limit_reached", { resets_at: midnight.toISOString() });
      }
      if (mode.mode === "fail") throw new HttpError(503, "tutor_unavailable");
      state.usage.set(enrolment.student_id, Math.min(DAILY_LIMIT, (state.usage.get(enrolment.student_id) ?? 0) + 1));
      const fragment = state.fragments.find((f) => state.documents.some((d) => d.id === f.document_id && d.course_id === s.course_id && d.validation_status === "validated"));
      const grounded = mode.mode === "answer" && fragment !== undefined;
      const review: Review = {
        id: id(),
        submission_id: s.id,
        error_type: repeated.error_type,
        topic_name: repeated.topic_name,
        kind: grounded ? "answer" : "no_source",
        explanation: grounded
          ? "Cuando la incógnita está multiplicada, divides los dos miembros entre ese número; restar no la deja sola."
          : "No he encontrado una explicación de este error en el material de tu profesor/a. Pregúntale directamente o pide ayuda al tutor con un ejemplo concreto.",
        worked_example: grounded ? "1. 3x = 12\n2. Divides entre 3 los dos miembros: x = 12 / 3\n3. x = 4" : null,
        practice: grounded ? ["Despeja la incógnita en 5x = 20", "Despeja la incógnita en 4x = 18"] : [],
        cited: grounded ? [fragment.id] : [],
        created_at: now()
      };
      state.reviews.push(review);
      return reviewView(state, review);
    }
  },
  {
    method: "GET",
    path: PATH,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const s = submissionOf(ctx.state, enrolment.course_id, ctx.params.submission_id, enrolment.student_id);
      const review = ctx.state.reviews.find((r) => r.submission_id === s.id);
      if (!review) throw new HttpError(404, "not_found");
      return reviewView(ctx.state, review);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/submissions/{submission_id}/review",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const s = submissionOf(ctx.state, course.id, ctx.params.submission_id);
      const review = ctx.state.reviews.find((r) => r.submission_id === s.id);
      if (!review) throw new HttpError(404, "not_found");
      return reviewView(ctx.state, review);
    }
  },
  {
    method: "POST",
    path: "/__test/review",
    handler: (ctx) => {
      const body = ctx.body as { mode?: State["review"]["mode"]; delay_ms?: number };
      ctx.state.review = { mode: body.mode ?? "answer", delay_ms: body.delay_ms ?? 0 };
      return { ok: true };
    }
  },
  {
    method: "POST",
    path: "/__test/mistakes",
    handler: (ctx) => {
      const body = ctx.body as { course_id: string; count: number };
      const state = ctx.state;
      const student = state.users.find((u) => u.email === "alumno@docentai.local")!;
      let topic = state.topics.find((t) => t.course_id === body.course_id && t.name === "Paréntesis");
      if (!topic) {
        topic = { id: id(), course_id: body.course_id, name: "Paréntesis", position: 0 };
        state.topics.push(topic);
      }
      const fragment = state.fragments.find((f) => state.documents.some((d) => d.id === f.document_id && d.course_id === body.course_id));
      const ids = Array.from({ length: body.count }, (_, i) => {
        const submission = {
          id: id(),
          course_id: body.course_id,
          student_id: student.id,
          problem_statement: `Despeja la incógnita en ${i + 2}x = ${2 * (i + 2)}`,
          worked_answer: `${i + 2}x = ${2 * (i + 2)}\nx = ${2 * (i + 2)} - ${i + 2}\nx = ${i + 2}`,
          verdict: "incorrect" as const,
          mistake_location: `Paso 2: x = ${2 * (i + 2)} - ${i + 2}`,
          error_type: "procedural",
          topic_id: topic.id,
          topic_name: topic.name,
          explanation: "Cuando la incógnita está multiplicada por un número, se divide entre ese número en ambos miembros.",
          explanation_kind: "answer" as const,
          cited: fragment ? [fragment.id] : [],
          saved: true,
          created_at: new Date(Date.now() - (body.count - i) * 60_000).toISOString()
        };
        state.submissions.push(submission);
        return submission.id;
      });
      return { ids };
    }
  }
];
