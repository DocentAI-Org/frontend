# Validation: Student Erasure on Request

**Date**: 2026-11-07

## Mock API

- `tests/app/e2e/student-erasure.spec.ts`: 10 passed (desktop and mobile), with axe on the list,
  the dialog, the success and the error messages.
- Full app E2E: 403 of 404 passed. The one failure, `001-US14-AS2` on mobile (dragging a topic
  handle), fails the same way on `main` in this Windows environment after updating Playwright; it is
  not touched by this change.
- Unit tests: 286 passed (2 new for the typed confirmation).

## Real stack

Backend `017-student-erasure` (DocentAI-Org/backend#27) on port 8077, local Supabase,
`next dev` on port 3000, `E2E_TARGET=integration`.

- 017-US1-AS1…AS3 and 017-US2-AS1: 8 passed (desktop and mobile). Each scenario creates its own
  pseudonymous student and erases it, so the seeded users are left alone.
- 017-US1-AS4 (API failure) needs the mock's fault switch; it is covered there only.
