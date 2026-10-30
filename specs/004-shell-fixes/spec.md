# Feature Specification: Shell Fixes — Theme Switcher, Home Link and Navigation

**Feature Branch**: `004-shell-fixes`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "The light/dark theme button is missing; clicking the DocentAI icon or
name in the header must take you home (icon and name grouped, not selectable as text); some
redirects are wrong, e.g. 'About DocentAI' sends you back to sign-in instead of the previous
screen."

**Builds on**: [002](../002-app-api-integration/spec.md) (which postponed the theme selector) and
[003](../003-english-routes/spec.md).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Switch between light and dark (Priority: P1) 🎯

The app follows the operating system's theme until the user chooses. One button, on the same
line as the language selector, switches to the opposite of what is shown (moon in light, sun in
dark); that choice is saved as the user's preference, survives reloads and sign-out, and the first
paint already uses it (no flash).

**Acceptance Scenarios**:

1. **Given** a system in light mode and no saved choice, **When** the user presses "Switch to dark
   theme", **Then** the page turns dark and a reload keeps it dark.
2. **Given** a system in dark mode and no saved choice, **When** the page loads, **Then** it is dark
   and the button offers "Switch to light theme"; pressing it saves light.
3. **Given** a signed-in user, **When** they look for the button, **Then** it is on the same line as
   the language selector (sidebar on desktop, menu on mobile); on public pages, in the header.

### User Story 2 — The DocentAI brand takes you home (Priority: P1)

The DocentAI icon and name form one link to the user's home on every page (public header
included): signed-in users land on their role's home, others on sign-in. The icon and name cannot
be selected as text.

**Acceptance Scenarios**:

1. **Given** the about page while signed out, **When** the user clicks the brand, **Then** they
   land on `/sign-in`.
2. **Given** the about page while signed in as a teacher, **When** they click the brand, **Then**
   they land on `/teacher/courses`.

### User Story 3 — Back and sign-in go where the user expects (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a user who opened "About DocentAI" from any page, **When** they press "Back",
   **Then** they return to that page; opened directly (no previous page in the app), "Back" goes
   home.
2. **Given** a signed-in user, **When** they open `/sign-in`, **Then** they are sent to `next`
   (when safe) or their home, not shown the form again. An expired session (`?expired=1`) still
   shows the form.

## Requirements *(mandatory)*

- **FR-001**: Without a saved choice the theme MUST follow the system. A choice MUST be stored in a
  cookie (`docentai-theme`: `light` or `dark`), read on the server to set `data-theme` on `<html>`.
  It is a display preference, not personal data (Constitution VII).
- **FR-002**: The switcher MUST be one button whose icon and accessible name say what pressing it
  does ("Switch to dark theme" / "Switch to light theme"), correct from the first paint whatever
  the system theme is. This replaces the prototype's three-button ThemeSwitcher (system, light,
  dark), which took more room for a choice users rarely change.
- **FR-003**: The brand MUST be a single link with an accessible name, `select-none`, in every
  header.
- **FR-004**: The about page's "Back" MUST go to the previous page in the app when there is one,
  otherwise home (`/`).
- **FR-005**: A signed-in user on `/sign-in` without `expired=1` MUST be redirected by the proxy
  to a safe `next` or `/`.

## Success Criteria *(mandatory)*

- **SC-001**: E2E with axe for every scenario, desktop and mobile; the dark theme passes axe.
