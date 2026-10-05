# Feature Specification: DocentAI MVP Prototype (Frontend UI)

**Feature Branch**: `001-mvp-prototype`

**Created**: 2026-10-04

**Status**: Draft — revised 2026-10-04 to comply with constitution 2.0.0 (desktop-first for all roles; Spanish + English); revised 2026-10-04 for constitution 2.1.0 (deliverable is a static HTML prototype instead of Figma); revised 2026-10-06 to follow requirements.md as changed on 2026-10-06 (requirements audit PR-01 to PR-07, PR-11, PR-12): material validation, learning record, teacher corrections shown to students (US8 → P1), course topics (US14), student detail (US15), adapted explanations (US16), decision transparency (FR-016), progress tracking raised to P2 (US13)

**Input**: User description: "Frontend UI requirements for the DocentAI MVP. Source of truth for product requirements: docs/proposal/requirements.md — reference its IDs (T1–T7, S1–S7, P1) in every user story. Describe only what each user sees and does in the UI; backend concerns (RAG, logging, cost control, data export) are out of scope except for their visible effects. The deliverable of this feature is a validated Figma prototype, not code. Priorities follow the M/S/C column: P1 = all M requirements (T1, T2, T3, S1, S2, S3, S4, P1), P2 = S requirements (T4, T5, T6, T7, S5, S6), P3 = C (S7). Include for every screen: empty, loading and error states; AI disclosure to students; daily message limit reached; 'material does not cover this' answer (S2); source citations (S1). Roles: admin (minimal), teacher (desktop-first), student (mobile-first). UI language: Spanish. Include IMFAHE logo/acknowledgement."

