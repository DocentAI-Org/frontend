import { type Route, requireRole } from "../http.ts";
import { CONSENT_VERSION, type State, now } from "../state.ts";

export function consentStatus(state: State, studentId: string) {
  const last = state.consent.filter((e) => e.student_id === studentId).at(-1);
  const active = last?.action === "given";
  return {
    given: active && last.version === CONSENT_VERSION,
    version: active ? last.version : null,
    given_at: active ? last.created_at : null,
    current_version: CONSENT_VERSION
  };
}

export const consentRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/student/consent",
    handler: (ctx) => consentStatus(ctx.state, requireRole(ctx, "student").id)
  },
  {
    method: "POST",
    path: "/v1/student/consent",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      if (!consentStatus(ctx.state, student.id).given) {
        ctx.state.consent.push({ student_id: student.id, action: "given", version: CONSENT_VERSION, created_at: now() });
      }
      return consentStatus(ctx.state, student.id);
    }
  },
  {
    method: "DELETE",
    path: "/v1/student/consent",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      const last = ctx.state.consent.filter((e) => e.student_id === student.id).at(-1);
      if (last?.action === "given") {
        ctx.state.consent.push({ student_id: student.id, action: "revoked", version: last.version, created_at: now() });
      }
      return consentStatus(ctx.state, student.id);
    }
  },
  {
    method: "GET",
    path: "/v1/student/consent/history",
    handler: (ctx) => {
      const student = requireRole(ctx, "student");
      return ctx.state.consent
        .filter((e) => e.student_id === student.id)
        .map(({ action, version, created_at }) => ({ action, version, created_at }));
    }
  }
];
