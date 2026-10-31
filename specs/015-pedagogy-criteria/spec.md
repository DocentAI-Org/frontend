# Feature Specification: Configurable Pedagogical Criteria

**Feature Branch**: `015-pedagogy-criteria`

**Created**: 2026-11-01

**Status**: Draft

**Input**: Frontend half of backend spec `015-pedagogy-criteria`: the criteria behind open
questions OQ3, OQ9 and OQ12 (at-risk students, repeated mistakes and adaptation, mastery of a
topic) become easy to change. The study team sets the defaults; each teacher may adjust them in
their course. Contract pinned in `contracts/backend-openapi.json` (backend branch
`015-pedagogy-criteria`).

**Visuals**: no prototype page; built with the design system's form components, like
"Configuración del tutor".

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The study team sets the defaults (Priority: P1) 🎯

**Role**: Admin · **Device**: desktop-first

1. **Given** an admin, **When** they open "Criterios pedagógicos", **Then** they see five
   groups (inactivity, error rate, repeated mistakes, adaptation, mastery) with today's values,
   each with a short sentence of what it does, and "Provisional".
2. **When** they change a value and save, **Then** "Guardado" is announced and the page keeps
   the new value after a reload.
3. **Given** values the API rejects (e.g. "progressing" not below "mastered"), **Then** an error
   explains what to check and nothing is saved.

### User Story 2 — A teacher adjusts their course (Priority: P1)

**Role**: Teacher · **Device**: desktop-first

1. **Given** a course, **When** the teacher opens the "Criterios" tab, **Then** each group shows
   "Los del estudio" with the study's values, read-only.
2. **When** they choose "Personalizar" for a group, change a value and save, **Then** that group
   is marked as the course's own, and the others still follow the study.
3. **When** they go back to "Los del estudio" and save, **Then** the group follows the study again.

## Requirements *(mandatory)*

- **FR-001**: Rates are shown and typed as percentages; the API gets fractions.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the scenarios with the mock API (axe, desktop and mobile); existing
  suites pass.
