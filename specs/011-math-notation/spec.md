# Feature Specification: Math Notation

**Feature Branch**: `011-math-notation`

**Created**: 2026-10-31

**Status**: Draft

**Input**: Requirement §4.4 "Math notation support (LaTeX rendered with KaTeX) if the subject is
STEM". DocentAI is not only for maths: any subject may have formulas (physics, chemistry,
economics), and most text has none.

**Builds on**: backend [010](../../../backend/specs/010-math-notation/spec.md), which keeps the
LaTeX the model writes. The prompts do not ask the model for LaTeX yet (local models break it);
formulas come today from the teacher: material, quiz and test questions, corrections.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Formulas read as formulas (Priority: P1) 🎯

**Acceptance Scenarios**:

1. **Given** a text with `\( \frac{x}{2} = 3 \)`, **When** it is shown, **Then** the formula is
   typeset inline, and a screen reader reads it as math.
2. **Given** a text with `\[ … \]`, **Then** the formula is typeset on its own line.
3. **Given** a text without `\(` or `\[` (any subject, prices such as "12 $"), **Then** it is
   shown exactly as before, and no math code is downloaded.
4. **Given** a formula with a LaTeX error, **Then** its source text is shown instead.

Where: tutor answers and teacher corrections in the chat; exercise statement, mistake location,
explanation and correction; quiz and pre/post-test questions, options and explanations; the
cited passage; the teacher's views of the same texts and of the material's fragments. Not in
form fields, and not in the student's worked answer (typed as plain text).

## Requirements *(mandatory)*

- **FR-001**: Delimiters are `\( … \)` (inline) and `\[ … \]` (display) only, never `$`.
- **FR-002**: KaTeX is loaded only when a text has a formula.
- **FR-003**: KaTeX runs with its defaults (`trust: false`): no links, no HTML from the text.
- **FR-004**: No API change.

## Success Criteria *(mandatory)*

- **SC-001**: Unit tests cover the four scenarios; E2E shows a typeset formula in exercise
  feedback; the existing suites pass.
