---

description: "Task list for the DocentAI MVP Figma prototype (design deliverable, no code)"
---

# Tasks: DocentAI MVP Prototype (Frontend UI)

**Input**: Design documents from `/specs/001-mvp-prototype/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [quickstart.md](quickstart.md). There is no `contracts/`
(see plan.md).

**Tests**: No automated test tasks. The spec does not request them, and Constitution V
(Test-First) is N/A for a design deliverable. Each story instead ends with **verification**
tasks: an ES/EN mode check, a contrast check and acceptance-scenario traceability. Moderated
usability sessions run in the final phase ([quickstart.md](quickstart.md)).

**Organization**: Tasks are grouped by user story so each story's screens and flow can be built
and reviewed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different Figma pages/sections or files, no dependency on an
  unfinished task)
- **[Story]**: The user story the task belongs to (US1 … US13, as numbered in spec.md)

## Path Conventions

This feature produces a Figma file, not code. "Paths" are:

- **Figma locations**: `Figma › <Page> › <Section> › <frame or component name>`. Frame names
  follow plan.md: `US-NN · <Req IDs> · <Role> <screen> – <state> · <width>`.
- **Repo files**: only under `specs/001-mvp-prototype/` (plan.md: no other repository changes).
- Screen numbers `#N` refer to the Screen Inventory in plan.md.
- Every screen frame is built as a component (research R-05). Its instances are placed on
  `Figma › Prototype Flows`.

---

## Phase 1: Setup (File and account)

**Purpose**: Account, file skeleton and open decisions that block design work

- [ ] T001 Confirm a Figma plan with ≥2 variable modes per collection (apply for Figma for Education first, else 1 Professional seat), verify the current mode limit and allowed variable-name characters, and record the outcome under R-01/R-02 in specs/001-mvp-prototype/research.md
- [ ] T002 Create the Figma Design file "DocentAI – MVP Prototype" with pages Cover, Design System, Admin, Teacher, Student, Prototype Flows, Validation Notes (Figma › all pages)
- [ ] T003 [P] Build the Cover page: project name, version, date, status "Draft", link to spec.md, IMFAHE logo and acknowledgement, page index (Figma › Cover)
- [ ] T004 [P] Set up the Validation Notes page skeleton: session plan, task list, findings table (participant code, frame, severity, spec IDs), decision log (Figma › Validation Notes)
- [ ] T005 [P] Create story sections US-01 … US-13 on the Admin, Teacher and Student pages in story order (Figma › Admin, Teacher, Student)
- [ ] T006 Add the Figma file link to the Cover page and to the "Figma frames" table in specs/001-mvp-prototype/spec.md
- [ ] T007 Resolve the daily-limit scope open question in specs/001-mvp-prototype/data-model.md (per student vs per course) via `/speckit-clarify`, updating specs/001-mvp-prototype/spec.md first

---

## Phase 2: Foundational (Design system and shared patterns)

**Purpose**: Tokens, copy infrastructure and components that every story uses

**⚠️ CRITICAL**: No story screens can be built until this phase is complete

### Variables and styles

- [ ] T008 Create the `color` collection with a single `light` mode: palettes neutral, primary, success, warning, danger, info (`color/<palette>/<step>`) and semantic aliases such as `color/text/default`, `color/surface/raised`, `color/border/focus` (Figma › Design System › Color)
- [ ] T009 [P] Create the `spacing` collection on a 4 px base with steps 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16 (`spacing/<step>` → `--spacing-*`) (Figma › Design System › Spacing)
- [ ] T010 [P] Create the `radius` collection with sm, md, lg, xl, full (`radius/<size>` → `--radius-*`) (Figma › Design System › Radius)
- [ ] T011 [P] Create the `typography` variables (`font/*`, `text/*`, `leading/*`, `font-weight/*`) and the text styles built on them (Figma › Design System › Typography)
- [ ] T012 [P] Create effect styles `shadow/sm`, `shadow/md`, `shadow/lg` with colors bound to `color/*` variables (research R-03) (Figma › Design System › Shadows)
- [ ] T013 Build the contrast table for every text/background and UI/background pair (AA: ≥4.5:1 text, ≥3:1 large text and UI parts) and fix any failing pair (Figma › Design System › Contrast)
- [ ] T014 Document the variable → token mapping rule (`color/primary/500` → `--color-primary-500`; copy `student/chat/limitReached` → `student.chat.limitReached`) on Figma › Design System › Naming

