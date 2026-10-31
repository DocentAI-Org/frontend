# Validation: question review and adaptive quiz on the real stack (SC-002)

**Date**: 2026-10-31 · **Frontend**: `008-adaptive-quizzes` · **Backend**: `main` with
`006-adaptive-quizzes` · **Model**: `qwen2.5:7b` (Ollama), embeddings `bge-m3`

Driven with Playwright (desktop Chromium 1440 px, mobile WebKit 390 px, Spanish) against
Supabase, Ollama and the backend. A course "Cuestionarios demo" with `ecuaciones.md` validated,
the topic "Paréntesis" assigned to "3.3 Quitar paréntesis", and the student enrolled with
consent. The teacher asks for 5 questions, edits and approves the first, approves three more and
rejects the last; the student then takes a quiz on desktop and another on mobile.

| Step | Result |
|---|---|
| "Pedir preguntas" | ✅ "Generando preguntas nuevas…", then "Han llegado 5 preguntas nuevas a Pendientes." in 14 s; five cards citing § 3.3, right answers at different letters |
| Edit and "Guardar y aprobar" | ✅ saved, approved, marked "Editada" |
| Approve / reject | ✅ messages "Tus estudiantes ya pueden verla" / "no la verán"; tabs end at Pendientes 0 · Aprobadas 4 · Rechazadas 1 |
| Quiz | ✅ "4 preguntas de todos los temas" (4 approved), feedback at once with the answer and the right one marked in text, explanation and source |
| Level change | ✅ "Bajamos el nivel porque has fallado 2 seguidas. Es una regla provisional." after two wrong answers |
| Summary | ✅ "1 de 4 correctas", "Nivel final: Fácil", "Paréntesis: 1 de 4", next steps (another quiz, "Practicar Paréntesis", the tutor) |
| Mobile | ✅ same flow, no horizontal scroll |

## Open points

- **Every generated question was "Fácil"** in this run (backend validation saw levels 1–2 only).
  The quiz starts at level 2 and falls back to the nearest level, so the student sees "Fácil"
  from the first question, and "Bajamos el nivel" can appear while the questions were already
  easy. The rule works as specified, but it only makes sense with questions at every level:
  worth fixing in generation (ask for one level per request) or by starting at the lowest level
  available.
- **The teacher review is what keeps wrong questions out**: one draft ("¿Qué se debe hacer si hay
  un signo más delante de 3(x - 4)?" → "No hacer nada") is wrong, since the 3 still multiplies.
  In this walkthrough it was approved with only its statement edited, on purpose, to check that
  edits reach the quiz; a real review would have rejected or fixed it.
- The second quiz repeated the same order of questions: all four had been answered once, so none
  is preferred. Expected with so few questions.

## Second run, with backend `fix/quiz-levels` (2026-10-31)

Same walkthrough after the follow-up (backend 006 T008–T010, this spec T007–T008).

| Step | Result |
|---|---|
| "Pedir preguntas" | ✅ 5 questions in 19 s; the four approved ones were "Media", "Media", "Fácil" and "Difícil" (the first run had only "Fácil") |
| Quiz | ✅ starts at "Media"; two wrong → "Bajamos el nivel porque has fallado 2 seguidas."; when no easy question is left, the next one is "Difícil" and the reason says so ("No quedan más preguntas de dificultad fácil: la siguiente es difícil.", wording changed after this run) |
| Summary, mobile | ✅ as before, no horizontal scroll |

With only four approved questions, a student who keeps failing can still get a hard question
once the easy ones run out; the sentence now says why.

