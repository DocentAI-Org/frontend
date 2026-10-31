# Feature Specification: Quiz Questions Reviewed by the Teacher and Adaptive Quizzes

**Feature Branch**: `008-adaptive-quizzes`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "The teacher's question review and the student's adaptive quiz"
(frontend half of backend spec `006-adaptive-quizzes`).

**Builds on**: [001](../001-mvp-prototype/spec.md) US10 (T7) and US11 (S6). Contract pinned in
`contracts/backend-openapi.json`.

**Visuals**: prototype `teacher/questions.html`, `student/quiz.html` and
`student/quiz-summary.html`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The teacher asks for questions and reviews them (Priority: P1) 🎯

**Role**: Teacher · **Covers**: T7

**Acceptance Scenarios**:

1. **Given** a course with topics, **When** the teacher opens the "Preguntas" tab, **Then** the
   questions appear in three tabs, "Pendientes", "Aprobadas" and "Rechazadas", each with its
   count, and can be filtered by topic. Each question shows its statement, the four options
   with the correct one marked in text (not colour alone), the explanation, the difficulty in
   words ("Fácil", "Media", "Difícil"), the topic, its sources and an AI tag ("editada" once the
   teacher changed it).
2. **Given** a topic and a number of questions, **When** the teacher selects "Pedir preguntas
   nuevas", **Then** the button says "Generando preguntas nuevas…" while it waits and the new
   questions appear under "Pendientes" with a confirmation of how many arrived.
3. **Given** the material does not cover the topic, or the tutor is unavailable, **Then** the
   teacher is told so and nothing changes.
4. **Given** a pending question, **When** the teacher selects "Aprobar" or "Rechazar", **Then**
   it moves to that tab, the counts update and a message says whether students can see it.
5. **Given** "Editar", **Then** a form shows the statement, four options, which one is right,
   the explanation and the difficulty; "Guardar y aprobar" saves and approves; invalid input
   (empty or repeated options) is explained next to the field.
6. **Given** an approved question students have answered, **Then** it shows how many answers
   it has and the share that were right.
7. **Given** no questions, **Then** an empty state explains what questions are for and points
   to "Pedir preguntas nuevas"; with no topics, it points to "Temas".

### User Story 2 — The student takes an adaptive quiz (Priority: P1)

**Role**: Student · **Covers**: S6 · **Device**: mobile first

**Acceptance Scenarios**:

1. **Given** approved questions, **When** the student opens "Cuestionario" from the course and
   starts (all topics; one topic from a summary, see AS4), **Then** they see "N preguntas sobre {tema}", that the difficulty
   adapts and does not count for the grade, the counter "Pregunta 1 de N", the difficulty in
   words and the options.
2. **Given** an option, **When** the student selects "Comprobar", **Then** the feedback appears
   at once: "¡Correcto!" or "No es correcta", their answer and the right one marked in text, the
   explanation and its sources; the options can no longer change.
3. **Given** the level changes, **Then** the next question is preceded by the reason in one
   sentence from the API values ("Subimos el nivel porque has acertado 2 seguidas", "Bajamos el
   nivel porque has fallado 2 seguidas") and the rule is called provisional.
4. **Given** the last answer, **When** the student selects "Ver resumen", **Then** the summary
   shows the score, the result by topic with a text count, the final level, and next steps:
   another quiz, a quiz on one of its topics, or asking the tutor.
5. **Given** no approved questions, **Then** the empty state says the teacher has not published
   questions yet and offers the tutor.
6. **Given** the student reloads during a quiz, or comes back to "Cuestionario" with one
   unfinished, **Then** they can continue at the current question.

## Requirements *(mandatory)*

- **FR-001**: Students never receive the right option before answering (the API does not send
  it); the interface MUST NOT reveal it either, e.g. through option order or styling.
- **FR-002**: Every level change MUST state its reason in plain language (001 FR-016).
- **FR-003**: Right and wrong MUST be conveyed by text and icon, not colour alone.
- **FR-004**: The teacher's actions and the quiz MUST work by keyboard and at 390 px width.

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile, against the mock API.
- **SC-002**: The walkthrough against the real stack generates, approves and answers questions
  for "Paréntesis" on the `ecuaciones.md` fixture.

## Assumptions

- The teacher's per-student view (T8) and the student's progress (S7) do not show quiz results
  yet; they follow when the backend aggregates them.
