---
name: DocentAI
description: Teacher-guided AI tutor whose every answer shows its source. Direction "Cuadrícula", the annotated notebook.
colors:
  ink: "oklch(0.261 0.03 265)"
  ink-muted: "oklch(0.502 0.034 264)"
  paper: "oklch(0.991 0.003 265)"
  sheet: "oklch(0.998 0.001 262)"
  sunken: "oklch(0.962 0.008 262)"
  grid: "oklch(0.948 0.012 262)"
  hairline: "oklch(0.925 0.016 262)"
  hairline-strong: "oklch(0.62 0.032 263)"
  pen-violet: "oklch(0.499 0.221 283)"
  pen-violet-deep: "oklch(0.44 0.2 283)"
  teacher-green: "oklch(0.486 0.088 166)"
  teacher-green-ink: "oklch(0.44 0.08 166)"
  highlighter: "oklch(0.917 0.113 98)"
  highlighter-ink: "oklch(0.36 0.08 70)"
  info-ink: "oklch(0.39 0.08 245)"
  success-green: "oklch(0.52 0.13 148)"
  danger-red: "oklch(0.53 0.2 27)"
  scrim: "oklch(0.17 0.02 266)"
typography:
  display:
    fontFamily: "Literata, Literata Fallback, Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: "3rem"
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Literata, Literata Fallback, Georgia, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: "2.5rem"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Literata, Literata Fallback, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  answer:
    fontFamily: "Literata, Literata Fallback, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.75rem"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible Next Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-small:
    fontFamily: "Atkinson Hyperlegible Next, Atkinson Hyperlegible Next Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
rounded:
  sm: "0.1875rem"
  md: "0.25rem"
  lg: "0.375rem"
  xl: "0.5rem"
  2xl: "0.75rem"
  full: "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.pen-violet}"
    textColor: "{colors.paper}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.pen-violet-deep}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  tutor-answer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.answer}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  student-line:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  source-margin-note:
    textColor: "{colors.teacher-green-ink}"
    typography: "{typography.body-small}"
  hint-mark:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.highlighter-ink}"
    rounded: "{rounded.sm}"
  nav-link-current:
    textColor: "{colors.ink}"
---

# Design System: DocentAI

> **Source of truth.** `public/prototype/assets/theme.css` holds every token as `light-dark(light, dark)` and is imported unchanged by the React app (`src/app/globals.css`). The frontmatter lists **light-scheme** values under descriptive names; code uses the Tailwind token names (`primary-600`, `teacher-700`, `fg-muted`, …). When the two disagree, `theme.css` wins.

## Overview

**Direction: "Cuadrícula", the annotated notebook.** DocentAI looks like a well-kept squared school notebook with the teacher's notes in the margin. The tutor writes on the page, the student writes in pen, and the teacher's hand is the green ink in the margin: every source, correction and validation.

The product promise drives the metaphor. Every answer shows the passage it came from, so sources get a dedicated place in the layout (the margin) instead of a chip at the bottom of a bubble. When the material does not cover a question, the margin stays visibly empty behind a dashed rule. The AI is always labelled as AI, and students always see that their teacher may read the conversation.

**Key characteristics:**
- Cool paper (`surface`) with a faint 16 px squared grid behind every page. Loose sheets (cards, menus, dialogs) are plain white.
- Blue-black ink (`#1D2433`) for text and for selected/current states.
- **Four inks, each with a fixed meaning**: ink (text, selection), pen violet (what the student does: primary actions, send, focus, their own lines), teacher green (sources, the margin, corrections, validation) and highlighter yellow (hints, guided mode, non-blocking warnings).
- Two voices: **Literata** for the page (headings, tutor answers, quoted material), **Atkinson Hyperlegible Next** for the interface and the student.
- Nearly square corners (3–12 px). Hairline borders at rest, a soft shadow only on hover and floating layers.
- WCAG 2.2 AA in light and dark ("night study": deep blue paper, light ink).

## The notebook

### Paper
- `body` carries the grid in the base layer (`--color-grid`, 16 px squares, so the 8 px spacing scale lands on its lines). Any other surface can opt in with `bg-grid`.
- **Reading text never sits on the grid.** Tutor answers, notices and long copy sit on plain paper (`bg-surface`). The grid shows between blocks and inside worked maths: equations are written on a small gridded strip (`bg-grid` + hairline).
- Data-dense surfaces (tables, lists, forms) sit on a white sheet (`bg-surface-raised`, 1 px hairline, `rounded-xl`).

