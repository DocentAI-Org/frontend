# Feature Specification: Student Erasure on Request

**Feature Branch**: `017-student-erasure`

**Created**: 2026-11-07

**Status**: Draft

**Input**: Requirements §4.1 "Erasure on request removes a student and everything linked to them"
(frontend half of backend spec `017-student-erasure`, PR DocentAI-Org/backend#27). Contract
pinned in `contracts/backend-openapi.json` (backend branch `017-student-erasure`).

**Visuals**: no prototype page; built with the design system's `ConfirmDialog` and `Alert`, on the
admin "Usuarios" page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The admin erases a student (Priority: P1) 🎯

**Role**: Admin · **Covers**: §4.1 · **Device**: desktop-first, works on a phone

1. **Given** the admin's user list, **Then** each student row has "Borrar estudiante"; teacher and
   admin rows do not.
2. **Given** the admin presses it, **Then** a dialog says that the account and all its data
   (courses, chats, exercises, quizzes, tests, learning record, logs) are deleted for good, and
   asks them to type the student's name or code; the confirm button stays disabled until it
   matches (ignoring case and surrounding spaces).
3. **Given** they confirm, **Then** the list no longer shows the student, and a success message
   says what was deleted (courses, conversations, messages, exercises, quizzes, tests, logs). The
   message carries counts only, never the name, so no personal data goes into the URL.
4. **Given** the API fails or the student was already erased, **Then** an error message is shown
   and the list is unchanged.

### User Story 2 — Only the admin (Priority: P1)

1. **Given** a teacher or a student, **Then** the admin user list is not reachable (as every admin
   page).

## Requirements *(mandatory)*

- **FR-001**: A Server Action calls `DELETE /v1/admin/students/{student_id}` and redirects back to
  `/admin/users` with the counts or the error code; it checks the typed name again on the server,
  so a forged request cannot skip the dialog. `ConfirmDialog` gains an optional typed
  confirmation (`confirmPhrase`) for this and later destructive actions.
- **FR-002**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers every scenario with the mock API, on a student created in the test, so
  it also runs against the real stack; existing suites pass.
