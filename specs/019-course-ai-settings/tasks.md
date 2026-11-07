# Tasks: AI Settings per Course

**Spec**: [spec.md](spec.md)

Three PRs against `main`, each after its backend PR.

## PR 1 — Limits and models (US1, US2, US3, US6)

- [x] T001 E2E: 019-US1, US2, US3, US6 in `tests/app/e2e/course-ai-settings.spec.ts`
- [x] T002 Pin the backend contract and regenerate the types
- [x] T003 Mock API: study and course AI settings, model catalogue, course allowance
- [x] T004 [US6] "IA del estudio" admin page
- [x] T005 [US1] [US3] "IA" course tab: limits, models and retrieval
- [x] T006 [US2] Course allowance in the student chat and exercises

## PR 2 — Credentials (US4)

- [x] T007 E2E: 019-US4 and US3-AS3; mock API credentials
- [x] T008 "Proveedores de IA" admin page; "Tus claves" in the course tab; notices

## PR 3 — Instructions, test and usage (US5)

- [ ] T009 E2E: 019-US5; mock API test and usage
- [ ] T010 Instructions, retrieval, "Probar" and "Consumo"
