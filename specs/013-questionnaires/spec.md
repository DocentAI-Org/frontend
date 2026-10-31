# Feature Specification: Study Questionnaires

**Feature Branch**: `013-questionnaires`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Requirement **P4** "Satisfaction, usefulness and trust questionnaires (an external tool
such as Tally is fine)" (frontend half of backend spec `012-questionnaires`). Contract pinned in
`contracts/backend-openapi.json` (backend branch `012-questionnaires`, on top of
`011-study-export`; merge after frontend 012).

**Visuals**: no prototype page (P4 was out of the prototype's scope); built with the design
system's components, following the admin pages and the course cards.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The study team publishes questionnaires (Priority: P1) 🎯

**Role**: Admin · **Device**: desktop-first

1. **Given** an admin, **When** they open "Cuestionarios" in the admin menu, **Then** they see the
   list (title, audience, status) and a form: title, link, audience. The page explains that
   `{study_ref}` in the link becomes each student's pseudonymous code.
2. **Given** the form, **When** they add a valid questionnaire, **Then** it appears as open; an
   empty title or a link that is not `https` is explained next to the field.
3. **Given** a questionnaire, **When** they close, reopen or delete it, **Then** the list updates.

### User Story 2 — Students and teachers find the open ones (Priority: P1)

**Role**: Student, Teacher · **Device**: mobile-first for students

1. **Given** an open student questionnaire, **When** a student opens "Mis cursos", **Then** a
   "Cuestionarios del estudio" box lists it as a link that opens the external tool in a new tab
   (and says so to screen readers).
2. **Given** an open teacher questionnaire, **When** a teacher opens "Mis cursos", **Then** they
   see it the same way; students do not.
3. **Given** no open questionnaires, **Then** no box is shown.

## Requirements *(mandatory)*

- **FR-001**: External links use `target="_blank"` and `rel="noopener noreferrer"`.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the scenarios with the mock API; existing suites pass.
