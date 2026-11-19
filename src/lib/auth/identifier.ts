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

// Labels of the domain never contain a dot, so each character has one way to match and the
// check stays linear even on very long input (a server action accepts up to 1 MB).
const EMAIL = /^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+$/;

/** Whether `value` looks like an email: something, an @, and a domain with a dot. */
export function isEmail(value: string): boolean {
  return EMAIL.test(value);
}
