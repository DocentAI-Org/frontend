# Feature Specification: Repeated Mistakes Overcome

**Feature Branch**: `022-mistake-overcome`

**Created**: 2026-11-08

**Status**: Draft

**Input**: Frontend half of backend spec `022-mistake-overcome` (requirement S5, KPI "fewer
recurring errors"): tell the student when they got past a repeated mistake, show how far each
frequent mistake is from overcome, and stop recommending overcome ones. Contract pinned in
`contracts/backend-openapi.json` (backend branch `022-mistake-overcome`).

**Visuals**: no prototype page. A success notice on the feedback page, mirroring the warning
notice of a repeated mistake (spec 007); a line under each frequent mistake in progress.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The student is told when they got past a mistake (Priority: P1) 🎯

**Role**: Student · **Device**: mobile-first

1. **Given** the exercise that completes the run, **When** the student reads its feedback,
   **Then** "¡Error superado!" says how many exercises in a row they got right in the topic since
   their last mistake of that type, and how many times they had made it.
2. **Given** an earlier correct exercise, **Then** nothing is said yet.

### User Story 2 — Progress shows how far each mistake is (Priority: P1)

1. **Given** a frequent mistake with correct exercises after it, **Then** a line says how many
   in a row ("Llevas 2 …"), or "Superado: 3 …" once it is overcome; the teacher reads the same.

### User Story 3 — Overcome mistakes are not recommended (Priority: P1)

1. **Given** an overcome pattern, **Then** the next steps no longer propose reviewing it.

### User Story 4 — The threshold is a criterion (Priority: P2)

1. **Given** the criteria page, **Then** the repeated mistakes group has the exercises in a row
   that overcome a mistake.

## Requirements *(mandatory)*

- **FR-001**: Texts in ES and EN, built from the data.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers US1–US4 with the mock API; existing suites pass.
