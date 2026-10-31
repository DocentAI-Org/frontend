// Quiz questions and adaptive quizzes (backend specs/006). /__test/generation scripts the model
// (drafts, nothing usable, unavailable); /__test/questions seeds approved questions. The quiz
// follows the backend's provisional rule: the level is the difficulty shown, starting nearest
// to 2; 2 in a row aim one level up or down; 5 questions.
import { HttpError, type Route, page } from "../http.ts";
import { type Question, type Quiz, type QuizItem, type S, type State, id, now } from "../state.ts";
import { citationView } from "./chat.ts";
import { consentStatus } from "./consent.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";

const QUIZ_LENGTH = 5;
const START_LEVEL = 2;
const STREAK = 2;
const STATUSES = ["pending", "approved", "rejected"] as const;

let drafted = 0;

function topicName(state: State, topicId: string | null) {
  return state.topics.find((t) => t.id === topicId)?.name ?? "";
}

function questionView(state: State, q: Question): S["TeacherQuestion"] {
  const answers = state.quizzes.flatMap((quiz) => quiz.items).filter((i) => i.question_id === q.id && i.answered_at);
  const right = answers.filter((i) => i.correct).length;
  const { cited, ...rest } = q;
  return {
    ...rest,
    topic_name: topicName(state, q.topic_id),
    citations: cited.map((fid) => citationView(state, fid)),
    answered_count: answers.length,
    correct_rate: answers.length ? right / answers.length : null
  };
}

function courseFragment(state: State, courseId: string) {
  return state.fragments.find((f) =>
    state.documents.some((d) => d.id === f.document_id && d.course_id === courseId && d.validation_status === "validated")
  );
}

function draft(state: State, courseId: string, topicId: string, difficulty: number, cited: string[], status: Question["status"] = "pending"): Question {
  drafted += 1;
  const n = drafted + 1;
  // The right answer moves through the positions, as the backend does.
  const options = [`${2 * n}x - ${2 * n}`, `${n}x - ${2 * n}`, `${2 * n}x + ${2 * n}`, `${2 * n}x - ${n}`];
  const correct = drafted % 4;
  [options[0], options[correct]] = [options[correct], options[0]];
  return {
    id: id(),
    course_id: courseId,
    topic_id: topicId,
    statement: `¿Qué queda al quitar el paréntesis en 2(${n}x - ${n})?`,
    options,
    correct_option: correct,
    explanation: "El número de fuera multiplica a cada término de dentro del paréntesis.",
    difficulty,
    status,
    origin: "ai",
    cited,
    reviewed_at: status === "pending" ? null : now(),
    created_at: now()
  };
}

function ownQuestion(state: State, courseId: string, questionId: string) {
  const q = state.questions.find((x) => x.id === questionId && x.course_id === courseId);
  if (!q) throw new HttpError(404, "not_found");
  return q;
}

// --- Quizzes ------------------------------------------------------------------------

function current(quiz: Quiz): QuizItem | undefined {
  return quiz.status === "in_progress" ? quiz.items.find((i) => !i.answered_at) : undefined;
}

function summary(quiz: Quiz): S["QuizSummary"] | null {
  if (quiz.status !== "completed") return null;
  const byTopic = new Map<string, S["TopicScore"]>();
  for (const item of quiz.items.filter((i) => i.answered_at)) {
    const key = `${item.topic_id}|${item.topic_name}`;
    const score = byTopic.get(key) ?? { topic_id: item.topic_id, topic_name: item.topic_name, correct: 0, total: 0 };
    score.correct += item.correct ? 1 : 0;
    score.total += 1;
    byTopic.set(key, score);
  }
  const scores = [...byTopic.values()];
  return {
    score: scores.reduce((sum, s) => sum + s.correct, 0),
    total: scores.reduce((sum, s) => sum + s.total, 0),
    final_level: quiz.level,
    by_topic: scores
  };
}

