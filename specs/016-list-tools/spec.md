# Feature Specification: Search, Sort and Favourites in Lists

**Feature Branch**: `016-list-tools`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Frontend half of backend spec `016-list-tools`: lists are endless today. Every list
gets a search box and a sort, the course lists get favourites, and long lists show 20 items
with a "Show more" button. Contract pinned in `contracts/backend-openapi.json` (backend branch
`016-list-tools`).

**Visuals**: no prototype page; one toolbar above every list, in the dashboard style of the
signed-in shell (search field with an icon, a compact sort Select, the list's own filters).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Find something in a long list (Priority: P1) 🎯

**Role**: Teacher, student, admin · **Device**: desktop and mobile

1. **Given** a list, **When** the user types in "Buscar" and stops typing, **Then** the list
   shows only what matches, "Mostrando 3 de 3" says how many, and the URL keeps the search
   (`?q=…`), so reload and back keep it.
2. **Given** nothing matches, **Then** the list says so ("Nada coincide con «…»") with a button
   to clear the search.
3. **Given** a list with its own filters (conversations, questions, users), **Then** search and
   filters work together.

### User Story 2 — Sort and page a long list (Priority: P2)

1. **Given** a list, **When** the user picks an order (e.g. "Nombre"), **Then** the list follows
   it and the URL keeps it.
2. **Given** more than 20 items, **Then** the list shows 20, "Mostrando 20 de 143" and
   "Mostrar más"; each press adds 20 more; with all shown, the button is gone.

### User Story 3 — Star the courses I use most (Priority: P1)

**Role**: Teacher, student

1. **Given** "Mis cursos", **When** the user presses the star of a course, **Then** it is marked
   at once, moves to the top and stays there after a reload.
2. **When** they press it again, **Then** it goes back to its place.
3. The star is a toggle button named after the course ("Marcar Álgebra como favorito"), with
   its pressed state announced.

## Requirements *(mandatory)*

- **FR-001**: One `ListToolbar` and one "Mostrar más" for every list; search, sort, filters and
  the number shown live in the URL, so the server renders the list (no client fetching).
- **FR-002**: Lists ask for what they show (20, 40, …) instead of the first 100, so no list is
  cut without notice.
- **FR-003**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the scenarios with the mock API (axe, desktop and mobile); existing
  suites pass.
