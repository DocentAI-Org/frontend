# Validation: 002 quickstart C on the English routes (T009, SC-003)

**Date**: 2026-10-30 · **Frontend**: `003-english-routes` · **Backend**: `main` at `d8df95b` plus
`refactor/join-invitation-path` (the app does not depend on it, FR-004)

Real local stack (Supabase, Ollama, backend with `uvicorn`, app with `npm run dev`), driven with
Playwright (desktop Chromium, Spanish locale cookie). No database reset: the run creates its own
course.

| Step | Route | Result |
|---|---|---|
| Teacher signs in, creates a course, invitation link | `/sign-in` → `/teacher/courses` → `/teacher/courses/new` → `/teacher/courses/[id]`; link `/join/<code>` | ✅ |
| Uploads `ecuaciones.md`, opens fragments, validates | `…/material`, `…/material/[documentId]` | ✅ |
| Tutor settings, topics, assignment, conversations, corrections load | `…/tutor`, `…/topics`, `…/topics/assignment`, `…/conversations`, `…/corrections` | ✅ |
| Student opens the invitation link → sign-in → study consent → joins | `/join/<code>` → `/sign-in?next=%2Fjoin%2F…` → `/student/consent` → `/student/join?joined=…` | ✅ |
| Covered question → answer citing `ecuaciones.md`; uncovered question → "no cubre" | `/student/courses/[id]` → `…/conversations/[conversationId]` | ✅ |
| Teacher opens the conversation | `/sign-in?next=…/conversations` → `…/conversations/[conversationId]` | ✅ |
| Admin pages | `/admin/users`, `/admin/teachers/new`, `/admin/students/new`, `/admin/courses` | ✅ |
| Old invitation path, public pages | `/unirse/<code>` → 308; `/about`, `/forgot-password`, `/access-denied` | ✅ |

**Total time**: 53 s automated.

## Notes

- The teacher's profile language was English, so the app opened in English after sign-in (002 US1
  AS5): the run then set the language cookie to Spanish to read the Spanish labels, without
  changing the profile.
