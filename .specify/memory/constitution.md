<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Bump rationale: Initial ratification; all template placeholders replaced with project content.

Modified principles (template placeholder → new title):
- [PRINCIPLE_1_NAME] → I. Teacher Control & Transparency
- [PRINCIPLE_2_NAME] → II. Two Roles, Two Experiences
- [PRINCIPLE_3_NAME] → III. Accessibility WCAG 2.2 AA (NON-NEGOTIABLE)
- [PRINCIPLE_4_NAME] → IV. Design System First
- [PRINCIPLE_5_NAME] → V. Test-First (NON-NEGOTIABLE)

Added sections:
- Principles VI. Typed Backend Contract, VII. Privacy by Design, VIII. Bilingual from the MVP,
  IX. Simplicity (template provided 5 principle slots; project defines 9)
- Technical Constraints (from [SECTION_2_NAME])
- Development Workflow (from [SECTION_3_NAME])

Removed sections: none

Templates reviewed (not modified by this command; they read the constitution at runtime):
- .specify/templates/plan-template.md — "Constitution Check" gate MUST be evaluated against
  Principles I–IX; "Complexity Tracking" is the exception mechanism. ⚠ verify on next /speckit-plan
- .specify/templates/spec-template.md — user stories MUST state role (II) and link Figma frames (IV).
  ⚠ verify on next /speckit-specify
- .specify/templates/tasks-template.md — test tasks MUST precede implementation tasks per story (V).
  ⚠ verify on next /speckit-tasks

Deferred TODOs: none
-->

# DocentAI Frontend Constitution

DocentAI is a teacher-guided AI education platform (see `docs/proposal`) with two roles: teacher
and student. The student age range is not yet decided (secondary and/or university), so every rule
in this constitution is written for the most restrictive case: **students may be minors**.

## Core Principles

### I. Teacher Control & Transparency

- Every AI response shown to a student MUST cite its source: the teacher-validated material it is
  based on (document and section).
- When no validated source exists for a question, the UI MUST say so explicitly and MUST NOT
  present an unsourced answer.
- Teachers MUST be able to view, review and validate the material the AI draws from.
- Every teacher-facing metric or flag (e.g. "at-risk student") MUST show the data it is based on.

**Rationale**: DocentAI's differentiator is that the teacher controls the content; the AI assists.

### II. Two Roles, Two Experiences

- Teacher and student MUST have separate routes, navigation and layouts, implemented as separate
  App Router route groups.
- Role-based access MUST be enforced server-side. Hiding elements on the client is not access
  control and MUST NOT be relied on as such.
- Views MUST NOT mix data across roles and MUST NOT expose one student's data to another student.
- Every user story MUST state which role it belongs to.

**Rationale**: Teachers and students have different goals and different data rights; blurring
them creates both UX confusion and data leaks.

### III. Accessibility WCAG 2.2 AA (NON-NEGOTIABLE)

- Every screen MUST meet WCAG 2.2 AA, including: color contrast, full keyboard operability,
  visible focus, semantic HTML, screen reader support, and respect for `prefers-reduced-motion`.
- User-facing copy MUST use plain language appropriate to the student's age.
- The E2E tests of every new screen MUST include automated accessibility checks (axe). An axe
  failure blocks merge.

**Rationale**: An education platform that excludes students is failing at its core purpose, and
public-sector education contexts require AA compliance.

### IV. Design System First

- Figma variables MUST map one-to-one to Tailwind v4 tokens declared in `@theme`, with matching
  names.
- Hardcoded visual values (hex/rgb colors, arbitrary `[..]` utility values, raw pixel spacing) are
  forbidden outside token definitions.
- Reusable components MUST have the same name in Figma and in React.
- Figma is the source of truth for visuals; `spec.md` is the source of truth for behavior.
- Every spec that includes UI MUST link the Figma frames it implements.

**Rationale**: A single shared vocabulary between design and code keeps the product consistent
and makes design changes cheap to propagate.

### V. Test-First (NON-NEGOTIABLE)

- Strict TDD: tests MUST be written and observed failing before the implementation
  (Red-Green-Refactor).
- Unit and component tests MUST use Vitest + Testing Library. E2E tests MUST use Playwright, with
  at least one E2E test per acceptance scenario in the spec.
