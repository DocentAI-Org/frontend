# Tasks: English as the Base Language — Routes and Default Locale

**Spec**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md)

## Phase 1: Tests first

- [x] T001 [P] Unit: `Accept-Language` matching (quality values, regional tags, unsupported and
  malformed headers) in `tests/app/unit/locales.test.ts`
- [x] T002 [P] Unit: no Spanish path, query parameter or anchor in `src/` (SC-001) in
  `tests/app/unit/routes.test.ts`
- [x] T003 E2E: 003-US1-AS1…AS4 and 003-US2-AS1…AS3 in `tests/app/e2e/english-routes.spec.ts`;
  Playwright projects pinned to `es-ES`

## Phase 2: US2 — English default locale

- [x] T004 `DEFAULT_LOCALE = "en"`, `matchLocale()` in `src/i18n/locales.ts`; cookie, then
  `Accept-Language`, then English in `src/i18n/request.ts`

## Phase 3: US1 — English routes

- [x] T005 `git mv` every route folder and dynamic segment to its English name
- [x] T006 Update `params`, query parameters, anchors, `src/lib/routes.ts`, literal links,
  `src/proxy.ts` and `src/lib/api/client.ts`
- [x] T007 Invitation link from `routes.join(class_code)`; `/unirse/:code` redirect in
  `next.config.ts`; mock API `invitation_path`
- [x] T008 Update every E2E path and helper

## Phase 4: Polish

- [x] T009 README and docs paths; 002 quickstart walkthrough against the real stack (SC-003)
