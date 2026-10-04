# Implementation Plan: DocentAI MVP Prototype (Frontend UI)

**Branch**: `001-mvp-prototype` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-mvp-prototype/spec.md`

**Note**: Revised 2026-10-04 for constitution 2.1.0. The deliverable is a **validated static HTML
prototype**, not a Figma file and not product code. "Implementation" means building the
prototype pages and running validation sessions.

## Summary

Build and validate a clickable, bilingual (ES default, EN) static HTML prototype for all three
roles (admin, teacher, student). It has one page per screen; every state in the Screen Inventory
can be reached by a `?state=` query parameter and from a visible state panel. Pages use plain
HTML styled with Tailwind v4 through the `@tailwindcss/browser` CDN build, and a small vanilla JS
runtime handles includes, copy, state and language switching. There is no build step. The
prototype lives in `public/prototype/`, so Next.js serves it at `/prototype` locally and on every
Vercel preview. Design tokens live in one `@theme` file that both the prototype and the React app
load (Constitution IV). Copy lives in ES/EN message files whose keys are the future i18n keys
(Constitution VIII). Validation runs moderated sessions with teachers and students; findings go
into `spec.md` first, then the prototype.

## Technical Context

**Language/Version**: HTML5, CSS (Tailwind v4.3.3 syntax), JavaScript (ES2022 modules, no
transpiling). Copy in Spanish (default) and English.

**Primary Dependencies**: `@tailwindcss/browser@4.3.3` loaded from jsDelivr with the version
pinned to match the app's `tailwindcss` 4.3.3 (research R-01). No runtime npm dependency.
Dev-only, for verification: `vitest`, `jsdom`, `@testing-library/dom`, `@playwright/test`,
`@axe-core/playwright` (R-11; all are tools the constitution already requires for the app).

**Storage**: Static files in the repo: pages, a page manifest, ES/EN message files, sample-data
files, and the shared `@theme` token file. `localStorage` holds only the language and
state-panel preferences, never personal data (Constitution VII). Session recordings are never
stored in the repo.

**Testing**: Vitest + Testing Library (jsdom) for the prototype runtime modules and for static
checks: ES/EN key parity, no hardcoded visual values, manifest consistency. Playwright for:
- an axe sweep (WCAG 2.2 AA) of every page × state at 390 px and 1440 px;
- one test per acceptance scenario, titled with its ID and grouped in a serial `describe` per
  flow (F1–F15), so every scenario has at least one E2E test (Constitution V).

Moderated usability sessions ([quickstart.md](quickstart.md)) remain the validation that decides
"validated" (SC-001–SC-007).

**Target Platform**: Last 2 versions of Chrome, Edge, Firefox and Safari. Desktop at 1440 px
(primary for all roles) and mobile at 390 px (every student page, and the key teacher/admin pages
marked "M" in the inventory). Students test on their own phones through the Vercel preview URL.

**Project Type**: Design deliverable (static UI prototype) inside the existing Next.js web app
repository.

**Performance Goals**: A page is usable in under 2 s on a phone over 4G. Loading states appear
within 1 s of an action (spec Edge Cases). These are prototype goals, not product targets.

**Constraints**: No build step for the prototype. WCAG 2.2 AA (contrast ≥4.5:1 text, ≥3:1 large
text and UI parts, visible focus, targets ≥24×24 px and 44×44 px for primary student mobile
actions). Light mode only. Only fictitious people and data. No hex/rgb or arbitrary `[..]`
values outside the token file. Desktop-first design for all roles; no horizontal scroll at 390 px.

**Scale/Scope**: 32 screens from the Screen Inventory below, implemented as 31 pages (the citation
sheet #9 is an overlay state of the chat page #8). About 150 page states in total, 13 user
stories, 15 flows (F1–F15).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution version: **2.1.0**.

| Principle | Applies | Status | How this plan complies |
|---|---|---|---|
| I. Teacher Control & Transparency | Full | ✅ Pass | `SourceCitation` on every grounded answer. One shared `NoSourceNotice` (S2) reused in chat, hints, exercise feedback and explanations. Material review pages (T2). At-risk and error items show their data (T5). |
| II. Role Separation | Full | ✅ Pass | Separate folders, shells and navigation per role (`admin/`, `teacher/`, `student/`). Access-denied page. No page shows another student's data or another teacher's course. Route groups apply to the later React app. |
| III. Accessibility WCAG 2.2 AA | Full | ✅ Pass | Semantic HTML and visible focus ring. Targets ≥24 px (44 px for primary mobile actions). Reduced-motion respected. An axe sweep runs on every page × state at both widths (R-11), and failures block merge. Manual keyboard and focus-order check on every P1 page. |
| IV. Design System First | Full | ✅ Pass | One `@theme` file is loaded by both the prototype and `src/app/globals.css`, so tokens are identical by construction (R-02). Tailwind's default palette is cleared, so only DocentAI tokens exist. A static check forbids hex/rgb and arbitrary values in pages. Component names in `data-component` match the future React names. The spec "Prototype pages" table gets linked (FR-052). |
| V. Test-First | Applies to the runtime JS and flows | ✅ Pass | Unit tests for `assets/js/*` modules are written and seen failing before each module. The Playwright flow tests for a story are written before its pages, and fail until the pages exist. |
| VI. Typed Backend Contract | One clause | ✅ Pass | No API calls. Loading, empty and error states are designed in the prototype for every data-driven page (FR-001). `data-model.md` is input for the future OpenAPI contract. |
| VII. Privacy by Design | Full | ✅ Pass | Fictitious data only (`example.org` emails). Consent and revocation designed. No personal data in `localStorage`. No analytics in the prototype. Session recordings are kept outside the repo and deleted after analysis. Findings use participant codes. The jsDelivr request is noted in R-01. |
| VIII. Bilingual from the MVP | Full | ✅ Pass | All copy, alt text and `aria-label`s come from `messages/es.json` and `messages/en.json`, and a test fails on a missing key in either locale. Dates and numbers use `Intl` per locale. Plurals use `_one`/`_other` keys. Language switcher on sign-in and in every shell. |
| IX. Simplicity | Full | ✅ Pass | No runtime dependency and no build step. Dev dependencies are justified below and are already mandated for the app. A component is extracted into a partial only if it is used on ≥2 pages and its markup is identical. The Server Components clause is N/A (no React). |

**Dependency justification (IX)**: `vitest`, `@testing-library/dom` and `jsdom` (unit tests,
Constitution V), `@playwright/test` and `@axe-core/playwright` (E2E and axe, Constitutions III and
V). All five are needed by the React app later, so adding them now costs nothing extra. Nothing is
added to `dependencies`.

**Gate result (pre-research)**: PASS.

**Gate result (post-design)**: PASS. Re-checked after research.md, data-model.md,
contracts/ and quickstart.md:
- R-02 changes `src/app/globals.css` to import the shared token file. The app's current ad-hoc
  tokens (`ink`, `paper`, `accent`, `success`) and the hardcoded body colors are replaced by
  DocentAI tokens. This fixes an existing Principle IV violation rather than adding one.
- R-07 adds one redirect to `next.config.ts` so `/prototype` opens the index.

**User input reconciled with the constitution**: the request asked for "mobile-first student
screens" and a "Spanish UI". The user chose to comply with the constitution instead: student
pages are designed desktop-first and verified at 390 px, and the UI is ES + EN with Spanish as
the default.

## Prototype Structure

### Pages and states

Each page appears once in `public/prototype/assets/pages.json` (see
[contracts/prototype-pages.md](contracts/prototype-pages.md)). That manifest drives the index, the
state panel and the test sweep. Legend: D default · E empty · L loading · Er error · LR limit
reached · NS no validated source · AI AI disclosure · SC source citations. "M" = verified at 390 px
(all pages are responsive; M marks the widths that are tested and reviewed).

| # | Role | Screen | Page (`/prototype/…`) | Story | Req IDs | Prio | States | M |
|---|---|---|---|---|---|---|---|---|
| 1 | All | Sign-in | `auth/sign-in.html` | US-07 | P1, FR-005 | P1 | D, L, Er (invalid credentials), session expired | ✓ |
| 2 | All | Password recovery | `auth/password-recovery.html` | US-07 | P1 | P1 | D, L, Er, sent | ✓ |
| 3 | All | Access denied / not found | `auth/access-denied.html` | US-07 | P1 | P1 | access denied, not found, removed course | ✓ |
| 4 | All | About (IMFAHE, privacy) | `about.html` | US-07 | FR-005 | P1 | D | ✓ |
| 5 | Student | Consent & AI transparency | `student/consent.html` | US-01, US-07 | S1, P1 | P1 | D, AI, Er, revoked | ✓ |
| 6 | Student | My courses | `student/courses.html` | US-04 | T1 | P1 | D, E, L, Er, several courses | ✓ |
| 7 | Student | Join course (code / link) | `student/join.html` | US-04 | T1 | P1 | D, L, Er invalid / expired / disabled, confirm | ✓ |
| 8 | Student | Course chat | `student/chat.html` | US-01 | S1, S2 | P1 | D, E + AI (first use), L (history), Er (history load), tutor writing, SC, NS, low allowance, LR, failed message, document unavailable | ✓ |
| 9 | Student | Citation sheet | `student/chat.html?state=citation` | US-01 | S1 | P1 | citation (overlay of #8), citation-unavailable | ✓ |
| 10 | Student | Course chat – guided mode | `student/chat-guided.html` | US-05 | S3 | P1 | D, L, Er, hint N, all hints (solution allowed), all hints (hints only), NS, LR | ✓ |
| 11 | Student | Submit exercise | `student/exercise.html` | US-06 | S4 | P1 | D, review, L, Er empty, Er unreadable photo, LR | ✓ |
| 12 | Student | Exercise feedback | `student/exercise-feedback.html` | US-06, US-12 | S4, S5 | P1 | L (pending), D (SC), NS, Er, repeated-mistake notice | ✓ |
| 13 | Student | Profile & consent | `student/profile.html` | US-07 | P1, FR-015 | P1 | D, L, Er, revoke confirm, revoked | ✓ |
| 14 | Teacher | My courses | `teacher/courses.html` | US-04 | T1 | P1 | D, E, L, Er | ✓ |
| 15 | Teacher | Create course | `teacher/course-new.html` | US-04 | T1 | P1 | D, Er validation, L | — |
| 16 | Teacher | Course overview | `teacher/course.html` | US-04 | T1 | P1 | D, E (no students), L, Er, code copied, code disabled, regenerate confirm, code regenerated | ✓ |
| 17 | Teacher | Material list & upload | `teacher/material.html` | US-02 | T2 | P1 | E, L, Er, D, uploading, processing, file error, all excluded, duplicate dialog | ✓ |
| 18 | Teacher | Fragment review | `teacher/fragments.html` | US-02 | T2 | P1 | D, L, Er, search results, search no results | — |
| 19 | Teacher | Tutor settings | `teacher/tutor-settings.html` | US-03 | T3, S3 | P1 | D (defaults), L, Er (load), preview, unsaved dialog, saved, Er (save failed) | — |
| 20 | Admin | Users | `admin/users.html` | US-07 | P1 | P1 | D, E, L, Er | ✓ |
| 21 | Admin | Create teacher | `admin/teacher-new.html` | US-07 | P1 | P1 | D, Er validation, L, created | — |
| 22 | Admin | Courses | `admin/courses.html` | US-07 | P1 | P1 | D, E, L, Er | — |
| 23 | Teacher | Conversations list | `teacher/conversations.html` | US-08 | T4 | P2 | D, E, L, Er, filtered, no results | ✓ |
| 24 | Teacher | Conversation detail | `teacher/conversation.html` | US-08 | T4, T6, S1, S2 | P2 | D (SC, NS message), L, Er, flag dialog, flagged | — |
| 25 | Teacher | Flags list | `teacher/flags.html` | US-08 | T6 | P2 | D, E, L, Er | — |
| 26 | Teacher | Dashboard | `teacher/dashboard.html` | US-09 | T5 | P2 | by topic, by student, E (not enough data), L, Er | — |
| 27 | Teacher | At-risk student detail | `teacher/student-risk.html` | US-09 | T5 | P2 | D, L, Er | — |
| 28 | Teacher | Quiz question review | `teacher/questions.html` | US-10 | T7 | P2 | pending, approved, rejected, edit, E, L, Er | — |
| 29 | Student | Quiz | `student/quiz.html` | US-11 | S6 | P2 | D, correct, incorrect (SC), difficulty change, E, L, Er | ✓ |
| 30 | Student | Quiz summary | `student/quiz-summary.html` | US-11 | S6 | P2 | D, L, Er | ✓ |
| 31 | Student | Targeted explanation / practice | `student/practice.html` | US-12 | S5 | P2 | D (SC), NS, L, Er | ✓ |
| 32 | Student | My progress | `student/progress.html` | US-13 | S7 | P3 | D, E, L, Er | ✓ |

The full state IDs (kebab-case values for `?state=`) are fixed in the contract. Every
data-driven page has loading and error states (FR-001, Constitution VI). An empty state is
omitted only where the page cannot be empty: profile (#13), conversation detail (#24) and quiz
summary (#30) always have content, and the chat's empty state is its first-use state. The student shell
always shows the AI label, the teacher-review notice and the message allowance (FR-010, FR-011,
FR-014), so these appear on every chat and exercise page.

Two support pages are not product screens: `index.html` (cover: status, version, page and flow
index, IMFAHE acknowledgement) and `design-system.html` (tokens, type scale, every component in
every variant and state, focus ring, motion spec, icon set).

### Flows

Flows are chains of links and actions between pages and states. Each flow has a start link on
`index.html`, and its error branches can be reached from the state panel ("Simular", R-06).

| Flow | Role | Width | Steps | Covers |
|---|---|---|---|---|
| F1 Teacher uploads and validates material | Teacher | 1440 | My courses → Course → Material (E) → upload → uploading → processing → one file error → Fragment review → exclude/include → all-excluded warning | US-02 AS1–6 |
| F2 Student asks and sees cited sources | Student | 390 (+1440) | Sign-in → Consent → My courses → Chat (E + AI) → ask → tutor writing → SC answer → citation sheet → back | US-01 AS1–3, AS7; US-07 AS1–2, AS4 |
| F3 Material does not cover this | Student | 390 | Chat → off-topic question → NS → next step | US-01 AS4 |
| F4 Daily limit | Student | 390 | Chat (low allowance) → send → LR (input disabled, reset time, history readable) → exercise also blocked | US-01 AS5–6; US-06 AS6 |
| F5 Admin minimal tasks | Admin | 1440 | Sign-in → Users (E → D) → Create teacher → created → Courses; access denied on a teacher page | US-07 AS2, AS5–6 |
| F6 Course creation and join | Teacher → Student | 1440 / 390 | Create course → code copied → (student) Join → invalid code → valid code → confirm → course in list | US-04 AS1–6 |
| F7 Tutor settings | Teacher | 1440 | Settings → hints only → preview → unsaved dialog → save → save failed → retry → saved | US-03 AS1–4 |
| F8 Guided mode | Student | 390 | Guided chat → hint 1 → another hint → all hints → solution-allowed / hints-only variants | US-05 AS1–4 |
| F9 Exercise feedback | Student | 390 | Submit → review → pending → feedback (Paso 2, SC) → NS variant → unreadable photo | US-06 AS1–5 |
| F10 Sign-in errors and session | All | 390 / 1440 | Invalid credentials → recovery → sent → session expired → back to the same page | US-07 AS3, AS7 |
| F11 Conversations and flags | Teacher | 1440 | Conversations → filter → detail → flag → flags list | US-08 AS1–5 |
| F12 Dashboard and at-risk | Teacher | 1440 | Dashboard by topic → by student → at-risk detail | US-09 AS1–3 |
| F13 Question review | Teacher | 1440 | Pending → edit → approve → reject → counters | US-10 AS1–3 |
| F14 Adaptive quiz | Student | 390 | Quiz → correct → incorrect → difficulty change → summary | US-11 AS1–5 |
| F15 Repeated mistake and progress | Student | 390 | Feedback with notice → explanation → practice; My progress | US-12 AS1–3; US-13 AS1–2 |

F1–F5 are the required minimum. F6–F10 complete "every P1 acceptance scenario" (FR-051), and
F11–F15 are the P2/P3 happy paths.

## Design System

### Tokens (`public/prototype/assets/theme.css` → shared `@theme`)

Tailwind v4 namespaces are used directly, so a token name is its CSS variable and the utilities
follow from it (`--color-primary-600` → `bg-primary-600`).

| Group | Tokens | Notes |
|---|---|---|
| Reset | `--color-*: initial;` | Removes Tailwind's default palette so only DocentAI colors exist. |
| Palettes | `--color-{neutral,primary,success,warning,danger,info}-{50,100,…,900}` | Steps chosen so that text pairs meet AA (checked by axe on real pages). |
| Semantic colors | `--color-fg`, `--color-fg-muted`, `--color-fg-inverse`, `--color-surface`, `--color-surface-raised`, `--color-surface-sunken`, `--color-border`, `--color-border-strong`, `--color-focus` | Alias palette steps with `var()`. Components use these, not palette steps, where a semantic role exists (R-03). |
| Spacing | `--spacing: 0.25rem` | Tailwind v4's single base unit (4 px). `p-4` = 16 px. |
| Radius | `--radius-{sm,md,lg,xl}` (plus Tailwind's `rounded-full`) | |
| Type | `--font-sans`, `--font-mono`, `--text-{xs,sm,base,lg,xl,2xl,3xl}` with `--text-*--line-height`, `--font-weight-{normal,medium,semibold,bold}` | System font stack; no web-font request (R-04). |
| Shadow | `--shadow-{sm,md,lg}` | A real token now, unlike Figma. |
| Motion | `--ease-standard`, `--animate-*` as needed | Every animation has a `motion-reduce:` alternative. |

### Components

Names match the future React components. In pages, each instance carries
`data-component="<Name>"` (plus `data-variant` where useful), so a reviewer or a script can find
every use. A component is a **partial** (`partials/*.html`, injected at load) only when its markup
is identical on every page, as with shells and the footer. Otherwise its canonical markup lives on
`design-system.html` and pages copy it (R-05).

| Component | Variants / states | Used by |
|---|---|---|
| `Button`, `IconButton` | primary, secondary, ghost, danger × sm/md × default/hover/focus/disabled/loading | All |
| `TextField`, `TextArea`, `Select`, `Toggle`, `RadioGroup` | default, focus, error, disabled, helper text | All |
| `Card`, `Dialog`, `Toast` | default, interactive | All |
| `EmptyState`, `ErrorState`, `Skeleton`, `AccessDenied` | generic states | All |
| `AppShell` (partials per role) | admin, teacher, student; desktop nav and mobile nav | All |
| `LanguageSwitcher` | ES/EN | All |
| `ImfaheAcknowledgement` | footer, sign-in, about | All (FR-005) |
| `ChatMessage`, `ChatComposer` | student, tutor-answer, tutor-hint, tutor-no-source, failed; composer default/sending/disabled-by-limit | US1, US5, US8 |
| `SourceCitation`, `CitationSheet` | chip, unavailable; bottom sheet (390) / side panel (1440) | US1, US5, US6, US8, US10–12 |
| `NoSourceNotice` | shared S2 pattern | US1, US5, US6, US12 |
| `AIDisclosure` | first-use dialog, header label | US1, US7 |
| `MessageAllowance`, `LimitReachedBanner` | normal, low, reached; chat, exercise | US1, US6 |
| `GuidedModeIndicator` | on with hint counter | US5 |
| `FileUploadItem`, `DocumentRow`, `FragmentItem` | per plan states | US2 |
| `ClassCode` | active, copied, disabled | US4 |
| `FlagControl` | none, incorrect, needs improvement | US8 |
| `QuizQuestion` | unanswered, correct, incorrect, teacher review | US10, US11 |
| `ProgressByTopic` | bar with text label | US13 |

## Bilingual Copy

- Every visible string, `alt` and `aria-label` uses `data-i18n` (and `data-i18n-attr` for
  attributes). Keys follow `role.screen.element` (`student.chat.limitReached`); shared strings
  use `common.*`. The files are nested JSON (`messages/es.json`, `messages/en.json`) in the shape
  the future app's message files will use.
- Sample content (course, documents, people, questions and answers) lives in `sample/es.json` and
  `sample/en.json` under `sample.*`. These keys are **not** future i18n keys (R-09).
- Plurals use `key_one` / `key_other`, chosen with `Intl.PluralRules`. Dates and numbers are
  formatted with `Intl.DateTimeFormat` and `Intl.NumberFormat` (`4 oct 2026` / `Oct 4, 2026`).
- `?lang=en` or the `LanguageSwitcher` changes the language and updates `<html lang>`. Spanish is
  the default.
- **Check**: a unit test fails on any key missing in either locale or used in a page but not
  defined. Every P1 page is reviewed in both languages at both widths, and breakages are logged.

## Sample Content

All sample content is fictitious and exists in ES and EN (unchanged from the previous plan).

- **Course**: "Matemáticas 3º ESO – Álgebra" / "Year 9 Maths – Algebra". Topics: linear equations,
  systems of equations, polynomials, factorisation.
- **Documents**: `Tema 3 – Ecuaciones de primer grado.pdf` (24 pages),
  `Apuntes – Sistemas de ecuaciones.docx`, `Ejercicios resueltos – Polinomios.md`, and one
  scanned PDF that fails processing.
- **Questions**: "¿Cómo despejo x en 3x + 5 = 20?" (covered; citation Tema 3, p. 12); "¿Quién
  inventó el álgebra?" (not covered → NS); worked exercise "2(x − 3) = 4x + 2" with a sign error in
  step 2.
- **People**: teacher "Prof. Elena Ruiz Navarro"; students "Lucas Herrera", "Aisha Benali", "Mateo
  Ortega", pseudonyms "Estudiante-07", "Estudiante-12"; admin "Admin DocentAI". Emails use
  `example.org`.
- **Numbers**: daily limit 30 messages (illustrative), reset 00:00 local time; dates in
  October–November 2026.
- Before validation, check that no sample name matches a team member or participant.

## Validation Protocol (summary)

Full procedure in [quickstart.md](quickstart.md). The protocol is unchanged from the Figma
version, except that participants open the Vercel preview URL (students on their own phone) and
facilitators trigger branches from the state panel.

- **Participants**: ≥5 students (adults, own phone) and ≥3 teachers (desktop); 1 admin run by a
  team member. They come from the team's network and are not pilot participants.
- **Success criteria**: SC-001 to SC-007.
- **Recording**: only with signed consent; stored in the team's private storage; deleted once
  findings are written; findings use participant codes.
- **Findings**: behavior changes go into `spec.md` first, then the prototype. Findings and the
  decision log live in `specs/001-mvp-prototype/validation.md` (anonymised).

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-prototype/
├── spec.md
├── plan.md                    # This file
├── research.md                # Phase 0
├── data-model.md              # Phase 1: information each screen displays
├── quickstart.md              # Phase 1: run the prototype, run a validation session
├── contracts/
│   └── prototype-pages.md     # Phase 1: URL, state, language and markup contract
├── checklists/requirements.md
├── validation.md              # Created during validation: findings, decision log, SC results
└── tasks.md                   # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
public/prototype/
├── index.html                 # Cover: status, version, page index, flow starts, IMFAHE
├── design-system.html         # Tokens, components × variants × states, focus, motion, icons
├── about.html
├── auth/                      # sign-in, password-recovery, access-denied
├── admin/                     # users, teacher-new, courses
├── teacher/                   # courses, course-new, course, material, fragments,
│                              # tutor-settings, conversations, conversation, flags,
│                              # dashboard, student-risk, questions
├── student/                   # consent, courses, join, chat, chat-guided, exercise,
│                              # exercise-feedback, profile, quiz, quiz-summary,
│                              # practice, progress
├── partials/                  # shell-admin, shell-teacher, shell-student, footer, _template
└── assets/
    ├── theme.css              # The single @theme token file (also imported by the app)
    ├── pages.json             # Page manifest: path, screen #, story, req IDs, states, widths
    ├── js/
    │   ├── prototype.js       # Entry: loads theme + Tailwind, then runs the modules below
    │   ├── i18n.js            # Key lookup, plurals, Intl dates/numbers, language switch
    │   ├── state.js           # ?state= parsing, show/hide, auto-advance, state panel
    │   └── include.js         # data-include partial injection
    ├── messages/{es,en}.json  # Future i18n keys
    ├── sample/{es,en}.json    # Fictitious content, not i18n keys
    └── img/                   # DocentAI mark, IMFAHE logo (official file), icon sprite

src/app/globals.css            # Changed: @import of the shared theme; ad-hoc tokens removed
next.config.ts                 # Changed: redirect /prototype → /prototype/index.html

tests/prototype/
├── unit/                      # Vitest + Testing Library (jsdom): i18n, state, include,
│                              # static checks (key parity, no hardcoded values, manifest)
└── e2e/                       # Playwright: axe sweep, flows F1–F15 tagged by AS ID

vitest.config.ts, playwright.config.ts   # New (dev tooling)
.github/workflows/ci.yml       # New: CI gates (lint, typecheck, test, test:e2e, build)
package.json                   # New devDependencies and scripts: typecheck, test, test:e2e
```

**Structure Decision**: the prototype is static content in `public/prototype/`, so Next.js serves
it on every local and preview URL with no extra hosting or build step. The only app files touched
are `globals.css` (shared tokens) and `next.config.ts` (index redirect). Tests live in `tests/` at
the root, where the app's own tests will also go.

## Complexity Tracking

No Constitution Check violations; table not needed.
