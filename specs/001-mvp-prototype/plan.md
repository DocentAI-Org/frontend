# Implementation Plan: DocentAI MVP Prototype (Frontend UI)

**Branch**: `001-mvp-prototype` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-mvp-prototype/spec.md`

**Note**: This feature's deliverable is a **validated Figma prototype, not code**. "Implementation"
here means building the Figma file and running validation sessions. No source code, no
dependencies, and no repository changes outside `specs/001-mvp-prototype/`.

## Summary

Design and validate a clickable, bilingual (ES/EN) Figma prototype for all three roles (admin,
teacher, student) that covers every screen and state in the spec's Screen Inventory: P1 stories
fully (all acceptance scenarios clickable) and P2/P3 at least on their happy path. The file is
built on a design system whose Figma variables and component names match the future Tailwind v4
`@theme` tokens and React components one-to-one (Constitution IV). Copy lives in Figma string
variables with ES and EN modes named after the future i18n keys (Constitution VIII). Validation
runs moderated sessions with teachers and students. Findings go into `spec.md` first, then Figma.

## Technical Context

**Language/Version**: N/A (no code). Copy in Spanish (default) and English.

**Primary Dependencies**: Figma (Design file) on a plan that allows **2 variable modes per
collection** (Professional, Education or higher). The free Starter plan allows only 1 mode, so it
cannot hold ES + EN; see [research.md](research.md) R-01.

**Storage**: The Figma file (the source of truth for visuals) and, in this repo, the Markdown plan
artifacts under `specs/001-mvp-prototype/`. Session recordings are **not** stored in the repo or
in Figma (see Constitution VII below).

**Testing**: Moderated usability sessions ([quickstart.md](quickstart.md)); WCAG 2.2 AA contrast
checks of every color pairing; ES/EN mode switch check on every P1 screen; checking each spec
acceptance scenario against a prototype flow.

**Target Platform**: Desktop frames at 1440 px (primary, all roles); mobile frames at 390 px
(every student screen, key teacher/admin screens). Validation on a desktop browser and on a
phone using the Figma mobile app or browser.

**Project Type**: Design deliverable (UI prototype) for a web application.

**Performance Goals**: N/A for runtime. Prototype goals come from spec SC-001 to SC-007 (e.g.
≥80% unaided P1 task completion).

**Constraints**: WCAG 2.2 AA (contrast ≥4.5:1 text, ≥3:1 large text and UI parts, visible focus,
targets ≥24×24 px); light color mode only for the MVP (the spec does not ask for dark mode); only
fictitious people and data; no new repository dependencies.

**Scale/Scope**: 18 screen groups in the spec's Screen Inventory, about 40 distinct screens,
about 150 frames (screen × state), plus 1440 px/390 px variants. 13 user stories, 5 required
P1 flows (see Phase 1).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution version: **2.0.0**.

| Principle | Applies | Status | How this plan complies |
|---|---|---|---|
| I. Teacher Control & Transparency | Full | ✅ Pass | `SourceCitation` on every grounded answer; one shared "no validated source" pattern (S2) reused in chat, hints, exercise feedback and explanations; teacher material review screens (T2); at-risk and error dashboard items show the data behind them (T5). |
| II. Role Separation | Full | ✅ Pass | Separate Figma pages (Admin, Teacher, Student) with separate navigation shells; every frame name carries its US and requirement IDs; admin limited to users, create teacher, courses (FR-042); access-denied screens designed. |
| III. Accessibility WCAG 2.2 AA | Full | ✅ Pass | Contrast ratios documented on the Design System page; focus ring as a component state; targets ≥24×24 px (44×44 for primary mobile actions); focus-order annotations per P1 screen; color never the only signal; motion spec with a reduced-motion alternative. The axe/E2E clause applies to later code features. |
| IV. Design System First | Full | ✅ Pass | Variables named to match future `@theme` tokens; component names match future React names; every fill, spacing and radius bound to a variable; spec "Figma frames" table filled once frames exist (FR-052). |
| V. Test-First | N/A | — | No code is written in this feature; validation is done with usability sessions instead (see quickstart). |
| VI. Typed Backend Contract | N/A (one clause applies) | ✅ Pass | No API calls or types. The clause "loading, empty and error states MUST be designed in Figma" is met by this feature (FR-001). `data-model.md` will inform the future OpenAPI contract. |
| VII. Privacy by Design | Full | ✅ Pass | Only fictitious people and data; consent screen and revocation designed; teacher views show pseudonyms when used; usability session recordings only with written consent, stored outside the repo and Figma, deleted after analysis; Validation Notes in Figma contain only anonymised findings (P-01…). |
| VIII. Bilingual from the MVP | Full | ✅ Pass | All copy in string variables with ES and EN modes, including alt text and accessible names; `LanguageSwitcher` component; every P1 screen checked in both modes; dates and numbers written per locale in each mode; plural forms as separate keys. |
| IX. Simplicity | Partial | ✅ Pass | No dependencies added (applies). YAGNI applies to components: a component is created only when used in ≥2 places. The Server Components clause is N/A (no code). |

**Gate result (pre-research)**: PASS. No violations; Complexity Tracking not needed.

**Gate result (post-design)**: PASS. Re-checked after research.md, data-model.md and
quickstart.md: no decision adds a violation. Notes: R-03 (shadows as effect styles, not
variables) keeps names matching the tokens, so IV still holds; R-05 (screens as components so
flows can reuse them) adds no new dependency.

**Pre-requisite resolved before this plan**: the spec was revised on 2026-10-04 to comply with
constitution 2.0.0 (FR-002 now ES + EN; FR-003 now desktop-first at 1440 px with 390 px mobile
frames; matching Device lines and Assumptions).

## Figma File Structure

### Pages

| Page | Contents |
|---|---|
| **Cover** | Project name, version and date, status (Draft / In validation / Validated), link to `spec.md`, IMFAHE logo and acknowledgement, page index. |
| **Design System** | Variable collections, color swatches with contrast table, type scale, spacing/radius/shadow samples, all components with variants and states, icon set, motion spec, focus-order and annotation legend. |
| **Admin** | All admin screens × states, 1440 px, plus 390 px for sign-in and the user list. |
| **Teacher** | All teacher screens × states, 1440 px, plus 390 px for course overview, material list and conversations list. |
| **Student** | All student screens × states, 1440 px and 390 px for every screen. |
| **Prototype Flows** | Flow starting points and connected instances of screens (see R-05), one section per flow. |
| **Validation Notes** | Session plan, task list, anonymised findings (participant codes only), severity, decision log linking each change to the spec revision. |

Inside each role page, sections are grouped by user story (`US-01 …`) in story order.

### Frame naming

`US-NN · <Req IDs> · <Role> <screen> – <state> · <width>`

Examples, using the spec's actual story numbers:

- `US-01 · S2 · Student chat – no source available · 390`
- `US-01 · S1 · Student chat – citation sheet open · 1440`
- `US-01 · S1 · Student chat – daily limit reached · 390`
- `US-02 · T2 · Teacher material – upload error · 1440`
- `US-07 · P1 · Admin users – empty · 1440`

States use one fixed vocabulary: `default`, `empty`, `loading`, `error`, `limit reached`,
`no source available`, `AI disclosure`, `citation sheet open`, plus screen-specific states
listed in the spec's Screen Inventory.

## Design System

### Variable collections (→ future Tailwind v4 `@theme` tokens)

Figma variable path segments are joined with `-` and prefixed with `--` to get the token name.
For example, `color/primary/500` → `--color-primary-500`.

| Collection | Modes | Figma path pattern | Future token | Notes |
|---|---|---|---|---|
| `color` | `light` | `color/<palette>/<step>`, `color/<role>/<name>` | `--color-*` | Palettes: neutral, primary, success, warning, danger, info. Semantic roles (e.g. `color/text/default`, `color/surface/raised`, `color/border/focus`) alias palette steps. |
| `spacing` | — | `spacing/<step>` | `--spacing-*` | 4 px base: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16. |
| `radius` | — | `radius/<size>` | `--radius-*` | sm, md, lg, xl, full. |
| `typography` | — | `font/<family>`, `text/<size>`, `leading/<size>`, `font-weight/<name>` | `--font-*`, `--text-*`, `--leading-*`, `--font-weight-*` | Text styles are built from these variables. |
| `shadow` | — | Effect styles `shadow/<size>` | `--shadow-*` | Figma variables cannot hold a composite shadow, so shadows are **effect styles** with the same names and colors bound to `color/*` variables (R-03). |
| `copy` | `es`, `en` | `<role>/<screen>/<element>` | i18n key `<role>.<screen>.<element>` | String variables. `/` in Figma is `.` in code (R-02). Shared strings use `common/…`. |

**Contrast documentation**: the Design System page has a table of every text/background and
UI/background pairing used, with its ratio and AA result. Any pair below the threshold is fixed
before use.

### Components

Names match the future React components exactly. Each interactive component has the states
`default`, `hover`, `focus` (visible focus ring), `disabled`, and `loading` and `error` where
they make sense. Touch targets are at least 24×24 px (44×44 px for primary student mobile actions).

| Component | Variants / key properties | Used by |
|---|---|---|
| `Button` | primary, secondary, ghost, danger × sm/md × states | All |
| `IconButton` | same states; accessible-name annotation | All |
| `TextField`, `TextArea`, `Select`, `Toggle`, `RadioGroup` | default, focus, error, disabled, with helper text | All |
| `Card` | default, interactive | All |
| `AppShell` | admin, teacher, student × desktop/mobile (separate nav per role) | All |
| `LanguageSwitcher` | ES/EN | All |
| `ImfaheAcknowledgement` | footer, sign-in, about | All (FR-005) |
| `ChatMessage` | student, tutor-answer, tutor-hint, tutor-no-source, failed | US1, US5 |
| `SourceCitation` | chip, expanded, unavailable document | US1, US5, US6, US10–12 |
| `CitationSheet` | bottom sheet (mobile), side panel (desktop) | US1 |
| `NoSourceNotice` | the shared S2 pattern | US1, US5, US6, US12 |
| `AIDisclosure` | first-use dialog, persistent header label | US1, US7 |
| `MessageAllowance` | normal, low, reached | US1, US6 |
| `LimitReachedBanner` | chat, exercise | US1, US6 |
| `GuidedModeIndicator` | on; hint counter | US5 |
| `ChatComposer` | default, sending, disabled-by-limit | US1, US5 |
| `FileUploadItem` | uploading, processing, ready, error | US2 |
| `DocumentRow` | included, excluded, processing, error | US2 |
| `FragmentItem` | default, search match | US2 |
| `ClassCode` | active, copied, disabled | US4 |
| `FlagControl` | none, incorrect, needs-improvement | US8 |
| `QuizQuestion` | unanswered, correct, incorrect | US10, US11 |
| `ProgressByTopic` | bar with text label | US13 |
| `EmptyState`, `ErrorState`, `Skeleton`, `Toast`, `Dialog`, `AccessDenied` | generic states | All |

## Bilingual Copy

- Every visible string, plus annotated alt text and accessible names, is a string variable in the
  `copy` collection with `es` and `en` modes. No literal text on frames except sample user
  content (also variables where feasible; see R-04).
- Key structure: `role/screen/element` → `role.screen.element` in code, e.g.
  `student/chat/limitReached` → `student.chat.limitReached`; shared: `common/actions/retry`.
- Plurals use separate keys with a suffix (`student/chat/remaining_one`,
  `student/chat/remaining_other`) so they map to future plural rules.
- Dates and numbers are written in each mode in that locale's format (`4 oct 2026` / `Oct 4, 2026`).
- **Check**: every P1 screen is viewed in both modes. Breakages (truncation, wrapping, overflow)
  are logged on Validation Notes and fixed or recorded with the reason they are accepted.
  English is usually shorter than Spanish, but labels such as buttons and chips are checked in both.

## Screen Inventory

Legend for states: D default · E empty · L loading · Er error · LR limit reached · NS no
validated source · AI AI disclosure · SC source citations. "M" = 390 px mobile frame required.

| # | Role | Screen | Story | Req IDs | Prio | States | M |
|---|---|---|---|---|---|---|---|
| 1 | All | Sign-in | US-07 | P1 | P1 | D, L, Er (invalid credentials), session expired | ✓ |
| 2 | All | Password recovery | US-07 | P1 | P1 | D, L, Er, sent | ✓ |
| 3 | All | Access denied / not found | US-07 | P1 | P1 | D | ✓ |
| 4 | All | About (IMFAHE, privacy) | US-07 | FR-005 | P1 | D | ✓ |
| 5 | Student | Consent & AI transparency | US-01, US-07 | S1, P1 | P1 | D, AI, Er, revoked | ✓ |
| 6 | Student | My courses | US-04 | T1 | P1 | D, E, L, Er | ✓ |
| 7 | Student | Join course (code / link) | US-04 | T1 | P1 | D, L, Er (invalid / expired / disabled), confirm | ✓ |
| 8 | Student | Course chat | US-01 | S1, S2 | P1 | D, E (first use), L (tutor writing), Er (failed message), LR, low allowance, NS, AI, SC | ✓ |
| 9 | Student | Citation sheet | US-01 | S1 | P1 | D (SC), document unavailable | ✓ |
| 10 | Student | Course chat – guided mode | US-05 | S3 | P1 | D, hint N, all hints seen (solution allowed / hints only), NS, SC, LR | ✓ |
| 11 | Student | Submit exercise | US-06 | S4 | P1 | D, review, L, Er (empty / unreadable photo), LR | ✓ |
| 12 | Student | Exercise feedback | US-06, US-12 | S4, S5 | P1 | D (SC), L (pending), NS, Er, repeated-mistake notice | ✓ |
| 13 | Student | Profile & consent | US-07 | P1 | P1 | D, revoke confirm, revoked | ✓ |
| 14 | Teacher | My courses | US-04 | T1 | P1 | D, E, L, Er | ✓ |
| 15 | Teacher | Create course | US-04 | T1 | P1 | D, validation Er, L | — |
| 16 | Teacher | Course overview (code, link, students) | US-04 | T1 | P1 | D, E (no students), L, Er, code copied, code disabled, regenerate confirm | ✓ |
| 17 | Teacher | Material list & upload | US-02 | T2 | P1 | D, E, L, per-file uploading/processing/ready/error, all excluded warning, duplicate dialog | ✓ |
| 18 | Teacher | Fragment review | US-02 | T2 | P1 | D, L, Er, search with / without results | — |
| 19 | Teacher | Tutor settings | US-03 | T3, S3 | P1 | D (defaults), preview, unsaved-changes dialog, saved, Er (save failed) | — |
| 20 | Admin | Users | US-07 | P1 | P1 | D, E, L, Er | ✓ |
| 21 | Admin | Create teacher | US-07 | P1 | P1 | D, validation Er, L, created (pending invitation) | — |
| 22 | Admin | Courses | US-07 | P1 | P1 | D, E, L, Er | — |
| 23 | Teacher | Conversations list | US-08 | T4 | P2 | D, E, L, Er, filtered, no results | ✓ |
| 24 | Teacher | Conversation detail | US-08 | T4, T6, S1, S2 | P2 | D (SC), NS message, flag dialog, flagged | — |
| 25 | Teacher | Flags list | US-08 | T6 | P2 | D, E, L, Er | — |
| 26 | Teacher | Dashboard | US-09 | T5 | P2 | D (by topic / by student), E (not enough data), L, Er | — |
| 27 | Teacher | At-risk student detail | US-09 | T5 | P2 | D (indicators + example errors), L, Er | — |
| 28 | Teacher | Quiz question review | US-10 | T7 | P2 | D (pending / approved / rejected tabs, SC), edit, E, L, Er | — |
| 29 | Student | Quiz | US-11 | S6 | P2 | D, correct, incorrect (SC), difficulty change, E (no questions), L, Er | ✓ |
| 30 | Student | Quiz summary | US-11 | S6 | P2 | D | ✓ |
| 31 | Student | Targeted explanation / practice | US-12 | S5 | P2 | D (SC), NS, L, Er | ✓ |
| 32 | Student | My progress | US-13 | S7 | P3 | D, E, L, Er | ✓ |

The student AppShell persistently shows the AI label, the teacher-review notice and the message
allowance (FR-010, FR-011, FR-014), so these appear in every chat and exercise frame.

## Prototype Flows

Each P1 flow covers all the acceptance scenarios listed; error and limit branches are
reached through visible prototype hotspots (a "simulate" toggle in the flow-start frame) so
the facilitator can trigger them.

| Flow | Role | Width | Steps (screens) | Covers |
|---|---|---|---|---|
| F1 Teacher uploads and validates material | Teacher | 1440 | My courses → Course → Material (empty) → upload → per-file progress → one error → Fragment review → exclude/include → all-excluded warning | US-02 AS1–6, T2 |
| F2 Student asks and sees cited sources | Student | 390 (+1440) | Sign-in → Consent/AI disclosure → My courses → Chat (first use) → ask → tutor writing → answer with citations → citation sheet → back | US-01 AS1–3, AS7; US-07 AS1–2, AS4; S1 |
| F3 Student gets "material does not cover this" | Student | 390 | Chat → ask off-topic question → NS answer → suggested next step | US-01 AS4; S2 |
| F4 Student reaches the daily limit | Student | 390 | Chat (low allowance warning) → send → limit reached → input disabled, reset time, history readable → exercise submit also blocked | US-01 AS5–6; US-06 AS6 |
| F5 Admin minimal tasks | Admin | 1440 | Sign-in → Users (empty → populated) → Create teacher → pending invitation → Courses; plus access-denied when visiting the teacher area | US-07 AS2, AS5–6; P1 |
| F6 Teacher creates course, student joins | Teacher → Student | 1440 / 390 | Create course → code copied → (student) Join → invalid code → valid code → confirm → course in list | US-04 AS1–6; T1 |
| F7 Teacher configures tutor | Teacher | 1440 | Tutor settings → hints only → preview → unsaved changes → save → save failed → retry | US-03 AS1–4; T3 |
| F8 Student guided mode | Student | 390 | Chat (guided indicator) → hint 1 → another hint → all hints → solution allowed / hints-only variants | US-05 AS1–4; S3 |
| F9 Student exercise feedback | Student | 390 | Submit → review → pending → feedback with mistake + citations → NS variant → unreadable photo | US-06 AS1–5; S4 |
| F10 Sign-in errors and session | All | 390 / 1440 | Invalid credentials → recovery → session expired → back to same place | US-07 AS3, AS7 |
| F11–F15 P2/P3 happy paths | Teacher / Student | per screen | Conversations + flag; dashboard + at-risk; question review; quiz; repeated-mistake help; progress | US-08 to US-13 |

F1–F5 are the required minimum (one per role at least: teacher F1, student F2–F4, admin F5).
F6–F10 complete the "every P1 acceptance scenario" requirement (FR-051).

## Sample Content

All sample content is fictitious and exists in ES and EN.

- **Course**: "Matemáticas 3º ESO – Álgebra" / "Year 9 Maths – Algebra". Topics: linear equations,
  systems of equations, polynomials, factorisation.
- **Documents**: `Tema 3 – Ecuaciones de primer grado.pdf` (24 pages),
  `Apuntes – Sistemas de ecuaciones.docx`, `Ejercicios resueltos – Polinomios.md`, and one
  scanned PDF that fails processing (error state).
- **Questions**: "¿Cómo despejo x en 3x + 5 = 20?" (covered; citation: Tema 3, p. 12);
  "¿Quién inventó el álgebra?" (not covered → NS); worked exercise "2(x − 3) = 4x + 2" with a
  sign error in step 2 (S4 feedback).
- **People** (fictitious, no real data): teacher "Prof. Elena Ruiz Navarro"; students "Lucas
  Herrera", "Aisha Benali", "Mateo Ortega", pseudonyms "Estudiante-07", "Estudiante-12";
  admin "Admin DocentAI". Emails use the reserved `example.org` domain.
- **Numbers**: daily limit 30 messages (illustrative, per spec Assumptions), reset 00:00 local
  time; dates in October–November 2026.
- Before validation, check that no sample name matches a team member or participant.

The content level is secondary school (ESO), as requested for this prototype; pilot
participants are adults (requirements §2), so copy addressed to students stays in a neutral
adult register.

## Validation Protocol (summary)

Full procedure in [quickstart.md](quickstart.md).

- **Participants**: ≥5 students (on their own phone) and ≥3 teachers (desktop); optional 1
  admin-role run by a team member. Adults, recruited from the team's network, not pilot
  participants (spec Assumptions).
- **Tasks**: one per flow, written from the acceptance scenarios (F1–F5 mandatory; F6–F10 for
  the participants whose role matches them).
- **Success criteria**: SC-001 to SC-007 from the spec; per task: completed unaided / with help /
  failed, time, errors, plus post-session comprehension questions for SC-002 and SC-003.
- **Recording**: only with signed consent; screen + audio; stored in the team's private storage
  (not in the repo or Figma); deleted once findings are written; findings use participant codes.
- **Feedback loop**: each finding → severity → if it changes behavior, update `spec.md` first
  (via `/speckit-clarify` or a spec edit), then Figma; log the decision on Validation Notes with
  the spec change it caused.

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-prototype/
├── spec.md              # Feature spec (revised for constitution 2.0.0)
├── plan.md              # This file
├── research.md          # Phase 0: design decisions and alternatives
├── data-model.md        # Phase 1: information each screen displays
├── quickstart.md        # Phase 1: how to run a validation session
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

**contracts/**: not created. This feature exposes no interface to other systems: it produces
a design file, not an API, library or CLI. The UI-to-backend contract will be generated from
the FastAPI OpenAPI schema in an implementation feature (Constitution VI), using
[data-model.md](data-model.md) as input.

### Source Code (repository root)

None. This feature changes no files outside `specs/001-mvp-prototype/`. The Figma file lives
outside the repository; its link is recorded in the spec's "Figma frames" table and on the
Cover page.

**Structure Decision**: documentation-only feature. The design artifacts live in Figma; the
planning artifacts live in this feature folder.

## Complexity Tracking

No Constitution Check violations; table not needed.
