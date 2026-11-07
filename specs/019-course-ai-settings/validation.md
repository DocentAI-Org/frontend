# Validation: AI Settings per Course (PR 1)

**Date**: 2026-11-07

## Mock API

- `tests/app/e2e/course-ai-settings.spec.ts`: 13 scenarios, desktop and mobile, with axe on the
  course tab, the admin page and the student's chat at the limit.
- Full app E2E: 426 of 430 passed. The 4 failures (`001-US2-AS2`, `001-US2-AS4`, `001-US8-AS2` and
  one more) came while the Mac went to sleep (`ERR_NETWORK_IO_SUSPENDED`) and pass when re-run.
- Unit tests: 286 passed; typecheck and lint clean.

## Real stack

The backend half was checked against the real stack (backend `validation.md`). The pages were
only run against the mock API.
