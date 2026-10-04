# Validation Notes: DocentAI MVP Prototype

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Run guide**: [quickstart.md](quickstart.md)

Anonymised record of prototype checks, usability findings and the decisions they caused
(research R-18, R-19). Participant codes only (P-S01…, P-T01…). No names, recordings or contact
details are stored here.

## Status

| Field | Value |
|---|---|
| Prototype status | Borrador (Draft) |
| Version | 0.1.0 |
| Last updated | 2026-10-04 |

## Open items

| Item | Owner | Status |
|---|---|---|
| Official IMFAHE logo file. The prototype shows an HTML placeholder ("Logo IMFAHE – pendiente") until IMFAHE supplies the file (research R-10). | Team | Pending |
| IMFAHE acknowledgement wording. Draft: "Proyecto financiado por la Fundación IMFAHE" (spec Assumptions). | Team | Pending confirmation |
| `npm run lint` failed: typescript-eslint does not support TypeScript 7.0. Fixed by running TS side by side: `typescript` → `@typescript/typescript6` (API for tools), `typescript7` → `typescript@7.0.2` (the `tsc` used by `npm run typecheck`). | Team | Resolved 2026-10-04 |

## ES/EN review log

One row per page reviewed in both languages at 1440 px (and 390 px where the manifest says `mobile`).