### Copy collection (bilingual)

- [ ] T015 Create the `copy` string collection with modes `es` (default) and `en`, and `common/*` keys for shared actions and states (retry, cancel, back, loading, generic error) (Figma › Design System › Copy)
- [ ] T016 [P] Add plural-key and locale conventions to the Copy section: `…_one` / `…_other` keys, and dates and numbers written per locale (`4 oct 2026` / `Oct 4, 2026`) (research R-14) (Figma › Design System › Copy)
- [ ] T017 [P] Create `sample/*` string variables (ES/EN) for the fictitious course, documents, people (`example.org` emails) and algebra content from plan.md "Sample Content", marked as not i18n keys (research R-04) (Figma › Design System › Copy)

### Base components (variants: default, hover, focus, disabled, loading, error where relevant; targets ≥24×24 px, 44×44 px for primary mobile actions)

- [ ] T018 [P] Create `Button` (primary, secondary, ghost, danger × sm/md × states) and `IconButton` with accessible-name annotation (Figma › Design System › Components)
- [ ] T019 [P] Create `TextField`, `TextArea`, `Select`, `Toggle`, `RadioGroup` with helper and error text (Figma › Design System › Components)
- [ ] T020 [P] Create `Card` (default, interactive), `Dialog` and `Toast` (Figma › Design System › Components)
- [ ] T021 [P] Create `EmptyState`, `ErrorState`, `Skeleton` and `AccessDenied` (Figma › Design System › Components)
- [ ] T022 [P] Create `LanguageSwitcher` (ES/EN) and `ImfaheAcknowledgement` (footer, sign-in, about variants) (Figma › Design System › Components)
- [ ] T023 Create `AppShell` variants admin, teacher and student × 1440/390, each with its own navigation; the student shell carries slots for the AI label, teacher-review notice and message allowance (FR-010, FR-011, FR-014) (Figma › Design System › Components)

### Shared student AI patterns (used by US1, US5, US6, US8, US10–US12)

- [ ] T024 [P] Create `SourceCitation` (chip, expanded, "Documento ya no disponible" unavailable variant) and `CitationSheet` (bottom sheet 390, side panel 1440) (research R-07) (Figma › Design System › Components)
- [ ] T025 [P] Create `NoSourceNotice`: info icon, info color (not error red), heading "El material del curso no cubre esta pregunta", actions "Reformular la pregunta" / "Preguntar al profesor/a" (research R-08) (Figma › Design System › Components)
- [ ] T026 [P] Create `AIDisclosure` (first-use dialog with required acknowledgement; persistent header label) (research R-10) (Figma › Design System › Components)
- [ ] T027 [P] Create `MessageAllowance` (normal, low at "≤5", reached) and `LimitReachedBanner` (chat and exercise variants, with reset time "00:00") (research R-09) (Figma › Design System › Components)
- [ ] T028 Create `ChatMessage` (student, tutor-answer with "IA" tag and citation row, tutor-hint, tutor-no-source using `NoSourceNotice`, failed) and `ChatComposer` (default, sending, disabled-by-limit) (Figma › Design System › Components)

### Accessibility and prototype kit

- [ ] T029 [P] Create the focus-ring spec (2 px `color/border/focus`, 2 px offset, ≥3:1) and the numbered focus-order annotation kit (research R-12) (Figma › Design System › Accessibility)
- [ ] T030 [P] Write the motion spec: "Instant" or a short dissolve, with a no-motion alternative for `prefers-reduced-motion` (Figma › Design System › Motion)
- [ ] T031 [P] Create the facilitator-only "Simular" panel component with hotspots for network error, limit reached and upload failure, labelled as not part of the product (research R-15) (Figma › Design System › Prototype kit)

**Checkpoint**: Design system ready. Story screens can now be built in parallel.

---

## Phase 3: User Story 1 — Student asks the tutor and sees sources (Priority: P1) 🎯 MVP

**Goal**: Student chat with citations, the "not covered" answer, AI disclosure and the daily limit (S1, S2)

