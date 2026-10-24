# Implementation Plan: DocentAI App — P1 Screens Connected to the API v1

**Branch**: `002-app-api-integration` | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

## Summary

Build the P1 screens of the validated prototype as a Next.js 16 App Router app wired to the
DocentAI API v1: cookie-based Supabase Auth with pseudonymous sign-in, one route group per role
guarded on the server, Server Components reading through a typed `src/lib/api` layer generated
from the pinned backend contract, Server Actions for mutations, `next-intl` for ES/EN, and
Playwright E2E tests with axe against a typed mock backend. One new admin screen (pseudonymous
accounts) is first added to the prototype.

## Technical Context

**Language/Version**: TypeScript (strict), React 19.3, Next.js 16.3 (App Router), Tailwind CSS
4.3 with the shared `@theme` tokens of `public/prototype/assets/theme.css`.

**Primary Dependencies**: `@supabase/ssr`, `@supabase/supabase-js`, `openapi-fetch`, `next-intl`,
`server-only`; dev: `openapi-typescript`, `@testing-library/react`, `@testing-library/user-event`
(justified in [research.md R10](research.md#r10-new-dependencies-constitution-ix)).

**Backend contract (pinned, Constitution VI)**: `contracts/backend-openapi.json`, copied from
`DocentAI-Org/backend` at `002-consent-and-flags` (commit `d9875e0`, API v1 + consent and flags).
To be re-pinned to the `main` merge commit once backend PR 002 is merged.

**Storage**: none in the browser beyond the HttpOnly session cookies and the `NEXT_LOCALE`
cookie; no personal data in `localStorage`/`sessionStorage` (Constitution VII).

**Testing**: Vitest + Testing Library (`tests/app/unit`); Playwright + axe (`tests/app/e2e`)
against the typed mock backend (`tests/app/mock-api`), desktop 1440 px and mobile 390 px
projects; optional integration run against the real local stack. The prototype suites
(`tests/prototype/**`) stay as they are.

**Target Platform**: last 2 versions of Chrome, Edge, Firefox, Safari; desktop-first, fully usable
at 390 px; Vercel previews.

**Project Type**: web application (frontend of a separate API).

**Performance Goals**: course chat usable within 3 s on a mid-range phone (SC-005); Server
Components by default to keep client JavaScript small.

**Constraints**: WCAG 2.2 AA; ES and EN complete; tokens only (no hard-coded visual values);
server-side role checks; generated API types only.

**Scale/Scope**: 29 routes (28 prototype screens + 1 new), 4 route groups; pilot scale (≤ 60
students, a few teachers).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre | Post | Evidence |
|---|---|---|---|
| I. Teacher control & transparency | ✅ | ✅ | Citations and "no cubierto" pattern from API `kind`/`citations`; materials show validation state and validator; flags list and corrected markers (backend 002) |
| II. Role separation | ✅ | ✅ | Route groups `(admin)`, `(teacher)`, `(student)` with server layouts checking `/v1/me`; proxy redirects signed-out users; every story names its role ([routes](contracts/routes.md)) |
| III. Accessibility WCAG 2.2 AA | ✅ | ✅ | Prototype components ported with their semantics; every E2E test runs axe on desktop and mobile; reduced motion respected |
| IV. Design system first | ✅ | ✅ | Same `theme.css` tokens and component names as the prototype; new admin screen added to the prototype first (R8); each route links its prototype page |
| V. Test-first | ✅ | ✅ | Vitest + Testing Library and Playwright; one E2E per acceptance scenario; tests before implementation in tasks.md |
| VI. Typed backend contract | ✅ | ✅ | `openapi-typescript` + `openapi-fetch` from the pinned contract; all calls in `src/lib/api` (`server-only`); typed mock backend; loading/empty/error states from the prototype |
| VII. Privacy by design | ✅ | ✅ | HttpOnly cookie sessions; no analytics; minimum data per view (API already scoped); study consent explicit and revocable (backend 002) |
| VIII. Bilingual | ✅ | ✅ | `next-intl`, catalogs from the prototype's, key-parity test fails CI, locale-aware dates/numbers |
| IX. Simplicity | ✅ | ✅ | Server Components by default; client components only for interaction; 6 runtime/dev deps justified (R10) |

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-app-api-integration/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/routes.md · contracts/backend-openapi.json (pinned)
├── checklists/requirements.md
└── tasks.md
```

### Source Code

```text
src/
├── proxy.ts                         # session refresh + signed-out redirect
├── i18n/request.ts                  # next-intl config (locale from cookie/profile)
├── lib/
│   ├── api/
│   │   ├── schema.d.ts              # generated, never edited
│   │   ├── client.ts                # openapi-fetch + bearer from the session (server-only)
│   │   ├── errors.ts                # API error codes → message keys
│   │   └── me.ts courses.ts documents.ts tutor.ts topics.ts chat.ts exercises.ts review.ts admin.ts consent.ts
│   └── auth/
│       ├── supabase.ts              # @supabase/ssr server client
│       └── identifier.ts            # email or pseudonymous code → auth email
├── components/                      # same names as the prototype (SourceCitation, ValidationStatus…)
└── app/
    ├── layout.tsx                   # html lang, fonts, NextIntlClientProvider
    ├── page.tsx                     # role home redirect
    ├── (public)/entrar · recuperar · acceso-denegado · acerca
    ├── (student)/layout.tsx         # role + consent guard, student shell
    │   ├── unirse/[codigo]
    │   └── alumno/consentimiento · cursos · unirse · perfil · cursos/[id]/…
    ├── (teacher)/layout.tsx         # role guard, teacher shell
    │   └── profesor/cursos/…
    └── (admin)/layout.tsx           # role guard, admin shell
        └── admin/usuarios · profesores/nuevo · estudiantes/nuevos · cursos

messages/es.json · messages/en.json
public/prototype/admin/students-new.html   # new prototype page (#35)

tests/app/
├── unit/                            # Vitest + Testing Library
├── e2e/                             # Playwright + axe, one file per story
└── mock-api/                        # typed mock of /v1 and the Supabase Auth endpoints
```

**Structure Decision**: a single Next.js app in the existing repository. App code under `src/`,
app tests under `tests/app/` next to the prototype's `tests/prototype/`. Playwright gets two
configs: the existing prototype one and `playwright.app.config.ts`.

## Complexity Tracking

None.
