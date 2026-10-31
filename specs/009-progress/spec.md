# Feature Specification: Progress and Mastery by Topic

**Feature Branch**: `009-progress`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "My progress by topic, and the same for the teacher on the student's
page" (frontend half of backend spec `007-progress`).

**Builds on**: [001](../001-mvp-prototype/spec.md) US13 (S7) and US15 (T8),
[005](../005-exercise-feedback/spec.md) (learning record), [006](../006-teacher-dashboard/spec.md)
(the student's page). Contract pinned in `contracts/backend-openapi.json`.

**Visuals**: prototype `student/progress.html` and `teacher/student.html`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student sees their progress by topic (Priority: P1) 🎯

**Role**: Student · **Covers**: S7 · **Device**: mobile first

**Acceptance Scenarios**:

1. **Given** activity, **When** the student opens "Mi progreso", **Then** every course topic shows
   its mastery level in words and as three bars ("Nivel de dominio: En progreso"), and its basis
   in text: exercises right, partially right and total, quiz answers right and total.
2. **Given** a level, **When** the student opens "¿Por qué?", **Then** one sentence states the
   score and how many items it is based on, and that the criterion is provisional, with its
   thresholds.
3. **Given** a topic with few items, **Then** it says there is not enough activity yet; a topic
   without any says "Todavía no has trabajado este tema".
4. **Given** weekly scores, **Then** the topic shows how it changed over the last 8 weeks as bars
   with a text alternative (week and percentage, or "sin datos").
5. **Given** mistakes in a topic, **Then** their most frequent types are listed with their count,
   each linking to the latest example.
6. **Given** graded work without a topic, **Then** it appears last as "Sin tema".
7. **Given** no activity at all, **Then** an empty state invites to ask the tutor or take a quiz.
8. **Given** progress, **Then** the page says when it was last updated and how many quizzes were
   completed; the full list of mistakes stays below.

### User Story 2 — The teacher sees the same on the student's page (Priority: P1)

**Role**: Teacher · **Covers**: T8

**Acceptance Scenarios**:

1. **Given** a student with activity, **When** the teacher opens their page, **Then** "Progreso
   por tema" shows the same levels, bases and history, worded for the teacher ("ha acertado").
2. **Given** completed quizzes, **Then** the weekly activity table has a "Cuestionarios" column.

## Requirements *(mandatory)*

- **FR-001**: Levels MUST be conveyed in text, not by colour or bars alone (001 FR-016).
- **FR-002**: The "¿Por qué?" disclosure MUST work without JavaScript (native `details`).
- **FR-003**: Student and teacher views MUST show the same data (backend constitution I).

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile, against the mock API.
- **SC-002**: The walkthrough against the real stack shows mastery for a topic with exercises and
  quiz answers.