**Independent Test**: In the prototype, a student opens a course chat, sends a question, reads a cited answer, opens a citation, gets a "no cubierto por el material" reply and hits the daily limit (flows F2 from the chat, F3, F4)

- [ ] T032 [P] [US1] Design screen #5 Consent & AI transparency in states D, AI, Er, revoked at 1440 and 390 (`US-01 · S1 · Student consent – <state> · <width>`) in Figma › Student › US-01
- [ ] T033 [US1] Design screen #8 Course chat at 1440 and 390 in states: E (first use + `AIDisclosure` dialog), D, L (tutor writing), answer with citations (SC), NS, low allowance, LR, Er (failed message, "Reintentar", shown as not counted) in Figma › Student › US-01
- [ ] T034 [P] [US1] Design screen #9 Citation sheet in states D (document, "p. 12", passage) and document unavailable at 390 (bottom sheet) and 1440 (side panel) in Figma › Student › US-01
- [ ] T035 [US1] Add `student/chat/*` and `student/consent/*` copy keys (ES/EN), including `student/chat/remaining_one` / `_other` and `student/chat/limitReached` in Figma › Design System › Copy
- [ ] T036 [US1] Build flows F2 (consent → chat → ask → cited answer → citation sheet → back), F3 (off-topic question → NS → next step) and F4 (low allowance → limit reached → history readable) with the Simular panel in Figma › Prototype Flows
- [ ] T037 [US1] Add focus-order annotations to the chat and consent frames in Figma › Student › US-01
- [ ] T038 [US1] Verify: switch every US-01 frame between ES and EN and log breakages; check contrast; trace US-01 AS1–AS7 to F2/F3/F4 steps in Figma › Validation Notes

**Checkpoint**: The MVP student experience is clickable and can be shown on its own.

---

## Phase 4: User Story 2 — Teacher uploads and curates material (Priority: P1)

**Goal**: Upload, processing, fragment review and include/exclude (T2)

**Independent Test**: A teacher uploads a file, sees progress and one error, opens fragment review and toggles inclusion (flow F1)

- [ ] T039 [P] [US2] Create `FileUploadItem` (uploading with %, processing, ready, error), `DocumentRow` (included, excluded, processing, error) and `FragmentItem` (default, search match) in Figma › Design System › Components
- [ ] T040 [US2] Design screen #17 Material list & upload in states E (accepted formats "PDF, DOCX, MD", max size "20 MB" illustrative), L, D, per-file uploading/processing/ready/error (unsupported format / too large / no readable text), all-excluded warning, and the duplicate dialog (replace or keep both) at 1440 and 390 in Figma › Teacher › US-02
- [ ] T041 [P] [US2] Design screen #18 Fragment review in states D (ordered fragments with "p. 12" / "§ 3.2" location), L, Er, search with and without results at 1440 in Figma › Teacher › US-02
- [ ] T042 [US2] Add `teacher/material/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T043 [US2] Build flow F1 (My courses → Course → Material empty → upload → progress → scanned-PDF error → fragment review → exclude/include → all-excluded warning) in Figma › Prototype Flows
- [ ] T044 [US2] Verify: ES/EN check, contrast, focus order; trace US-02 AS1–AS6 to F1 in Figma › Validation Notes

**Checkpoint**: The teacher material flow is clickable on its own.

---

## Phase 5: User Story 3 — Teacher configures the tutor (Priority: P1)

**Goal**: Level, tone and solution policy, with a preview (T3)

**Independent Test**: A teacher changes the settings, sees the preview, saves, and recovers from a save failure (flow F7)

- [ ] T045 [US3] Design screen #19 Tutor settings at 1440 in states D (defaults: level "Intermedio", tone "Cercano", "hints first, then solution"; one-line explanation per option), preview example exchange, unsaved-changes dialog, saved, Er (save failed, changes kept, retry) in Figma › Teacher › US-03
- [ ] T046 [US3] Add `teacher/tutorSettings/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T047 [US3] Build flow F7 (settings → hints only → preview → leave with unsaved changes → save → save failed → retry) in Figma › Prototype Flows
- [ ] T048 [US3] Verify: ES/EN check, contrast, focus order; trace US-03 AS1–AS4 to F7 in Figma › Validation Notes

---

## Phase 6: User Story 4 — Teacher creates a course and students join (Priority: P1)

