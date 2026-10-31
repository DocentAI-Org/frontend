# Feature Specification: Study Data Export

**Feature Branch**: `012-study-export`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Requirement **P5** "Export of anonymised data for the study analysis" (frontend half of
backend spec `011-study-export`). Contract pinned in `contracts/backend-openapi.json` (backend
branch `011-study-export`).

**Visuals**: no prototype page (P5 was out of the prototype's scope); built with the design
system's components, following the admin "Cursos" page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The study team downloads the data (Priority: P1) 🎯

**Role**: Admin · **Covers**: P5 · **Device**: desktop-first

1. **Given** an admin, **When** they open "Datos del estudio" in the admin menu, **Then** they
   read what the export contains and what it leaves out: only students who consented, a
   pseudonymous code per student, no names, emails or free text.
2. **Given** that page, **When** they choose "Todos los cursos" or one course and press
   "Descargar ZIP", **Then** the browser saves `docentai-study-export.zip`.
3. **Given** the API fails, **Then** the page shows the error and nothing is downloaded.
4. **Given** a teacher or a student, **Then** the page is not reachable (as every admin page).

## Requirements *(mandatory)*

- **FR-001**: The download goes through a route handler that calls the API with the admin's
  session (`src/lib/api/admin.ts`); it works without JavaScript (a GET form).
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the four scenarios with the mock API; existing suites pass.
