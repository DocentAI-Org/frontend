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

## Keyboard pass log

Keyboard only: Tab order follows the visual order, focus always visible, dialogs trap focus and
return it to the opener.

| Page | Date | Result | Notes |
|---|---|---|---|
| student/consent.html | 2026-10-04 | Pass | Skip link → language switcher → privacy link → checkbox → Continuar. Continuing without the checkbox is blocked by native validation. |
| student/chat.html | 2026-10-04 | Pass | Order: skip link, shell nav, user menu, switch course, citation chip, suggestion, composer, send, footer. First-use dialog: focus stays inside, Esc does not close it (acknowledgement required). Citation sheet: Enter opens it with focus on Close; Esc closes it and focus returns to the chip. |

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
