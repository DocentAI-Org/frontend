# Research: DocentAI MVP Prototype (Frontend UI)

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04

Design decisions for the Figma prototype. Each entry: decision, rationale, alternatives
considered. Items marked **Verify** depend on Figma product limits that should be confirmed in
the Figma account before building, since plans and limits change.

## Tooling and file setup

### R-01 · Figma plan that supports two variable modes

- **Decision**: Build the file in a team on a Figma plan that allows at least 2 modes per
  variable collection (Professional, Education or higher). Apply for Figma for Education with
  the team's university accounts first, since it is free for verified educators and students;
  otherwise pay for one Professional editor seat for the months of design work.
- **Rationale**: The `copy` collection needs `es` and `en` modes (Constitution VIII). The free
  Starter plan is limited to 1 mode per collection. The project budget is $1,000, so a free
  education plan is preferred.
- **Alternatives considered**: Two duplicated pages (ES and EN): doubles the frames and lets the
  two languages drift. A translation plugin: adds a tool dependency and does not keep the
  future i18n keys.
- **Verify**: current mode limits per plan and Education eligibility.

### R-02 · Variable naming and mapping to code

- **Decision**: Figma variables use `/` to group (`color/primary/500`,
  `student/chat/limitReached`). Mapping rule: style tokens are `--` + path joined by `-`
  (`--color-primary-500`); copy keys are the path joined by `.` (`student.chat.limitReached`).
  Names use lowerCamelCase for the last segment of copy keys and kebab/number steps for tokens.
- **Rationale**: `/` creates groups in Figma's variable panel, and the mapping is mechanical, so
  a script can export them later without renaming. Constitution IV requires matching names.
- **Alternatives considered**: Dots in Figma names: not usable as grouping and, as far as we
  know, not allowed in variable names. Flat names (`colorPrimary500`): no grouping, hard to
  browse.
- **Verify**: allowed characters in Figma variable names.

### R-03 · Shadows

- **Decision**: Shadows are effect styles named `shadow/sm`, `shadow/md`, `shadow/lg`, with
  their colors bound to `color/*` variables. They map to `--shadow-sm` and so on.
- **Rationale**: Figma variables have no composite shadow type. Effect styles keep the
  one-to-one name match that Constitution IV requires.
- **Alternatives considered**: Number variables for each shadow parameter: very verbose, and the
  composite still has to be an effect.

### R-04 · Sample user content in two languages

- **Decision**: Sample content (student questions, tutor answers, document names, people) is
  stored as string variables under a separate `sample/…` group in the `copy` collection, with
  ES and EN modes. `sample/*` keys are clearly marked as **not** future i18n keys.
- **Rationale**: Switching mode must switch the whole screen, including the conversation, so
  each P1 screen can be checked in both languages. Keeping it separate stops sample text from
  leaking into the i18n key structure.
- **Alternatives considered**: Literal text on frames: the EN check would show mixed languages.
  Sample content only in Spanish: hides layout problems in EN.

### R-05 · How prototype flows reuse role screens

- **Decision**: Each screen × state on the role pages is a **component** (e.g.
  `Screen/Student/Chat/limit-reached-390`). The Prototype Flows page contains **instances** of
  them, connected with prototype interactions. State changes inside a screen use interactive
  component variants.
- **Rationale**: Figma prototype connections only work between frames on the same page, while
  the requested structure keeps screens on role pages. Instances keep one source of truth, so an
  edit on a role page updates the flows.
- **Alternatives considered**: Copying frames to the flows page: they drift apart. Building
  flows on each role page: breaks the requested page structure, and F6 crosses roles.

### R-06 · Color mode

- **Decision**: Light mode only; the `color` collection has a single `light` mode, and
  components use semantic aliases (`color/text/default`) rather than palette steps directly.
- **Rationale**: The spec does not require dark mode. Semantic aliases let a dark mode be
  added later without touching components.
- **Alternatives considered**: Light + dark now: doubles contrast checks without a requirement
  asking for it.

## Interaction patterns

### R-07 · Citation display (S1)

- **Decision**: Under each grounded tutor answer, a row of `SourceCitation` chips shows
  "Tema 3 · p. 12". Tapping a chip opens a `CitationSheet` (bottom sheet at 390 px, side panel
  at 1440 px) with document name, page or section, and the quoted passage. If the document has
  since been excluded, the chip shows "Documento ya no disponible" and is not clickable.
- **Rationale**: Chips are large enough to tap (≥24×24 px, 44 px tall on mobile), are labelled
  in text (not color only) and keep the answer readable. A sheet keeps the student in the chat,
  as AS3 requires.
- **Alternatives considered**: Inline superscript numbers [1]: too small to tap, and need a
  footnote list. Always-expanded quotes: make answers long on mobile. Opening the PDF itself:
  leaves the chat and needs a document viewer.

### R-08 · "No validated source" answer (S2)

- **Decision**: A distinct `ChatMessage` variant (`tutor-no-source`) with an info icon, an
  information color (not error red), the heading "El material del curso no cubre esta
  pregunta" and suggested actions as buttons: "Reformular la pregunta", "Preguntar al
  profesor/a". It has no citation row. The same `NoSourceNotice` is reused in hints, exercise
  feedback and explanations.
- **Rationale**: SC-003 needs students to tell it apart from a normal answer; text and icon do
  that without relying on color. Red would suggest the student did something wrong, but this is
  correct tutor behavior.
- **Alternatives considered**: Plain text answer: indistinguishable from a normal one. Warning
  or error styling: implies a malfunction.

