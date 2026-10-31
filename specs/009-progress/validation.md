# Validation: progress by topic on the real stack (SC-002)

**Date**: 2026-10-31 · **Frontend**: `009-progress` · **Backend**: `007-progress` · **Model**:
`qwen2.5:7b` (Ollama), embeddings `bge-m3`

A course "Progreso demo" with `ecuaciones.md` validated and three topics assigned to its sections
(3.1–3.3). Through the API, the student sends five exercises (real feedback) and takes a quiz on
"Paréntesis" of five teacher-approved questions (right, right, wrong, right, wrong). Then the
pages are checked with Playwright (desktop Chromium 1440 px, mobile WebKit 390 px, Spanish).

| Step | Result |
|---|---|
| Student, "Mi progreso" | ✅ "Actualizado el 31 de octubre de 2026 · 1 cuestionario hecho"; "Transponer términos": "Todavía no has trabajado este tema"; "Despejar la incógnita": "Nivel de dominio: En progreso", "2 de 3 ejercicios correctos", "Error de procedimiento · 1 vez · Ver un ejemplo"; "Paréntesis": "En progreso", "3 de 5 preguntas acertadas" |
| "¿Por qué?" | ✅ "Has acertado el 60 % de tus últimos 5 ejercicios y preguntas de este tema." and the provisional criterion with its thresholds |
| History | ✅ 8 weeks, "sin datos" until this week, then 67 % / 60 % |
| Teacher, student page | ✅ the same progress, worded for the teacher; the API returns identical JSON to both; weekly activity "0 · 5 · 1" (messages, exercises, quizzes) this week |
| Mobile | ✅ no horizontal scroll |

## Open points (exercise feedback, spec 003, with the 7B model)

These change what progress shows but are not this feature:

- Both bracket mistakes were filed under "Despejar la incógnita", although "Paréntesis" exists
  and the backend validation of 007 saw them land there; the topic of a mistake is still
  unstable.
- "3(x + 1) = x + 7" answered with "3x + 1" (the bracket not distributed) was judged correct.
- "Despeja la incógnita: 5x = 20" and "Resuelve: x + 5 = 9" were "not assessed": the material
  was not retrieved for them, so they do not count.
