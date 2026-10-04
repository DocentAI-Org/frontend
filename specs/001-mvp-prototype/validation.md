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
