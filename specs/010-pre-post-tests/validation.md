# Validation: pre-test and post-test on the real stack (SC-002)

**Date**: 2026-10-31 · **Frontend**: `010-pre-post-tests` · **Backend**: `008-pre-post-tests`

Driven through the UI with Playwright (teacher on desktop Chromium 1440 px; the student takes the
pre-test on mobile WebKit 390 px and the post-test on desktop). A course with the topics
"Paréntesis" and "Despejar la incógnita". No model is involved.

| Step | Result |
|---|---|
| Teacher adds 3 questions through the form | ✅ listed in order with their topic and the right option marked in text |
| Opens the pre-test | ✅ confirmation about freezing; "Abierto desde el 31 de octubre de 2026"; "Las preguntas ya no se pueden cambiar" and no edit actions |
| Student, "Mis cursos" (mobile) | ✅ the card says the pre-test is open; "Hacer el pre-test" opens it |
| Student answers and sends (1 of 3 right) | ✅ confirmation step, then "¡Gracias! Has terminado el pre-test." with no score; no horizontal scroll |
| Teacher closes the pre-test, opens the post-test; student takes it (3 of 3) | ✅ |
| Results | ✅ "Lucas Herrera · 1 de 3 · 33 % · 3 de 3 · 100 %"; by topic "Paréntesis 50 % → 100 %", "Despejar la incógnita 0 % → 100 %" |

## Changes made because of this run

- **Text typed before hydration was lost** in the teacher's question form on mobile WebKit (seen
  in the E2E tests: the statement came back empty). The form now uses uncontrolled fields read on
  submit. The student's test form got the same change as a precaution (radios read from the form,
  also once on hydration), so a choice made on a slow phone before the page is ready counts. The
  first two walkthrough attempts failed for reasons in the walkthrough script itself (it read the
  page before navigating, and opened the pre-test before the third question was saved), not in
  the app.

## Open points

- **Option order**: the student sees the options in the order the teacher wrote them. If the
  teacher always puts the right answer first, a student can guess it. Worth either a reminder in
  the form or shuffling the options per student in the backend.
