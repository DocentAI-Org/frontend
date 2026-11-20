// The demo deployment's backend: the same typed mock as the E2E tests, called in process, with
// sample data built from the course material and class lists in demo-data/ (the same files the
// backend's seed script uses). Activity is generated per student from a seeded random number
// generator, so every build has the same people and shape of data, dated relative to now.
// Changes live in memory and the data starts over every hour. Fictitious people only (AGENTS.md VII).
import { createHandler } from "./app.ts";
import algebra from "./demo-data/courses/algebra-3b.json";
import basesDatos from "./demo-data/courses/bases-datos-uni.json";
import calculo from "./demo-data/courses/calculo-uni.json";
import comentario from "./demo-data/courses/comentario-4a.json";
import contemporanea from "./demo-data/courses/contemporanea-4a.json";
import edadModerna from "./demo-data/courses/edad-moderna-3b.json";
import estadistica from "./demo-data/courses/estadistica-4a.json";
import funciones from "./demo-data/courses/funciones-4a.json";
import geometria from "./demo-data/courses/geometria-3b.json";
import lengua from "./demo-data/courses/lengua-3b.json";
import programacion from "./demo-data/courses/programacion-uni.json";
import sigloDeOro from "./demo-data/courses/siglo-de-oro-4a.json";
import roster from "./demo-data/people.json";
import {
  type Course,
  type Doc,
  type Frag,
  type Msg,
  PASSWORD,
  type Question,
  type Quiz,
  type State,
  type Submission,
  type User,
  id,
  resetIds,
  seed
} from "./state.ts";

type Section = { title: string; page: number | null; text: string };
type Exercise = { statement: string; correct_answer: string; wrong_answer: string; mistake_location: string; error_type: string; explanation: string };
type QuizQuestion = { statement: string; options: string[]; correct: number; explanation: string; difficulty: number };
type TopicContent = {
  name: string;
  document: string;
  section: string;
  questions: { question: string; answer: string }[];
  exercises: Exercise[];
  quiz: QuizQuestion[];
};
type CourseContent = {
  key: string;
  name: string;
  description: string;
  documents: { file_name: string; file_type: Doc["file_type"]; page_count: number | null; sections: Section[] }[];
  topics: TopicContent[];
  off_topic: string[];
};
type Person = { name: string; email: string; pseudonym: string | null };
type People = {
  teachers: { key: string; email: string; name: string }[];
  groups: { key: string; label: string; tag_color: State["tags"][number]["color"]; students: Person[] }[];
  courses: { key: string; teacher: string; group: string; class_code: string; settings: Omit<Course["settings"], "updated_at"> }[];
};

const PEOPLE = roster as People;
// In the order courses are created: Álgebra last, so it heads the "most recent" lists.
const CONTENT = [
  calculo,
  programacion,
  basesDatos,
  contemporanea,
  edadModerna,
  sigloDeOro,
  comentario,
  lengua,
  estadistica,
  funciones,
  geometria,
  algebra
] as CourseContent[];

const RESET_MS = 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
/** Activity covers the last eight weeks, the span of the teacher's weekly charts. */
const ACTIVE_DAYS = 56;

/** What happens to each course's third, supplementary document. */
const SUPPLEMENT: Record<string, "validated" | "pending_validation" | "excluded" | "processing" | "error"> = {
  "algebra-3b": "validated",
  "geometria-3b": "pending_validation",
  "funciones-4a": "pending_validation",
  "estadistica-4a": "processing",
  "lengua-3b": "validated",
  "comentario-4a": "excluded",
  "siglo-de-oro-4a": "pending_validation",
  "edad-moderna-3b": "error",
  "contemporanea-4a": "validated",
  "calculo-uni": "pending_validation",
  "programacion-uni": "validated",
  "bases-datos-uni": "pending_validation"
};

/** Pre/post tests: which phases have run, per course. */
const TESTS: Record<string, { pre: "open" | "closed"; post?: "open" }> = {
  "algebra-3b": { pre: "closed", post: "open" },
  "funciones-4a": { pre: "open" },
  "programacion-uni": { pre: "closed" }
};