| Page | Date | Widths | Result | Breakages and fixes |
|---|---|---|---|---|
| student/consent.html (all 4 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| student/chat.html (all 12 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | The prototype state panel covered the send button at 390 px; it now starts collapsed as a small pill (top centre on mobile, bottom right on desktop). Button colours briefly faded in after load, which axe caught as low contrast; transitions are now off until the page is revealed. |
| teacher/material.html (all 9 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| teacher/fragments.html (all 5 states) | 2026-10-04 | 1440 | Pass (ES, EN) | None. |
| teacher/tutor-settings.html (all 8 states) | 2026-10-04 | 1440 | Pass (ES, EN) | Radio names included the explanation text; each radio is now named by its option only and described by the explanation (also fixed in the design system RadioGroup). |
| teacher/courses.html (4 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| teacher/course-new.html (3 states) | 2026-10-04 | 1440 | Pass (ES, EN) | None. |
| teacher/course.html (8 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | "Copiar enlace" wrapped onto two lines at 1440 px; copy buttons no longer shrink or wrap. |
| student/courses.html (5 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| student/join.html (6 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | Opening an error state directly shows an empty code field (the typed code is only kept when arriving by submitting). Accepted for the prototype. |
| student/chat-guided.html (11 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | The indicator icon wrapped onto its own line at 390 px; icon and text now stay together. |
| student/exercise.html (6 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | In unreadable-photo the native file field says no file is selected (a static page cannot pre-fill it); the attached file name is shown under the field. Accepted for the prototype. |
| student/exercise-feedback.html (5 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| auth/sign-in.html (4 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| auth/password-recovery.html (4 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| auth/access-denied.html (3 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| about.html | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| student/profile.html (5 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| admin/users.html (4 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | Table at 1440 px; stacked list at 390 px. |
| admin/teacher-new.html (4 states) | 2026-10-04 | 1440 | Pass (ES, EN) | None. |
| admin/courses.html (4 states) | 2026-10-04 | 1440 | Pass (ES, EN) | None. |
| teacher/conversations.html (6 states) | 2026-10-04 | 1440, 390 | Pass (ES, EN) | None. |
| teacher/conversation.html (5 states) | 2026-10-04 | 1440 | Pass (ES, EN) | The flag badge stretched to full width; now sized to its content. |
| teacher/flags.html (4 states) | 2026-10-04 | 1440 | Pass (ES, EN) | None. |

## Keyboard pass log

Keyboard only: Tab order follows the visual order, focus always visible, dialogs trap focus and
return it to the opener.

| Page | Date | Result | Notes |
|---|---|---|---|
| student/consent.html | 2026-10-04 | Pass | Skip link → language switcher → privacy link → checkbox → Continuar. Continuing without the checkbox is blocked by native validation. |
| student/chat.html | 2026-10-04 | Pass | Order: skip link, shell nav, user menu, switch course, citation chip, suggestion, composer, send, footer. First-use dialog: focus stays inside, Esc does not close it (acknowledgement required). Citation sheet: Enter opens it with focus on Close; Esc closes it and focus returns to the chip. |
| teacher/material.html | 2026-10-04 | Pass | Shell nav → back link → upload → per document: include switch, review-fragments link (its name includes the document). Duplicate dialog: focus starts on Cancelar and stays inside. |
| teacher/fragments.html | 2026-10-04 | Pass | Back link → search field → search button → footer. |
| teacher/tutor-settings.html | 2026-10-04 | Pass | Back link → policy, level, tone radio groups (arrow keys within a group) → example, discard, save. Unsaved dialog: focus starts on "Seguir editando"; Esc returns to the form with the change kept. |
| teacher/courses.html | 2026-10-04 | Pass | Create course → course cards (one link each). |
| teacher/course-new.html | 2026-10-04 | Pass | Back → name → description → Cancel → Create. Empty name: error summary plus field error, the field is marked aria-invalid and its error is part of its description. |
| teacher/course.html | 2026-10-04 | Pass | Tabs (Students is aria-current) → copy code → link field → copy link → regenerate → disable. Regenerate dialog: focus on Cancelar first. |
| student/courses.html | 2026-10-04 | Pass | Join → per course a labelled group of four actions. |
| student/join.html | 2026-10-04 | Pass | Code field → Continue; errors are announced through the field description. |
| student/chat-guided.html | 2026-10-04 | Pass | Citation chip → "Otra pista" → "Intentarlo yo" (moves focus to the composer) → composer → send. The citation sheet returns to the hint state it was opened from, with focus back on the chip. |
| student/exercise.html | 2026-10-04 | Pass | Statement → steps → photo → review. Errors are announced (role alert) and fields are aria-invalid. Review: Edit → Send. |
| student/exercise-feedback.html | 2026-10-04 | Pass | Citation chip (opens the sheet, focus returns on close) → ask the tutor → fix and resend. |
| auth/sign-in.html | 2026-10-04 | Pass | Language → email → password → forgot → sign in → three demo links → privacy. |
| student/profile.html | 2026-10-04 | Pass | Review consent → withdraw. Dialog: focus starts on Cancelar. |
| admin/teacher-new.html | 2026-10-04 | Pass | Name → email → cancel → send. Errors: summary alert plus per-field errors in the field descriptions. |
| auth/password-recovery.html, auth/access-denied.html, about.html, admin/users.html, admin/courses.html | 2026-10-04 | Pass | Linear order; tables use row headers and a caption. |
| teacher/conversations.html | 2026-10-04 | Pass | Flags link → three labelled filters → apply → one "open" link per conversation, described by the student name. |
| teacher/conversation.html | 2026-10-04 | Pass | Flag buttons after each tutor answer. Flag dialog: radio group (arrows) → comment → cancel → save; focus stays inside. |
| teacher/flags.html | 2026-10-04 | Pass | One "view the message" link per flag, named with the student. |

## Session plan

To be filled before the first session (quickstart.md B1).

| Session | Date | Participant | Role | Device | Flows |
|---|---|---|---|---|---|

## Findings

| # | Participant | Page + state (link) | Finding | Severity | Spec IDs | Decision |
|---|---|---|---|---|---|---|

## Decision log

| Date | Decision | Caused by | Spec revision |
|---|---|---|---|
| 2026-10-04 | Added an `error` state to teacher/material.html. The contract listed none, but FR-001 and Constitution VI require one for every data-driven page. | Implementation of T049 | contract §4 updated |
| 2026-10-04 | The upload empty state lists "PDF, DOCX, Markdown" (spec US-02 AS1 wording) rather than "PDF, DOCX, MD" (task T049). | Implementation of T049 | none |
| 2026-10-04 | Tutor settings keep the "saved" confirmation and the hint example visible together, so US-03 AS2 (confirmation plus example after saving) is one state. | Implementation of T054 | none |
| 2026-10-04 | Added a `code-regenerated` state to teacher/course.html (new code ALG-9Q2M and a note that the old code no longer works), so US-04 AS4 "the screen shows the new state" is visible. | Implementation of T060 | contract §4, plan pages table |
| 2026-10-04 | Creating a course leads to the course page in `no-students` state (a new course has no students yet). Join codes for the prototype: ALG-7K3P valid, ALG-4X2B expired, ALG-8M1D disabled, anything else invalid. | Implementation of T059, T062 | none |
| 2026-10-04 | Added a `citation` state to student/chat-guided.html so hint citations open the citation sheet (US-05 AS4, S1). The sheet uses `data-close-state="@back"` to return to the hint the student was on. | Implementation of T067 | contract §3, §4 |
| 2026-10-04 | Added a `citation` state to student/exercise-feedback.html so its citation opens the passage (FR-012). Added `data-mirror` so the review step shows what the student typed. | Implementation of T070, T071 | contract §3, §4 |
| 2026-10-04 | Role separation (Constitution II, FR-041) checked on all 31 pages: student pages show only the signed-in student; teacher pages only the teacher’s own courses and students; only admin pages list all users and courses. | T085 | none |
| 2026-10-04 | Demo sign-in links read "Entrar como profesor/a" (gender-neutral, as in the spec) rather than "profesora" (task T076). The access-denied home link takes the role home from `?home=` (default: student courses). | Implementation of T076, T078 | contract §3 |
| 2026-10-04 | Browser tests serve the pinned Tailwind browser build from node_modules instead of jsDelivr: hundreds of CDN loads per run caused intermittent unstyled pages and flaky accessibility results. The prototype itself still uses the CDN. | Phase 9 test runs | plan.md dependency note |
| 2026-10-04 | In the teacher conversation view, citations are shown as non-interactive chips and the no-source reply has no student actions; the teacher reviews but does not act as the student. | Implementation of T087 | none |
| 2026-10-04 | Playwright runs with 4 workers locally and 2 on CI, a 60 s test timeout and a 10 s assertion timeout: with ~500 page loads, uncapped parallelism made the timed state changes and WebKit axe runs flaky. | Phase 10 test runs | none |

## Success criteria results

| Criterion | Target | Result | Pass? |
|---|---|---|---|
| SC-001 unaided P1 task completion | ≥80% per task | | |
| SC-002 AI and teacher-review recall | ≥90% of students | | |
| SC-003 find source / tell no-source apart | ≥90% of students | | |
| SC-004 setup time / time to first question | <10 min / <2 min | | |
| SC-005 states and contrast coverage | 100% (axe sweep green) | | |
| SC-006 pedagogy sign-off and traceability | signed; flow tests green | | |
| SC-007 IMFAHE visible, ≤1 tap/click | yes | | |
