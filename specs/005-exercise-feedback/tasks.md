# Tasks: Real Exercise Feedback and the Learning Record

**Spec**: [spec.md](spec.md)

- [x] T001 E2E: 005-US1-AS1…AS5, 005-US2-AS1…AS2, 005-US3-AS1 in
  `tests/app/e2e/exercise-feedback.spec.ts`; drop the stub scenario 002-US7-AS1
- [x] T002 Pin the backend contract (`contracts/backend-openapi.json`) and regenerate the types
- [x] T003 Mock API: feedback scenarios (`/__test/feedback`), `not_assessed`, `GET /v1/error-types`
- [x] T004 [US1] Feedback page: taxonomy labels, `not_assessed`, no stub notice; pending label
- [x] T005 [US2] `/student/courses/[id]/progress`: mistakes by topic and type
- [x] T006 [US3] `/teacher/courses/[id]/students/[studentId]`: same view, linked from the student list