**Goal**: Course creation, class code/link and student join (T1)

**Independent Test**: A teacher creates a course and copies the code; a student enters an invalid code, then a valid one, and sees the course (flow F6)

- [ ] T049 [P] [US4] Create `ClassCode` (active, copied, disabled) in Figma › Design System › Components
- [ ] T050 [P] [US4] Design screen #14 Teacher My courses (D, E, L, Er) at 1440 and 390, and #15 Create course (D, validation Er for name "required (1–80 characters)", L) at 1440 in Figma › Teacher › US-04
- [ ] T051 [US4] Design screen #16 Course overview at 1440 and 390 in states D (code "ALG-7K3P", link, students), E (no students), L, Er, code copied, code disabled, regenerate confirm in Figma › Teacher › US-04
- [ ] T052 [P] [US4] Design screens #6 Student My courses (D, E with "Unirse a un curso", L, Er) and #7 Join course (D, L, Er invalid / expired / disabled, confirm with course and teacher name) at 390 and 1440 in Figma › Student › US-04
- [ ] T053 [US4] Add `teacher/courses/*`, `teacher/course/*`, `student/courses/*`, `student/join/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T054 [US4] Build flow F6 (create course → copy code → student join → invalid code → valid code → confirm → course in list) in Figma › Prototype Flows
- [ ] T055 [US4] Verify: ES/EN check, contrast, focus order; trace US-04 AS1–AS6 to F6 in Figma › Validation Notes

---

## Phase 7: User Story 5 — Student guided (Socratic) mode (Priority: P1)

**Goal**: Numbered hints, "Otra pista", solution only if allowed (S3)

**Independent Test**: In a guided-mode chat, a student gets hint 1, asks for more, and reaches the end of the hints in both policy variants (flow F8)

- [ ] T056 [P] [US5] Create `GuidedModeIndicator` (on, with hint counter) in Figma › Design System › Components
- [ ] T057 [US5] Design screen #10 Chat – guided mode at 390 and 1440 in states D (indicator), hint N with "Otra pista" / "Intentarlo yo" and citations, all hints seen with "Ver solución", all hints seen with hints-only note, NS, LR in Figma › Student › US-05
- [ ] T058 [US5] Add `student/guided/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T059 [US5] Build flow F8 (indicator → hint 1 → another hint → last hint → solution-allowed and hints-only variants) in Figma › Prototype Flows
- [ ] T060 [US5] Verify: ES/EN check, contrast, focus order; trace US-05 AS1–AS4 to F8 in Figma › Validation Notes

---

## Phase 8: User Story 6 — Student submits a worked exercise (Priority: P1)

**Goal**: Submit a worked answer and get feedback on the specific mistake (S4)

**Independent Test**: A student submits "2(x − 3) = 4x + 2" with a sign error in step 2 and reads feedback pointing to "Paso 2" (flow F9)

