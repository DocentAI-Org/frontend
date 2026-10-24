# Data model: UI fields ↔ API v1

**Feature**: [spec.md](spec.md). The UI fields are those of
[001 data-model.md](../001-mvp-prototype/data-model.md); the API models are in the pinned
contract. This table lists only where they differ or need derivation.

| UI (001) | API v1 | Rule |
|---|---|---|
| Course.codeStatus | `TeacherCourse.class_code_active` | `active` ⇔ true |
| Course.invitationLink | `TeacherCourse.invitation_path` | app origin + path |
| Course.teacherName | `StudentCourse.teacher_name` | — |
| MaterialDocument.processingStatus "uploading (%)" | — | client-side during the upload request only |
| MaterialDocument.validatedBy | `Document.validated_by_name` | — |
| MaterialDocument.sizeLabel | `Document.size_bytes` | formatted in the active locale |
| Message.kind "failed" | `StudentMessage.status = failed` | a failed student message; kind stays `question` |
| Message.hintNumber | `StudentMessage.hint_number` | no total (spec D6) |
| Message.flag (teacher) | `TeacherMessage.flag` | category + correction |
| Message.correction (student) | `StudentMessage.correction` | text + `reviewed_at`; no category |
| Citation.available | `Citation.available` | passage `null` when unavailable |
| DailyMessageAllowance.state | `Allowance.remaining` | `reached` = 0, `low` ≤ 5, else `normal` |
| DailyMessageAllowance.resetsAt | `Allowance.resets_at` | formatted in the active locale and time zone |
| TutorSettings.solutionPolicy | `solution_policy` | `direct` · `hints_first` · `hints_only` |
| Consent (student profile) | `Consent`, `ConsentEvent` (backend 002) | study consent, account-wide |
| AI disclosure (per course) | `StudentCourse.disclosure_acknowledged` | `POST …/disclosure` |
| ExerciseSubmission.photo | — | not supported (spec D2) |
| Adaptation (S8) | — | P2, out of scope |
| User.accountStatus "pending invitation" | `AdminUser.status` (`active`/`disabled`) | spec D3 |
