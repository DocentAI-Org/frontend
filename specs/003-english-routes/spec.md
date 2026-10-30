# Feature Specification: English as the Base Language — Routes and Default Locale

**Feature Branch**: `003-english-routes`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Make the project English by default, including the routes. From
there every language is an add-on; in this case Spanish."

**Builds on**: [`specs/002-app-api-integration`](../002-app-api-integration/spec.md). This
feature changes no screen, text or behavior of 002 other than what is listed here.

## Clarifications

### Session 2026-10-30

- Q: How should URLs look with several languages? → A: English only, the same for every language.
  The language is only the text on screen (cookie and profile), as in 002. Adding a language never
  touches the routes.
- Q: Which language does a first-time visitor (no cookie, no session) see? → A: The browser's
  language when the app has it (`Accept-Language`), otherwise English. After sign-in the profile's
  language applies, as in 002.
- Q: Where is it done? → A: A new branch and PR on top of `002-app-api-integration`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Every route is in English (Priority: P1) 🎯

Anyone using DocentAI, in any language, sees English paths (`/sign-in`, `/teacher/courses`,
`/student/courses/{id}`), English query parameters and English anchors. Each 002 route keeps its
page, role and API calls; only the path changes ([routes](contracts/routes.md)).

**Independent Test**: sign in as each role in Spanish and in English; every link, redirect and
form leads to the English path of the same page.

**Acceptance Scenarios**:

1. **Given** a signed-out user, **When** they open any protected page, **Then** they are sent to
   `/sign-in?next=<the English path>` and, after signing in, back to that page.
2. **Given** a teacher on a course, **When** they copy the invitation link, **Then** it is
   `<origin>/join/<code>`.
3. **Given** an invitation link with the old path `/unirse/<code>`, **When** someone opens it,
   **Then** they are redirected to `/join/<code>`.
4. **Given** any page in Spanish, **When** the user switches to English (or back), **Then** the
   URL does not change.

### User Story 2 — English is the base language; Spanish is an add-on (Priority: P1)

A first-time visitor sees the app in their browser's language when DocentAI has it, and in
English otherwise. Spanish stays complete (Constitution VIII), but nothing in the app assumes it.

**Independent Test**: open `/sign-in` with no cookie and the browser set to Spanish, to English
and to an unsupported language (e.g. German).

**Acceptance Scenarios**:

1. **Given** no language cookie and a browser preferring Spanish, **When** they open `/sign-in`,
   **Then** the page is in Spanish.
2. **Given** no language cookie and a browser preferring German, **When** they open `/sign-in`,
   **Then** the page is in English.
3. **Given** a language cookie, **When** the browser prefers another language, **Then** the
   cookie wins.
4. **Given** a signed-in user, **When** they sign in, **Then** their profile language applies
   (002 US1 AS5, unchanged).

### Edge Cases

- `Accept-Language` with quality values (`de;q=1, es;q=0.8`) → the highest-ranked supported
  language (Spanish).
- Regional tags (`es-MX`, `en-GB`) match their base language.
- A missing or malformed header → English.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every route, dynamic segment, query parameter and in-page anchor MUST be English, as
  listed in [contracts/routes.md](contracts/routes.md). Routes MUST NOT depend on the language.
- **FR-002**: The default locale MUST be English. Without a language cookie, the locale MUST be the
  best supported match of `Accept-Language`, falling back to English.
- **FR-003**: Adding a language MUST only need: its code in `LOCALES`, its message catalog and its
  name in `common.language` (plus the backend's allowed `preferred_language` values).
- **FR-004**: The invitation link MUST be built by the app from the course's class code
  (`/join/<code>`), not from the backend's `invitation_path`.
- **FR-005**: The old invitation path `/unirse/<code>` MUST redirect to `/join/<code>`. Other
  Spanish paths need no redirect (the app has not been deployed with them).
- **FR-006**: This feature supersedes 002 FR-007 and US1 AS5 where they say "Spanish default"; all
  else in 002 is unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No Spanish path, query parameter or anchor remains in `src/` (checked by a unit test).
- **SC-002**: The full app E2E suite (desktop and mobile, with axe) passes on the new routes.
- **SC-003**: The quickstart walkthrough of 002 passes against the real local stack with the new
  routes.

## Assumptions

- The backend keeps `preferred_language` defaulting to `es` for new accounts (pilot in Spain), so
  a student created by the admin sees Spanish after signing in. Changing that is a backend
  decision outside this feature.
- The backend's `invitation_path` is updated to `/join/<code>` in a separate backend PR so the
  contract stays coherent; the app does not depend on it (FR-004).
- The static prototype in `public/prototype/` keeps its own file names; it is not part of the app's
  routes.
