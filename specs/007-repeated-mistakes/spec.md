# Feature Specification: Targeted Help for Repeated Mistakes

**Feature Branch**: `007-repeated-mistakes`

**Created**: 2026-10-31

**Status**: Draft

**Input**: User description: "Repeated mistake notice, targeted explanation and practice"
(frontend half of backend spec `005-repeated-mistakes`).

**Builds on**: [001](../001-mvp-prototype/spec.md) US12 and [005](../005-exercise-feedback/spec.md)
(real feedback). Contract pinned in `contracts/backend-openapi.json`.

**Visuals**: prototype `student/exercise-feedback.html` (state "repeated-mistake") and
`student/practice.html` (F15).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student is told the mistake repeats (Priority: P1) 🎯

**Acceptance Scenarios**:

1. **Given** feedback with a repeated mistake, **When** it opens, **Then** a notice above the
   verdict says "Este error te ha salido 3 veces en los últimos 30 días", names the type and the
   topic, and offers "Ver explicación", "Practicar" and "Ahora no".
2. **Given** "Ahora no", **Then** the notice disappears and does not come back for the same type
   and topic during the browser session, also on other feedback pages.
3. **Given** feedback without a repeated mistake, **Then** there is no notice.

### User Story 2 — The student reads the review and practises (Priority: P1)

**Acceptance Scenarios**:

1. **Given** "Ver explicación", **When** the review is ready (several seconds; the button says
   so), **Then** a review page shows "Qué está pasando", "Un ejemplo resuelto", the sources, and
   "Practica" with two statements.
2. **Given** "Practicar", **Then** the same page opens at the practice section.
3. **Given** "Resolver" on a statement, **Then** the exercise form opens with that statement
   filled in.
4. **Given** the material does not cover the pattern, **Then** the page uses the not-covered
   pattern and offers to ask the tutor or the teacher.
5. **Given** the tutor is unavailable or the daily limit is reached, **Then** the feedback page
   shows the reason and the student can retry later.

### User Story 3 — The teacher sees the same basis (Priority: P2)

1. **Given** the teacher opens a submission with a repeated mistake, **Then** they see the same
   sentence and, if the student opened it, a link to the review.

## Requirements *(mandatory)*

- **FR-001**: The notice and the review MUST state their basis in one sentence from the values
  the API returns (count, window, type label, topic), and that the definition is provisional.
- **FR-002**: Dismissal MUST be stored in the browser session only (`sessionStorage`), keyed by
  course, type and topic, and the page MUST render correctly without it.
- **FR-003**: The review MUST carry the AI tag and its citations like the feedback.

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile, against the mock API.
- **SC-002**: The walkthrough against the real stack shows the notice on a third mistake and a
  grounded review.
