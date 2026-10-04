# Feature Specification: DocentAI MVP Prototype (Frontend UI)

**Feature Branch**: `001-mvp-prototype`

**Created**: 2026-10-04

**Status**: Draft — revised 2026-10-04 to comply with constitution 2.0.0 (desktop-first for all roles; Spanish + English); revised 2026-10-04 for constitution 2.1.0 (deliverable is a static HTML prototype instead of Figma)

**Input**: User description: "Frontend UI requirements for the DocentAI MVP. Source of truth for product requirements: docs/proposal/requirements.md — reference its IDs (T1–T7, S1–S7, P1) in every user story. Describe only what each user sees and does in the UI; backend concerns (RAG, logging, cost control, data export) are out of scope except for their visible effects. The deliverable of this feature is a validated Figma prototype, not code. Priorities follow the M/S/C column: P1 = all M requirements (T1, T2, T3, S1, S2, S3, S4, P1), P2 = S requirements (T4, T5, T6, T7, S5, S6), P3 = C (S7). Include for every screen: empty, loading and error states; AI disclosure to students; daily message limit reached; 'material does not cover this' answer (S2); source citations (S1). Roles: admin (minimal), teacher (desktop-first), student (mobile-first). UI language: Spanish. Include IMFAHE logo/acknowledgement."