### R-09 · Communicating the daily message limit

- **Decision**: `MessageAllowance` near the composer always shows the remaining count ("Te
  quedan 12 mensajes hoy"). At 5 or fewer it changes to the low state, with an icon and text. When
  the limit is reached, `LimitReachedBanner` replaces the composer: it explains the limit, shows
  the reset time ("Podrás escribir de nuevo a las 00:00") and keeps the draft and history readable.
  Failed messages are shown as not counted.
- **Rationale**: Showing the limit early avoids a surprise block (AS5); replacing the composer
  makes the disabled state obvious without a modal, so the student can still reread answers (AS6).
- **Alternatives considered**: Only telling the student at the limit: abrupt. A blocking modal:
  stops them reading the history. A progress bar only: depends on color and a visual estimate.

### R-10 · AI disclosure

- **Decision**: Three layers. A first-use `AIDisclosure` dialog that the student must
  acknowledge, covering that it's an AI, that it answers only from the material, and that the
  teacher may review conversations. A persistent label in the chat header ("Tutor IA · tu
  profesor/a puede revisar esta conversación"). An "IA" tag on every tutor message.
- **Rationale**: Requirements §4.1 transparency and spec FR-010/FR-011; SC-002 measures recall.
  A one-time notice alone is easily forgotten.
- **Alternatives considered**: Only in the terms or consent text: low recall. A banner on
  every message: noisy.

### R-11 · Guided mode hints (S3)

- **Decision**: Hints are `ChatMessage` `tutor-hint` variants labelled "Pista 1", "Pista 2" and
  so on, with quick replies "Otra pista" and "Intentarlo yo". After the last hint, either "Ver
  solución" (if allowed) or a note that the teacher chose hints only. `GuidedModeIndicator` in
  the chat header.
- **Rationale**: It stays in the chat, so there is no extra mode to learn. Numbered hints make
  progress visible, and quick replies keep mobile typing short.
- **Alternatives considered**: One accordion with all hints: shows hints the student hasn't
  asked for yet. A separate "exercise mode" screen: duplicates the chat.

### R-12 · Accessibility specifics

- **Decision**:
  - The focus ring is a 2 px outline in `color/border/focus` with a 2 px offset and ≥3:1 contrast
    against adjacent colors, shown as a `focus` variant on every interactive component.
  - Targets are at least 24×24 px, and 44×44 px for primary student mobile actions.
  - Each P1 screen gets numbered focus-order annotations.
  - Prototype transitions use "Instant" or a short dissolve. The motion spec on the Design System
    page lists a no-motion alternative for `prefers-reduced-motion`.
- **Rationale**: WCAG 2.2 AA (2.4.7, 2.4.11, 2.5.8, 1.4.3, 1.4.11) at design level, as required by
  Constitution III and FR-004.
- **Alternatives considered**: Leaving focus states to developers: they get skipped, and they
  can't be validated.

### R-13 · Language switching

- **Decision**: `LanguageSwitcher` on the sign-in screen and in each role's account menu. Spanish
  is the default. In the prototype, switching the language means switching the Figma variable mode.
- **Rationale**: FR-002 requires that users can switch language. Putting it on sign-in lets
  someone who reads only English get started.
- **Alternatives considered**: Choosing by browser locale only: there's nothing to show in the
  prototype, and users can't override it.

### R-14 · Plurals, dates and numbers in copy

- **Decision**: Plurals use separate keys (`…_one`, `…_other`), which map to standard plural
  categories. Dates and numbers are written per locale in each mode.
- **Rationale**: Figma string variables can't compute plurals. Separate keys match the future
  i18n format (Constitution VIII).
- **Alternatives considered**: "mensaje(s)": poor readability and not correct i18n.

### R-15 · Triggering error and limit states during sessions

- **Decision**: Each flow's start frame has a small, facilitator-only "Simular" panel with
  hotspots: network error, limit reached, upload failure. It is visually separated from the UI
  and labelled as not part of the product.
- **Rationale**: Participants can reach error branches without a scripted false path, and
  facilitators can run any branch on demand.
- **Alternatives considered**: Separate flows for every error: too many starting points for
  participants to navigate.

## Validation

### R-16 · Participants and recording

- **Decision**: At least 5 students (adults, on their own phones) and at least 3 teachers, from
  the team's network. The sessions are moderated and remote or in person, 45–60 min, think-aloud.
  Recordings are made only with written consent, stored in the team's private institutional
  storage, and deleted after the findings are written. Findings use participant codes (P-S01,
  P-T01).
- **Rationale**: These numbers are the spec's SC-001 minimum. Five users per role find most
  usability issues. Constitution VII and GDPR: recordings are personal data, kept only as long
  as needed.
- **Alternatives considered**: Unmoderated testing tools: these add a third-party processor and
  cost, and give less insight with a clickable Figma prototype. Using pilot participants: would
  contaminate the study.

### R-17 · How findings change the spec and Figma

- **Decision**: Findings are rated by severity (critical / major / minor / cosmetic). Findings
  that change behavior update `spec.md` first, through `/speckit-clarify` or a reviewed spec
  edit, and Figma second. Visual-only findings update Figma directly. Every change is logged on
  the Validation Notes page with the spec revision it relates to.
- **Rationale**: The constitution's development workflow says behavior changes go into the spec
  first, and Constitution IV makes the spec the source of truth for behavior.
- **Alternatives considered**: Fixing Figma during the sessions: the spec drifts and the
  decision isn't recorded.
