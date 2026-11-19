# DocentAI frontend

Next.js app for DocentAI, a teacher-guided AI education platform with three roles: admin, teacher
and student. It talks to the DocentAI API (`DocentAI-Org/backend`) through types generated from
the backend's OpenAPI schema. Product requirements (IDs T#, S#, P#) live in
`DocentAI-Org/knowledge-base`, `docs/requirements.md`; the product and design context in
`PRODUCT.md` and `DESIGN.md`.

The student age range is not decided yet (secondary and/or university), so every rule is written
for the most restrictive case: **students may be minors**.

These are the rules for changing this repository, for people and coding agents alike.
`CONTRIBUTING.md` has the conventions for branches, commits and pull requests.

## Commands

```bash
npm install                       # also enables the git hooks
npm run dev                       # http://localhost:3000
npm run lint && npm run typecheck
npm run test                      # Vitest unit and component tests
npm run test:e2e:app              # app E2E with axe, against the typed mock backend
npm run test:e2e:integration      # the same suite against the real local stack
npm run test:e2e                  # prototype tests
npm run api:types                 # regenerate src/lib/api/schema.d.ts; api:check verifies it
npm run build
```

CI runs lint, types, unit tests, the build, and the E2E suites a change can affect; all must pass
before merge.

## Rules

Code comments cite them by number, e.g. "AGENTS.md IV".

### I. Teacher control and transparency

- Every AI response shown to a student cites its source: the teacher-validated material it is
  based on (document and section).
- When no validated source exists for a question, the UI says so and never presents an unsourced
  answer.
- Teachers can view, review and validate the material the AI draws from.
- Every teacher-facing metric or flag (e.g. "at-risk student") shows the data it is based on.

### II. Role separation

- Exactly three roles: admin, teacher and student, each with its own routes, navigation and
  layout, as separate App Router route groups.
- The admin role stays minimal: only the account and course management explicitly required.
- Role-based access is enforced server-side; hiding elements on the client is not access control.
- Views never mix data across roles, never show one student's data to another student, and never
  show one teacher's courses to another teacher.

### III. Accessibility, WCAG 2.2 AA

- Every screen meets WCAG 2.2 AA: contrast, full keyboard operation, visible focus, semantic HTML,
  screen reader support, and `prefers-reduced-motion`.
- User-facing copy uses plain language appropriate to the student's age.
- The E2E tests of every new screen include axe checks. An axe failure blocks merge.

### IV. Design system first

- The design reference is the static HTML prototype in `public/prototype/` (Tailwind v4, browser
  CDN build). It is the source of truth for visuals.
- The prototype declares its design tokens in `@theme`, with the same names and values as the
  app's.
- Hard-coded visual values (hex/rgb colours, arbitrary `[..]` utilities, raw pixel spacing) are
  forbidden outside token definitions, in the prototype and in the app.
- Reusable components have the same name in the prototype and in React.

### V. Test-first

- Tests are written and seen failing before the implementation.
- Vitest + Testing Library for unit and component tests; Playwright for E2E, with at least one E2E
  test per acceptance scenario, titled with its ID.
- No merge with disabled tests (`skip`/`only`) unless the pull request justifies each one.

### VI. Typed backend contract

- API types are generated from the backend's OpenAPI schema, pinned in
  `contracts/backend-openapi.json`; hand-written API types are forbidden.
- Every backend call goes through `src/lib`; components never call the API directly.
- Mocks (`tests/app/mock-api`) honour the same generated contract.
- Loading, empty and error states are designed in the prototype and tested for every data-driven
  view.

### VII. Privacy by design (GDPR, possible minors)

- Personal data (names, emails, student messages, grades) never appears in client logs, analytics
  or Sentry events; Sentry PII scrubbing is on.
- The client receives only the data each view needs.
- Personal data and session tokens are never stored in `localStorage` or `sessionStorage`.
- Consent is explicit, informed and revocable, worded for the student's age.
- Sample people in fixtures are fictitious and use the `example.org` domain.

### VIII. Bilingual

- Spanish and English are complete for every feature before it merges.
- No user-facing text is hard-coded: every string lives in `messages/`, including errors, alt text
  and `aria-label`s. Missing keys fail CI.
- Dates, numbers and plurals follow the active locale.

### IX. Simplicity

- Server Components by default; `'use client'` only when required, on the smallest component.
- No new dependency without a justification in the pull request.
- No abstraction before two real uses for it.

## Technical constraints

- Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4 (the standard build in the
  app; the browser CDN build only in the prototype).
- Vercel (hosting and previews), Supabase Auth, Sentry.
- Desktop-first for every role, and fully usable on mobile with no horizontal scroll.
- The last two versions of Chrome, Edge, Firefox and Safari.
- Reviewers also check the Vercel preview; UX changes are validated by the pedagogy team.

## Feature numbers

Comments that cite `spec NNN`, `specs/NNN` or `backend specs/NNN` name the feature that introduced
the code (in this repository or the backend): its branch is `NNN-name` and its pull request
explains it.

## For tools outside this repository

A development or evaluation tool may rely on the commands above and on these files, and on
nothing else. Changing them is a change to this repository, made in a pull request that says so:

- `contracts/backend-openapi.json` and `src/lib/api/schema.d.ts`, the pinned API contract.
- `public/prototype/` and its page manifest `public/prototype/assets/pages.json` (each page's
  states and mobile flag).
- `messages/es.json` and `messages/en.json`.
- `PRODUCT.md` and `DESIGN.md`.
