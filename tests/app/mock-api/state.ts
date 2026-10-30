// In-memory state of the mock DocentAI backend. Types come from the generated contract, so a
// contract change that breaks the app also breaks the mock (Constitution VI).
import type { components } from "../../../src/lib/api/schema.d.ts";

export type S = components["schemas"];
export type Role = S["Me"]["role"];

export type User = {
  id: string;
  email: string;
  password: string;
  role: Role;
  display_name: string;
  pseudonym_code: string | null;
  status: "active" | "disabled";
  preferred_language: "es" | "en";
  created_at: string;
};

export const PASSWORD = "docentai-dev-password";

export type Course = {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  class_code: string;
  class_code_active: boolean;
  created_at: string;
  settings: S["TutorSettings"];
};

export type Enrolment = {
  course_id: string;
  student_id: string;
  status: "active" | "revoked";
  joined_at: string;
  disclosure_acknowledged_at: string | null;
};

export type Doc = {
  id: string;
  course_id: string;
  file_name: string;
  file_type: "pdf" | "docx" | "markdown";
  size_bytes: number;
  page_count: number | null;
  processing_status: "processing" | "ready" | "error";
  error_reason: S["Document"]["error_reason"];
  validation_status: "pending_validation" | "validated" | "excluded";
  validated_by: string | null;
  validated_at: string | null;
  uploaded_at: string;
};

export type Frag = {
  id: string;
  document_id: string;
  position: number;
  section: string;
  location_label: string;
  text: string;
  excluded: boolean;
};

export type Conversation = { id: string; course_id: string; student_id: string; started_at: string; last_message_at: string };

export type Msg = {
  id: string;
  conversation_id: string;
  author: "student" | "tutor";
  kind: "question" | "answer" | "hint" | "no_source";
  status: "sent" | "failed";
  text: string;
  hint_number: number | null;
  request_solution: boolean;
  counts_toward_limit: boolean;
  created_at: string;
  /** Fragment ids cited by a tutor message. */
  cited: string[];
};

export type Flag = {
  id: string;
  course_id: string;
  message_id: string | null;
  submission_id: string | null;
  category: "incorrect" | "poor";
  correction: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  course_id: string;
  student_id: string;
  problem_statement: string;
  worked_answer: string;
  verdict: "correct" | "partially_correct" | "incorrect" | "not_assessed";
  mistake_location: string | null;
  error_type: string | null;
  topic_id: string | null;
  topic_name: string | null;
  explanation: string;
  explanation_kind: "answer" | "no_source";
  cited: string[];
  /** In the learning record (a mistake with a known error type). */
  saved: boolean;
  created_at: string;
};

export type Topic = { id: string; course_id: string; name: string; position: number };
export type Assignment = {
  id: string;
  course_id: string;
  topic_id: string;
  document_id: string;
  section: string | null;
  status: "suggested" | "confirmed";
};

export type State = {
  users: User[];
  courses: Course[];
  enrolments: Enrolment[];
  documents: Doc[];
  fragments: Frag[];
  conversations: Conversation[];
  messages: Msg[];
  flags: Flag[];
  submissions: Submission[];
  topics: Topic[];
  assignments: Assignment[];
  consent: { student_id: string; action: "given" | "revoked"; version: string; created_at: string }[];
  /** Messages used today per student (shared across courses). */
  usage: Map<string, number>;
  /** Named faults tests can switch on, e.g. "expire_sessions", "tutor_unavailable". */
  faults: Set<string>;
  /** What the next exercise feedback looks like (backend specs/003), set by /__test/feedback. */
  feedback: { mode: "mistake" | "correct" | "fail"; delay_ms: number };
  /** What each course's dashboard looks like (backend specs/004), set by /__test/dashboard. */
  dashboard: Map<string, "busy" | "quiet" | "calm">;
};

export const CONSENT_VERSION = "2026-10";
export const DAILY_LIMIT = 30;

let counter = 0;
export function id(): string {
  counter += 1;
  return `00000000-0000-4000-8000-${counter.toString(16).padStart(12, "0")}`;
}

export function now(): string {
  return new Date().toISOString();
}

function user(role: Role, email: string, display_name: string, pseudonym_code: string | null = null): User {
  return {
    id: id(),
    email,
    password: PASSWORD,
    role,
    display_name,
    pseudonym_code,
    status: "active",
    preferred_language: "es",
    created_at: now()
  };
}

/** Same demo users as the backend seed script, so tests also run against the real stack. */
export function seed(): State {
  return {
    users: [
      user("admin", "admin@docentai.local", "Admin DocentAI"),
      user("teacher", "profesora@docentai.local", "Prof. Elena Ruiz"),
      user("student", "alumno@docentai.local", "Lucas Herrera"),
      user("teacher", "otro.profesor@docentai.local", "Prof. Otro"),
      user("student", "est-demo1@students.docentai.invalid", "EST-DEMO1", "EST-DEMO1")
    ],
    courses: [],
    enrolments: [],
    documents: [],
    fragments: [],
    conversations: [],
    messages: [],
    flags: [],
    submissions: [],
    topics: [],
    assignments: [],
    consent: [],
    usage: new Map(),
    faults: new Set(),
    feedback: { mode: "mistake", delay_ms: 0 },
    dashboard: new Map()
  };
}

export const state: { current: State } = { current: seed() };