**Requirements source**: `knowledge-base/docs/requirements.md` (the path `docs/proposal/requirements.md` given in the input does not exist; the file was found here). IDs below (T#, S#, P#) refer to §3 of that document.

**Deliverable**: a validated, clickable static HTML prototype covering every screen and state in this spec: one page per screen, with each state reachable from that page. No production code is produced by this feature; later features implement these pages (Constitution IV, 2.1.0).

## Clarifications

### Session 2026-10-04

- Q: Does the daily message limit apply per student across all their courses, or per student per course? → A: One allowance per student, shared across all their courses (requirements §4.3 "per-student daily message limit").

## User Scenarios & Testing *(mandatory)*

> Every story states its **role** (Constitution II) and the **requirement IDs** it covers. "Prototype test" means a moderated click-through of the HTML prototype with a representative participant.

### User Story 1 — Student asks the tutor and sees where each answer comes from (Priority: P1)

**Role**: Student · **Covers**: S1, S2 · **Device**: desktop-first, with mobile frames (students mostly use phones)

A student opens their course (often on their phone) and asks the tutor a question. The tutor answers using only the teacher's material. Each answer shows its sources (document name and page or section); tapping a source shows the cited passage. When the material does not cover the question, the tutor clearly says so instead of answering, and suggests rephrasing or asking the teacher. The student always knows they are talking to an AI and how many messages they have left today.

**Why this priority**: This is the core value of DocentAI — a tutor the teacher controls, grounded in the teacher's material (S1, S2 are M).

**Independent Test**: In the prototype, a student can open a course, send a question, read an answer with citations, open a citation, and see a "no cubierto por el material" answer — without any other story being present.

**Acceptance Scenarios**:

1. **Given** a student enters a course chat for the first time, **When** the chat opens, **Then** a disclosure states that they are talking to an AI tutor, that it answers only from the teacher's material, and that the teacher may review conversations; the student must acknowledge it before sending the first message.
2. **Given** the chat is open, **When** the student sends a question that the material covers, **Then** a "the tutor is writing" indicator appears, followed by an answer with at least one citation chip showing document name and page/section.
3. **Given** an answer with citations, **When** the student taps a citation, **Then** a sheet opens showing the document name, page/section and the cited passage, and can be closed to return to the same place in the chat.
4. **Given** the chat is open, **When** the student asks something the material does not cover, **Then** the answer is visually distinct (not styled as a normal answer), says explicitly that the course material does not cover it (e.g. "El material del curso no cubre esta pregunta"), shows no citations, and offers next steps (rephrase, ask the teacher).
5. **Given** the student has messages left today, **When** they view the chat, **Then** the remaining count is visible; **When** it drops to a low threshold, **Then** a warning appears.
6. **Given** the student has used their daily message limit, **When** they open or are in the chat, **Then** the input is disabled, a message explains the limit has been reached and when it resets, and previous conversation remains readable.
7. **Given** the answer fails to arrive (network or service error), **When** the error occurs, **Then** the failed message is marked, an error explains what happened in plain language, and a "Reintentar" action is available; a failed attempt is shown as not counting toward the limit.

---

### User Story 2 — Teacher uploads and curates the course material (Priority: P1)

**Role**: Teacher · **Covers**: T2 · **Device**: desktop-first

A teacher uploads PDF, DOCX or Markdown files to a course, watches them being processed, reviews how each document was split into fragments, and decides which documents are included in the tutor's knowledge base.

**Why this priority**: Without curated material the tutor cannot answer (T2 is M), and teacher control is DocentAI's differentiator (Constitution I).

**Independent Test**: In the prototype, a teacher can upload a file, see processing progress, open the fragment review, and toggle a document between included and excluded.

**Acceptance Scenarios**:

1. **Given** a course with no material, **When** the teacher opens "Material", **Then** an empty state explains why material matters and offers an upload action listing accepted formats (PDF, DOCX, Markdown) and maximum size.
2. **Given** the teacher selects or drags files, **When** upload starts, **Then** each file shows its own progress and status (subiendo → procesando → listo / error).
3. **Given** a file fails (unsupported format, too large, unreadable/scanned with no text), **When** processing ends, **Then** the file shows a specific error message and an action to remove or retry it.
4. **Given** a processed document, **When** the teacher opens its review, **Then** they see the list of fragments in order, each with its page/section reference and text, and can search within them.
5. **Given** a processed document, **When** the teacher toggles "Incluir en la base de conocimiento" off, **Then** its status changes to "Excluido" immediately and the list shows which documents the tutor currently uses.
6. **Given** a course has material but all of it is excluded, **When** the teacher views the material list, **Then** a warning states that the tutor has no material and will answer that nothing is covered.

---

### User Story 3 — Teacher configures the tutor's pedagogical behaviour (Priority: P1)

**Role**: Teacher · **Covers**: T3 (and the configuration side of S3) · **Device**: desktop-first

The teacher sets the course level, the tutor's tone, and whether the tutor may give direct solutions or only hints (guided mode), and can preview how the tutor will behave.

**Why this priority**: T3 is M and controls the guided mode that S3 depends on.

**Independent Test**: In the prototype, a teacher can open tutor settings, change level, tone and solution policy, save, and see a confirmation and an example of the resulting behaviour.

**Acceptance Scenarios**:

1. **Given** a new course, **When** the teacher opens "Configuración del tutor", **Then** sensible defaults are pre-selected and each option has a one-line explanation in plain language.
2. **Given** the teacher selects "Solo pistas (modo guiado)", **When** they save, **Then** a confirmation appears and an example exchange illustrates step-by-step hints instead of a direct solution.
3. **Given** the teacher has unsaved changes, **When** they try to leave the page, **Then** they are warned before losing them.
4. **Given** saving fails, **When** the error occurs, **Then** the changes are kept on screen and a retry action is shown.

---

### User Story 4 — Teacher creates a course and students join it (Priority: P1)

**Role**: Teacher, Student · **Covers**: T1 · **Device**: desktop-first; mobile frames for the student join flow

A teacher creates a course and gets a class code and a shareable link. A student uses the code or link to join the course.

**Why this priority**: T1 is M; no student can reach the tutor without joining a course.

**Independent Test**: In the prototype, a teacher can create a course and copy its code/link, and a student can enter the code (or open the link) and land in the course.

**Acceptance Scenarios**:

1. **Given** a teacher with no courses, **When** they land on their home, **Then** an empty state invites them to create their first course.
2. **Given** the teacher fills in the course name (and optional description), **When** they create it, **Then** the course page shows a class code and invitation link with copy actions and a "Copied" confirmation.
3. **Given** a course, **When** the teacher opens "Estudiantes", **Then** they see enrolled students (by display name or pseudonym) or an empty state pointing to the invitation code.
4. **Given** the teacher regenerates or disables the code, **When** they confirm, **Then** the old code stops working and the screen shows the new state.
5. **Given** a signed-in student, **When** they enter a valid code or open a valid link, **Then** they see the course name and teacher and confirm joining; the course then appears in their course list.
6. **Given** a student enters an invalid, expired or disabled code, **When** they submit, **Then** a specific error explains the problem and suggests asking the teacher for a new code.

---

### User Story 5 — Student works through a problem in guided (Socratic) mode (Priority: P1)

**Role**: Student · **Covers**: S3 · **Device**: desktop-first, with mobile frames (students mostly use phones)

When the teacher has enabled guided mode, the tutor responds to problem-type questions with step-by-step hints. The student can ask for the next hint and, only if the teacher allows it, see the solution after the hints.

**Why this priority**: S3 is M and is the main pedagogical safeguard against handing out answers.

**Independent Test**: In the prototype, a student can ask a problem question in a guided-mode course, receive a first hint, request further hints, and reach the end of the hint sequence.

**Acceptance Scenarios**:

1. **Given** guided mode is on for the course, **When** the student opens the chat, **Then** a visible indicator ("Modo guiado") explains that the tutor will give hints before solutions.
2. **Given** the student asks how to solve a problem, **When** the tutor answers, **Then** the answer is marked as a hint (e.g. "Pista 1 de N" or "Pista 1") and offers "Otra pista" and a way to reply with their own attempt.
3. **Given** the student has seen all hints, **When** the teacher's setting allows solutions after hints, **Then** a "Ver solución" action appears; **When** the setting does not allow it, **Then** the UI explains that the teacher has chosen hints only.
4. **Given** hints are shown, **Then** they carry source citations like any other answer (S1).

---

### User Story 6 — Student submits a worked exercise and gets feedback on the mistake (Priority: P1)

**Role**: Student · **Covers**: S4 · **Device**: desktop-first, with mobile frames (students mostly use phones)

A student submits their worked answer to an exercise and receives feedback that points to the specific step or mistake, with an explanation grounded in the material.

**Why this priority**: S4 is M; targeted feedback on errors is a central learning outcome of the study.

**Independent Test**: In the prototype, a student can open "Enviar ejercicio", enter the problem and their worked answer, submit, and read feedback highlighting the specific mistake.

**Acceptance Scenarios**:

1. **Given** the student opens the exercise flow, **When** they enter the problem statement and their worked solution (typed text, optionally with a photo of handwritten work), **Then** they can review the submission before sending.
2. **Given** a submission is sent, **When** feedback is being generated, **Then** a loading state is shown and the student can leave and come back to it.
3. **Given** feedback is ready, **When** the student opens it, **Then** it states whether the answer is correct, identifies the specific step or element that is wrong, explains why with citations to the material, and does not give the full solution if guided mode is on.
4. **Given** the exercise is outside the course material, **When** feedback is returned, **Then** it uses the same "material does not cover this" pattern as the chat (S2).
5. **Given** the photo is unreadable or the submission is empty, **When** the student submits, **Then** a specific validation message explains how to fix it.
6. **Given** the daily limit is reached, **When** the student tries to submit, **Then** the same limit-reached message as the chat appears.

---

### User Story 7 — Everyone signs in and sees only what their role allows; admin manages accounts (Priority: P1)

**Role**: Admin, Teacher, Student · **Covers**: P1 · **Device**: desktop-first; mobile frames for sign-in and student screens

Users sign in and land on a home appropriate to their role. Students see only their own courses and conversations; teachers see only their own courses. A minimal admin area lets the admin create teacher accounts and see the list of users and courses.

**Why this priority**: P1 is M; role separation is also a privacy requirement (GDPR, Constitution II and VII).

**Independent Test**: In the prototype, three sign-ins (admin, teacher, student) lead to three different homes; navigating to another role's area shows an access-denied screen.

**Acceptance Scenarios**:

1. **Given** the sign-in screen, **When** it loads, **Then** it shows the DocentAI identity, the sign-in form, the IMFAHE logo and acknowledgement, and links to privacy information.
2. **Given** valid credentials, **When** the user signs in, **Then** they land on their role's home (admin: users and courses; teacher: courses; student: my courses).
3. **Given** invalid credentials, **When** the user submits, **Then** a non-revealing error ("Correo o contraseña incorrectos") is shown, with a "forgot password" path.
4. **Given** a student signs in for the first time, **When** they reach the app, **Then** they see the informed-consent and AI-transparency screen and must accept before continuing; they can later review or revoke consent from their profile.
5. **Given** a user opens a page outside their role or a course they do not belong to, **Then** an access-denied screen explains it and links back to their home.
6. **Given** the admin opens "Usuarios", **When** they create a teacher account, **Then** the new teacher appears in the list with a pending-invitation status.
7. **Given** a session has expired, **When** the user acts, **Then** they are asked to sign in again and returned to where they were.

---

### User Story 8 — Teacher reviews student conversations and flags poor answers (Priority: P2)

**Role**: Teacher · **Covers**: T4, T6 · **Device**: desktop-first

The teacher browses their students' conversations within the transparency agreed with students, reads tutor answers with their citations, and flags any answer as wrong or poor with a reason.

**Why this priority**: T4 and T6 are S; they build trust in the tutor and feed the quality evaluation before the student pilot.

**Independent Test**: In the prototype, a teacher can filter conversations by student and date, open one, and flag a tutor answer with a reason.

**Acceptance Scenarios**:

1. **Given** a course with conversations, **When** the teacher opens "Conversaciones", **Then** they see a list filterable by student, date and topic, with message counts and a marker for "not covered" answers.
2. **Given** an open conversation, **When** the teacher selects a tutor answer, **Then** they can flag it as "Incorrecta" or "Mejorable", add an optional comment, and see the flag reflected on the message.
3. **Given** a flagged answer, **When** the teacher views the flags list, **Then** all their flags appear with status and link back to the message.
4. **Given** no conversations exist yet, **Then** an empty state explains that conversations will appear when students use the tutor.
5. **Given** a student, **When** they are in the chat, **Then** they can see a persistent reminder that the teacher may review conversations (no hidden monitoring).

---

### User Story 9 — Teacher sees recurring errors and at-risk students (Priority: P2)

**Role**: Teacher · **Covers**: T5 · **Device**: desktop-first

The teacher opens a dashboard showing recurring errors grouped by topic and by student, and a list of at-risk students, each with the data behind it.

**Why this priority**: T5 is S; it delivers the "lower teacher workload / early detection" promise of the proposal.

**Independent Test**: In the prototype, a teacher can open the dashboard, switch between "by topic" and "by student", and open an at-risk student to see why they were flagged.

**Acceptance Scenarios**:

1. **Given** sufficient activity, **When** the teacher opens "Panel", **Then** they see recurring errors grouped by topic, switchable to grouped by student, with counts and a time range selector.
2. **Given** a student is listed as at risk, **When** the teacher opens the item, **Then** the indicators behind the flag (e.g. activity, error rate over time) and example errors are shown (Constitution I).
3. **Given** too little data, **Then** an empty state says the dashboard needs more student activity and roughly what is needed.

---

### User Story 10 — Teacher reviews and approves AI-generated quiz questions (Priority: P2)

**Role**: Teacher · **Covers**: T7 · **Device**: desktop-first

The teacher reviews quiz questions the AI drafted from the material, edits them, and approves or rejects each one; only approved questions reach students.

**Why this priority**: T7 is S and is a prerequisite for student quizzes (S6).

**Independent Test**: In the prototype, a teacher can open the pending question queue, edit one, approve one and reject one.

**Acceptance Scenarios**:

1. **Given** pending questions, **When** the teacher opens "Preguntas", **Then** each question shows its text, options/answer, difficulty, topic and source citation.
2. **Given** a question, **When** the teacher approves, edits-and-approves or rejects it, **Then** it moves to the corresponding list and a counter updates.
3. **Given** no pending questions, **Then** an empty state offers to request new questions for a topic.

---

### User Story 11 — Student practises with adaptive quizzes (Priority: P2)

**Role**: Student · **Covers**: S6 · **Device**: desktop-first, with mobile frames (students mostly use phones)

The student takes a short quiz; each answer gets immediate feedback, and the difficulty of the next question follows their performance.

**Why this priority**: S6 is S; practice with feedback drives the learning outcomes measured in the pilot.

**Independent Test**: In the prototype, a student can start a quiz, answer correctly and incorrectly, see immediate feedback each time, and reach a summary screen.

**Acceptance Scenarios**:

1. **Given** approved questions exist, **When** the student starts a quiz, **Then** they see the number of questions and the topic.
2. **Given** a question, **When** the student answers, **Then** feedback appears immediately (correct/incorrect, short explanation, citation) before moving on.
3. **Given** the student answers several in a row correctly or incorrectly, **Then** the UI indicates the difficulty level change in plain language.
4. **Given** the quiz ends, **Then** a summary shows score by topic and suggests next steps.
5. **Given** no approved questions exist, **Then** an empty state says the teacher has not published questions yet.

---

### User Story 12 — Student receives targeted help for repeated mistakes (Priority: P2)

**Role**: Student · **Covers**: S5 · **Device**: desktop-first, with mobile frames (students mostly use phones)

When the student repeats the same type of mistake, they get a notice naming the pattern and are offered a targeted explanation or practice.

**Why this priority**: S5 is S; reducing recurring errors is a study KPI.

**Independent Test**: In the prototype, after a feedback screen, a student sees a "repeated mistake" notice and can open the targeted explanation or practice.

**Acceptance Scenarios**:

1. **Given** a repeated error pattern is detected, **When** the student receives feedback, **Then** a notice names the pattern in plain language (e.g. "Has cometido este error 3 veces") with options "Ver explicación" and "Practicar".
2. **Given** the student opens the explanation, **Then** it is grounded in the material with citations.
3. **Given** the student dismisses the notice, **Then** it does not reappear for the same pattern in the same session.

---

### User Story 13 — Student views their own progress by topic (Priority: P3)

**Role**: Student · **Covers**: S7 · **Device**: desktop-first, with mobile frames (students mostly use phones)

The student sees their progress per topic of the course, based on their own activity only.

**Why this priority**: S7 is C (could have).

**Independent Test**: In the prototype, a student can open "Mi progreso" and see per-topic progress and the activity it is based on.

**Acceptance Scenarios**:

1. **Given** the student has activity, **When** they open "Mi progreso", **Then** each topic shows a progress indicator with its basis (e.g. quizzes completed, exercises correct) in text, not colour alone.
2. **Given** no activity yet, **Then** an empty state invites them to start with the tutor or a quiz.

---

### Edge Cases

- **Daily limit reached mid-flow**: the student is typing or mid-hint sequence when the limit is hit — the draft is preserved, the input is disabled, and the reset time is shown.
- **Partial citation**: an answer draws on a document the teacher later excludes — the citation shows "Documento ya no disponible" instead of a broken link.
- **Material changes during a conversation**: the teacher excludes all material — the student sees the "material does not cover" answer, never an unsourced answer.
- **Student belongs to no course**: their home shows an empty state with "Unirse a un curso" (enter code).
- **Student in several courses**: course switcher; each chat and progress is scoped to the selected course. The daily message allowance is shared across all the student's courses, and the limit indicator says so ("hoy, en todos tus cursos").
- **Teacher with many students/conversations**: lists stay usable with search and filters, and show loading placeholders while content loads.
- **Long answers and math notation**: long answers stay readable on a 390 px wide screen; formulas render as formatted notation if the chosen subject is STEM.
- **Slow connection**: loading states appear within one second of any action; the student can still read messages already shown.
- **Consent revoked**: the student loses access to the tutor and sees what revocation means and how to re-consent.
- **Duplicate upload**: uploading a file with the same name asks whether to replace or keep both.
- **Unsupported or oversized file**: rejected before upload with a specific message.
- **Access to a removed course or revoked enrolment**: an explanatory screen, not a generic error.
- **Prompt-injection-like text in student input or documents**: no special UI; it is displayed as plain text like any other content.

## Requirements *(mandatory)*

### Functional Requirements

#### Cross-cutting (apply to every screen)

- **FR-001**: Every data-driven screen MUST be designed in four states: populated, empty, loading and error. Error states MUST explain the problem in plain language and offer a recovery action (retry, go back, or contact).
- **FR-002**: All interface text MUST exist in Spanish and English (Constitution VIII), written in plain language suitable for adult students, and kept as separable text (no text baked into images). Spanish is the default language for the pilot; users MUST be able to switch language.
- **FR-003**: All screens MUST be designed desktop-first (reference width 1440 px) for all three roles. Every student screen, and the key teacher and admin screens, MUST also be designed at mobile width (390 px), fully usable with no horizontal scroll, because students will mostly use their phones (requirements §4.6).
- **FR-004**: All prototype pages, in every state, MUST meet WCAG 2.2 AA at design level: text and UI contrast, visible focus states, minimum touch target sizes, information not conveyed by colour alone, and a defined keyboard/focus order for each screen.
- **FR-005**: The IMFAHE logo and an acknowledgement of IMFAHE as funding organisation MUST appear on the sign-in screen, on a public "Acerca de" page, and in the footer or "about" area reachable from every role's navigation.
- **FR-006**: The prototype MUST use a shared component library and named design tokens (colour, type, spacing, radius) so that component and token names can be reused in code (Constitution IV).

#### Student-facing AI transparency and limits

- **FR-010**: Students MUST be told they are interacting with an AI, both on first use (acknowledgement required) and persistently in the chat (e.g. a label on tutor messages and in the chat header) (S1, §4.1).
- **FR-011**: Students MUST be told, before first use and persistently, that their teacher may review their conversations (T4, §4.1).
- **FR-012**: Every tutor answer that draws on the material MUST display its source citations (document name and page or section), and each citation MUST open the cited passage (S1).
- **FR-013**: When the material does not cover a question, the tutor's reply MUST use a distinct "no cubierto por el material" pattern with no citations and suggested next steps; this pattern MUST be reused in chat, guided mode, exercise feedback and explanations (S2).
- **FR-014**: The student's remaining daily messages MUST be visible in the chat and exercise flows, with a warning near the limit and a blocking "limit reached" state that shows when the limit resets (§4.3).
- **FR-015**: Students MUST be able to review and revoke their consent from their profile.

#### Teacher

- **FR-020**: Teachers MUST be able to create a course and obtain a class code and invitation link they can copy, regenerate and disable (T1).
- **FR-021**: Teachers MUST be able to upload PDF, DOCX and Markdown files, see per-file progress and status, review each document's fragments with page/section references, and include or exclude each document from the knowledge base (T2).
- **FR-022**: Teachers MUST be able to set the course level, tutor tone, and solution policy (direct solutions allowed / hints first then solution / hints only), with a preview example of the resulting behaviour (T3).
- **FR-023**: Teachers MUST be able to browse and filter their students' conversations and flag any tutor answer as incorrect or poor with an optional comment (T4, T6).
- **FR-024**: Teachers MUST have a dashboard of recurring errors grouped by topic and by student, and a list of at-risk students, each showing the data behind it (T5).
- **FR-025**: Teachers MUST be able to review, edit, approve and reject AI-generated quiz questions; only approved questions are visible to students (T7).

#### Student

- **FR-030**: Students MUST be able to join a course by entering a class code or opening an invitation link, and switch between their courses (T1).
- **FR-031**: Students MUST be able to chat with the tutor of each course they belong to (S1, S2).
- **FR-032**: In guided mode, tutor replies to problem questions MUST be presented as numbered hints with "Otra pista" and reply actions; "Ver solución" appears only if the teacher allows it (S3).
- **FR-033**: Students MUST be able to submit a worked exercise (typed text, optionally a photo) and receive feedback that identifies the specific mistake, with citations (S4).
- **FR-034**: Students MUST be notified of repeated error patterns and offered a targeted explanation or practice (S5).
- **FR-035**: Students MUST be able to take adaptive quizzes with immediate feedback per question and a final summary (S6).
- **FR-036**: Students MAY view their own progress by topic (S7).

#### Platform and admin

- **FR-040**: The prototype MUST include sign-in, password recovery, session-expired and access-denied screens (P1).
- **FR-041**: After sign-in, each role MUST land on its own home with its own navigation; no screen may show another student's data to a student, or another teacher's course to a teacher (P1).
- **FR-042**: The admin area MUST be minimal: list of users with role and status, create teacher account, and list of courses. No other admin features are in scope (P1).
- **FR-043**: Students MUST be able to appear under a pseudonym or code instead of their real name where the team manages enrolment (§4.1); teacher views MUST display whatever display name the student has.

#### Prototype deliverable

- **FR-050**: The prototype MUST be a set of static HTML pages with one page per screen in the Screen Inventory below. Every state listed for a screen MUST be reachable on that screen's page, both through a query parameter in the page address (so each state has its own shareable link) and through a visible state toggle. Each page MUST work at the reference widths in FR-003.
- **FR-051**: The prototype MUST include clickable flows, made of links and actions between pages and states, for every P1 user story's acceptance scenarios, and for P2/P3 stories at least their main happy path.
- **FR-052**: Each page MUST state the user story and requirement IDs it covers, and the spec's "Prototype pages" table MUST be updated with links to each page once pages exist (Constitution IV).
- **FR-053**: The prototype is "validated" when it has passed the usability and review criteria in Success Criteria SC-001 to SC-007.

### Screen Inventory

Every screen below needs populated, empty (where applicable), loading and error states. Rows group related screens; the plan splits them into one prototype page per screen (e.g. "Course chat" becomes a chat page and a guided-mode chat page), and FR-050's "one page per screen" applies to those individual screens.

| Role | Screen | Stories | Extra states |
|---|---|---|---|
| All | Sign-in, password recovery | US7 | invalid credentials, session expired |
| All | Access denied, not found | US7 | — |
| All | Acerca de (IMFAHE acknowledgement, privacy) | FR-005 | — |
| Student | Consent & AI transparency (first use) | US1, US7 | revoked |
| Student | My courses / join a course | US4 | invalid/expired code, no courses |
| Student | Course chat | US1, US5 | first-use disclosure, not covered (S2), citation sheet, guided mode, limit warning, limit reached, failed message |
| Student | Submit exercise / exercise feedback | US6, US12 | feedback pending, not covered, unreadable photo, limit reached, repeated-mistake notice |
| Student | Quiz / quiz summary | US11 | no questions, difficulty change |
| Student | My progress | US13 | no activity |
| Student | Profile & consent | FR-015 | — |
| Teacher | My courses / create course | US4 | no courses |
| Teacher | Course overview (code, link, students) | US4 | no students, code disabled |
| Teacher | Material list / upload / fragment review | US2 | per-file processing and error, all excluded, duplicate |
| Teacher | Tutor settings | US3 | unsaved changes, save failed |
| Teacher | Conversations / conversation detail / flags | US8 | no conversations, flagged answer |
| Teacher | Dashboard (errors, at-risk students) | US9 | not enough data |
| Teacher | Quiz question review | US10 | no pending questions |
| Admin | Users, create teacher, courses | US7 | no users |

### Prototype pages

Links are added once pages exist (FR-052). Each link points to the screen's page; a state is opened by adding its query parameter.

| Story | Screens | Pages |
|---|---|---|
| US1 | Consent & AI transparency, Course chat, Citation sheet | _To be linked_ |
| US2 | Material list & upload, Fragment review | _To be linked_ |
| US3 | Tutor settings | _To be linked_ |
| US4 | Teacher my courses, Create course, Course overview, Student my courses, Join course | _To be linked_ |
| US5 | Course chat – guided mode | _To be linked_ |
| US6 | Submit exercise, Exercise feedback | _To be linked_ |
| US7 | Sign-in, Password recovery, Access denied / not found, Acerca de, Profile & consent, Admin users, Create teacher, Admin courses | _To be linked_ |
| US8 | Conversations list, Conversation detail, Flags list | _To be linked_ |
| US9 | Dashboard, At-risk student detail | _To be linked_ |
| US10 | Quiz question review | _To be linked_ |
| US11 | Quiz, Quiz summary | _To be linked_ |
| US12 | Exercise feedback (repeated-mistake notice), Targeted explanation / practice | _To be linked_ |
| US13 | My progress | _To be linked_ |

### Key Entities

- **User**: a person with one role (admin, teacher, student) and a display name, which for students may be a pseudonym.
- **Course**: created by one teacher; has a class code/invitation link, enrolled students, material and tutor settings.
- **Enrolment**: a student's membership in a course; can be revoked.
- **Material document**: an uploaded file with processing status, included/excluded flag and its fragments.
- **Fragment**: a piece of a document with a page or section reference; the unit a citation points to.
- **Tutor settings**: level, tone and solution policy of a course.
- **Conversation / Message**: a student's exchange with the tutor in one course; tutor messages carry citations, a "not covered" marker, a hint number in guided mode, and teacher flags.
- **Citation**: a link from a tutor message to a fragment (document + page/section + passage).
- **Exercise submission / Feedback**: a student's worked answer and the feedback identifying the mistake.
- **Error pattern**: a recurring mistake type for a student and topic.
- **Quiz question**: AI-drafted question with topic, difficulty, source and approval status.
- **Daily message allowance**: per-student count of messages used and remaining, shared across all of the student's courses, with reset time.
- **Consent record**: whether and when a student accepted, and whether they revoked it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In moderated prototype tests with at least 5 students (on a phone) and 3 teachers, at least 80% of participants complete each P1 task without help.
- **SC-002**: At least 90% of student participants, when asked after the test, correctly state that the tutor is an AI and that their teacher may review conversations.
- **SC-003**: At least 90% of student participants can find the document and page an answer came from, and can tell a "not covered by the material" reply apart from a normal answer.
- **SC-004**: A teacher can create a course, upload one document and configure the tutor in under 10 minutes in the prototype; a student can go from receiving a class code to sending a first question in under 2 minutes.
- **SC-005**: 100% of screens in the Screen Inventory have populated, empty, loading and error states in the prototype, and 100% of those states pass a contrast check at WCAG 2.2 AA.
- **SC-006**: The pedagogy team (educational stream) signs off the student-facing copy and the guided-mode flow, and every P1 story's acceptance scenarios are traceable to at least one prototype flow.
- **SC-007**: The IMFAHE logo and acknowledgement are visible on the sign-in screen and reachable in at most one tap/click from every role's home.

## Assumptions

- **Participants are adults** (over 18, per requirements §2), so copy targets adult university-level students. The constitution's "possible minors" wording is more restrictive and does not conflict with this design.
- **Layout is desktop-first for all roles** (constitution 2.0.0). Because students mostly use phones (requirements §4.6), every student screen is also designed at 390 px and student flows are tested on a phone.
- **Prototype is bilingual (ES/EN)** per Constitution VIII, which applies to prototypes too. Spanish is the pilot language and the default.
- **Admin role is minimal** (users, create teacher, courses), as defined by Constitution II "Role Separation".
- **Sign-in is email + password** with password recovery; students may use a team-assigned code/pseudonym email where the team manages enrolment (§4.1).
- **Daily message limit value is not fixed**; the prototype shows an illustrative value (e.g. 30 messages/day, reset at midnight local time). The real value is set with the cost model.
- **Exercise submission** accepts typed text with an optional photo; if the evaluation topic (still undecided) makes photos unnecessary, the photo option can be dropped without changing the flow.
- **Evaluation topic is undecided** (§2); the prototype uses fictitious secondary-school algebra content (ES/EN), which also exercises math notation.
- **Exact IMFAHE acknowledgement wording** follows the grant term sheet ("acknowledge IMFAHE as a funding organisation"); a draft such as "Proyecto financiado por la Fundación IMFAHE" is used until confirmed.
- **Out of scope**: retrieval, logging, cost control, data export, pre/post-tests (P3) and questionnaires (P4) — except for their visible effects listed above (citations, not-covered replies, limits).
- **Usability test participants** for validation can be recruited from the team's network before the formal pilot; this is not the study pilot itself.
