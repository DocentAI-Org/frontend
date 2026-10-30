/**
 * Error codes of the DocentAI API (backend contracts/api.md). The API returns codes, never
 * user-facing copy: each code has a translated message under `errors.<code>` (spec FR-006).
 */
export const API_ERROR_CODES = [
  "unauthenticated",
  "forbidden",
  "not_found",
  "validation_error",
  "conflict",
  "class_code_invalid",
  "class_code_disabled",
  "enrolment_revoked",
  "unsupported_file_type",
  "file_too_large",
  "document_not_ready",
  "topic_name_taken",
  "disclosure_not_acknowledged",
  "consent_required",
  "daily_limit_reached",
  "solution_not_allowed",
  "tutor_unavailable",
  "not_a_tutor_message",
  "email_taken",
  "auth_unavailable",
  "storage_unavailable",
  // Raised by the app when the API cannot be reached at all.
  "api_unreachable"
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const KNOWN = new Set<string>(API_ERROR_CODES);

export function errorMessageKey(code: string | undefined): string {
  return code && KNOWN.has(code) ? `errors.${code}` : "errors.unknown";
}

export function errorCodeOf(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null || !("error" in body)) return undefined;
  const error = (body as { error: unknown }).error;
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  const code = (error as { code: unknown }).code;
  return typeof code === "string" ? code : undefined;
}
