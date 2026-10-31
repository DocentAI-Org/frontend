# Feature Specification: Pre-test and Post-test

**Feature Branch**: `010-pre-post-tests`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "The teacher prepares the pre/post-test, opens each phase and reads
the results; students take each phase once" (frontend half of backend spec `008-pre-post-tests`,
requirement P3). Contract pinned in `contracts/backend-openapi.json`.

**Visuals**: no prototype page (P3 was out of the prototype's scope); built with the design
system's components, following "Preguntas" (008) for questions and "Panel" (006) for tables.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The teacher prepares the test (Priority: P1) 🎯

**Role**: Teacher · **Covers**: P3 · **Device**: desktop-first

1. **Given** a course with topics, **When** the teacher opens the "Pre/post-test" tab, **Then**
   they see the two phases with their status, the questions in order (statement, options with
   the right one marked in text, topic) and a form to add one.
2. **Given** the form, **When** the teacher writes a statement and four options, picks the right
   one and a topic, **Then** the question is added; repeated or empty options are explained next
   to the field.
3. **Given** approved quiz questions, **When** the teacher picks one in "Copiar del banco de
   preguntas", **Then** it is added to the test.
4. **Given** a question, **When** the teacher edits or deletes it, **Then** the list updates.
5. **Given** no topics, **Then** an empty state points to "Temas".

### User Story 2 — The teacher opens and closes each phase (Priority: P1)

1. **Given** questions, **When** the teacher opens the pre-test, **Then** a confirmation says the
   questions will be frozen; after it the phase is "Abierto" and the questions can no longer be
   changed (the page says so and hides the actions).
2. **Given** an open phase, **When** the teacher closes it, **Then** it shows "Cerrado" with the
   date, and can be reopened.
3. **Given** no questions, **Then** opening is not offered.

### User Story 3 — The student takes each phase once (Priority: P1)

**Role**: Student · **Device**: mobile first

1. **Given** an open phase not done, **When** the student opens "Mis cursos", **Then** the course
   card says the pre-test (or post-test) is open, with a link.
2. **Given** the test page, **Then** every question is shown with its options, no hint, and
   "Enviar respuestas" is enabled only when all are answered; it asks for confirmation since
   answers cannot change.
3. **Given** the submission, **Then** a confirmation thanks the student without any score.
4. **Given** a phase already done, **Then** the page says so; a phase not open says it is not
   open yet.

### User Story 4 — The teacher reads the results (Priority: P1)

1. **Given** submissions, **Then** the tab shows a table of students with their pre-test and
   post-test scores ("2 de 3"), "—" if not done, and the average per topic for each phase.

## Requirements *(mandatory)*

- **FR-001**: Students never see right or wrong in this feature (backend 008).
- **FR-002**: Scores are given in text ("2 de 3 · 67 %"), never by colour alone.

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile, against the mock API.
- **SC-002**: Walkthrough against the real stack: prepare, open, take both phases, read results.
