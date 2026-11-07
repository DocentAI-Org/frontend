# Validation: AI Settings per Course (PR 1)

**Date**: 2026-11-07

## Mock API

- `tests/app/e2e/course-ai-settings.spec.ts`: 13 scenarios, desktop and mobile, with axe on the
  course tab, the admin page and the student's chat at the limit.
- Full app E2E: 426 of 430 passed. The 4 failures came while the Mac went to sleep
  (`ERR_NETWORK_IO_SUSPENDED`); all 4 pass when re-run.
- Unit tests: 286 passed; typecheck and lint clean.

## Real stack

The backend half was checked against the real stack (backend `validation.md`). The pages were
only run against the mock API.

# Validation: Credentials (PR 2)

**Date**: 2026-11-08

- `tests/app/e2e/course-ai-settings.spec.ts`: 19 scenarios (6 new), 38 passed on desktop and
  mobile, with axe on "Proveedores de IA" and the teacher's own keys.
- `roles`, `us9-admin`, `english-routes`, `shell-fixes` and `pedagogy-criteria`: 64 passed.
- Unit tests: 286 passed; typecheck and lint clean.
- The pages were only run against the mock API; the backend half was checked on the real stack.