- In `tasks.md`, each story's test tasks MUST precede its implementation tasks.
- No merge with disabled tests (`skip`/`only`) unless the PR explicitly justifies each one.

**Rationale**: Tests derived from acceptance scenarios prove the spec is implemented, and writing
them first keeps scope tied to the spec.

### VI. Typed Backend Contract

- API types MUST be generated from the FastAPI OpenAPI schema; hand-written API types are
  forbidden.
- The backend API version used for type generation MUST be pinned in `plan.md`.
- All backend calls MUST go through `src/lib`; components MUST NOT call the API directly.
- When the backend is not ready, mocks MUST honor the same generated, typed contract.
- Loading, empty and error states MUST be designed (in Figma) and tested for every data-driven
  view.

**Rationale**: A generated contract catches frontend/backend drift at compile time, and a single
access layer keeps auth, errors and mocking in one place.

### VII. Privacy by Design (GDPR, possible minors)

- Personal data (names, emails, student messages, grades) MUST NOT appear in client logs,
  analytics or Sentry events; Sentry PII scrubbing MUST be enabled.
- The client MUST receive only the minimum data each view needs.
- Personal data and session tokens MUST NOT be stored in `localStorage` or `sessionStorage`.
- Consent MUST be explicit, informed and revocable, with wording appropriate to the student's age.

**Rationale**: Students may be minors, and GDPR treats their data with heightened protection;
data that never reaches the client cannot leak from it.

### VIII. Bilingual from the MVP

- Spanish and English MUST be complete for every feature before it merges.
- No user-facing text may be hardcoded; all strings MUST be externalized, including error
  messages, alt text and `aria-label`s.
- Dates, numbers and plurals MUST be formatted according to the active locale.
- Missing translation keys MUST fail CI.

**Rationale**: Retrofitting i18n is expensive and error-prone; building both languages from day
one keeps them equal.

### IX. Simplicity

- Components MUST be Server Components by default; `'use client'` is allowed only when required,
  and only on the smallest possible component.
- No new dependency may be added without a justification in `plan.md`.
- YAGNI: no abstraction may be introduced until there are two real use cases for it.

**Rationale**: Less client JavaScript and fewer dependencies mean faster pages, a smaller attack
surface and code that is easier to change.

## Technical Constraints

- **Stack**: Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS v4.
- **Platform & services**: Vercel (hosting and previews), Supabase Auth, Sentry.
- **Responsiveness**: desktop-first for both roles; every screen MUST be fully functional on
  mobile with no horizontal scroll.
- **Browser support**: the last 2 versions of Chrome, Edge, Firefox and Safari.
- **CI gates** (all MUST pass before merge): lint, typecheck, unit tests, E2E tests (including
  axe accessibility checks), build. Missing translations also fail CI (Principle VIII).

## Development Workflow

- **Spec-Driven Development with Spec Kit**: specify → clarify → plan → tasks → analyze →
  implement. Any behavior change MUST be made in the spec first, then propagated.
- **GitHub Flow**: `main` is always deployable and protected; changes land only via PR with
  green CI.
- **Branches**: one branch per feature, named after its `specs/` folder (`NNN-name`).
- **Conventional Commits**: one commit per SDD artifact (`docs(spec): ...`, `docs(plan): ...`,
  `docs(tasks): ...`); code commits MUST reference the task ID (e.g. `feat(chat): T012 ...`).
- **Pull requests**: one PR per feature, squash-merged, linking `spec.md`, the Figma frames and
  the completed checklists.
- **Review**: reviewers MUST also check the Vercel preview. UX changes MUST additionally be
  validated by the pedagogy team.

## Governance

- This constitution supersedes all other practices and guidelines for the DocentAI frontend.
- Every `plan.md` MUST pass the Constitution Check twice: before research/design and again after
  design. Any exception MUST be justified in the plan's Complexity Tracking table.
- Every PR review MUST verify compliance with this constitution.
- Amendments MUST be made in a dedicated PR titled `docs(constitution): vX.Y.Z` that states the
  reason for the change and its impact on existing specs, plans and code.
- Versioning follows semantic versioning:
  - **MAJOR**: a principle is removed or redefined.
  - **MINOR**: a principle or section is added, or guidance is materially expanded.
  - **PATCH**: wording, clarifications and typo fixes with no change in meaning.

**Version**: 1.0.0 | **Ratified**: 2026-10-04 | **Last Amended**: 2026-10-04