function quizView(quiz: Quiz): S["Quiz"] {
  const item = current(quiz);
  return {
    id: quiz.id,
    topic_id: quiz.topic_id,
    topic_name: quiz.topic_name,
    status: quiz.status,
    question_count: quiz.question_count,
    answered_count: quiz.items.filter((i) => i.answered_at).length,
    level: quiz.level,
    current: item
      ? {
          id: item.question_id,
          position: item.position,
          statement: item.statement,
          options: item.options,
          difficulty: item.difficulty,
          topic_name: item.topic_name
        }
      : null,
    summary: summary(quiz),
    started_at: quiz.started_at,
    completed_at: quiz.completed_at
  };
}

function citationsOf(state: State, item: QuizItem) {
  const q = state.questions.find((x) => x.id === item.question_id);
  return q ? q.cited.map((fid) => citationView(state, fid)) : [];
}

function approved(state: State, courseId: string, topicId: string | null) {
  return state.questions.filter((q) => q.course_id === courseId && q.status === "approved" && (!topicId || q.topic_id === topicId));
}

function pick(state: State, quiz: Quiz, target: number): Question | undefined {
  const used = new Set(quiz.items.map((i) => i.question_id));
  const answered = (qid: string) =>
    state.quizzes
      .filter((z) => z.student_id === quiz.student_id && z.course_id === quiz.course_id)
      .flatMap((z) => z.items)
      .filter((i) => i.question_id === qid && i.answered_at).length;
  return approved(state, quiz.course_id, quiz.topic_id)
    .filter((q) => !used.has(q.id))
    .sort(
      (a, b) =>
        Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target) ||
        answered(a.id) - answered(b.id) ||
        a.difficulty - b.difficulty ||
        a.created_at.localeCompare(b.created_at)
    )[0];
}

function addItem(state: State, quiz: Quiz, q: Question) {
  quiz.items.push({
    question_id: q.id,
    position: quiz.items.length + 1,
    topic_id: q.topic_id,
    topic_name: topicName(state, q.topic_id),
    statement: q.statement,
    options: [...q.options],
    correct_option: q.correct_option,
    explanation: q.explanation,
    difficulty: q.difficulty,
    choice: null,
    correct: null,
    answered_at: null
  });
}

function ownQuiz(state: State, courseId: string, studentId: string, quizId: string) {
  const quiz = state.quizzes.find((z) => z.id === quizId && z.course_id === courseId && z.student_id === studentId);
  if (!quiz) throw new HttpError(404, "not_found");
  return quiz;
}

