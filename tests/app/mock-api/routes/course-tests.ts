// Pre-test and post-test (backend specs/008): one test per course, frozen once the pre-test has
// been opened; students take each phase once and never see right or wrong.
import { HttpError, NO_CONTENT, type Route } from "../http.ts";
import { type S, type State, type TestAttempt, type TestQuestion, id, now } from "../state.ts";
import { consentStatus } from "./consent.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";

type Phase = "pre" | "post";
const PHASES: Phase[] = ["pre", "post"];

function questionsOf(state: State, courseId: string) {
  return state.testQuestions.filter((q) => q.course_id === courseId).sort((a, b) => a.position - b.position);
}

function phaseRow(state: State, courseId: string, phase: Phase) {
  return state.testPhases.get(`${courseId}:${phase}`) ?? { status: "not_open" as const, opened_at: null, closed_at: null };
}

function locked(state: State, courseId: string) {
  return phaseRow(state, courseId, "pre").opened_at !== null;
}

function phaseView(state: State, courseId: string, phase: Phase): S["TestPhaseView"] {
  return {
    phase,
    ...phaseRow(state, courseId, phase),
    submitted_count: state.testAttempts.filter((a) => a.course_id === courseId && a.phase === phase).length
  };
}

function view(q: TestQuestion): S["TestQuestion"] {
  const { course_id: _course, ...rest } = q;
  void _course;
  return rest;
}

function ensureUnlocked(state: State, courseId: string) {
  if (locked(state, courseId)) throw new HttpError(409, "test_locked");
}

function checkOptions(options: string[]) {
  const clean = options.map((o) => o.trim());
  if (clean.length !== 4 || clean.some((o) => !o) || new Set(clean.map((o) => o.toLowerCase())).size !== 4) {
    throw new HttpError(422, "validation_error", { fields: { options: "invalid" } });
  }
  return clean;
}

function topicOf(state: State, courseId: string, topicId: string) {
  const topic = state.topics.find((t) => t.id === topicId && t.course_id === courseId);
  if (!topic) throw new HttpError(422, "validation_error", { fields: { topic_id: "unknown" } });
  return topic;
}

function nextPosition(state: State, courseId: string) {
  return Math.max(0, ...questionsOf(state, courseId).map((q) => q.position)) + 1;
}

function score(attempt: TestAttempt, questions: TestQuestion[]): S["PhaseScore"] {
  const byTopic = new Map<string, S["TestTopicScore"]>();
  for (const q of questions) {
    const key = `${q.topic_id}|${q.topic_name}`;
    if (!byTopic.has(key)) byTopic.set(key, { topic_id: q.topic_id, topic_name: q.topic_name, right: 0, total: 0 });
  }
  for (const a of attempt.answers) {
    const q = questions.find((x) => x.id === a.question_id);
    if (!q) continue;
    const t = byTopic.get(`${q.topic_id}|${q.topic_name}`)!;
    t.right += a.correct ? 1 : 0;
    t.total += 1;
  }
  const scores = [...byTopic.values()].filter((t) => t.total);
  return { submitted_at: attempt.submitted_at, right: scores.reduce((s, t) => s + t.right, 0), total: scores.reduce((s, t) => s + t.total, 0), by_topic: scores };
}

const BASE = "/v1/teacher/courses/{course_id}/test";
const STUDENT = "/v1/student/courses/{course_id}/test";

