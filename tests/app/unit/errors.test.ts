import { describe, expect, it } from "vitest";

import { API_ERROR_CODES, errorCodeOf, errorMessageKey } from "@/lib/api/errors";

describe("API error mapping", () => {
  it("maps every known code to its own message key", () => {
    for (const code of API_ERROR_CODES) {
      expect(errorMessageKey(code)).toBe(`errors.${code}`);
    }
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(errorMessageKey("brand_new_code")).toBe("errors.unknown");
    expect(errorMessageKey(undefined)).toBe("errors.unknown");
  });

  it("reads the code from the API error body", () => {
    expect(errorCodeOf({ error: { code: "daily_limit_reached", message: "x", details: null } })).toBe(
      "daily_limit_reached"
    );
    expect(errorCodeOf({ detail: "not our schema" })).toBeUndefined();
    expect(errorCodeOf(null)).toBeUndefined();
  });

  it("knows every code the backend contract documents", () => {
    expect(API_ERROR_CODES).toEqual(
      expect.arrayContaining([
        "unauthenticated",
        "forbidden",
        "not_found",
        "validation_error",
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
        "api_unreachable"
      ])
    );
  });
});
