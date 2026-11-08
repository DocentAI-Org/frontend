// Recommended next steps (backend specs/020), ranked as the backend does: an open test not taken,
// the latest unfinished quiz, the most repeated mistake, the weakest topic and the first topic not
// started; at most three. Uses the backend defaults, like the progress mock.
import { HttpError, type Route } from "../http.ts";
import type { S, State } from "../state.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";
import { REPEATED } from "./exercises.ts";
import { progressOf } from "./progress.ts";

const DAY = 86_400_000;
const LIMIT = 3;
type Step = S["NextSteps"]["steps"][number];

function reviewMistake(state: State, courseId: string, studentId: string): Step | null {
  const since = Date.now() - REPEATED.days * DAY;
  const patterns = new Map<string, { count: number; latest: (typeof state.submissions)[number] }>();
  for (const s of state.submissions) {
    if (s.course_id !== courseId || s.student_id !== studentId || !s.saved || !s.error_type) continue;
    if (Date.parse(s.created_at) < since) continue;
    const key = `${s.error_type}|${s.topic_id}|${s.topic_name}`;
    const p = patterns.get(key) ?? { count: 0, latest: s };
    p.count += 1;
    if (s.created_at >= p.latest.created_at) p.latest = s;
    patterns.set(key, p);
  }
  const top = [...patterns.values()]
    .filter((p) => p.count >= REPEATED.count)
    .sort((a, b) => b.count - a.count || b.latest.created_at.localeCompare(a.latest.created_at))[0];
  if (!top) return null;
  const s = top.latest;
  return {
    kind: "review_mistake",
    error_type: s.error_type!,
    topic_id: s.topic_id,
    topic_name: s.topic_name,
    count: top.count,
    window_days: REPEATED.days,
    submission_id: s.id,
    reviewed: state.reviews.some((r) => r.submission_id === s.id)
  };
}

export function nextStepsOf(state: State, courseId: string, studentId: string): S["NextSteps"] {
  const steps: (Step | null)[] = [];
  const questions = state.testQuestions.filter((q) => q.course_id === courseId).length;
  for (const phase of ["pre", "post"] as const) {
    const open = state.testPhases.get(`${courseId}:${phase}`)?.status === "open";
    const done = state.testAttempts.some((a) => a.course_id === courseId && a.student_id === studentId && a.phase === phase);
    if (open && !done && questions) steps.push({ kind: "test", phase });
  }
  const quiz = state.quizzes
    .filter((q) => q.course_id === courseId && q.student_id === studentId && q.status === "in_progress")
    .sort((a, b) => b.started_at.localeCompare(a.started_at))[0];
  const answered = quiz ? quiz.items.filter((i) => i.answered_at).length : 0;
  steps.push(
    quiz && answered < quiz.question_count
      ? { kind: "resume_quiz", quiz_id: quiz.id, topic_name: quiz.topic_name, answered, total: quiz.question_count }
      : null
  );
  steps.push(reviewMistake(state, courseId, studentId));

  const progress = progressOf(state, courseId, studentId);
  const asked = new Set(state.questions.filter((q) => q.course_id === courseId && q.status === "approved").map((q) => q.topic_id));
  const items = (t: S["TopicProgress"]) => t.basis.exercises_total + t.basis.quiz_total;
  const weakest = progress.topics
    .filter((t) => t.level === "starting" || t.level === "progressing")
    .reduce<S["TopicProgress"] | null>((low, t) => (low === null || (t.score ?? 0) < (low.score ?? 0) ? t : low), null);
  steps.push(
    weakest && {
      kind: "practice_topic",
      topic_id: weakest.topic_id!,
      topic_name: weakest.topic_name!,
      level: weakest.level as "starting" | "progressing",
      score: weakest.score ?? 0,
      items: items(weakest),
      has_questions: asked.has(weakest.topic_id!)
    }
  );
  const fresh = progress.topics.find((t) => t.level === "not_started" || t.level === "insufficient");
  steps.push(
    fresh
      ? {
          kind: "start_topic",
          topic_id: fresh.topic_id!,
          topic_name: fresh.topic_name!,
          level: fresh.level as "not_started" | "insufficient",
          items: items(fresh),
          min_items: progress.criteria.min_items,
          has_questions: asked.has(fresh.topic_id!)
        }
      : null
  );
  return { provisional: true, steps: steps.filter((s): s is Step => s !== null).slice(0, LIMIT) };
}

export const nextStepsRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/next-steps",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      return nextStepsOf(ctx.state, enrolment.course_id, enrolment.student_id);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/students/{student_id}/next-steps",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const enrolment = ctx.state.enrolments.find((e) => e.course_id === course.id && e.student_id === ctx.params.student_id);
      if (!enrolment) throw new HttpError(404, "not_found");
      return nextStepsOf(ctx.state, course.id, enrolment.student_id);
    }
  }
];