export const quizRoutes: Route[] = [
  {
    method: "POST",
    path: "/v1/teacher/courses/{course_id}/topics/{topic_id}/questions/generate",
    status: 201,
    handler: async (ctx) => {
      const course = ownedCourse(ctx);
      const state = ctx.state;
      const topic = state.topics.find((t) => t.id === ctx.params.topic_id && t.course_id === course.id);
      if (!topic) throw new HttpError(404, "not_found");
      const count = (ctx.body as { count?: number } | null)?.count ?? 5;
      if (count < 1 || count > 10) throw new HttpError(422, "validation_error");
      const mode = state.generation;
      if (mode.delay_ms) await new Promise((resolve) => setTimeout(resolve, mode.delay_ms));
      if (mode.mode === "fail") throw new HttpError(503, "tutor_unavailable");
      const fragment = courseFragment(state, course.id);
      if (mode.mode === "no_source" || !fragment) return { kind: "no_source", questions: [] };
      const made = Array.from({ length: count }, (_, i) => draft(state, course.id, topic.id, (i % 3) + 1, [fragment.id]));
      state.questions.push(...made);
      return { kind: "answer", questions: made.map((q) => questionView(state, q)) };
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/questions",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const state = ctx.state;
      const status = ctx.url.searchParams.get("status");
      const topicId = ctx.url.searchParams.get("topic_id");
      const scope = state.questions.filter((q) => q.course_id === course.id && (!topicId || q.topic_id === topicId));
      const counts = Object.fromEntries(STATUSES.map((s) => [s, scope.filter((q) => q.status === s).length])) as S["QuestionCounts"];
      const rows = scope
        .filter((q) => !status || q.status === status)
        .sort((a, b) => Number(a.status !== "pending") - Number(b.status !== "pending") || b.created_at.localeCompare(a.created_at));
      return { ...page(rows.map((q) => questionView(state, q)), ctx.url), counts };
    }
  },
  {
    method: "PATCH",
    path: "/v1/teacher/courses/{course_id}/questions/{question_id}",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const state = ctx.state;
      const q = ownQuestion(state, course.id, ctx.params.question_id);
      const body = ctx.body as S["QuestionUpdate"];
      if (body.options) {
        const cleaned = body.options.map((o) => o.trim());
        if (cleaned.length !== 4 || cleaned.some((o) => !o) || new Set(cleaned.map((o) => o.toLowerCase())).size !== 4) {
          throw new HttpError(422, "validation_error", { fields: { options: "invalid" } });
        }
        body.options = cleaned;
      }
      if (body.statement !== undefined && body.statement !== null && !body.statement.trim()) {
        throw new HttpError(422, "validation_error", { fields: { statement: "required" } });
      }
      let edited = false;
      for (const field of ["statement", "options", "correct_option", "explanation", "difficulty"] as const) {
        const value = body[field];
        if (value === undefined || value === null) continue;
        if (JSON.stringify(value) !== JSON.stringify(q[field])) {
          (q as Record<string, unknown>)[field] = value;
          edited = true;
        }
      }
      if (edited) q.origin = "edited";
      if (body.status) {
        q.status = body.status;
        q.reviewed_at = now();
      }
      return questionView(state, q);
    }
  },
  {
    method: "POST",
    path: "/v1/student/courses/{course_id}/quizzes",
    status: 201,
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      if (!consentStatus(state, enrolment.student_id).given) throw new HttpError(409, "consent_required");
      const topicId = (ctx.body as { topic_id?: string | null } | null)?.topic_id ?? null;
      const topic = topicId ? state.topics.find((t) => t.id === topicId && t.course_id === enrolment.course_id) : null;
      if (topicId && !topic) throw new HttpError(404, "not_found");
      const available = approved(state, enrolment.course_id, topicId).length;
      if (!available) throw new HttpError(409, "no_questions");
      const quiz: Quiz = {
        id: id(),
        course_id: enrolment.course_id,
        student_id: enrolment.student_id,
        topic_id: topic?.id ?? null,
        topic_name: topic?.name ?? null,
        status: "in_progress",
        question_count: Math.min(QUIZ_LENGTH, available),
        level: START_LEVEL,
        streak: 0,
        started_at: now(),
        completed_at: null,
        items: []
      };
      state.quizzes.push(quiz);
      const first = pick(state, quiz, START_LEVEL)!;
      quiz.level = first.difficulty;
      addItem(state, quiz, first);
      return quizView(quiz);
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/quiz-topics",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      return state.topics
        .filter((t) => t.course_id === enrolment.course_id)
        .sort((a, b) => a.position - b.position)
        .map((t) => ({ topic_id: t.id, topic_name: t.name, question_count: approved(state, t.course_id, t.id).length }))
        .filter((t) => t.question_count > 0);
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/quizzes",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const rows = ctx.state.quizzes
        .filter((z) => z.course_id === enrolment.course_id && z.student_id === enrolment.student_id)
        .sort((a, b) => b.started_at.localeCompare(a.started_at));
      return page(rows.map(quizView), ctx.url);
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/quizzes/{quiz_id}",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      const quiz = ownQuiz(state, enrolment.course_id, enrolment.student_id, ctx.params.quiz_id);
      const items = quiz.items
        .filter((i) => i.answered_at)
        .map((i) => ({
          position: i.position,
          statement: i.statement,
          options: i.options,
          difficulty: i.difficulty,
          topic_name: i.topic_name,
          choice: i.choice!,
          correct: Boolean(i.correct),
          correct_option: i.correct_option,
          explanation: i.explanation,
          citations: citationsOf(state, i),
          answered_at: i.answered_at!
        }));
      return { ...quizView(quiz), items };
    }
  },
  {
    method: "POST",
    path: "/v1/student/courses/{course_id}/quizzes/{quiz_id}/answers",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const state = ctx.state;
      if (!consentStatus(state, enrolment.student_id).given) throw new HttpError(409, "consent_required");
      const quiz = ownQuiz(state, enrolment.course_id, enrolment.student_id, ctx.params.quiz_id);
      if (quiz.status === "completed") throw new HttpError(409, "quiz_completed");
      const body = ctx.body as S["QuizAnswer"];
      if (!Number.isInteger(body.choice) || body.choice < 0 || body.choice > 3) throw new HttpError(422, "validation_error");
      const item = current(quiz);
      if (!item || item.question_id !== body.question_id) throw new HttpError(409, "not_current_question");
      item.choice = body.choice;
      item.correct = body.choice === item.correct_option;
      item.answered_at = now();

      const run = item.correct ? (quiz.streak > 0 ? quiz.streak + 1 : 1) : quiz.streak < 0 ? quiz.streak - 1 : -1;
      const from = quiz.level;
      let change: S["DifficultyChange"] | null = null;

      if (item.position >= quiz.question_count) {
        quiz.status = "completed";
        quiz.completed_at = now();
      } else {
        let target = from;
        if (run >= STREAK && from < 3) target = from + 1;
        if (-run >= STREAK && from > 1) target = from - 1;
        const next = pick(state, quiz, target);
        if (next) {
          if (next.difficulty !== from) {
            const streakMove = target !== from && (next.difficulty - from) * (target - from) > 0;
            change = {
              from_level: from,
              to_level: next.difficulty,
              reason: streakMove ? (item.correct ? "correct_streak" : "wrong_streak") : "level_exhausted",
              streak: Math.abs(run)
            };
          }
          quiz.streak = change ? 0 : run;
          quiz.level = next.difficulty;
          addItem(state, quiz, next);
        } else {
          quiz.question_count = item.position;
          quiz.status = "completed";
          quiz.completed_at = now();
        }
      }
      return {
        correct: item.correct,
        correct_option: item.correct_option,
        explanation: item.explanation,
        citations: citationsOf(state, item),
        difficulty_change: change,
        quiz: quizView(quiz)
      };
    }
  },
  {
    method: "POST",
    path: "/__test/generation",
    handler: (ctx) => {
      const body = ctx.body as { mode?: State["generation"]["mode"]; delay_ms?: number };
      ctx.state.generation = { mode: body.mode ?? "drafts", delay_ms: body.delay_ms ?? 0 };
      return { ok: true };
    }
  },
  {
    method: "POST",
    path: "/__test/questions",
    handler: (ctx) => {
      // Questions (approved unless `status` says otherwise) for a topic, "Paréntesis" by
      // default, one per entry of `levels`.
      const body = ctx.body as { course_id: string; levels?: number[]; status?: Question["status"]; topic?: string };
      const state = ctx.state;
      const name = body.topic ?? "Paréntesis";
      let topic = state.topics.find((t) => t.course_id === body.course_id && t.name === name);
      if (!topic) {
        topic = { id: id(), course_id: body.course_id, name, position: state.topics.filter((t) => t.course_id === body.course_id).length + 1 };
        state.topics.push(topic);
      }
      const fragment = courseFragment(state, body.course_id);
      const made = (body.levels ?? [1, 1, 2, 2, 3, 3]).map((level) =>
        draft(state, body.course_id, topic.id, level, fragment ? [fragment.id] : [], body.status ?? "approved")
      );
      state.questions.push(...made);
      return { topic_id: topic.id, questions: made.map((q) => ({ id: q.id, correct_option: q.correct_option, options: q.options, statement: q.statement })) };
    }
  }
];