const FAVORITES: Record<string, string[]> = {
  "profesora@docentai.local": ["algebra-3b", "funciones-4a"],
  "javier.molina@example.org": ["lengua-3b"],
  "andres.navarro@example.org": ["programacion-uni"],
  "alumno@docentai.local": ["algebra-3b"]
};

const PRAISE = [
  "Respuesta correcta: has seguido bien todos los pasos.",
  "¡Bien hecho! La respuesta es correcta y está bien justificada.",
  "Correcto. El planteamiento es claro y el resultado, exacto.",
  "Respuesta correcta y bien presentada."
];

const CORRECTIONS: { category: "incorrect" | "poor"; text: string }[] = [
  { category: "poor", text: "La respuesta es correcta, pero conviene remitir al ejemplo resuelto del apartado: lo trabajamos así en clase." },
  { category: "poor", text: "Demasiado larga para este nivel. Mejor en dos pasos cortos y con un ejemplo." },
  { category: "incorrect", text: "Falta un matiz importante que vimos en clase; lo he añadido al material de la unidad." }
];

/** Students behave differently: how much they do, how well and until when. */
type Profile = "engaged" | "regular" | "struggling" | "fading" | "silent";
const PROFILES: { profile: Profile; weight: number }[] = [
  { profile: "engaged", weight: 0.25 },
  { profile: "regular", weight: 0.47 },
  { profile: "struggling", weight: 0.14 },
  { profile: "fading", weight: 0.09 },
  { profile: "silent", weight: 0.05 }
];
const BEHAVIOUR: Record<Profile, { chats: [number, number]; exercises: [number, number]; quizzes: [number, number]; correct: number; partial: number; quizRight: number; idle: [number, number] }> = {
  engaged: { chats: [4, 7], exercises: [9, 14], quizzes: [2, 4], correct: 0.78, partial: 0.12, quizRight: 0.85, idle: [0, 2] },
  regular: { chats: [2, 4], exercises: [5, 9], quizzes: [1, 2], correct: 0.6, partial: 0.18, quizRight: 0.65, idle: [0, 4] },
  struggling: { chats: [3, 6], exercises: [7, 11], quizzes: [1, 2], correct: 0.25, partial: 0.2, quizRight: 0.4, idle: [0, 4] },
  fading: { chats: [1, 3], exercises: [2, 5], quizzes: [0, 1], correct: 0.5, partial: 0.2, quizRight: 0.55, idle: [9, 20] },
  silent: { chats: [0, 0], exercises: [0, 0], quizzes: [0, 0], correct: 0, partial: 0, quizRight: 0, idle: [0, 0] }
};

/** mulberry32, seeded by a string: the same data on every build. */
function random(seedText: string) {
  let a = [...seedText].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 1779033703) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: ([min, max]: [number, number]) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p
  };
}
type Random = ReturnType<typeof random>;

function profileOf(rng: Random): Profile {
  let roll = rng.next();
  for (const { profile, weight } of PROFILES) {
    roll -= weight;
    if (roll < 0) return profile;
  }
  return "regular";
}

