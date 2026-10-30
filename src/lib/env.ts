import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example).`);
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseKey() {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
  get apiBaseUrl() {
    return required("API_BASE_URL");
  },
  get pseudonymEmailDomain() {
    return process.env.PSEUDONYM_EMAIL_DOMAIN ?? "students.docentai.invalid";
  }
};
