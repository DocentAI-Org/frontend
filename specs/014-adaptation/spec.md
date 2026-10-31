# Feature Specification: Explanations Adapted to the Student

**Feature Branch**: `014-adaptation`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Requirement **S8** and §4.7 (frontend half of backend spec `013-adaptation`): "An
adapted explanation says that it was adapted and why, in one sentence", and the teacher sees the
same basis. Contract pinned in `contracts/backend-openapi.json` (backend branch
`013-adaptation`).

**Visuals**: no prototype page; a one-line note under the answer, styled like the existing
notes (icon and muted text), with the error type's name from the taxonomy.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student sees why an answer was adapted (Priority: P1) 🎯

**Role**: Student · **Device**: mobile-first

1. **Given** a tutor answer with `adaptation`, **When** the student reads it in the chat,
   **Then** a sentence under it says it was adapted for them because they made N mistakes of
   that type (by name) in the last D days.
2. **Given** exercise feedback with `adaptation`, **Then** the same sentence is shown under the
   explanation.
3. **Given** an answer or feedback without `adaptation`, **Then** no sentence is shown.

### User Story 2 — The teacher sees the same basis (Priority: P1)

**Role**: Teacher · **Device**: desktop-first

1. **Given** an adapted answer or feedback, **When** the teacher reviews the conversation or the
   submission, **Then** they read the same basis, worded for them.

## Requirements *(mandatory)*

- **FR-001**: The sentence is built from `adaptation` and the taxonomy, in the active language.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the scenarios with the mock API; existing suites pass.
