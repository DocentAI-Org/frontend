# Feature Specification: Quizzes That Start From the Student's Mastery

**Feature Branch**: `021-adaptive-quiz-start`

**Created**: 2026-11-08

**Status**: Draft

**Input**: Frontend half of backend spec `021-adaptive-quiz-start` (requirement S6 and §4.7): a
quiz starts at the student's mastery and says why, and the quiz settings become a group of the
pedagogical criteria (spec 015). Contract pinned in `contracts/backend-openapi.json` (backend
branch `021-adaptive-quiz-start`).

**Visuals**: no prototype page. The start note reuses the quiz's existing `DecisionReason` notice
(the one that explains a level change); the criteria group reuses the criteria form.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student knows why the quiz starts where it does (Priority: P1) 🎯

**Role**: Student · **Device**: mobile-first

1. **Given** a topic the student masters, **When** they start a quiz on it, **Then** before the
   first answer a note says they start with hard questions because their mastery of the topic is
   «Dominado» (with the share right), and that the rule is provisional.
2. **Given** a weak topic, **Then** the note says easy questions and «Empezando».
3. **Given** too little activity, **Then** the note says the default difficulty and why.
4. **Given** the first answer, **Then** the note is gone (level changes have their own note).

### User Story 3 — The quiz settings are course criteria (Priority: P2)

**Role**: Teacher (and admin for the study) · **Device**: desktop-first

1. **Given** the criteria page, **Then** a "Cuestionarios" group shows the questions per quiz,
   the streak, the starting difficulty without data and whether the start is adaptive; a
   teacher may customise it for the course, and the student's next quiz follows it.

## Requirements *(mandatory)*

- **FR-001**: The note is built from `start_basis` in the active language; quizzes without it
  (started before) show none.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers US1 and US3 with the mock API; existing suites pass.
