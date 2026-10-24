---
description: "Task list for 002-app-api-integration"
---

# Tasks: DocentAI App — P1 Screens Connected to the API v1

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[contracts/routes.md](contracts/routes.md), [data-model.md](data-model.md)

**Tests**: mandatory (Constitution V). In every story the tests come first and are seen failing.
Every acceptance scenario in scope (001 stories minus deviations, plus this spec) gets one E2E
test with axe, titled with its ID (e.g. `001-US2-AS5`, `002-US3-AS1`).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Add the dependencies of research R10 and scripts `api:types`, `api:check`,
  `test:e2e:app`, `test:e2e:integration` in `package.json`
- [x] T002 [P] Generate `src/lib/api/schema.d.ts` from
  `specs/002-app-api-integration/contracts/backend-openapi.json`; `api:check` fails when stale
- [x] T003 [P] Vitest config for `tests/app/unit/**/*.test.{ts,tsx}` (jsdom, React) alongside the
  prototype suites in `vitest.config.ts`
- [x] T004 [P] `playwright.app.config.ts` (desktop 1440 / mobile 390, webServer: mock API + app)
- [x] T005 [P] `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
  `API_BASE_URL`, `PSEUDONYM_EMAIL_DOMAIN`; remove `NEXT_PUBLIC_API_BASE_URL`
- [ ] T006 CI: add `api:check` and the app E2E suite to `.github/workflows/ci.yml`

## Phase 2: Foundational (blocks every story)

- [x] T007 [P] Unit tests: identifier → auth email (`tests/app/unit/identifier.test.ts`), error
  code → message key mapper (`errors.test.ts`), catalog key parity ES/EN (`messages.test.ts`)
- [x] T008 `src/lib/auth/identifier.ts`, `src/lib/api/errors.ts`
- [x] T009 `messages/es.json`, `messages/en.json` seeded from the prototype catalogs, plus
  `errors.*` keys; `src/i18n/request.ts`; root `layout.tsx` with `NextIntlClientProvider`
- [x] T010 `src/lib/auth/supabase.ts` (server client, cookies) and `src/proxy.ts` (refresh,
  signed-out redirect with `next`)
- [x] T011 `src/lib/api/client.ts` (openapi-fetch, bearer from the session, `server-only`,
  401 → sign-in redirect) and `src/lib/api/me.ts`
- [x] T012 Typed mock backend `tests/app/mock-api/` (server, seeded admin/teacher/students, auth
  endpoints, state reset endpoint for tests) and E2E helpers (`signInAs`, `axeCheck`)
- [x] T013 [P] Port shared components with the prototype names and states into
  `src/components/` (shells per role, `AppFooter` with IMFAHE, `LanguageSwitcher`, `EmptyState`,
  `ErrorState`, `LoadingState`, `ConfirmDialog`, `CopyButton`, `StatusBadge`), each with a
  component test

**Checkpoint**: app boots, mock API serves `/v1/me`, catalogs pass parity.

## Phase 3: US1 — Sign-in and role areas (P1) 🎯

- [x] T014 [US1] E2E: 001-US7-AS1…AS3, AS5, AS7; 002-US1-AS1…AS3, AS5 in `tests/app/e2e/us1-auth.spec.ts`
- [x] T015 [US1] `(public)` routes: `/entrar` (+ session-expired state), `/recuperar`,
  `/acceso-denegado`, `/acerca`; sign-in/sign-out/recover Server Actions
- [x] T016 [US1] Role group layouts `(admin)`, `(teacher)`, `(student)` with server role check;
  `/` home redirect; language switch saved to the profile

## Phase 4: US9 — Admin area (P1)

- [x] T017 [US9] Prototype first: `public/prototype/admin/students-new.html` (#35) with states
  default, loading, validation error, created, error; add to `pages.json`, catalogs and the
  prototype test sweep
- [x] T018 [US9] E2E: 001-US7-AS6 (with deviation D3), 002-US1-AS4, 002-US9-AS1…AS2 in
  `tests/app/e2e/us9-admin.spec.ts`
- [x] T019 [US9] `/admin/usuarios`, `/admin/cursos`, `/admin/profesores/nuevo`,
  `/admin/estudiantes/nuevos` (CSV download client-side), `src/lib/api/admin.ts`

## Phase 5: US2 — Courses and enrolment (P1)

- [x] T020 [US2] E2E: 001-US4-AS1…AS6, 002-US2-AS1…AS2 in `tests/app/e2e/us2-courses.spec.ts`
- [x] T021 [US2] `src/lib/api/courses.ts`; teacher `/profesor/cursos`, `/nuevo`, `/[id]`
  (codes, regenerate/disable, students, revoke)
- [x] T022 [US2] Student `/alumno/cursos`, `/alumno/unirse`, `/unirse/[codigo]` (return after
  sign-in), study consent page `/alumno/consentimiento` and the consent guard (001-US7-AS4)

## Phase 6: US3 — Material (P1)

- [x] T023 [US3] E2E: 001-US2-AS1…AS8, 002-US3-AS1…AS4 in `tests/app/e2e/us3-material.spec.ts`
- [x] T024 [US3] `src/lib/api/documents.ts`; `/profesor/cursos/[id]/material` with upload,
  per-file progress, error reasons, validate/exclude/remove dialogs, no-validated warning,
  duplicate-name dialog (client-side check)
- [x] T025 [US3] `DocumentStatusPoller` client component (FR-008) with a component test
- [x] T026 [US3] `/profesor/cursos/[id]/material/[documento]`: fragments (all pages), search,
  exclude/include, open original file

## Phase 7: US4 — Tutor settings (P1)

- [x] T027 [US4] E2E: 001-US3-AS1…AS4, 002-US4-AS1 in `tests/app/e2e/us4-settings.spec.ts`
- [x] T028 [US4] `src/lib/api/tutor.ts`; `/profesor/cursos/[id]/tutor` with example exchange,
  unsaved-changes guard, retry on failure

## Phase 8: US6 — Student chat and guided mode (P1)

- [x] T029 [US6] E2E: 001-US1-AS1…AS9, 001-US5-AS1…AS4 (deviation D6), 002-US6-AS1…AS5 in
  `tests/app/e2e/us6-chat.spec.ts`
- [x] T030 [US6] `src/lib/api/chat.ts`; chat route with conversation list, disclosure dialog,
  tutor-information panel, allowance banner (normal/low/reached)
- [x] T031 [US6] Chat components with tests: `MessageList`, `TutorMessage` (answer/hint/no-source,
  correction), `SourceCitation` + citation sheet (available/unavailable), `Composer` (pending,
  failed + retry, "Otra pista", "Ver solución" by policy)

## Phase 9: US7 — Exercises (P1)

- [ ] T032 [US7] E2E: 001-US6-AS1…AS4, AS6, AS7 (deviation D2), 002-US7-AS1 in
  `tests/app/e2e/us7-exercises.spec.ts`
- [ ] T033 [US7] `src/lib/api/exercises.ts`; `/alumno/cursos/[id]/ejercicio` (review before
  send) and `/ejercicios/[envio]` (stub notice)

## Phase 10: US5 — Topics (P1)

- [ ] T034 [US5] E2E: 001-US14 scenarios (deviation D5), 002-US5-AS1…AS2 in
  `tests/app/e2e/us5-topics.spec.ts`
- [ ] T035 [US5] `src/lib/api/topics.ts`; `/profesor/cursos/[id]/temas` (CRUD, reorder,
  unassigned) and `/temas/asignacion`

## Phase 11: US8 — Review and corrections (P1)

- [x] T036 [US8] E2E: 001-US8-AS1…AS7 (deviation D4), 002-US8-AS1 in
  `tests/app/e2e/us8-review.spec.ts`
- [x] T037 [US8] `src/lib/api/review.ts`; `/profesor/cursos/[id]/conversaciones` (filters,
  markers, submissions), conversation and feedback detail with flag dialog, preview, edit, remove
- [x] T038 [US8] `/profesor/cursos/[id]/correcciones` (flags list, links back)

## Phase 12: Profile and consent (P1, US1/US7)

- [x] T039 E2E: 001-US7-AS4 revocation, FR-015 in `tests/app/e2e/profile.spec.ts`
- [x] T040 `/alumno/perfil`: profile, language, consent history, revoke with confirmation

## Phase 13: Polish

- [ ] T041 [P] Role-separation E2E over every route × role (SC-006)
- [ ] T042 [P] Mobile pass at 390 px for every student page and the key teacher/admin pages
- [x] T043 Re-pin `backend-openapi.json` to the backend `main` merge commit; regenerate types
- [ ] T044 Run quickstart B + C against the real local stack; record `validation.md`
- [ ] T045 [P] Update `README.md` (app setup, scripts) and the 001 prototype index (#35)

## Dependencies

- Setup → Foundational → US1 → US9 → US2 → (US3, US4) → US6 → US7 → US5 → US8 → Profile →
  Polish. US3 and US4 can run in parallel; US5 needs US3 (sections). Profile revocation, US8
  "corrected" marker and the flags list need backend PR 002 merged for the integration run (the
  mock already implements them).

## Implementation strategy

Demo-first: Phases 1–8 give the full loop for the December 1st report (sign-in → course →
material → settings → chat). Then exercises, topics, review, profile and polish.