**Requirements source**: `knowledge-base/docs/requirements.md` (the path `docs/proposal/requirements.md` given in the input does not exist; the file was found here). IDs below (T#, S#, P#) refer to §3 of that document, as revised on 2026-10-06 (see its changelog); §4.7 is its decision-transparency requirement.

**Deliverable**: a validated, clickable static HTML prototype covering every screen and state in this spec: one page per screen, with each state reachable from that page. No production code is produced by this feature; later features implement these pages (Constitution IV, 2.1.0).

## Clarifications

### Session 2026-10-04

- Q: Does the daily message limit apply per student across all their courses, or per student per course? → A: One allowance per student, shared across all their courses (requirements §4.3 "per-student daily message limit").

## User Scenarios & Testing *(mandatory)*

> Every story states its **role** (Constitution II) and the **requirement IDs** it covers. "Prototype test" means a moderated click-through of the HTML prototype with a representative participant.

### User Story 1 — Student asks the tutor and sees where each answer comes from (Priority: P1)

**Role**: Student · **Covers**: S1, S2, T3 and T6 (student side) · **Device**: desktop-first, with mobile frames (students mostly use phones)

A student opens their course (often on their phone) and asks the tutor a question. The tutor answers using only material the teacher has validated. Each answer shows its sources (document name and page or section); tapping a source shows the cited passage. When the material does not cover the question, the tutor clearly says so instead of answering, and suggests rephrasing or asking the teacher. The student always knows they are talking to an AI and how many messages they have left today.

**Why this priority**: This is the core value of DocentAI — a tutor the teacher controls, grounded in the teacher's material (S1, S2 are M).

**Independent Test**: In the prototype, a student can open a course, send a question, read an answer with citations, open a citation, and see a "no cubierto por el material" answer — without any other story being present.

**Acceptance Scenarios**:

1. **Given** a student enters a course chat for the first time, **When** the chat opens, **Then** a disclosure states that they are talking to an AI tutor, that it answers only from material validated by their teacher ("material validado por tu profesor/a"), and that the teacher may review conversations; the student must acknowledge it before sending the first message.
2. **Given** the chat is open, **When** the student sends a question that the material covers, **Then** a "the tutor is writing" indicator appears, followed by an answer with at least one citation chip showing document name and page/section.
3. **Given** an answer with citations, **When** the student taps a citation, **Then** a sheet opens showing the document name, page/section and the cited passage, and can be closed to return to the same place in the chat.
4. **Given** the chat is open, **When** the student asks something the material does not cover, **Then** the answer is visually distinct (not styled as a normal answer), says explicitly that the course material does not cover it (e.g. "El material del curso no cubre esta pregunta"), shows no citations, and offers next steps (rephrase, ask the teacher).
5. **Given** the student has messages left today, **When** they view the chat, **Then** the remaining count is visible; **When** it drops to a low threshold, **Then** a warning appears.
6. **Given** the student has used their daily message limit, **When** they open or are in the chat, **Then** the input is disabled, a message explains the limit has been reached and when it resets, and previous conversation remains readable.
7. **Given** the answer fails to arrive (network or service error), **When** the error occurs, **Then** the failed message is marked, an error explains what happened in plain language, and a "Reintentar" action is available; a failed attempt is shown as not counting toward the limit.
8. **Given** the teacher has corrected a tutor answer (US8), **When** the student opens that conversation, **Then** the answer shows a "Revisado por tu profesor/a" marker with the teacher's correction directly below it; the original answer stays readable but is visibly marked as corrected.
9. **Given** the chat is open, **When** the student opens the tutor information in the chat header, **Then** it lists the level, tone and solution policy their teacher chose for the course, in plain language, stating that the teacher chose them (T3).

---

### User Story 2 — Teacher uploads, curates and validates the course material (Priority: P1)

**Role**: Teacher · **Covers**: T2 · **Device**: desktop-first

A teacher uploads PDF, DOCX or Markdown files to a course, watches them being processed, reviews how each document was split into fragments, excludes any fragment the tutor should not use, and validates each document before the tutor may use it. A whole document can also be excluded. Each document shows its status, who validated it and when.

**Why this priority**: Without validated material the tutor cannot answer (T2 is M), and teacher validation of content is DocentAI's differentiator (Constitution I).

**Independent Test**: In the prototype, a teacher can upload a file, see processing progress, open the fragment review, exclude a fragment, validate the document, and exclude another document.

**Acceptance Scenarios**:

1. **Given** a course with no material, **When** the teacher opens "Material", **Then** an empty state explains why material matters and offers an upload action listing accepted formats (PDF, DOCX, Markdown) and maximum size.
2. **Given** the teacher selects or drags files, **When** upload starts, **Then** each file shows its own progress and status (subiendo → procesando → listo / error).
3. **Given** a file fails (unsupported format, too large, unreadable/scanned with no text), **When** processing ends, **Then** the file shows a specific error message and an action to remove or retry it.
4. **Given** a processed document, **When** the teacher opens its review, **Then** they see the list of fragments in order, each with its page/section reference and text, and can search within them.
5. **Given** a document has just been processed, **When** the teacher views the material list, **Then** its status is "Pendiente de validar" and the list states that the tutor does not use it yet; **When** the teacher selects "Validar" and confirms, **Then** the status changes to "Validado" with the teacher's name and the date, and the list shows which documents the tutor currently uses.
6. **Given** the fragment review is open, **When** the teacher excludes a fragment, **Then** the fragment is visibly marked "Excluido" with an action to include it again, and the document shows how many of its fragments are excluded.
7. **Given** a document, **When** the teacher selects "Excluir documento" and confirms, **Then** its status changes to "Excluido" and the tutor stops using it; the teacher can validate it again later.
8. **Given** a course has material but none of it is validated (all pending or excluded), **When** the teacher views the material list, **Then** a warning states that the tutor has no validated material and will answer that nothing is covered.

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

**Role**: Student · **Covers**: S4 (including the learning record), T6 (student side) · **Device**: desktop-first, with mobile frames (students mostly use phones)

A student submits their worked answer to an exercise and receives feedback that points to the specific step or mistake, with an explanation grounded in the material. The mistake is labelled with its error type and topic and saved to the student's learning record, which the student and their teacher can see.

**Why this priority**: S4 is M; targeted feedback on errors is a central learning outcome of the study.

**Independent Test**: In the prototype, a student can open "Enviar ejercicio", enter the problem and their worked answer, submit, and read feedback highlighting the specific mistake.

**Acceptance Scenarios**:

1. **Given** the student opens the exercise flow, **When** they enter the problem statement and their worked solution (typed text, optionally with a photo of handwritten work), **Then** they can review the submission before sending.
2. **Given** a submission is sent, **When** feedback is being generated, **Then** a loading state is shown and the student can leave and come back to it.
3. **Given** feedback is ready, **When** the student opens it, **Then** it states whether the answer is correct, identifies the specific step or element that is wrong, names the error type and topic in plain language (e.g. "Tipo de error: despejar la variable · Tema: ecuaciones lineales"), explains why with citations to the material, says the mistake was saved to their progress with a link to "Mi progreso", and does not give the full solution if guided mode is on.
4. **Given** the exercise is outside the course material, **When** feedback is returned, **Then** it uses the same "material does not cover this" pattern as the chat (S2).
5. **Given** the photo is unreadable or the submission is empty, **When** the student submits, **Then** a specific validation message explains how to fix it.
6. **Given** the daily limit is reached, **When** the student tries to submit, **Then** the same limit-reached message as the chat appears.
7. **Given** the teacher has corrected the feedback (US8), **When** the student opens it, **Then** it shows the "Revisado por tu profesor/a" marker and the correction, as in the chat.

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

### User Story 8 — Teacher reviews student conversations and corrects poor answers (Priority: P1)

**Role**: Teacher · **Covers**: T4, T6 · **Device**: desktop-first

The teacher browses their students' conversations and exercise feedback within the transparency agreed with students, reads tutor answers with their citations, flags any answer or feedback as wrong or poor, and writes a correction that the student sees on the original message.

**Why this priority**: T4 and T6 are M (requirements revised 2026-10-06). Pedagogical supervision that reaches the student is DocentAI's key differentiator; flags and corrections also feed the quality evaluation.

**Independent Test**: In the prototype, a teacher can filter conversations by student and date, open one, flag a tutor answer, write a correction, preview how the student will see it, and save it.

**Acceptance Scenarios**:

1. **Given** a course with conversations, **When** the teacher opens "Conversaciones", **Then** they see a list of conversations and exercise feedback, filterable by student, date and topic, with message counts, a marker for "not covered" answers and a marker for answers already corrected.
2. **Given** an open conversation or exercise feedback, **When** the teacher selects a tutor answer, **Then** they can flag it as "Incorrecta" or "Mejorable", must write a correction, and can preview how the student will see it ("Revisado por tu profesor/a"); **When** they save, **Then** the message shows the flag and the correction.
3. **Given** a corrected answer, **When** the teacher views the flags list, **Then** all their flags appear with the flag type, the correction, the date and a link back to the message.
4. **Given** no conversations exist yet, **Then** an empty state explains that conversations will appear when students use the tutor.
5. **Given** a student, **When** they are in the chat, **Then** they can see a persistent reminder that the teacher may review conversations (no hidden monitoring).
6. **Given** a corrected answer, **When** the teacher edits or removes the correction, **Then** the student's view shows the new correction, or no marker once it is removed.
7. **Given** saving a correction fails, **When** the error occurs, **Then** the written correction is kept on screen and a retry action is shown.

---

### User Story 9 — Teacher sees recurring errors and at-risk students (Priority: P2)

**Role**: Teacher · **Covers**: T5 · **Device**: desktop-first

The teacher opens a dashboard showing recurring errors grouped by topic and by student, and a list of at-risk students, each with the data behind it.

**Why this priority**: T5 is S; it delivers the "lower teacher workload / early detection" promise of the proposal.

**Independent Test**: In the prototype, a teacher can open the dashboard, switch between "by topic" and "by student", and open an at-risk student to see why they were flagged.

**Acceptance Scenarios**:

1. **Given** sufficient activity, **When** the teacher opens "Panel", **Then** they see recurring errors grouped by topic, switchable to grouped by student, with counts and a time range selector.
2. **Given** a student is listed as at risk, **When** the teacher opens the item, **Then** the student detail page (US15) opens in its at-risk state, showing the indicators behind the flag (e.g. activity, error rate over time) and example errors (Constitution I, FR-016).
3. **Given** too little data, **Then** an empty state says the dashboard needs more student activity and roughly what is needed.
4. **Given** the "by student" view, **When** the teacher selects any student, at risk or not, **Then** that student's detail page (US15) opens.

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
3. **Given** the student answers several in a row correctly or incorrectly, **Then** the UI indicates the difficulty level change in plain language and states its reason (e.g. "Subimos el nivel porque has acertado 3 seguidas") (FR-016).
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

### User Story 13 — Student views their own progress by topic over time (Priority: P2)

**Role**: Student · **Covers**: S7, S4 (student side of the learning record) · **Device**: desktop-first, with mobile frames (students mostly use phones)

The student sees their progress per course topic over time, with a mastery level per topic and their most frequent error types, based on their own activity only and updated after every exercise and quiz.

**Why this priority**: S7 is S (requirements revised 2026-10-06). Continuously tracking individual progress is one of the three things the proposal says DocentAI does beyond answering questions about documents.

**Independent Test**: In the prototype, a student can open "Mi progreso" and see per-topic mastery, how it changed over time, the activity it is based on, and their most frequent error types.

**Acceptance Scenarios**:

1. **Given** the student has activity, **When** they open "Mi progreso", **Then** each topic shows its mastery level and how it changed over time, with its basis (e.g. quizzes completed, exercises correct) in text, not colour alone.
2. **Given** no activity yet, **Then** an empty state invites them to start with the tutor or a quiz.
3. **Given** the student has classified mistakes (US6), **When** they view a topic, **Then** their most frequent error types for that topic are listed, each linking to an example.
4. **Given** the student has just completed an exercise or quiz, **When** they return to "Mi progreso", **Then** it includes that activity and shows when it was last updated.
5. **Given** a mastery level, **When** the student selects it, **Then** its basis is stated in one plain-language sentence (FR-016).

---

### User Story 14 — Teacher defines the course topics (Priority: P1)

**Role**: Teacher · **Covers**: T9 · **Device**: desktop-first

The teacher defines the topics (learning objectives) of the course and assigns each document, or each section of it, to its topics. The AI may suggest assignments, which the teacher confirms. The dashboard, quizzes, error types and progress views all use this topic list.

**Why this priority**: T9 is M. Topics anchor the tutor to the teacher's course objectives and give per-topic errors, progress and mastery their meaning.

**Independent Test**: In the prototype, a teacher can add and rename a topic, review the suggested topic assignments for a document, confirm one and change another, and see which documents have no topic.

**Acceptance Scenarios**:

1. **Given** a course with no topics, **When** the teacher opens "Temas", **Then** an empty state explains what topics are used for and offers to add the first topic.
2. **Given** the topic list, **When** the teacher adds, renames, reorders or deletes a topic, **Then** the list updates; deleting a topic that has assigned documents or sections asks for confirmation and states how many become unassigned.
3. **Given** a processed document, **When** the teacher opens its topic assignment, **Then** suggested topics per section are marked "Sugerido", and the teacher can confirm, change or remove each; only confirmed assignments count as assigned.
4. **Given** documents or sections without a confirmed topic, **When** the teacher views "Temas" or "Material", **Then** a warning lists them.
5. **Given** suggestions cannot be loaded, **When** the teacher opens a topic assignment, **Then** an error explains this and the teacher can still assign topics manually.

---

### User Story 15 — Teacher views a student's learning record (Priority: P2)

**Role**: Teacher · **Covers**: T8, S4 (teacher side of the learning record) · **Device**: desktop-first

From the dashboard, the teacher opens any student and sees their learning record: progress and mastery by topic over time, most frequent error types with examples, and activity. Students flagged as at risk open on the same page, which then also shows why they were flagged.

**Why this priority**: T8 is S. It lets the teacher follow every student individually, not only those flagged as at risk.

**Independent Test**: In the prototype, a teacher can open one student who is not at risk and one who is, and for each see progress by topic, error types and activity.

**Acceptance Scenarios**:

1. **Given** a student with activity, **When** the teacher opens their detail page, **Then** it shows progress and mastery per topic over time, the most frequent error types with counts, and activity (sessions, exercises and quizzes completed) for a selectable period.
2. **Given** the student is at risk, **When** the page opens, **Then** it also shows the at-risk indicators and why the student was flagged, in plain language (FR-016, Constitution I).
3. **Given** an error type, **When** the teacher selects it, **Then** they see the student's mistakes of that type, each linking to the exercise feedback or conversation (US8).
4. **Given** a student with no activity, **When** the teacher opens their page, **Then** an empty state says so.
5. **Given** any student, **Then** the page shows the student's display name or pseudonym only (FR-043).

---

### User Story 16 — Student receives explanations adapted to them (Priority: P2)

**Role**: Student, Teacher · **Covers**: S8, §4.7 · **Device**: desktop-first, with mobile frames for the student (students mostly use phones)

When the tutor adapts an explanation to the student's learning record (for example, their recurring mistakes), the answer is labelled "Adaptado para ti" with a one-sentence reason. The student can open the label to see which parts of their record were used. The teacher sees the same label and reason when reviewing the conversation.

**Why this priority**: S8 is S. Adapting explanations to each student is one of the proposal's named differentiators, and stating why keeps that adaptation transparent (§4.7).

**Independent Test**: In the prototype, a student can read an adapted answer and its reason and open the record entries it used; a teacher can see the same label in the conversation detail.

**Acceptance Scenarios**:

1. **Given** the tutor adapted an answer, **When** the student reads it, **Then** it shows "Adaptado para ti" and a one-sentence reason (e.g. "Te lo explico paso a paso porque esta semana has fallado al despejar variables"), and still shows its citations (S1).
2. **Given** an adapted answer, **When** the student selects the label, **Then** a sheet lists the learning-record entries used (e.g. error type, count, topic) with a link to "Mi progreso", and can be closed to return to the same place in the chat.
3. **Given** an answer that was not adapted, **Then** no label is shown.
4. **Given** guided mode is on, **When** a hint is adapted, **Then** it carries the same label, and it never reveals a solution the teacher's setting does not allow (T3).
5. **Given** the teacher opens a conversation (US8), **When** it contains adapted answers, **Then** they show the same label and reason.

---

### Edge Cases

- **Daily limit reached mid-flow**: the student is typing or mid-hint sequence when the limit is hit — the draft is preserved, the input is disabled, and the reset time is shown.
- **Partial citation**: an answer draws on a document the teacher later excludes — the citation shows "Documento ya no disponible" instead of a broken link.
- **Material changes during a conversation**: the teacher excludes all material — the student sees the "material does not cover" answer, never an unsourced answer.
- **Material uploaded but not validated**: documents still "Pendiente de validar" are never cited; if no validated material exists, the student sees the "material does not cover" answer.
- **Fragment excluded after being cited**: earlier citations to it show "Fragmento ya no disponible" instead of the passage.
- **Correction added while the student is away**: the "Revisado por tu profesor/a" marker is visible the next time the student opens that conversation or feedback.
- **Student with no learning record yet**: answers are not labelled "Adaptado para ti", and "Mi progreso" and the student detail page show their empty states.
- **Topic deleted**: documents and sections assigned to it become unassigned and appear in the unassigned warning; past mistakes keep the topic name, marked as deleted.
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
- **FR-012**: Every tutor answer that draws on the material MUST be based only on teacher-validated material and MUST display its source citations (document name and page or section), and each citation MUST open the cited passage (S1).
- **FR-013**: When the material does not cover a question, the tutor's reply MUST use a distinct "no cubierto por el material" pattern with no citations and suggested next steps; this pattern MUST be reused in chat, guided mode, exercise feedback and explanations (S2).
- **FR-014**: The student's remaining daily messages MUST be visible in the chat and exercise flows, with a warning near the limit and a blocking "limit reached" state that shows when the limit resets (§4.3).
- **FR-015**: Students MUST be able to review and revoke their consent from their profile.
- **FR-016**: Every decision the system makes about a student (difficulty change, repeated-error pattern, adapted explanation, mastery level, at-risk flag) MUST show its basis in one plain-language sentence to the student it affects, and the same basis to their teacher (§4.7).

#### Teacher

- **FR-020**: Teachers MUST be able to create a course and obtain a class code and invitation link they can copy, regenerate and disable (T1).
- **FR-021**: Teachers MUST be able to upload PDF, DOCX and Markdown files, see per-file progress and status, review each document's fragments with page/section references, exclude individual fragments, and validate or exclude each document. Each document MUST show its status ("Pendiente de validar", "Validado", "Excluido"), who validated it and when. Only validated, non-excluded fragments are used by the tutor (T2).
- **FR-022**: Teachers MUST be able to set the course level, tutor tone, and solution policy (direct solutions allowed / hints first then solution / hints only), with a preview example of the resulting behaviour. Students MUST be able to see the level, tone and solution policy their teacher chose, from the chat header (US1 AS9); in guided mode the solution policy is also shown in the chat (FR-032) (T3).
- **FR-023**: Teachers MUST be able to browse and filter their students' conversations and exercise feedback, flag any tutor answer or feedback as incorrect or poor, and write a correction. The student MUST see the correction on the original message, marked "Revisado por tu profesor/a" (T4, T6).
- **FR-024**: Teachers MUST have a dashboard of recurring errors grouped by topic and by student, and a list of at-risk students, each showing the data behind it. From it, teachers MUST be able to open any student's detail page, showing their learning record: progress and mastery by topic over time, most frequent error types with examples, and activity (T5, T8).
- **FR-025**: Teachers MUST be able to review, edit, approve and reject AI-generated quiz questions; only approved questions are visible to students (T7).
- **FR-026**: Teachers MUST be able to define the course's topics (learning objectives), and assign each document or section to topics; suggested assignments MUST be marked as suggestions until the teacher confirms them, and unassigned documents or sections MUST be listed (T9).

#### Student

- **FR-030**: Students MUST be able to join a course by entering a class code or opening an invitation link, and switch between their courses (T1).
- **FR-031**: Students MUST be able to chat with the tutor of each course they belong to (S1, S2).
- **FR-032**: In guided mode, tutor replies to problem questions MUST be presented as numbered hints with "Otra pista" and reply actions; "Ver solución" appears only if the teacher allows it (S3).
- **FR-033**: Students MUST be able to submit a worked exercise (typed text, optionally a photo) and receive feedback that identifies the specific mistake, names its error type and topic, and states that it was saved to their learning record, with citations (S4).
- **FR-034**: Students MUST be notified of repeated error patterns and offered a targeted explanation or practice (S5).
- **FR-035**: Students MUST be able to take adaptive quizzes with immediate feedback per question and a final summary (S6).
- **FR-036**: Students MUST be able to view their own progress by topic over time, with a mastery level per topic and their most frequent error types, updated after every exercise and quiz (S7, S4).
- **FR-037**: When the tutor adapts an answer to the student's learning record, the answer MUST be labelled "Adaptado para ti" with a one-sentence reason, and the label MUST open the learning-record entries used; the teacher MUST see the same label and reason. Unadapted answers MUST carry no label (S8, §4.7).

#### Platform and admin

- **FR-040**: The prototype MUST include sign-in, password recovery, session-expired and access-denied screens (P1).
- **FR-041**: After sign-in, each role MUST land on its own home with its own navigation; no screen may show another student's data to a student, or another teacher's course to a teacher (P1).
- **FR-042**: The admin area MUST be minimal: list of users with role and status, create teacher account, and list of courses. No other admin features are in scope (P1).
- **FR-043**: Students MUST be able to appear under a pseudonym or code instead of their real name where the team manages enrolment (§4.1); teacher views MUST display whatever display name the student has.

#### Prototype deliverable

- **FR-050**: The prototype MUST be a set of static HTML pages with one page per screen in the Screen Inventory below. Every state listed for a screen MUST be reachable on that screen's page, both through a query parameter in the page address (so each state has its own shareable link) and through a visible state toggle. Each page MUST work at the reference widths in FR-003.
- **FR-051**: The prototype MUST include clickable flows, made of links and actions between pages and states, for every P1 user story's acceptance scenarios, and for P2 stories at least their main happy path.
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
| Student | Course chat | US1, US5, US16 | tutor information (teacher's settings), first-use disclosure, not covered (S2), citation sheet, guided mode, limit warning, limit reached, failed message, teacher-corrected answer ("Revisado por tu profesor/a"), adapted answer ("Adaptado para ti") with its basis sheet |
| Student | Submit exercise / exercise feedback | US6, US12 | feedback pending, not covered, unreadable photo, limit reached, repeated-mistake notice, classified mistake (error type and topic), teacher-corrected feedback ("Revisado por tu profesor/a") |
| Student | Quiz / quiz summary | US11 | no questions, difficulty change with its reason |
| Student | My progress | US13 | no activity, progress over time, error types per topic, mastery basis |
| Student | Profile & consent | FR-015 | — |
| Teacher | My courses / create course | US4 | no courses |
| Teacher | Course overview (code, link, students) | US4 | no students, code disabled |
| Teacher | Material list / upload / fragment review | US2 | per-file processing and error, "Pendiente de validar", validated, document excluded, fragment excluded, no validated material, duplicate |
| Teacher | Course topics / topic assignment | US14 | no topics, suggested assignments ("Sugerido"), unassigned documents, suggestions unavailable, delete topic with assignments |
| Teacher | Tutor settings | US3 | unsaved changes, save failed |
| Teacher | Conversations / conversation detail / flags | US8, US16 | no conversations, flagged answer with correction, correction preview, correction save failed, adapted answer |
| Teacher | Dashboard (errors, at-risk students) | US9 | not enough data |
| Teacher | Student detail (learning record) | US9, US15 | not at risk, at risk, no activity, mistakes of one error type |
| Teacher | Quiz question review | US10 | no pending questions |
| Admin | Users, create teacher, courses | US7 | no users |

### Prototype pages

Each link opens the screen's page in the running prototype (`npm run dev`, or a Vercel preview);
add `?state=<id>` to open a state (contract §4) and `&lang=en` for English. The cover page
(`/prototype`) lists every page and state, and the start of each flow F1–F15 (FR-052).

| Story | Screens | Pages |
|---|---|---|
| US1 | Consent & AI transparency, Course chat, Citation sheet | [`student/consent.html`](/prototype/student/consent.html), [`student/chat.html`](/prototype/student/chat.html), [`student/chat.html?state=citation`](/prototype/student/chat.html?state=citation) |
| US2 | Material list & upload, Fragment review | [`teacher/material.html`](/prototype/teacher/material.html), [`teacher/fragments.html`](/prototype/teacher/fragments.html) |
| US3 | Tutor settings | [`teacher/tutor-settings.html`](/prototype/teacher/tutor-settings.html) |
| US4 | Teacher my courses, Create course, Course overview, Student my courses, Join course | [`student/courses.html`](/prototype/student/courses.html), [`student/join.html`](/prototype/student/join.html), [`teacher/courses.html`](/prototype/teacher/courses.html), [`teacher/course-new.html`](/prototype/teacher/course-new.html), [`teacher/course.html`](/prototype/teacher/course.html) |
| US5 | Course chat – guided mode | [`student/chat-guided.html`](/prototype/student/chat-guided.html) |
| US6 | Submit exercise, Exercise feedback | [`student/exercise.html`](/prototype/student/exercise.html), [`student/exercise-feedback.html`](/prototype/student/exercise-feedback.html) |
| US7 | Sign-in, Password recovery, Access denied / not found, Acerca de, Profile & consent, Admin users, Create teacher, Admin courses | [`auth/sign-in.html`](/prototype/auth/sign-in.html), [`auth/password-recovery.html`](/prototype/auth/password-recovery.html), [`auth/access-denied.html`](/prototype/auth/access-denied.html), [`about.html`](/prototype/about.html), [`student/consent.html`](/prototype/student/consent.html), [`student/profile.html`](/prototype/student/profile.html), [`admin/users.html`](/prototype/admin/users.html), [`admin/teacher-new.html`](/prototype/admin/teacher-new.html), [`admin/courses.html`](/prototype/admin/courses.html) |
| US8 | Conversations list, Conversation detail, Flags list | [`teacher/conversations.html`](/prototype/teacher/conversations.html), [`teacher/conversation.html`](/prototype/teacher/conversation.html), [`teacher/flags.html`](/prototype/teacher/flags.html) |
| US9 | Dashboard, Student detail (at-risk state) | [`teacher/dashboard.html`](/prototype/teacher/dashboard.html), [`teacher/student.html?state=at-risk`](/prototype/teacher/student.html?state=at-risk) |
| US10 | Quiz question review | [`teacher/questions.html`](/prototype/teacher/questions.html) |
| US11 | Quiz, Quiz summary | [`student/quiz.html`](/prototype/student/quiz.html), [`student/quiz-summary.html`](/prototype/student/quiz-summary.html) |
| US12 | Exercise feedback (repeated-mistake notice), Targeted explanation / practice | [`student/exercise-feedback.html`](/prototype/student/exercise-feedback.html), [`student/practice.html`](/prototype/student/practice.html), [`student/exercise-feedback.html?state=repeated-mistake`](/prototype/student/exercise-feedback.html?state=repeated-mistake) |
| US13 | My progress | [`student/progress.html`](/prototype/student/progress.html) |
| US14 | Course topics, Topic assignment | [`teacher/topics.html`](/prototype/teacher/topics.html), [`teacher/topic-assignment.html`](/prototype/teacher/topic-assignment.html), [`teacher/material.html?state=unassigned-topics`](/prototype/teacher/material.html?state=unassigned-topics) |
| US15 | Student detail | [`teacher/student.html`](/prototype/teacher/student.html), [`teacher/student.html?state=at-risk`](/prototype/teacher/student.html?state=at-risk) (formerly `teacher/student-risk.html`, renamed in T119) |
| US16 | Course chat – adapted answer, Conversation detail – adapted answer | [`student/chat.html?state=adapted`](/prototype/student/chat.html?state=adapted), [`student/chat-guided.html?state=adapted-hint`](/prototype/student/chat-guided.html?state=adapted-hint), [`teacher/conversation.html?state=adapted`](/prototype/teacher/conversation.html?state=adapted) |

States added on 2026-10-06 are reachable on their pages with `?state=` (contract revision note), e.g. [`teacher/material.html?state=pending-validation`](/prototype/teacher/material.html?state=pending-validation), [`student/chat.html?state=corrected`](/prototype/student/chat.html?state=corrected), [`teacher/conversation.html?state=flagged`](/prototype/teacher/conversation.html?state=flagged).

### Key Entities

- **User**: a person with one role (admin, teacher, student) and a display name, which for students may be a pseudonym.
- **Course**: created by one teacher; has a class code/invitation link, enrolled students, material and tutor settings.
- **Enrolment**: a student's membership in a course; can be revoked.
- **Material document**: an uploaded file with processing status, validation status (pending validation, validated, excluded) with validator and date, and its fragments.
- **Fragment**: a piece of a document with a page or section reference; the unit a citation points to. Can be excluded individually and assigned to topics.
- **Topic**: a learning objective of a course, defined by the teacher; documents or sections are assigned to it, and errors, quiz questions and progress are grouped by it.
- **Tutor settings**: level, tone and solution policy of a course.
- **Conversation / Message**: a student's exchange with the tutor in one course; tutor messages carry citations, a "not covered" marker, a hint number in guided mode, an "adapted" marker with its reason, and teacher flags and corrections.
- **Teacher correction**: a teacher's flag ("Incorrecta" or "Mejorable") and correction text on a tutor answer or exercise feedback, with date; shown to the student on the original message.
- **Citation**: a link from a tutor message to a fragment (document + page/section + passage).
- **Exercise submission / Feedback**: a student's worked answer and the feedback identifying the mistake, classified by error type and topic; may carry a teacher correction.
- **Error type**: a category from the error taxonomy that classifies one mistake (e.g. "Error de signo al quitar paréntesis"); every classified mistake has one error type and one topic.
- **Error pattern**: an error type that the same student repeats in the same topic (in the prototype, 3 or more times); it triggers the repeated-mistake notice (US12).
- **Learning record**: a student's classified mistakes, activity, and progress and mastery per topic over time, in one course; visible to the student and their teacher.
- **Quiz question**: AI-drafted question with topic, difficulty, source and approval status.
- **Daily message allowance**: per-student count of messages used and remaining, shared across all of the student's courses, with reset time.
- **Consent record**: whether and when a student accepted, and whether they revoked it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In moderated prototype tests with at least 5 students (on a phone) and 3 teachers, at least 80% of participants complete each P1 task without help.
- **SC-002**: At least 90% of student participants, when asked after the test, correctly state that the tutor is an AI and that their teacher may review conversations.
- **SC-003**: At least 90% of student participants can find the document and page an answer came from, and can tell a "not covered by the material" reply apart from a normal answer.
- **SC-004**: A teacher can create a course, upload and validate one document and configure the tutor in under 10 minutes in the prototype; a student can go from receiving a class code to sending a first question in under 2 minutes.
- **SC-005**: 100% of screens in the Screen Inventory have populated, empty, loading and error states in the prototype, and 100% of those states pass a contrast check at WCAG 2.2 AA.
- **SC-006**: The pedagogy team (educational stream) signs off the student-facing copy, the guided-mode flow, and the wording of adaptation reasons, difficulty-change reasons and teacher corrections, and every P1 story's acceptance scenarios are traceable to at least one prototype flow.
- **SC-007**: The IMFAHE logo and acknowledgement are visible on the sign-in screen and reachable in at most one tap/click from every role's home.
- **SC-008**: At least 80% of student participants can say, after the test, why an answer was labelled "Adaptado para ti" or why the quiz difficulty changed, and can tell a teacher-corrected answer apart from an uncorrected one; at least 67% of teacher participants (and at least 2) find a given student's most frequent error type on the student detail page without help.

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
- **Topics are the teacher's own course objectives.** Whether "curriculum objectives" means an official curriculum framework is an open blocking decision (requirements §2, OQ1); if it does, US14 changes.
- **Mastery levels are illustrative** (e.g. "Empezando", "En progreso", "Dominado") until the educational stream defines mastery (requirements §2, OQ9).
- **Adaptation reasons are illustrative.** What S8 adapts to is an open decision (requirements §2, OQ3); the prototype shows adaptation to recurring error types only.
- **Teacher corrections change what the student sees on that message.** Whether they also change the tutor's later answers is open (requirements §2, OQ7) and has no visible effect in this spec.
- **Error types in examples are illustrative** until the error taxonomy for the chosen topic exists (requirements §5).
- **Story numbers are stable.** New stories are numbered US14 to US16, and US8 keeps its number after moving to P1, so existing prototype pages and tasks keep their references; priority, not number, gives the order.
- **Usability test participants** for validation can be recruited from the team's network before the formal pilot; this is not the study pilot itself.
