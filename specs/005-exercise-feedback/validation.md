# Validation: real feedback and the learning record on the real stack (SC-002)

**Date**: 2026-10-30 · **Frontend**: `005-exercise-feedback` · **Backend**: `003-exercise-feedback`
(PR DocentAI-Org/backend#6) · **Model**: `qwen2.5:7b` (Ollama)

Driven with Playwright (desktop Chromium, Spanish) against Supabase, Ollama and the backend branch.

| Step | Result |
|---|---|
| Teacher creates a course, adds the topic "Paréntesis", uploads and validates `ecuaciones.md` | ✅ |
| Student joins with the invitation link and acknowledges the AI disclosure | ✅ |
| Sends `2(x - 3) = 4x + 2` with the bracket not distributed: the button shows "Revisando tu ejercicio…", then the feedback | ✅ "Incorrecta", type «Error de procedimiento» (label, not code), topic «Paréntesis», citation to `ecuaciones.md` |
| "Guardado en tu progreso" → `/student/courses/[id]/progress` | ✅ the topic block lists «Error de procedimiento · 1 vez» |
| Sends `2x + 3 = 7` solved correctly | ✅ "Correcta", no type |
| Teacher opens the student from the course's list → record → "Ver un ejemplo" | ✅ opens the submission in the teacher's view |

**Total time**: 59 s automated, of which ~15 s waiting for the model.
