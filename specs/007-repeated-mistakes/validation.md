# Validation: repeated mistakes on the real stack (SC-002)

**Date**: 2026-10-31 · **Frontend**: `007-repeated-mistakes` · **Backend**: `005-repeated-mistakes`
· **Model**: `qwen2.5:7b` (Ollama)

Driven with Playwright (desktop Chromium 1440 px, mobile 390 px, Spanish) against Supabase, Ollama
and the backend branch. Local course "Repaso demo" with `ecuaciones.md` validated and three topics.
The student sends "Quita los paréntesis y despeja la incógnita: 2(x - 3) = 4x + 2" with the bracket
not distributed, through the exercise form, until the feedback shows the notice.

| Step | Result |
|---|---|
| Submissions 1–6 | ⚠️ no notice yet: the model files the same mistake as "Error de ejecución · Paréntesis", "Error de procedimiento · Despejar la incógnita" or "Error de procedimiento · Paréntesis", so no pair reaches 3 |
| Submission 7 | ✅ notice "Este error te ha salido 3 veces en los últimos 30 días", "Error de procedimiento · Despejar la incógnita", the provisional line and the three options |
| "Ver explicación" | ✅ "Preparando el repaso…", then the review page in 16 s: explanation, worked example, practice with two statements, citation to § 3.3 "Quitar paréntesis" |
| "Resolver" | ✅ the exercise form opens with the statement filled in |
| Mobile | ✅ no horizontal scroll |
| Teacher | ✅ same basis sentence on the submission and the review the student got |

## Open points (also in backend `specs/005-repeated-mistakes/validation.md`)

- **Classification is unstable**, so a real repeated mistake takes 7 submissions instead of 3 to
  be noticed. This is the exercise feedback of spec 003 (type and topic), not this feature.
- **Generated maths is wrong with the 7B model**: the worked example reaches "-24 = 0" and both
  practice statements have no solution. Kept on purpose, to re-evaluate with the pilot's model
  before students use it.
