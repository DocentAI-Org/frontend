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

export type State = {
  users: User[];
  courses: Course[];
  enrolments: Enrolment[];
  consent: { student_id: string; action: "given" | "revoked"; version: string; created_at: string }[];
  /** Messages used today per student (shared across courses). */
  usage: Map<string, number>;
  /** Named faults tests can switch on, e.g. "expire_sessions", "tutor_unavailable". */
  faults: Set<string>;
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
    consent: [],
    usage: new Map(),
    faults: new Set()
  };
}

export const state: { current: State } = { current: seed() };
