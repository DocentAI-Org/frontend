// Progress by topic (backend specs/007), computed from the mock state as the backend does: the
// latest 10 graded items per topic (exercise 1/½/0, quiz answer 1/0), 3 needed for a score,
// "progressing" from 0.5 and "mastered" from 0.8. /__test/progress seeds Lucas's graded work.
import { HttpError, type Route } from "../http.ts";
import { type S, type State, id } from "../state.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";

const CRITERIA = { window: 10, min_items: 3, progressing: 0.5, mastered: 0.8 };
const VALUE: Record<string, number> = { correct: 1, partially_correct: 0.5, incorrect: 0 };
const DAY = 86_400_000;

type Item = { at: string; value: number; kind: "exercise" | "quiz" };
type Bucket = { items: Item[]; errors: Map<string, { count: number; latest: string; at: string }> };

function mondays(): string[] {
  const today = new Date();
  const monday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  return Array.from({ length: 8 }, (_, i) => new Date(monday - (7 - i) * 7 * DAY).toISOString().slice(0, 10));
}

function latest(items: Item[]) {
  return [...items].sort((a, b) => a.at.localeCompare(b.at)).slice(-CRITERIA.window);
}

function score(items: Item[]): number | null {
  const last = latest(items);
  return last.length < CRITERIA.min_items ? null : last.reduce((sum, i) => sum + i.value, 0) / last.length;
}

function level(count: number, value: number | null): S["TopicProgress"]["level"] {
  if (count === 0) return "not_started";
  if (value === null) return "insufficient";
  if (value >= CRITERIA.mastered) return "mastered";
  return value >= CRITERIA.progressing ? "progressing" : "starting";
}

function view(topicId: string | null, name: string | null, bucket: Bucket): S["TopicProgress"] {
  const value = score(bucket.items);
  const window = latest(bucket.items);
  const exercises = window.filter((i) => i.kind === "exercise");
  const quiz = window.filter((i) => i.kind === "quiz");
  return {
    topic_id: topicId,
    topic_name: name,
    level: level(bucket.items.length, value),
    score: value,
    basis: {
      exercises_correct: exercises.filter((i) => i.value === 1).length,
      exercises_partial: exercises.filter((i) => i.value === 0.5).length,
      exercises_total: exercises.length,
      quiz_right: quiz.filter((i) => i.value === 1).length,
      quiz_total: quiz.length
    },
    history: mondays().map((week) => {
      const end = new Date(Date.parse(week) + 7 * DAY).toISOString();
      return { week_start: week, score: score(bucket.items.filter((i) => i.at < end)) };
    }),
    top_errors: [...bucket.errors.entries()]
      .sort((a, b) => b[1].count - a[1].count || b[1].at.localeCompare(a[1].at))
      .slice(0, 3)
      .map(([error_type, e]) => ({ error_type, count: e.count, latest_submission_id: e.latest })),
    last_activity_at: bucket.items.map((i) => i.at).sort().at(-1) ?? null
  };
}

export function progressOf(state: State, courseId: string, studentId: string): S["Progress"] {
  const buckets = new Map<string | null, Bucket>();
  const bucket = (key: string | null) => {
    if (!buckets.has(key)) buckets.set(key, { items: [], errors: new Map() });
    return buckets.get(key)!;
  };
  for (const s of state.submissions.filter((x) => x.course_id === courseId && x.student_id === studentId && x.verdict in VALUE)) {
    bucket(s.topic_id).items.push({ at: s.created_at, value: VALUE[s.verdict], kind: "exercise" });
    if (s.saved && s.error_type) {
      const errors = bucket(s.topic_id).errors;
      const e = errors.get(s.error_type) ?? { count: 0, latest: s.id, at: "" };
      e.count += 1;
      if (s.created_at > e.at) Object.assign(e, { latest: s.id, at: s.created_at });
      errors.set(s.error_type, e);
    }
  }
  const quizzes = state.quizzes.filter((q) => q.course_id === courseId && q.student_id === studentId);
  for (const item of quizzes.flatMap((q) => q.items).filter((i) => i.answered_at)) {
    bucket(item.topic_id).items.push({ at: item.answered_at!, value: item.correct ? 1 : 0, kind: "quiz" });
  }
  const topics = state.topics.filter((t) => t.course_id === courseId).sort((a, b) => a.position - b.position);
  const views = topics.map((t) => view(t.id, t.name, buckets.get(t.id) ?? { items: [], errors: new Map() }));
  const known = new Set(topics.map((t) => t.id));
  const loose: Bucket = { items: [], errors: new Map() };
  for (const [key, b] of buckets) {
    if (key !== null && known.has(key)) continue;
    loose.items.push(...b.items);
    for (const [code, e] of b.errors) loose.errors.set(code, e);
  }
  const unassigned = loose.items.length ? view(null, null, loose) : null;
  const dates = [...views, unassigned].flatMap((v) => (v?.last_activity_at ? [v.last_activity_at] : [])).sort();
  return {
    provisional: true,
    criteria: CRITERIA,
    updated_at: dates.at(-1) ?? null,
    quizzes_completed: quizzes.filter((q) => q.status === "completed").length,
    topics: views,
    unassigned
  };
}

