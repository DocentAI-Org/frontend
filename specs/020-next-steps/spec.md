# Feature Specification: Next Steps

**Feature Branch**: `020-next-steps`

**Created**: 2026-11-08

**Status**: Draft

**Input**: Frontend half of backend spec `020-next-steps`: turn the learning record, the mastery by
topic and the repeated mistakes into "what to do next", each step with its basis in one sentence
(§4.7), so the personalised learning the proposal promises is visible to the student. Contract
pinned in `contracts/backend-openapi.json` (backend branch `020-next-steps`).

**Visuals**: no prototype page. A highlighted block at the top of "Mi progreso" with up to three
steps (icon, title, reason, action), styled like the existing notices; the same block, without
actions, on the teacher's student page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student sees what to do next (Priority: P1) 🎯

**Role**: Student · **Device**: mobile-first

1. **Given** a course with topics and no activity, **When** the student opens "Mi progreso",
   **Then** "Tu siguiente paso" proposes the first topic and says why ("Todavía no has trabajado
   este tema"), with the tutor (and an exercise) as actions when the topic has no quiz questions.
2. **Given** a weakest topic with approved questions, **Then** the step says it is the weakest
   with its score and number of items, and "Hacer un cuestionario" starts a quiz on that topic.
3. **Given** an open pre-test not taken, **Then** it comes first and "Hacer el test" opens it.
4. **Given** a repeated mistake, **Then** the step names its type, topic, count and days, and
   "Repasar" opens the latest submission (or "Ver el repaso" if it was already requested).
5. **Given** every topic mastered, **Then** the block says the student is up to date.
6. **Given** a topic with approved questions, **Then** its progress card offers "Practicar «tema»
   con un cuestionario".
7. **Given** steps exist, **Then** the empty progress state does not repeat their actions.

### User Story 2 — The teacher sees the same steps (Priority: P2)

**Role**: Teacher · **Device**: desktop-first

1. **Given** a student of their course, **When** the teacher opens the student's page, **Then**
   they read the same steps and reasons, worded for them, with no actions.

### User Story 3 — The quiz summary starts with the weakest topic (Priority: P3)

1. **Given** a completed quiz over several topics, **Then** the "practise this topic" buttons are
   ordered from the topic missed most, and a line says so.

## Requirements *(mandatory)*

- **FR-001**: Reasons are built from the step's data and the taxonomy, in the active language.
- **FR-002**: The provisional note is shown while the criteria are provisional.
- **FR-003**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers US1–US2 with the mock API, a unit test covers US3; existing suites pass.
