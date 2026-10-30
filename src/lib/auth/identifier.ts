/**
 * Students may sign in with a pseudonymous code instead of an email (spec FR-004). Supabase Auth
 * needs an email, so a code maps to `<code>@<domain>`, the rule the backend uses when it creates
 * those accounts (backend research R8).
 */
export function toAuthEmail(identifier: string, pseudonymDomain: string): string | null {
  const value = identifier.trim().toLowerCase();
  if (!value) return null;
  return value.includes("@") ? value : `${value}@${pseudonymDomain}`;
}
