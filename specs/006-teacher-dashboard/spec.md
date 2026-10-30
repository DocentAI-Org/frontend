# Feature Specification: Teacher Dashboard — Recurring Errors and At-Risk Students

**Feature Branch**: `006-teacher-dashboard`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Teacher dashboard with recurring errors and at-risk students, with
provisional criteria" (frontend half of backend spec `004-teacher-dashboard`).

**Builds on**: [001](../001-mvp-prototype/spec.md) US9 and the at-risk part of US15,
[005](../005-exercise-feedback/spec.md) (learning record views), and backend
`specs/004-teacher-dashboard` (dashboard, risk and criteria endpoints, provisional criteria in
`risk-criteria.md`). Contract pinned in `contracts/backend-openapi.json`.

**Visuals**: prototype `teacher/dashboard.html` (F12) and the risk state of
`teacher/student.html`. Mastery and quizzes stay out (OQ9, S6).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The teacher opens the course dashboard (Priority: P1) 🎯

**Acceptance Scenarios**:

1. **Given** a course with enough activity, **When** the teacher opens "Panel" from the course,
   **Then** they see the repeated errors by topic (topic, errors, students, most frequent type by
   its label) with a period selector (7 days, 30 days, whole course) and a "by topic / by student"
   switch; the basis line says what is counted and for which period.
2. **Given** the "by student" view, **When** the teacher selects any student, **Then** that
   student's page opens (005 US3).
3. **Given** too little activity, **Then** an empty state says the dashboard needs more activity
   and what is missing (e.g. "12 of 20 messages or 2 of 5 exercises").
4. **Given** the period changes, **Then** the URL keeps it (`?period=7d`) so a reload or a shared
   link shows the same view.

### User Story 2 — The teacher sees who may need help and why (Priority: P1)

**Acceptance Scenarios**:

1. **Given** at-risk students, **When** the dashboard opens, **Then** a "Students who may need
   help" list shows each one with every reason in one plain sentence ("No activity in 9 days",
   "6 of 10 exercises with mistakes in the last 14 days") and a "See why" link.
2. **Given** "See why", **Then** the student's page opens with a "Why they appear here" block
   (the reasons, the last activity and the activity per week) above the learning record.
3. **Given** a student who is not at risk, **Then** their page has no such block.
4. **Given** no at-risk students, **Then** the list says so in one line.

## Requirements *(mandatory)*

- **FR-001**: The dashboard and the "why" block MUST say in one line that the criteria and the
  error types are provisional and that the flag is not a grade.
- **FR-002**: Reasons MUST be built from the values the API returns, never hard-coded numbers.
- **FR-003**: Students MUST be shown by display name or pseudonym only.
- **FR-004**: Counts MUST be readable without colour (text or table, not only a chart); any chart
  follows the `dataviz` rules and has a table alternative.

## Assumptions

- The criteria are provisional and global for now; later, teachers will configure them per course
  (backend 004, Assumptions). Reasons and the basis line already use the thresholds the API
  returns, so that change needs a settings page but no change to these views.

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile, against the mock API.
- **SC-002**: The walkthrough against the real stack shows the dashboard and one at-risk student.
