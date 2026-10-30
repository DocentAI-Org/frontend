# Feature Specification: Real Exercise Feedback and the Learning Record

**Feature Branch**: `005-exercise-feedback`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Real exercise feedback with a provisional error taxonomy" (frontend
half of backend spec `003-exercise-feedback`).

**Builds on**: [002](../002-app-api-integration/spec.md) US7 (exercise submission with the stub,
deviation D2, which this feature closes) and backend `specs/003-exercise-feedback` (real feedback,
`not_assessed`, `GET /v1/error-types`). Contract pinned in
[contracts/backend-openapi.json](contracts/backend-openapi.json).

**Visuals**: prototype #12 `student/exercise-feedback.html`, and the error parts of #13
`student/progress.html` and #28 `teacher/student.html` (ProgressByTopic, ErrorTypeList). Mastery
levels, quizzes, timelines and risk indicators of those pages are P2 stories (S6, S7, T5, T8) that
need definitions not agreed yet (requirements OQ9, OQ12) and stay out.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student sees real feedback (Priority: P1) 🎯

**Acceptance Scenarios**:

1. **Given** a submitted exercise with a mistake, **When** the feedback opens, **Then** it shows
   the verdict, where the mistake is, the error type by its name in the user's language (not its
   code), the topic, the explanation with citations, and "Saved to your progress"; there is no
   provisional notice.
2. **Given** a correct answer, **When** the feedback opens, **Then** it says "Correct" and shows no
   mistake, type or "saved" line.
3. **Given** an exercise the material does not cover, **When** the feedback opens, **Then** it says
   "Not assessed" and uses the not-covered pattern.
4. **Given** the tutor is unavailable, **When** the student sends, **Then** they stay on the review
   step with the "tutor unavailable" message and can retry.
5. **Given** a sent exercise, **When** the tutor is checking it (several seconds), **Then** the
   button says so and cannot be pressed twice.

### User Story 2 — The student sees their mistakes by topic (Priority: P1)

**Acceptance Scenarios**:

1. **Given** recorded mistakes, **When** the student opens "My progress" in a course, **Then** they
   see one block per topic (and "No topic" for the rest) with each error type, how many times, and
   a link to the latest example.
2. **Given** no recorded mistakes, **When** they open it, **Then** an empty state explains that
   mistakes from exercises appear there.

### User Story 3 — The teacher sees a student's mistakes (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a course student with recorded mistakes, **When** the teacher opens the student from
   the course's student list, **Then** they see the same blocks, each example linking to the
   teacher's view of that submission.

## Requirements *(mandatory)*

- **FR-001**: Error types MUST be shown by their label from `GET /v1/error-types` in the active
  locale, falling back to the code only if it is not in the taxonomy (e.g. the v1 `placeholder`).
- **FR-002**: The `not_assessed` verdict MUST have its own label and neutral style.
- **FR-003**: Learning-record views MUST read all pages of the record (`limit` 100) and group by
  topic, then type, newest example first.
- **FR-004**: The provisional taxonomy MUST be disclosed in one line on the record views ("The
  error types are provisional").

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile.
- **SC-002**: The walkthrough against the real stack shows real feedback and the record.