- [ ] T061 [US6] Design screen #11 Submit exercise at 390 and 1440 in states D (problem + typed steps + optional photo "JPG/PNG"), review, L, Er (empty submission / unreadable photo), LR in Figma › Student › US-06
- [ ] T062 [US6] Design screen #12 Exercise feedback at 390 and 1440 in states L (pending, can leave and return), D (verdict, "Paso 2", explanation with citations, no full solution in guided mode), NS, Er in Figma › Student › US-06
- [ ] T063 [US6] Add `student/exercise/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T064 [US6] Build flow F9 (submit → review → pending → feedback → NS variant → unreadable photo) and add the exercise branch of F4 (submission blocked at the limit) in Figma › Prototype Flows
- [ ] T065 [US6] Verify: ES/EN check, contrast, focus order; trace US-06 AS1–AS6 to F9/F4 in Figma › Validation Notes

---

## Phase 9: User Story 7 — Sign-in, role separation and minimal admin (Priority: P1)

**Goal**: Sign-in, a home per role, access denied, consent on first use, admin user management (P1)

**Independent Test**: Admin, teacher and student sign-ins reach three different homes; visiting another role's area shows access denied; admin creates a teacher (flows F5, F10)

- [ ] T066 [P] [US7] Design screens #1 Sign-in (D, L, Er "Correo o contraseña incorrectos", session expired; with `LanguageSwitcher` and `ImfaheAcknowledgement`) and #2 Password recovery (D, L, Er, sent) at 1440 and 390 in Figma › Admin › US-07 (shared screens kept on the Admin page and listed on the Cover index)
- [ ] T067 [P] [US7] Design screens #3 Access denied / not found and #4 About (IMFAHE logo and acknowledgement, privacy) at 1440 and 390 in Figma › Admin › US-07
- [ ] T068 [P] [US7] Design screen #13 Profile & consent (D, revoke confirm, revoked) at 390 and 1440 in Figma › Student › US-07
- [ ] T069 [US7] Design admin screens #20 Users (D, E, L, Er; status active / pending invitation / disabled) at 1440 and 390, #21 Create teacher (D, validation Er, L, created with pending invitation) and #22 Courses (D, E, L, Er) at 1440 in Figma › Admin › US-07
- [ ] T070 [US7] Add `common/auth/*`, `common/errors/*`, `admin/users/*`, `admin/courses/*`, `student/profile/*` copy keys (ES/EN) in Figma › Design System › Copy
- [ ] T071 [US7] Build flows F5 (admin sign-in → users empty → create teacher → pending → courses → access denied on the teacher area) and F10 (invalid credentials → recovery → session expired → back to the same place) in Figma › Prototype Flows
- [ ] T072 [US7] Verify: ES/EN check, contrast, focus order; check that no frame shows another student's data or another teacher's course (Constitution II); trace US-07 AS1–AS7 to F5/F10/F2 in Figma › Validation Notes

**Checkpoint**: All P1 stories are clickable; the five required flows (F1–F5) exist.

---

## Phase 10: User Story 8 — Teacher reviews conversations and flags answers (Priority: P2)

**Goal**: Conversation review and flagging (T4, T6)

**Independent Test**: A teacher filters conversations, opens one and flags a tutor answer (flow F11)

- [ ] T073 [P] [US8] Create `FlagControl` (none, incorrect, needs improvement) in Figma › Design System › Components
- [ ] T074 [US8] Design screens #23 Conversations list (D with no-source marker, E, L, Er, filtered, no results; at 1440 and 390), #24 Conversation detail (D with citations, NS message, flag dialog, flagged) and #25 Flags list (D, E, L, Er) at 1440 in Figma › Teacher › US-08
- [ ] T075 [US8] Add `teacher/conversations/*` and `teacher/flags/*` copy keys (ES/EN) and build the F11 happy path in Figma › Prototype Flows
- [ ] T076 [US8] Verify: ES/EN check, contrast; confirm the student chat shell shows the teacher-review notice (AS5); trace US-08 AS1–AS5 in Figma › Validation Notes

---

## Phase 11: User Story 9 — Teacher dashboard: recurring errors and at-risk students (Priority: P2)

**Goal**: Errors by topic and by student; at-risk list with the data behind it (T5)

**Independent Test**: A teacher switches the grouping and opens an at-risk student to see why they were flagged (flow F12)

- [ ] T077 [US9] Design screen #26 Dashboard (D by topic, D by student, time range, E "not enough data", L, Er) and #27 At-risk student detail (reasons such as "Sin actividad en 7 días" / "Tasa de error 60%", activity series, example errors; L, Er) at 1440 in Figma › Teacher › US-09
- [ ] T078 [US9] Add `teacher/dashboard/*` copy keys (ES/EN), build the F12 happy path, verify ES/EN and contrast (chart colors never the only signal), and trace US-09 AS1–AS3 in Figma › Prototype Flows and Figma › Validation Notes

---

## Phase 12: User Story 10 — Teacher approves quiz questions (Priority: P2)

**Goal**: Review, edit, approve and reject AI-drafted questions (T7)

**Independent Test**: A teacher edits one pending question, approves one and rejects one (flow F13)

- [ ] T079 [P] [US10] Create `QuizQuestion` (unanswered, correct, incorrect; teacher review variant with difficulty, topic, citation) in Figma › Design System › Components
- [ ] T080 [US10] Design screen #28 Quiz question review (pending / approved / rejected tabs with counters, edit, E with "request new questions for a topic", L, Er) at 1440 in Figma › Teacher › US-10
- [ ] T081 [US10] Add `teacher/questions/*` copy keys (ES/EN), build the F13 happy path, verify ES/EN and contrast, and trace US-10 AS1–AS3 in Figma › Prototype Flows and Figma › Validation Notes

---

## Phase 13: User Story 11 — Student adaptive quizzes (Priority: P2)

**Goal**: Quiz with immediate feedback and difficulty that adapts (S6)

**Independent Test**: A student answers correctly and incorrectly, sees feedback each time and reaches the summary (flow F14)

- [ ] T082 [US11] Design screens #29 Quiz (D, correct, incorrect with citation, difficulty change "Subimos el nivel", E no questions, L, Er) and #30 Quiz summary (score by topic, next steps) at 390 and 1440 in Figma › Student › US-11
- [ ] T083 [US11] Add `student/quiz/*` copy keys (ES/EN), build the F14 happy path, verify ES/EN and contrast, and trace US-11 AS1–AS5 in Figma › Prototype Flows and Figma › Validation Notes

---

## Phase 14: User Story 12 — Student targeted help for repeated mistakes (Priority: P2)

**Goal**: Repeated-mistake notice with an explanation or practice (S5)

**Independent Test**: After feedback, a student sees "Has cometido este error 3 veces" and opens the explanation (flow F15)

- [ ] T084 [US12] Add the repeated-mistake notice state to screen #12 (pattern name, "Ver explicación", "Practicar", dismiss) and design screen #31 Targeted explanation / practice (D with citations, NS, L, Er) at 390 and 1440 in Figma › Student › US-12
- [ ] T085 [US12] Add `student/errorPatterns/*` copy keys (ES/EN), build the F15 happy path, verify ES/EN and contrast, and trace US-12 AS1–AS3 in Figma › Prototype Flows and Figma › Validation Notes

---

## Phase 15: User Story 13 — Student views progress by topic (Priority: P3)

**Goal**: Progress per topic based only on the student's own activity (S7)

**Independent Test**: A student opens "Mi progreso" and sees per-topic progress with its basis in text

- [ ] T086 [P] [US13] Create `ProgressByTopic` (bar with a text label such as "6 de 10 ejercicios correctos") in Figma › Design System › Components
- [ ] T087 [US13] Design screen #32 My progress (D, E, L, Er) at 390 and 1440, add `student/progress/*` copy keys (ES/EN), build the happy path, verify ES/EN and contrast, and trace US-13 AS1–AS2 in Figma › Student › US-13 and Figma › Prototype Flows

---

## Phase 16: Polish, validation and sign-off

**Purpose**: Cross-story consistency, usability validation and spec traceability

- [ ] T088 Connect the full F2 path from sign-in (US7) → My courses (US4) → consent → chat (US1) in Figma › Prototype Flows
- [ ] T089 [P] Audit every frame: all fills, spacing, radius and text bound to variables or styles; no detached components; names follow `US-NN · <Req IDs> · <Role> <screen> – <state> · <width>` (Figma › all pages)
- [ ] T090 [P] Audit the Screen Inventory: each of the 32 screens has every listed state, and 390 px frames exist where the plan marks "M" (SC-005) (Figma › Admin, Teacher, Student)
- [ ] T091 [P] Check that `ImfaheAcknowledgement` is on sign-in and About, and reachable in ≤1 click/tap from every role's home (SC-007) (Figma › all role pages)
- [ ] T092 [P] Check that every P1 screen has focus-order annotations and that no state is signalled by color alone (Figma › all role pages)
- [ ] T093 Check that no sample name matches a team member or participant, and that all emails use `example.org` (Figma › Design System › Copy `sample/*`)
- [ ] T094 Get pedagogy-team review of student-facing copy (ES/EN) and the guided-mode flow; record the sign-off for SC-006 in Figma › Validation Notes
- [ ] T095 Prepare the sessions per quickstart.md §1: view-only share links per flow, consent form, private recording storage, session sheets (Figma › Prototype Flows; materials outside the repo)
- [ ] T096 Run ≥5 student sessions (own phone) with tasks S-1 to S-5 and comprehension questions per specs/001-mvp-prototype/quickstart.md
- [ ] T097 [P] Run ≥3 teacher sessions (desktop) with tasks T-1 to T-3 and 1 admin run (A-1) per specs/001-mvp-prototype/quickstart.md
- [ ] T098 Write anonymised findings (participant codes, frame, severity, spec IDs) within 24 h of each session, then delete the recordings and note the deletion date (Figma › Validation Notes)
- [ ] T099 Apply critical and major findings: behavior changes in specs/001-mvp-prototype/spec.md first, then Figma; log each decision with its spec revision (Figma › Validation Notes)
- [ ] T100 Re-test changed P1 flows with ≥2 new participants if any critical finding was fixed (per specs/001-mvp-prototype/quickstart.md §8)
- [ ] T101 Fill in the SC-001 to SC-007 results table in Figma › Validation Notes; when all pass, set Cover status to "Validated" with date and version
- [ ] T102 Fill the "Figma frames" table in specs/001-mvp-prototype/spec.md with frame links per user story (FR-052)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: starts immediately. T001 blocks T015 (two copy modes need the right plan). T007 must finish before T035/T027 copy for the limit is final.
- **Foundational (Phase 2)**: depends on Setup and blocks all story phases.
- **Story phases (3–15)**: depend on Foundational only and can run in parallel. Recommended
  order is by priority: US1 → US2 → US3 → US4 → US5 → US6 → US7 (P1), then US8–US12 (P2), then US13 (P3).
- **Polish (Phase 16)**: T088 needs US1, US4 and US7. Sessions T096/T097 need at least all P1
  phases (F1–F10). T101/T102 need T099/T100.

### User Story Dependencies

- **US1**: none beyond Foundational. Its flow starts at consent and is linked from sign-in later (T088).
- **US2, US3, US4, US7**: independent.
- **US5, US6**: reuse the US1 chat frames as their visual base, but have their own screens and flows.
- **US8**: independent. It reuses `ChatMessage` and `SourceCitation` from Foundational.
- **US11**: needs `QuizQuestion` from US10 (T079).
- **US12**: extends screen #12 from US6 (T062).
- **US13**: independent.

### Within each story

Components → screens (all states, both widths) → copy keys → flow → verification.

### Parallel opportunities

- Phase 1: T003, T004, T005 in parallel after T002.
- Phase 2: T009–T012 in parallel after T008; T016/T017 after T015; T018–T022 and T024–T027 in parallel; T029–T031 in parallel.
- After Phase 2, different designers can take different stories (e.g. one designer on Student
  US1/US5/US6, one on Teacher US2/US3/US4, a team member on Admin US7).

---

## Parallel Example: User Story 1

```text
# After Foundational, in parallel (different sections/frames):
Task: "T032 [US1] Design screen #5 Consent & AI transparency in Figma › Student › US-01"
Task: "T034 [US1] Design screen #9 Citation sheet in Figma › Student › US-01"

# Then sequentially:
Task: "T033 [US1] Design screen #8 Course chat (all states)"
Task: "T035 [US1] Add student/chat/* copy keys (ES/EN)"
Task: "T036 [US1] Build flows F2, F3, F4"
```

## Parallel Example: P1 teacher stories

```text
Task: "T039 [US2] Create FileUploadItem, DocumentRow, FragmentItem"
Task: "T049 [US4] Create ClassCode"
Task: "T045 [US3] Design screen #19 Tutor settings"
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1 Setup → Phase 2 Foundational.
2. Phase 3 (US1): chat, citations, no-source answer, limit, disclosure.
3. **STOP and VALIDATE**: run 2–3 quick student sessions on F2–F4 only. The core value proposition
   is tested before investing in teacher screens.

### Incremental delivery

1. Add US2 (F1) and US7 (F5) next. With US1, these give the five required flows F1–F5.
2. Add US3, US4, US5 and US6 to complete P1 (F6–F10), then run the full validation (T095–T101).
3. Add P2 stories (US8–US12) as happy paths; validate them with teachers in the same or a later
   round.
4. US13 (P3) last, if time allows before the December 1st, 2026 progress report.

---

## Notes

- [P] = different Figma sections or files, no unfinished dependency.
- Every task's output is a Figma frame, component, variable or flow, or an edit to a file in
  `specs/001-mvp-prototype/`. No code or repository changes elsewhere.
- Behavior changes found at any point go into spec.md first, then Figma (Constitution workflow).
- Commit spec-folder updates as `docs(tasks): …` / `docs(spec): …` (Conventional Commits).