function build(): State {
  // Same ids on every build: a session token names its user by id.
  resetIds();
  const state = seed();
  const nowMs = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const daysAgo = (days: number) => nowMs - days * DAY;
  /** A moment on that day between 8:00 and 22:00 (UTC), never in the future. */
  const during = (rng: Random, ms: number) => Math.min(nowMs - 60_000, Math.floor(ms / DAY) * DAY + (8 + rng.next() * 14) * 3_600_000);

  const userBy = (email: string) => state.users.find((u) => u.email === email);
  const addUser = (role: User["role"], person: { email: string; name: string; pseudonym?: string | null }, createdDaysAgo: number) => {
    const existing = userBy(person.email);
    if (existing) return existing;
    const user: User = {
      id: id(),
      email: person.email,
      password: PASSWORD,
      role,
      display_name: person.name,
      pseudonym_code: person.pseudonym ?? null,
      status: "active",
      preferred_language: "es",
      created_at: iso(daysAgo(createdDaysAgo))
    };
    state.users.push(user);
    return user;
  };
  for (const user of state.users) user.created_at = iso(daysAgo(75));
  const teachers = new Map(PEOPLE.teachers.map((t) => [t.key, addUser("teacher", t, 74)]));
  const groups = new Map(PEOPLE.groups.map((g) => [g.key, { ...g, users: g.students.map((s) => addUser("student", s, 70)) }]));
  // One student left the university group: their account is disabled and their places revoked.
  const leaver = groups.get("uni")!.users.at(-1)!;
  leaver.status = "disabled";

  const traits = new Map<string, Profile>();
  const traitOf = (user: User) => {
    if (!traits.has(user.id)) traits.set(user.id, profileOf(random(`trait:${user.email}`)));
    return traits.get(user.id)!;
  };

  const courses = new Map<string, Course>();
  for (const [index, content] of CONTENT.entries()) {
    const meta = PEOPLE.courses.find((c) => c.key === content.key)!;
    const teacher = teachers.get(meta.teacher)!;
    const group = groups.get(meta.group)!;
    const createdMs = daysAgo(68 - index * 0.5);
    const course: Course = {
      id: id(),
      teacher_id: teacher.id,
      name: content.name,
      description: content.description,
      class_code: meta.class_code,
      class_code_active: content.key !== "calculo-uni",
      created_at: iso(createdMs),
      settings: { ...meta.settings, updated_at: iso(createdMs + DAY) }
    };
    state.courses.push(course);
    courses.set(content.key, course);
    state.dashboard.set(course.id, "live");

    // Material: the two main documents validated, the supplement as SUPPLEMENT says.
    const fragments = new Map<string, Frag>();
    for (const [n, source] of content.documents.entries()) {
      const outcome = n < 2 ? "validated" : SUPPLEMENT[content.key];
      const uploadedMs = n < 2 ? createdMs + (n + 1) * 3_600_000 : daysAgo(2 + (index % 5));
      const text = source.sections.map((s) => s.text).join("\n");
      const doc: Doc = {
        id: id(),
        course_id: course.id,
        file_name: source.file_name,
        file_type: source.file_type,
        size_bytes: source.page_count ? source.page_count * (source.file_type === "pdf" ? 48_213 : 21_407) : text.length * 2,
        page_count: source.page_count,
        processing_status: outcome === "processing" ? "processing" : outcome === "error" ? "error" : "ready",
        error_reason: outcome === "error" ? "no_readable_text" : null,
        validation_status: outcome === "validated" || outcome === "excluded" ? outcome : "pending_validation",
        validated_by: outcome === "validated" || outcome === "excluded" ? teacher.id : null,
        validated_at: outcome === "validated" || outcome === "excluded" ? iso(uploadedMs + DAY) : null,
        uploaded_at: iso(uploadedMs)
      };
      state.documents.push(doc);
      if (doc.processing_status !== "ready") continue;
      for (const [position, section] of source.sections.entries()) {
        const fragment: Frag = {
          id: id(),
          document_id: doc.id,
          position: position + 1,
          section: section.title,
          location_label: section.page ? `p. ${section.page} · ${section.title}` : `§ ${section.title}`,
          text: section.text,
          excluded: false
        };
        state.fragments.push(fragment);
        fragments.set(`${source.file_name}#${section.title}`, fragment);
      }
    }

    // Topics, each confirmed on its section; the validated supplement is suggested for one.
    const topics = content.topics.map((t, position) => {
      const topic = { id: id(), course_id: course.id, name: t.name, position: position + 1 };
      state.topics.push(topic);
      const fragment = fragments.get(`${t.document}#${t.section}`)!;
      state.assignments.push({ id: id(), course_id: course.id, topic_id: topic.id, document_id: fragment.document_id, section: t.section, status: "confirmed" });
      return { ...t, topic, fragment };
    });
    const supplement = content.documents[2];
    if (SUPPLEMENT[content.key] === "validated") {
      const fragment = fragments.get(`${supplement.file_name}#${supplement.sections[0].title}`)!;
      state.assignments.push({ id: id(), course_id: course.id, topic_id: topics[1].topic.id, document_id: fragment.document_id, section: fragment.section, status: "suggested" });
    }

    // Question bank: reviewed for the first four topics, the last one's drafts still pending.
    const approved = new Map<string, Question[]>();
    for (const [n, t] of topics.entries()) {
      const pending = n === topics.length - 1;
      const made = t.quiz.map((q, k): Question => {
        const createdAt = iso(createdMs + (n * 9 + 2) * DAY);
        return {
          id: id(),
          course_id: course.id,
          topic_id: t.topic.id,
          statement: q.statement,
          options: q.options,
          correct_option: q.correct,
          explanation: q.explanation,
          difficulty: q.difficulty,
          status: pending ? "pending" : n === 3 && k === 2 && index % 3 === 0 ? "rejected" : "approved",
          origin: (n + k) % 4 === 3 ? "edited" : "ai",
          cited: [t.fragment.id],
          reviewed_at: pending ? null : iso(Date.parse(createdAt) + DAY),
          created_at: createdAt
        };
      });
      state.questions.push(...made);
      approved.set(t.topic.id, made.filter((q) => q.status === "approved"));
    }

    // Pre/post test: the first approved question of each reviewed topic.
    const plan = TESTS[content.key];
    const testQuestions = plan
      ? topics.slice(0, 4).map((t, position) => {
          const q = approved.get(t.topic.id)![0];
          const question = { id: id(), course_id: course.id, topic_id: t.topic.id, topic_name: t.name, position: position + 1, statement: q.statement, options: q.options, correct_option: q.correct_option };
          state.testQuestions.push(question);
          return question;
        })
      : [];
    if (plan) {
      const preOpened = createdMs + 3 * DAY;
      state.testPhases.set(`${course.id}:pre`, { status: plan.pre, opened_at: iso(preOpened), closed_at: plan.pre === "closed" ? iso(preOpened + 10 * DAY) : null });
      if (plan.post) state.testPhases.set(`${course.id}:post`, { status: "open", opened_at: iso(daysAgo(5)), closed_at: null });
    }

    // Students: the group's class list, each with their own profile and activity.
    for (const student of group.users) {
      const rng = random(`${content.key}:${student.email}`);
      const lucas = student.email === "alumno@docentai.local";
      let profile = rng.chance(0.7) ? traitOf(student) : profileOf(rng);
      if (lucas) profile = content.key === "algebra-3b" ? "struggling" : "regular";
      const joinedMs = createdMs + (rng.int([1, 6]) + rng.next()) * DAY;
      const revoked = student === leaver;
      const active = profile !== "silent";
      state.enrolments.push({
        course_id: course.id,
        student_id: student.id,
        status: revoked ? "revoked" : "active",
        joined_at: iso(joinedMs),
        disclosure_acknowledged_at: active ? iso(joinedMs + 600_000) : null
      });
      if (!state.consent.some((c) => c.student_id === student.id)) {
        state.consent.push({ student_id: student.id, action: "given", version: "2026-10", created_at: iso(joinedMs) });
      }
      if (!active) continue;

      const b = BEHAVIOUR[profile];
      // Lucas has not been back to Álgebra for 9 days, and most of his exercises went wrong.
      const endMs = daysAgo(lucas && content.key === "algebra-3b" ? 9 : rng.int(b.idle) + rng.next());
      const startMs = Math.max(joinedMs, daysAgo(ACTIVE_DAYS));
      const when = (recent = false) => {
        const from = recent ? Math.max(startMs, endMs - 13 * DAY) : startMs;
        return during(rng, from + rng.next() * Math.max(0, endMs - from));
      };
      // Topics follow the course calendar: later dates, later topics.
      const topicAt = (ms: number, reviewedOnly = false) => {
        const share = (ms - daysAgo(ACTIVE_DAYS)) / (ACTIVE_DAYS * DAY);
        const last = reviewedOnly ? topics.length - 2 : topics.length - 1;
        return topics[Math.max(0, Math.min(last, Math.floor(share * topics.length + (rng.next() - 0.5))))];
      };

      for (let n = rng.int(b.chats); n > 0; n -= 1) {
        let at = when();
        const conversation = { id: id(), course_id: course.id, student_id: student.id, started_at: iso(at), last_message_at: iso(at) };
        state.conversations.push(conversation);
        const exchanges = rng.int([1, 3]);
        for (let k = 0; k < exchanges; k += 1) {
          const t = topicAt(at);
          const offTopic = rng.chance(0.07);
          const question = offTopic ? rng.pick(content.off_topic) : rng.pick(t.questions);
          const base = { conversation_id: conversation.id, status: "sent" as const, request_solution: false };
          const ask: Msg = { ...base, id: id(), author: "student", kind: "question", text: typeof question === "string" ? question : question.question, hint_number: null, counts_toward_limit: true, created_at: iso(at), cited: [] };
          at += (20 + rng.next() * 40) * 1000;
          const policy = course.settings.solution_policy;
          const hint = policy === "hints_only" || (policy === "hints_first" && k === 0);
          const answer: Msg = offTopic
            ? { ...base, id: id(), author: "tutor", kind: "no_source", text: "El material del curso no cubre esta pregunta. Prueba a reformularla o pregúntale a tu profesor/a.", hint_number: null, counts_toward_limit: false, created_at: iso(at), cited: [] }
            : { ...base, id: id(), author: "tutor", kind: hint ? "hint" : "answer", text: typeof question === "string" ? "" : question.answer, hint_number: hint ? 1 : null, counts_toward_limit: false, created_at: iso(at), cited: [t.fragment.id] };
          state.messages.push(ask, answer);
          conversation.last_message_at = iso(at);
          at += (2 + rng.next() * 6) * 60_000;
        }
      }

      const exercises = rng.int(b.exercises);
      for (let n = exercises; n > 0; n -= 1) {
        // The first is their latest activity; half of a struggling student's are recent, so
        // the error rate shows.
        const at = n === exercises ? during(rng, endMs) : when(profile === "struggling" && n % 2 === 0);
        const t = topicAt(at);
        const exercise = rng.pick(t.exercises);
        const roll = rng.next();
        const verdict: Submission["verdict"] = roll < b.correct ? "correct" : roll < b.correct + b.partial ? "partially_correct" : "incorrect";
        const mistake = verdict !== "correct";
        state.submissions.push({
          id: id(),
          course_id: course.id,
          student_id: student.id,
          problem_statement: exercise.statement,
          worked_answer: mistake ? exercise.wrong_answer : exercise.correct_answer,
          verdict,
          mistake_location: mistake ? exercise.mistake_location : null,
          error_type: mistake ? exercise.error_type : null,
          topic_id: t.topic.id,
          topic_name: t.name,
          explanation: mistake ? exercise.explanation : rng.pick(PRAISE),
          explanation_kind: "answer",
          cited: [t.fragment.id],
          saved: mistake,
          created_at: iso(at)
        });
      }

      for (let n = rng.int(b.quizzes); n > 0; n -= 1) {
        let at = when();
        const t = topicAt(at, true);
        const questions = approved.get(t.topic.id)!;
        const quiz: Quiz = {
          id: id(),
          course_id: course.id,
          student_id: student.id,
          topic_id: t.topic.id,
          topic_name: t.name,
          status: "completed",
          question_count: questions.length,
          level: 2,
          streak: 0,
          started_at: iso(at),
          completed_at: null,
          items: []
        };
        for (const [position, q] of questions.entries()) {
          at += (30 + rng.next() * 60) * 1000;
          const right = rng.chance(b.quizRight);
          quiz.items.push({
            question_id: q.id,
            position: position + 1,
            topic_id: t.topic.id,
            topic_name: t.name,
            statement: q.statement,
            options: q.options,
            correct_option: q.correct_option,
            explanation: q.explanation,
            difficulty: q.difficulty,
            choice: right ? q.correct_option : (q.correct_option + 1 + rng.int([0, 2])) % q.options.length,
            correct: right,
            answered_at: iso(at)
          });
          quiz.streak = right ? quiz.streak + 1 : 0;
        }
        quiz.completed_at = iso(at);
        state.quizzes.push(quiz);
      }

      // Test answers: most students took the pre-test; some already the post-test.
      for (const phase of ["pre", "post"] as const) {
        const row = state.testPhases.get(`${course.id}:${phase}`);
        if (!row || revoked || (phase === "post" && (lucas || !rng.chance(0.4))) || (phase === "pre" && !rng.chance(0.9))) continue;
        const openedMs = Date.parse(row.opened_at!);
        const submittedMs = during(rng, Math.min(nowMs - DAY, openedMs + rng.next() * 6 * DAY));
        const odds = phase === "pre" ? b.quizRight - 0.2 : b.quizRight;
        state.testAttempts.push({
          course_id: course.id,
          student_id: student.id,
          phase,
          submitted_at: iso(Math.max(openedMs + 3_600_000, submittedMs)),
          answers: testQuestions.map((q) => {
            const right = rng.chance(odds);
            return { question_id: q.id, choice: right ? q.correct_option : (q.correct_option + 2) % 4, correct: right };
          })
        });
      }
    }

    // The teacher's corrections of a few tutor answers and exercise feedback.
    const rng = random(`flags:${content.key}`);
    const answers = state.messages.filter((m) => m.kind === "answer" && state.conversations.find((c) => c.id === m.conversation_id)?.course_id === course.id);
    const feedback = state.submissions.filter((s) => s.course_id === course.id && s.verdict === "incorrect");
    for (const [n, correction] of CORRECTIONS.entries()) {
      const target = correction.category === "incorrect" ? rng.pick(feedback) : rng.pick(answers);
      if (!target) continue;
      const createdAt = iso(Math.min(nowMs - 3_600_000, Date.parse(target.created_at) + (n + 1) * 3_600_000));
      state.flags.push({
        id: id(),
        course_id: course.id,
        message_id: "conversation_id" in target ? target.id : null,
        submission_id: "conversation_id" in target ? null : target.id,
        category: correction.category,
        correction: correction.text,
        author_id: teacher.id,
        created_at: createdAt,
        updated_at: createdAt
      });
    }
  }

  // Each teacher tags their courses by class group; some courses are starred.
  for (const [key, course] of courses) {
    const meta = PEOPLE.courses.find((c) => c.key === key)!;
    const group = groups.get(meta.group)!;
    let tag = state.tags.find((t) => t.user_id === course.teacher_id && t.name === group.label);
    if (!tag) {
      tag = { id: id(), user_id: course.teacher_id, name: group.label, color: group.tag_color };
      state.tags.push(tag);
    }
    state.tagLinks.add(`${tag.id}:${course.id}`);
  }
  for (const [email, keys] of Object.entries(FAVORITES)) {
    const user = userBy(email)!;
    for (const key of keys) state.favorites.add(`${user.id}:${courses.get(key)!.id}`);
  }
  const lucas = userBy("alumno@docentai.local")!;
  const review = { id: id(), user_id: lucas.id, name: "Repasar", color: "amber" as const };
  state.tags.push(review);
  for (const key of ["algebra-3b", "lengua-3b"]) state.tagLinks.add(`${review.id}:${courses.get(key)!.id}`);
  return state;
}

// On globalThis, so every bundle in one process (the proxy and the app) shares one state.
const store = globalThis as typeof globalThis & { __docentaiDemo?: { state: State; built: number } };

function current(): State {
  if (!store.__docentaiDemo || Date.now() - store.__docentaiDemo.built > RESET_MS) {
    store.__docentaiDemo = { state: build(), built: Date.now() };
  }
  return store.__docentaiDemo.state;
}

/** Answers one request of the app's API or Auth client from the demo state. */
export async function handleDemo(request: Request): Promise<Response> {
  const state = current();
  // Visitors only reach the API and Auth endpoints, not the test helpers.
  if (new URL(request.url).pathname.startsWith("/__test/")) return new Response(null, { status: 404 });
  return createHandler(() => state)(request);
}