### The margin
- `border-margin` (teacher green, 2 px) separates an answer from its sources. On desktop the margin is a column to the right (`lg:grid-cols-12`: text `col-span-9`, margin `col-span-3`). On phones it folds under the answer with a top rule.
- Only the teacher writes in the margin: cited sources (`SourceCitation` `margin-note`) and corrections (`TeacherCorrection`).
- Reference marks are real numbers (¹, ²) that pair a claim with its note. Use them only when there is a note.
- **No source:** the answer becomes a `NoSourceNotice` (info wash, no citations) and the margin is an empty column behind a dashed rule.

### Page header
Pages open with their subject written at the top of the page: the `h1` in Literata, context lines underneath, and a 2 px ink rule (`border-b-2 border-neutral-900`) closing the header.

## Colors

### Neutral
Cool paper to blue-black ink (hue ≈ 262–265, low chroma); dark mode mirrors the ramp.
- **Ink** (`neutral-900` → `fg`): text, current and selected states.
- **Ink muted** (`neutral-600` → `fg-muted`): secondary text (≥ 5:1 on paper, sheet, sunken and grid).
- **Paper** (`surface` → `neutral-50`), **Sheet** (`surface-raised` → `neutral-0`), **Sunken** (`neutral-100`).
- **Hairline** (`border`), **Hairline strong** (`border-strong` → `neutral-450`, 3:1 for control borders and dashed absences).
- **Grid** (`--color-grid`): the squares only.