type Seed = { topic: string | null; kind: "exercise" | "quiz"; result: "correct" | "partially_correct" | "incorrect"; days_ago: number; error_type?: string };

export const progressRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/progress",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      return progressOf(ctx.state, enrolment.course_id, enrolment.student_id);
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/students/{student_id}/progress",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const enrolment = ctx.state.enrolments.find((e) => e.course_id === course.id && e.student_id === ctx.params.student_id);
      if (!enrolment) throw new HttpError(404, "not_found");
      return progressOf(ctx.state, course.id, enrolment.student_id);
    }
  },
  {
    method: "POST",
    path: "/__test/progress",
    handler: (ctx) => {
      // Topics by name (created if missing, in order of first mention); quiz answers of one
      // call form one completed quiz per topic.
      const body = ctx.body as { course_id: string; topics?: string[]; items: Seed[] };
      const state = ctx.state;
      const student = state.users.find((u) => u.email === "alumno@docentai.local")!;
      const topicId = (name: string) => {
        let topic = state.topics.find((t) => t.course_id === body.course_id && t.name === name);
        if (!topic) {
          topic = { id: id(), course_id: body.course_id, name, position: state.topics.filter((t) => t.course_id === body.course_id).length + 1 };
          state.topics.push(topic);
        }
        return topic.id;
      };
      (body.topics ?? []).forEach(topicId);
      const quizzes = new Map<string | null, State["quizzes"][number]>();
      for (const [n, item] of body.items.entries()) {
        const at = new Date(Date.now() - item.days_ago * DAY + n * 1000).toISOString();
        const tid = item.topic ? topicId(item.topic) : null;
        if (item.kind === "exercise") {
          const mistake = item.result !== "correct";
          state.submissions.push({
            id: id(),
            course_id: body.course_id,
            student_id: student.id,
            problem_statement: `Ejercicio ${n + 1}: 2(x - 3) = 4x + 2`,
            worked_answer: "2x - 6 = 4x + 2",
            verdict: item.result,
            mistake_location: mistake ? "Paso 1" : null,
            error_type: mistake ? (item.error_type ?? "procedural") : null,
            topic_id: tid,
            topic_name: item.topic,
            explanation: "El 2 multiplica a cada término.",
            explanation_kind: "answer",
            cited: [],
            saved: mistake,
            created_at: at
          });
        } else {
          let quiz = quizzes.get(tid);
          if (!quiz) {
            quiz = { id: id(), course_id: body.course_id, student_id: student.id, topic_id: tid, topic_name: item.topic, status: "completed", question_count: 0, level: 2, streak: 0, started_at: at, completed_at: at, items: [] };
            quizzes.set(tid, quiz);
            state.quizzes.push(quiz);
          }
          quiz.question_count += 1;
          quiz.completed_at = at;
          quiz.items.push({ question_id: id(), position: quiz.items.length + 1, topic_id: tid, topic_name: item.topic ?? "", statement: "¿?", options: ["a", "b", "c", "d"], correct_option: 0, explanation: "", difficulty: 2, choice: item.result === "correct" ? 0 : 1, correct: item.result === "correct", answered_at: at });
        }
      }
      return { ok: true };
    }
  }
];
