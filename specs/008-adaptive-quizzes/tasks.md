# Tasks: Quiz Questions Reviewed by the Teacher and Adaptive Quizzes

**Spec**: [spec.md](spec.md)

- [x] T001 E2E: 008-US1-AS1…AS7, 008-US2-AS1…AS6 in `tests/app/e2e/adaptive-quizzes.spec.ts`
- [x] T002 Pin the backend contract (`contracts/backend-openapi.json`) and regenerate the types
- [x] T003 Mock API: question generation (scripted: drafts, no_source, faults), review, quizzes
  with the backend's adaptive rule
- [x] T004 [US1] "Preguntas" tab `/teacher/courses/[id]/questions`: tabs with counts, topic
  filter, request, approve, reject, edit
- [x] T005 [US2] Quiz start `/student/courses/[id]/quiz`, quiz `/student/courses/[id]/quizzes/[quizId]`
  with feedback, level reasons and summary; "Cuestionario" on the course card
- [x] T006 Validation against the real stack (SC-002) in `validation.md`

## Follow-up after the real-stack walkthrough (backend 006 T008–T010)

- [x] T007 E2E: 008-US2-AS7, AS8; pin the contract of backend `fix/quiz-levels`; mock with the
  level shown and `…/quiz-topics`
- [x] T008 [US2] Topic choice on the start page; the `level_exhausted` sentence

