# Validation: teacher dashboard on the real stack (SC-002)

**Date**: 2026-10-30 · **Frontend**: `006-teacher-dashboard` · **Backend**: `004-teacher-dashboard`

Driven with Playwright (desktop Chromium 1440 px and mobile 390 px) against Supabase and the backend
branch. The local course "Panel demo" was seeded with dated activity: Lucas Herrera chatted 20 and
12 days ago and sent 10 exercises 9–12 days ago, 6 of them with mistakes. No model is involved.

| Step | Result |
|---|---|
| Teacher opens the course → "Dashboard" tab | ✅ errors by topic: Paréntesis 4 (Procedural error), Despejar la incógnita 2 (Slip); labels, not codes |
| "By student" | ✅ Lucas Herrera, 6 mistakes, topic Paréntesis, Procedural error |
| Students who may need help | ✅ Lucas Herrera: "No activity in 9 days (the last on October 21)" and "6 of 10 exercises with mistakes in the last 14 days" |
| "See why" | ✅ student page with the reasons, last seen, 8 weeks of activity (8 + 6 messages, 1 + 9 exercises in the right weeks), "Back to the dashboard", and the learning record below |
| Mobile | ✅ no horizontal page scroll; the tables fit at 390 px |

**Total time**: 4 s desktop, 2 s mobile, automated.

The demo teacher's profile language is English in this local database, so the run was in English;
the Spanish copy is covered by the E2E tests against the mock.

## Change made because of this run

- The student page showed two almost identical "provisional" notes (risk block and learning
  record). The risk block now says only that the criteria are provisional.