### Inks
- **Pen violet** (`primary-*`, the logo's violet end): primary buttons, send, focus ring, caret, the student's own messages (left pen rule) and the celebration.
- **Teacher green** (`teacher-*`): the margin rule (`margin` → `teacher-600`), source notes and reference marks (`teacher-700`), teacher corrections, "validated by your teacher" lines, the teacher line on a course.
- **Highlighter** (`warning-200` + `warning-900`, alias `highlight`): hint marks, guided mode, low allowance, at-risk reasons, draft status.

### Semantic
- **Info** (ink blue): the outlined **IA** tag and notices about the AI itself (no-source).
- **Success** (leaf green, yellower than the teacher's ink) always pairs with a check icon. **Danger** red for errors and invalid fields.

### Named Rules
**The Four Inks Rule.** Every coloured mark is ink, pen, teacher or highlighter, and means only that. Never use teacher green for success, or pen violet for navigation.

**The Margin Rule.** Sources live in the margin, never inside the answer text. An answer without a margin is either a no-source reply or a message that cites nothing.

**The Meaning-Not-Category Rule.** Bars and badges are coloured by meaning. Error volume on the teacher dashboard is ink (`neutral-800`) on a sunken track, with the number beside it.

**The Semantic Alias Rule.** Use role aliases (`fg`, `fg-muted`, `surface*`, `border*`, `focus`, `margin`, `highlight`) wherever a role exists. Raw colours exist only in `theme.css`; Tailwind's default palette is erased.

**The Mirrored Pair Rule.** `neutral-900` + `fg-inverse` and `*-50` + `*-800` keep AA in both schemes without a `dark:` override.

## Typography

Self-hosted (`assets/fonts/`, OFL), each with a metric-matched local fallback so lines do not jump while loading.

- **Literata** (variable, opsz + wght, roman and italic): every `h1`–`h3` (set in the base layer), tutor answers (`font-serif text-lg`), quoted passages and equations (italic). Headings use **600**.
- **Atkinson Hyperlegible Next** (variable wght): interface, buttons, navigation, data, the student's own messages. Designed for legibility, including its distinct zero.

### Hierarchy
- **Display** (Literata 600, 2.5rem): page `h1` from `sm` up; the cover can go to `text-5xl`.
- **Headline** (Literata 600, 2rem): mobile `h1`, section titles on the cover.
- **Title** (Literata 600, 1.25rem): sheet and section headings.
- **Answer** (Literata 400, 1.125rem / 1.75rem): tutor text.
- **Body** (Atkinson 400, 1rem) and **Body small** (Atkinson 500–600, 0.875rem) for the interface.
- No uppercase tracked labels. A small label is sentence case, `text-sm font-semibold text-fg-muted` (or `text-teacher-700` when it names a source).

**The Tabular Data Rule.** Counts, numbers, percentages, dates and times set `tabular-nums`.

**The Balanced Heading Rule.** Headings `text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Layout

- **Spacing: 8 px scale** on a 4 px unit (`2`, `4`, `6`, `8`, `10`, `12`; `1` only for icon gaps).
- **Containers:** reading pages (chat) `max-w-4xl` with the 9/3 text-and-margin grid; working pages `max-w-6xl`; single-task forms `max-w-md`.
- **The 44 px Rule.** Touch targets ≥ 44 px (`min-h-11`); dense desktop controls may drop to 36 px from `md`.

### App shells (`partials/shell-*.html`)
- **Student:** a white top sheet with the wordmark and **notebook divider tabs** on desktop (the current tab joins the page below it), the persistent `AIDisclosure` strip, and a **bottom tab bar** on phones (Mis cursos, Mi progreso, Perfil). Sticky bottom elements use `bottom-tabbar` so they sit above it.
- **Teacher and admin:** a fixed **contents sidebar** on desktop (`lg`, 16rem; the page gets `padding-inline-start` from `theme.css`). The current entry is bold ink with an ink bar on the sidebar edge. Below `lg`, a top bar with a menu.
- **Public:** a top sheet with the wordmark and language switcher.
- The footer carries the IMFAHE acknowledgement, language and theme switchers on every page.

## Elevation, Shape & Motion

- **Rest:** 1 px hairline, no shadow. **Hover** (`shadow-md`) only on interactive sheets. **Overlay** (`shadow-lg`) for menus, dialogs, sheets, toasts. The student's own message carries `shadow-sm`, like a slip of paper.
- **Radius:** `sm` 3 px marks and badges, `md` 4 px small controls, `lg` 6 px buttons and inputs, `xl` 8 px sheets, `2xl` 12 px dialogs and bottom sheets, `full` for avatars.
- **Motion:** 150 ms colour/border transitions, 80 ms press scale, 180 ms menu reveal, all behind `prefers-reduced-motion`. **One celebration** (quiz summary). Don't add others without replacing it.
- **Dashed borders mean absence** (empty states, unavailable citations, the empty margin), never decoration.

## Components

### ChatMessage
- **Student:** right-aligned line on a white slip with a 4 px pen-violet left rule; sans.
- **Tutor answer:** no bubble and no avatar. "Tutor" + outlined **IA** tag, then Literata text on plain paper; worked steps on gridded strips; sources in the margin.
- **Tutor hint:** the same, with a highlighter **Pista n** mark.
- **No source:** info-wash block with an info icon and next steps; empty dashed margin.
- **Failed:** the student's line with a danger left rule, a plain explanation and Retry.
- **Corrected:** the wrong text struck through in teacher green and the `TeacherCorrection` written in the margin.

### SourceCitation
`margin-note`: reference number + document and location in teacher green, a three-line italic excerpt, and "Ver el pasaje" to open the `CitationSheet`. `unavailable` / `fragment-unavailable`: a dashed, disabled note.

### CitationSheet
Bottom sheet below `lg`, right panel from `lg`. The passage is set in Literata behind the green margin rule; "From the material your teacher approved" closes it in teacher green.

### Teacher tables
Ledger style on a white sheet: a 2 px ink rule under the header row, hairlines between rows, numbers right-aligned beside an ink bar. At-risk reasons are highlighter marks.

### Selection
Segmented controls, current tabs and current nav use ink (`neutral-900` + `fg-inverse`, or an ink bar). Never the pen violet.

### States
Every data view has populated, empty, loading and error states. Empty states are a dashed panel with one clear action. Errors use the danger wash with a recovery action.

## Copy

Short, clear and warm, never childish. Verbs on buttons. Errors say what happened and what to do. Exclamation marks only for success and celebration. No emojis. Spanish (tú for students) and English say the same thing.

## Do's and Don'ts

### Do:
- **Do** take every colour from `theme.css` tokens and prefer the role aliases.
- **Do** keep each ink to its meaning (Four Inks Rule).
- **Do** put sources in the margin and keep reading text on plain paper.
- **Do** keep spacing on the 8 px scale, so edges land on the grid.
- **Do** check every pairing in light and dark.
- **Do** name components identically in the prototype (`data-component`) and in React.

### Don't:
- **Don't** set long text directly on the grid.
- **Don't** use gradients, glows or decorative illustration.
- **Don't** use the pen violet for selection or navigation, or teacher green for anything the teacher did not provide.
- **Don't** put a shadow on a resting sheet.
- **Don't** write raw colours, arbitrary `[..]` utilities or raw pixel spacing outside `theme.css`.
- **Don't** style a "not covered" reply like a normal answer or give it citations.
- **Don't** convey state by colour alone.
- **Don't** redraw or recolour the DocentAI logo, or drop the IMFAHE acknowledgement.
