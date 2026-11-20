import "server-only";

import { DEMO_ORIGIN, isDemo } from "@/lib/demo";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example).`);
  return value;
}

export const env = {
  get supabaseUrl() {
    return isDemo() ? DEMO_ORIGIN : required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseKey() {
    return isDemo() ? "demo" : required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
  get apiBaseUrl() {
    return isDemo() ? DEMO_ORIGIN : required("API_BASE_URL");
  },
  get pseudonymEmailDomain() {
    return process.env.PSEUDONYM_EMAIL_DOMAIN ?? "students.docentai.invalid";
  },
  /** The study questionnaires card on "Mis cursos" (P4, specs/013): hidden unless "on". */
  get studyQuestionnaires() {
    return process.env.STUDY_QUESTIONNAIRES === "on";
  }
};
