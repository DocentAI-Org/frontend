# Feature Specification: DocentAI App — P1 Screens Connected to the API v1

**Feature Branch**: `002-app-api-integration`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Implement in the React app every P1 screen of the prototype that the
backend API v1 already supports, connected to the real API (not mocks), so DocentAI can be
demonstrated end to end."

**Sources of truth** (Constitution IV):

- **Behavior**: the user stories and acceptance scenarios of
  [`specs/001-mvp-prototype/spec.md`](../001-mvp-prototype/spec.md) (US1–US8, US14), which this
  feature implements, with the deviations listed below.
- **Visuals**: the validated HTML prototype in `public/prototype/` (screens #1–#8, #10–#25, #33,
  #34 of the 001 plan's page table). Each implemented screen reuses its tokens and component
  names.
- **Data**: the backend contract `openapi.json` from `DocentAI-Org/backend` (feature
  `001-api-v1-contract`), from which API types are generated (Constitution VI).
- **Requirements**: `knowledge-base/docs/requirements.md` (IDs T#, S#, P#).

**Scope**: the P1 stories whose data the API v1 provides — US1 (chat with citations), US2
(material), US3 (tutor settings), US4 (courses and enrolment), US5 (guided mode), US6 (exercise,
stub feedback), US7 (sign-in, roles, consent, admin), US8 (review and corrections) and US14
(topics), plus a new admin screen for pseudonymous student accounts (US9 here). P2 stories of
001 (US9–US13, US15, US16) are out of scope.

## Clarifications

### Session 2026-10-24

- Q: Which screens does this feature implement? → A: Every P1 screen whose data the API v1
  supports (about 28 screens), not only the demo loop.
- Q: Consent revocation is not in the API v1. → A: Add it to the backend (backend feature 002);
  revoking blocks the chat until the student accepts again.
- Q: The course flags list (#25) and the "corrected" marker are not in the API v1. → A: Add both to
  the backend (backend feature 002). The topic filter on conversations is deferred: conversations
  have no topic.
- Q: Does the admin create pseudonymous student accounts in the app? → A: Yes, with a new admin
  screen, added to the prototype first (Constitution IV).

## User Scenarios & Testing *(mandatory)*

> Every story names its **role(s)** (Constitution II) and the 001 story it implements. Unless a
> deviation says otherwise, **all acceptance scenarios of that 001 story apply unchanged**, now
> against real data; the scenarios below add what connecting to the API introduces. "E2E" means a
> Playwright test with axe checks (Constitution III, V).

### User Story 1 — Everyone signs in and lands in their own area (Priority: P1) 🎯

**Role**: Admin, Teacher, Student · **Implements**: 001 US7 · **Covers**: P1, §4.1

A user signs in with email and password, or a student with their pseudonymous code and password,
and lands on their role's home. Each role has its own navigation; any other area shows the
access-denied screen. Sessions expire safely and return the user where they were.

**Why this priority**: Every other story needs an authenticated user with a role.

**Independent Test**: Sign in as each seeded role, confirm the home and navigation, open another
role's page and see access denied, sign out.

**Acceptance Scenarios**:

1. **Given** the sign-in screen, **When** a student enters a pseudonymous code (e.g.
   `EST-7K3P9`) and password, **Then** they are signed in exactly as with an email.
2. **Given** a signed-in user, **When** the app loads any page, **Then** the role shown and the
   data loaded come from the API (`/v1/me`), never from values stored in the browser.
3. **Given** a session that expires while the user acts, **When** the API rejects the request,
   **Then** the user is sent to sign-in and, after signing in, returned to the same page.
4. **Given** the admin area, **When** the admin creates a teacher, **Then** the screen shows the
   initial password once with a copy action and a warning that it will not be shown again
   (deviation D3).
5. **Given** any page, **When** the user switches language, **Then** every text appears in the
   chosen language (Spanish default, English) and the choice is saved to their profile.

---

### User Story 2 — Teacher creates a course and students join it (Priority: P1)

**Role**: Teacher, Student · **Implements**: 001 US4 · **Covers**: T1

**Why this priority**: Courses connect teachers, material and students.

**Independent Test**: As a teacher create a course and copy its code; as a student join with the
code or the invitation link; the course appears on both sides.

**Acceptance Scenarios**:

1. **Given** the course page, **When** the teacher copies the invitation link, **Then** the link
   is the app's own `/unirse/<code>` address, which opens the join screen with the code filled in.
2. **Given** a join error from the API (`class_code_invalid`, `class_code_disabled`,
   `enrolment_revoked`), **When** it is shown, **Then** each code maps to its own message in both
   languages.

---

### User Story 3 — Teacher uploads, reviews and validates material (Priority: P1)

**Role**: Teacher · **Implements**: 001 US2 · **Covers**: T2

**Why this priority**: The tutor answers nothing without validated material.

**Independent Test**: Upload the sample Markdown, watch it reach "Listo", exclude a fragment,
validate the document, and see the no-validated-material warning disappear.

**Acceptance Scenarios**:

1. **Given** an uploaded document, **When** it is processing, **Then** its status updates on its
   own until it is ready or failed, without reloading the page.
2. **Given** a processing error, **When** it is shown, **Then** the API's `error_reason` maps to
   a specific message (unsupported format, no readable text, processing failed, interrupted) with
   remove and re-upload actions.
3. **Given** the fragment review, **When** the teacher searches, **Then** matching fragments of
   the whole document are found, not only those on screen.
4. **Given** the teacher opens the original file, **When** they select it, **Then** it opens
   through a short-lived link.

---

### User Story 4 — Teacher configures the tutor (Priority: P1)

**Role**: Teacher · **Implements**: 001 US3 · **Covers**: T3

**Independent Test**: Change level, tone and policy, save, reload and see the saved values.

**Acceptance Scenarios**:

1. **Given** the settings screen, **When** the teacher changes a value, **Then** the example
   exchange updates to illustrate it before saving.

---

### User Story 5 — Teacher defines topics and assigns material (Priority: P1)

**Role**: Teacher · **Implements**: 001 US14 · **Covers**: T9

**Independent Test**: Create, rename, reorder and delete topics; assign a section to a topic; the
unassigned list shrinks.

**Acceptance Scenarios**:

1. **Given** the topic assignment screen, **When** the API returns no suggestions, **Then** the
   screen shows the manual assignment flow without a suggestions area (deviation D5).
2. **Given** a duplicate topic name, **When** saving, **Then** the `topic_name_taken` error is
   shown next to the name field.

---

### User Story 6 — Student chats with the tutor, with citations and guided mode (Priority: P1)

**Role**: Student · **Implements**: 001 US1 and US5 · **Covers**: S1, S2, S3, T3 (student side), T6
(student side)

**Why this priority**: The core value of DocentAI.

**Independent Test**: As a student of a course with validated material, acknowledge the AI
disclosure, ask a covered question (answer with citations), open a citation, ask an uncovered one
("no cubierto"), and in a guided course get numbered hints.

**Acceptance Scenarios**:

1. **Given** the first visit to a course chat, **When** the student acknowledges the disclosure,
   **Then** the acknowledgement is saved by the API and not asked again on any device.
2. **Given** a tutor reply, **When** it arrives, **Then** its kind (answer, hint, no source)
   selects the presentation; hints show "Pista N"; citations open the passage, or the
   "ya no disponible" variant when the API marks them unavailable.
3. **Given** guided mode, **When** the student asks for the solution, **Then** the request is sent
   as a solution request; if the policy is hints only, the action is replaced by the explanation
   that the teacher chose hints only (no request is sent).
4. **Given** the API answers `daily_limit_reached` or the allowance reaches zero, **Then** the
   limit-reached state shows the reset time from the API in the user's locale.
5. **Given** the API answers `tutor_unavailable`, **Then** the message is marked failed, the
   allowance is unchanged, and "Reintentar" retries that same message.

---

### User Story 7 — Student submits an exercise (stub feedback) (Priority: P1)

**Role**: Student · **Implements**: 001 US6 · **Covers**: S4

**Independent Test**: Submit a typed exercise and read the feedback with its error type, topic and
"guardado en tu progreso" note.

**Acceptance Scenarios**:

1. **Given** feedback the API marks `is_stub`, **When** it is shown, **Then** a discreet notice
   says automatic feedback is still being prepared (deviation D2), without hiding the rest of the
   screen.

---

### User Story 8 — Teacher reviews conversations and corrects answers (Priority: P1)

**Role**: Teacher, Student · **Implements**: 001 US8 · **Covers**: T4, T6

**Independent Test**: Filter conversations by student, open one, flag a tutor answer with a
correction, and see it as the student with "Revisado por tu profesor/a".

**Acceptance Scenarios**:

1. **Given** a saved correction, **When** the student opens that conversation or feedback,
   **Then** they see the correction and marker, never the flag category.

---

### Deviations from the 001 spec

The API v1 does not provide some data the 001 stories describe. Until it does, the app behaves as
follows:

| # | 001 behavior | In this feature |
|---|---|---|
| D1 | Revoke consent from the profile (US7 AS4, FR-015) | Implemented as in 001, using the backend feature 002 endpoint (see Dependencies) |
| D2 | Real exercise feedback with error type and topic (US6) | Feedback from the API stub, with a notice (US7 AS1 above). No photo upload (the API accepts text only) |
| D3 | New teacher shows "pending invitation" (US7 AS6) | The account is active; the initial password is shown once (US1 AS4) |
| D4 | Topic filter in the conversation list (US8 AS1) | Deferred: conversations have no topic. The flags list (#25) and the "corrected" marker are implemented with the backend feature 002 |
| D5 | AI-suggested topic assignments (US14) | Manual assignment only; no suggestions area |
| D6 | Hint "Pista N de M" (US5 AS2) | "Pista N": the API does not know the total |
| D7 | See the course and teacher, then confirm joining (US4 AS5) | The API joins on the code directly, so the course and teacher are shown after joining, with a link to the course. A preview endpoint would restore the confirmation step |

### User Story 9 — Admin creates pseudonymous student accounts (Priority: P1)

**Role**: Admin · **Implements**: new (FR-012) · **Covers**: §4.1, P1

The admin creates a batch of pseudonymous accounts for the pilot and hands each participant their
code and initial password, so no real email is stored.

**Independent Test**: Create 3 accounts, copy and download the list, and sign in as one of them
with its code.

**Acceptance Scenarios**:

1. **Given** the admin enters a number from 1 to 100, **When** they create the batch, **Then**
   the codes and initial passwords are listed with copy and CSV download actions, and a warning
   says they will not be shown again.
2. **Given** the admin leaves the screen, **When** they come back, **Then** the passwords are no
   longer visible; the users list shows the accounts by code.

### Dependencies

- **Backend feature 002** (`DocentAI-Org/backend`): consent revocation for a course enrolment
  (D1), a course flags list for the teacher and a `has_correction` marker in conversation
  summaries (D4). Screens #13 (profile) revocation, #25 (flags) and the corrected marker of #23
  depend on it; everything else depends only on the API v1.

### Edge Cases

- The API is unreachable: every data-driven screen shows its designed error state with retry
  (001 FR-001); nothing shows stale data as current.
- A request returns `forbidden` or `not_found` for a resource the user once had (enrolment revoked,
  course of another teacher): the access-denied screen explains it and links home.
- A teacher leaves the material page while a document processes: on return, the status is read
  again from the API.
- An unknown error code from the API: a generic, translated error message is shown and the code is
  not displayed raw.
- Two tabs: signing out in one signs out the other on its next request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST implement the screens in scope with the states defined in the 001
  page table, fed by the API v1; every data-driven screen MUST have loading, empty (where it
  applies) and error states.
- **FR-002**: All API access MUST go through a single access layer whose types are generated from
  the backend `openapi.json`; the backend contract version used MUST be recorded.
- **FR-003**: Authentication MUST use the platform's authentication service; session tokens MUST
  NOT be stored in browser storage readable by scripts, and personal data MUST NOT be stored in
  `localStorage` or `sessionStorage`.
- **FR-004**: Students MUST be able to sign in with a pseudonymous code instead of an email.
- **FR-005**: Role areas MUST be protected on the server: a user MUST NOT receive another role's
  pages or data, independently of what the API also enforces.
- **FR-006**: Every API error code in the contract MUST map to a translated, plain-language message
  in Spanish and English.
- **FR-007**: All user-facing text MUST be translated (Spanish default, English); dates, times and
  numbers MUST follow the active locale; missing translation keys MUST fail CI.
- **FR-008**: Document processing status MUST refresh automatically while any document of the
  open course is processing, and stop refreshing once none is.
- **FR-009**: The invitation link MUST open the join screen of this app with the code filled in;
  a signed-out user following it MUST return to it after signing in.
- **FR-010**: Personal data (names, emails, message texts) MUST NOT be sent to analytics, logs or
  error tracking.
- **FR-011**: The IMFAHE logo and acknowledgement MUST appear on sign-in, "Acerca de" and in every
  role's footer (001 FR-005).
- **FR-012**: The admin area MUST include a screen to create pseudonymous student accounts in
  bulk (1–100). The generated codes and initial passwords MUST be shown once, with copy and
  download (CSV) actions and a warning that they cannot be shown again. The screen MUST be added to
  the prototype, with its states, before it is implemented (Constitution IV).

### Key Entities

The entities are those of [`001 data-model.md`](../001-mvp-prototype/data-model.md), now read from
the API v1 models (e.g. `TeacherCourse`, `StudentCourse`, `Document`, `Fragment`, `TutorSettings`,
`StudentMessage`, `Citation`, `Allowance`, `TeacherFlag`, `StudentSubmission`, `Topic`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A teacher and a student complete the full loop — create course, upload and validate
  material, join, ask, get a cited answer, get corrected — in under 10 minutes on a first attempt,
  without help.
- **SC-002**: 100% of the in-scope acceptance scenarios of 001 (minus documented deviations) and of
  this spec have a passing E2E test with zero axe violations.
- **SC-003**: 0 API types are hand-written; a contract change that breaks the app fails the build.
- **SC-004**: 100% of user-facing strings exist in Spanish and English.
- **SC-005**: A student on a mid-range phone sees their course chat ready within 3 seconds of
  opening it, and a tutor reply as soon as the API returns it.
- **SC-006**: In a role-separation test, 100% of attempts to open another role's area or another
  user's data show access denied.

## Assumptions

- Participants are adults (requirements §2). The frontend constitution's "possibly minors" wording
  is still stricter and is followed where it adds rules (plain language, consent wording).
- The backend runs locally for development and demo (December deployment is out of scope).
- Password recovery uses the authentication service's own email flow; locally the email arrives in
  the local mail catcher.
- The prototype's visuals are final for these screens; any new UI (e.g. FR-012) is first added to
  the prototype (Constitution IV).
- Streaming replies are out of scope: the API returns each reply whole, and the "tutor is writing"
  state lasts until it arrives.