export const courseTestRoutes: Route[] = [
  {
    method: "GET",
    path: BASE,
    handler: (ctx): S["CourseTest"] => {
      const course = ownedCourse(ctx);
      return {
        locked: locked(ctx.state, course.id),
        questions: questionsOf(ctx.state, course.id).map(view),
        phases: PHASES.map((p) => phaseView(ctx.state, course.id, p))
      };
    }
  },
  {
    method: "POST",
    path: `${BASE}/questions`,
    status: 201,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      ensureUnlocked(ctx.state, course.id);
      const body = ctx.body as S["TestQuestionCreate"];
      if (!body.statement?.trim() || body.correct_option < 0 || body.correct_option > 3) throw new HttpError(422, "validation_error");
      const options = checkOptions(body.options);
      const topic = topicOf(ctx.state, course.id, body.topic_id);
      const q: TestQuestion = { id: id(), course_id: course.id, topic_id: topic.id, topic_name: topic.name, position: nextPosition(ctx.state, course.id), statement: body.statement.trim(), options, correct_option: body.correct_option };
      ctx.state.testQuestions.push(q);
      return view(q);
    }
  },
  {
    method: "POST",
    path: `${BASE}/questions/from-quiz`,
    status: 201,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      ensureUnlocked(ctx.state, course.id);
      const source = ctx.state.questions.find((q) => q.id === (ctx.body as { question_id: string }).question_id && q.course_id === course.id && q.status === "approved");
      if (!source) throw new HttpError(404, "not_found");
      const topic = ctx.state.topics.find((t) => t.id === source.topic_id);
      const q: TestQuestion = { id: id(), course_id: course.id, topic_id: source.topic_id, topic_name: topic?.name ?? "", position: nextPosition(ctx.state, course.id), statement: source.statement, options: [...source.options], correct_option: source.correct_option };
      ctx.state.testQuestions.push(q);
      return view(q);
    }
  },
  {
    method: "PATCH",
    path: `${BASE}/questions/{question_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const q = ctx.state.testQuestions.find((x) => x.id === ctx.params.question_id && x.course_id === course.id);
      if (!q) throw new HttpError(404, "not_found");
      ensureUnlocked(ctx.state, course.id);
      const body = ctx.body as S["TestQuestionUpdate"];
      if (body.options) q.options = checkOptions(body.options);
      if (body.statement !== undefined && body.statement !== null) {
        if (!body.statement.trim()) throw new HttpError(422, "validation_error");
        q.statement = body.statement.trim();
      }
      if (body.correct_option !== undefined && body.correct_option !== null) q.correct_option = body.correct_option;
      if (body.topic_id) {
        const topic = topicOf(ctx.state, course.id, body.topic_id);
        q.topic_id = topic.id;
        q.topic_name = topic.name;
      }
      return view(q);
    }
  },
  {
    method: "DELETE",
    path: `${BASE}/questions/{question_id}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const q = ctx.state.testQuestions.find((x) => x.id === ctx.params.question_id && x.course_id === course.id);
      if (!q) throw new HttpError(404, "not_found");
      ensureUnlocked(ctx.state, course.id);
      ctx.state.testQuestions = ctx.state.testQuestions.filter((x) => x.id !== q.id);
      return NO_CONTENT;
    }
  },
  {
    method: "PUT",
    path: `${BASE}/phases/{phase}`,
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const phase = ctx.params.phase as Phase;
      if (!PHASES.includes(phase)) throw new HttpError(422, "validation_error");
      const status = (ctx.body as { status: "open" | "closed" }).status;
      const row = { ...phaseRow(ctx.state, course.id, phase) };
      if (status === "open") {
        if (!questionsOf(ctx.state, course.id).length) throw new HttpError(409, "test_empty");
        Object.assign(row, { status: "open", opened_at: row.opened_at ?? now(), closed_at: null });
      } else {
        Object.assign(row, { status: "closed", closed_at: now() });
      }
      ctx.state.testPhases.set(`${course.id}:${phase}`, row);
      return phaseView(ctx.state, course.id, phase);
    }
  },
  {
    method: "GET",
    path: `${BASE}/results`,
    handler: (ctx): S["TestResults"] => {
      const course = ownedCourse(ctx);
      const state = ctx.state;
      const questions = questionsOf(state, course.id);
      const attempts = state.testAttempts.filter((a) => a.course_id === course.id);
      const students = state.enrolments
        .filter((e) => e.course_id === course.id && e.status === "active")
        .map((e) => {
          const user = state.users.find((u) => u.id === e.student_id)!;
          const of = (phase: Phase) => {
            const a = attempts.find((x) => x.student_id === e.student_id && x.phase === phase);
            return a ? score(a, questions) : null;
          };
          return { student_id: e.student_id, display_name: user.display_name, pre: of("pre"), post: of("post") };
        })
        .sort((a, b) => a.display_name.localeCompare(b.display_name));
      const averages = PHASES.map((phase) => {
        const scores = attempts.filter((a) => a.phase === phase).map((a) => score(a, questions));
        const topics = new Map<string, { topic_id: string | null; topic_name: string; values: number[] }>();
        for (const s of scores)
          for (const t of s.by_topic) {
            const key = `${t.topic_id}|${t.topic_name}`;
            if (!topics.has(key)) topics.set(key, { topic_id: t.topic_id, topic_name: t.topic_name, values: [] });
            topics.get(key)!.values.push(t.right / t.total);
          }
        return {
          phase,
          submitted: scores.length,
          score: scores.length ? scores.reduce((sum, s) => sum + s.right / s.total, 0) / scores.length : null,
          by_topic: [...topics.values()].map((t) => ({ topic_id: t.topic_id, topic_name: t.topic_name, score: t.values.reduce((a, b) => a + b, 0) / t.values.length }))
        };
      });
      return { question_count: questions.length, phases: PHASES.map((p) => phaseView(state, course.id, p)), students, averages };
    }
  },
  {
    method: "GET",
    path: STUDENT,
    handler: (ctx): S["StudentTestPhase"][] => {
      const enrolment = activeEnrolment(ctx);
      const count = questionsOf(ctx.state, enrolment.course_id).length;
      return PHASES.map((phase) => ({
        phase,
        status: phaseRow(ctx.state, enrolment.course_id, phase).status,
        done: ctx.state.testAttempts.some((a) => a.course_id === enrolment.course_id && a.student_id === enrolment.student_id && a.phase === phase),
        question_count: count
      }));
    }
  },
  {
    method: "GET",
    path: `${STUDENT}/{phase}`,
    handler: (ctx): S["StudentTest"] => {
      const enrolment = activeEnrolment(ctx);
      const phase = ctx.params.phase as Phase;
      const status = phaseRow(ctx.state, enrolment.course_id, phase).status;
      const attempt = ctx.state.testAttempts.find((a) => a.course_id === enrolment.course_id && a.student_id === enrolment.student_id && a.phase === phase);
      if (!attempt && status !== "open") throw new HttpError(409, "test_not_open");
      return {
        phase,
        status,
        done: Boolean(attempt),
        submitted_at: attempt?.submitted_at ?? null,
        questions: attempt ? [] : questionsOf(ctx.state, enrolment.course_id).map((q) => ({ id: q.id, position: q.position, statement: q.statement, options: q.options, topic_name: q.topic_name }))
      };
    }
  },
  {
    method: "POST",
    path: `${STUDENT}/{phase}`,
    status: 201,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      const phase = ctx.params.phase as Phase;
      if (!consentStatus(state, enrolment.student_id).given) throw new HttpError(409, "consent_required");
      if (state.testAttempts.some((a) => a.course_id === enrolment.course_id && a.student_id === enrolment.student_id && a.phase === phase)) throw new HttpError(409, "test_already_done");
      if (phaseRow(state, enrolment.course_id, phase).status !== "open") throw new HttpError(409, "test_not_open");
      const questions = questionsOf(state, enrolment.course_id);
      const answers = (ctx.body as S["TestSubmission"]).answers;
      const ids = answers.map((a) => a.question_id);
      if (new Set(ids).size !== ids.length || ids.length !== questions.length || questions.some((q) => !ids.includes(q.id))) {
        throw new HttpError(422, "validation_error");
      }
      const attempt: TestAttempt = {
        course_id: enrolment.course_id,
        student_id: enrolment.student_id,
        phase,
        submitted_at: now(),
        answers: answers.map((a) => ({ ...a, correct: questions.find((q) => q.id === a.question_id)!.correct_option === a.choice }))
      };
      state.testAttempts.push(attempt);
      return { phase, submitted_at: attempt.submitted_at };
    }
  },
  {
    method: "POST",
    path: "/__test/course-test",
    handler: (ctx) => {
      // A test of `count` questions in "Paréntesis" (and "Despejar" for the even ones);
      // optionally opens phases and records Lucas's answers ("right" flags per question).
      const body = ctx.body as { course_id: string; count?: number; open?: Phase[]; answered?: Partial<Record<Phase, boolean[]>> };
      const state = ctx.state;
      const topicId = (name: string) => {
        let t = state.topics.find((x) => x.course_id === body.course_id && x.name === name);
        if (!t) {
          t = { id: id(), course_id: body.course_id, name, position: state.topics.filter((x) => x.course_id === body.course_id).length + 1 };
          state.topics.push(t);
        }
        return t;
      };
      const made = Array.from({ length: body.count ?? 3 }, (_, i) => {
        const t = topicId(i % 2 === 0 ? "Paréntesis" : "Despejar");
        const q: TestQuestion = { id: id(), course_id: body.course_id, topic_id: t.id, topic_name: t.name, position: nextPosition(state, body.course_id), statement: `Pregunta ${i + 1} del test`, options: [`${i}a`, `${i}b`, `${i}c`, `${i}d`], correct_option: i % 4 };
        state.testQuestions.push(q);
        return q;
      });
      for (const phase of body.open ?? []) state.testPhases.set(`${body.course_id}:${phase}`, { status: "open", opened_at: now(), closed_at: null });
      const student = state.users.find((u) => u.email === "alumno@docentai.local")!;
      for (const [phase, rights] of Object.entries(body.answered ?? {}) as [Phase, boolean[]][]) {
        state.testAttempts.push({
          course_id: body.course_id,
          student_id: student.id,
          phase,
          submitted_at: now(),
          answers: made.map((q, i) => ({ question_id: q.id, choice: rights[i] ? q.correct_option : (q.correct_option + 1) % 4, correct: rights[i] }))
        });
      }
      return { questions: made.map(view) };
    }
  }
];
