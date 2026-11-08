# Feature Specification: Adaptive Surfaces

**Feature Branch**: `023-adaptive-surfaces`

**Created**: 2026-11-08

**Status**: Draft

**Input**: Follow-ups of specs 020 and 022. The student only meets the recommended next step on
the progress page, and the teacher's view of an exercise does not say when it overcame a repeated
mistake. Backend spec `023-adaptive-surfaces` makes the tutor's adaptation leave out overcome
patterns; it changes no contract, so the 022 contract stays pinned.

**Visuals**: no prototype page. One line with the first recommended step, under each course in
"Mis cursos" and under the course title in the chat, linking to the progress page where its
reason and actions are; the student's overcome notice, worded for the teacher.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The next step is where the student starts (Priority: P1) 🎯

1. **Given** a course with a recommended step, **When** the student opens "Mis cursos", **Then**
   its row reads "Tu siguiente paso: {step}" and the step links to the course's progress.
2. **Given** an open pre/post-test not taken, **Then** the row keeps its test notice and shows no
   second line.
3. **Given** the course chat, **Then** the same line shows under the course title.

### User Story 2 — The teacher sees when an exercise overcame a mistake (Priority: P2)

1. **Given** the exercise that completes the run (spec 022), **When** the teacher opens it,
   **Then** a notice says how many correct exercises in a row the student has in the topic since
   their last mistake of the type, and how many times they had made it.

## Requirements *(mandatory)*

- **FR-001**: The step titles are the progress page's (spec 020); one source for both.
- **FR-002**: The course list asks each course's next steps in parallel, like its test phases.
- **FR-003**: One overcome notice component for both audiences.

## Success Criteria *(mandatory)*

- **SC-001**: E2E cover every scenario on desktop and mobile, with axe; the full suite passes.
