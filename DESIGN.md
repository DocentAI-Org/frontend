---
name: DocentAI
description: Teacher-guided AI tutor whose every answer shows its source.
colors:
  accent: "oklch(0.515 0.215 279)"
  accent-deep: "oklch(0.455 0.2 280)"
  accent-ink: "oklch(0.395 0.165 281)"
  accent-wash: "oklch(0.972 0.012 277)"
  accent-edge: "oklch(0.81 0.09 277)"
  ink: "#1a1a1a"
  ink-muted: "oklch(0.5 0.009 70)"
  canvas: "oklch(1 0 0)"
  paper: "oklch(1 0 0)"
  sunken: "oklch(0.966 0.004 75)"
  hairline: "oklch(0.926 0.006 75)"
  hairline-hover: "oklch(0.872 0.008 75)"
  hairline-strong: "oklch(0.63 0.01 75)"
  tutor-teal-tint: "oklch(0.956 0.045 203)"
  tutor-teal-ink: "oklch(0.4 0.075 224)"
  hint-amber-wash: "oklch(0.987 0.022 95)"
  hint-amber-ink: "oklch(0.41 0.105 46)"
  success-green: "oklch(0.52 0.12 163)"
  danger-red: "oklch(0.53 0.2 27)"
  scrim: "oklch(0.15 0.003 70)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "3rem"
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "2.5rem"
    letterSpacing: "-0.026em"
  title:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.75rem"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-small:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "Plus Jakarta Sans, Plus Jakarta Sans Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.025em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.75rem"
  2xl: "1rem"
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
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  source-citation:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  chat-bubble-student:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  chat-bubble-tutor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  nav-link-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
---

# Design System: DocentAI

> **Source of truth.** `public/prototype/assets/theme.css` holds every token as `light-dark(light, dark)` and is imported unchanged by the React app (`src/app/globals.css`). The frontmatter lists **light-scheme** values under descriptive names; code uses the Tailwind token names (`primary-600`, `neutral-900`, `fg-muted`, …). When the two disagree, `theme.css` wins.

## Overview

**Style: friendly but polished.** The clean, confident base of products like Airbnb and Uber, with a little warmth and play. White canvas, near-black ink, warm grays and **one** vivid accent. Content leads: data, sources and the student's own work carry the screen, and decoration stays minimal.

The product promise still shapes everything ("The Glass Classroom"). The AI is always labelled as AI, students can always see that their teacher may read the conversation, every answer shows the passage it came from, and every flag a teacher sees shows the data behind it.

**Key characteristics:**
- Mostly neutral: white, `#1a1a1a` ink and a warm gray ramp. No gradients.
- One accent (brand indigo from the logo), used sparingly for primary actions and key highlights: primary buttons, source citations, the class code, the focus ring and the celebration badge.
- Selected and current states (nav, segmented controls, tabs, chosen answers) use **near-black**, not the accent.
- Plus Jakarta Sans with a strong hierarchy: large 700 headings, 400–500 body, mid-gray secondary text.
- Generous whitespace on an 8 px spacing scale.
- Cards are a 1 px hairline at rest; a very soft shadow appears only on hover.
- Fast, subtle motion (150–200 ms), plus one small celebration when a student finishes a quiz.
- WCAG 2.2 AA in both light and dark: 3:1 control borders, a visible 2 px focus ring, and colour never the only signal.

## Colors

### Neutral (most of the UI)
A warm gray ramp (hue ≈ 70–75, very low chroma) from pure white to `#1a1a1a`. Dark mode mirrors it.
- **Ink** (`neutral-900` → `fg`): `#1a1a1a`. Primary text, the student's chat bubbles, selected/current states and the tutor avatar.
- **Ink Muted** (`neutral-600` → `fg-muted`): the mid gray for secondary text, helper text, captions and inactive nav (≈ 6:1 on white).
- **Canvas / Paper** (`surface`, `surface-raised`): both white in light mode. Cards are defined by their border, not by a tint. In dark mode the canvas is darker than the raised paper.
- **Sunken** (`surface-sunken`): hover fills, icon tiles, the AI disclosure strip, inline equations and quoted passages.
- **Hairline** (`border`): 1 px resting borders on cards and dividers. Interactive cards shift to `neutral-300` on hover.
- **Hairline Strong** (`border-strong`): control borders (inputs, secondary buttons, dashed empty states), tuned to 3:1.

### Accent
- **Accent** (`primary-600`, hover `primary-700`): primary buttons, the send button, the focus ring, caret and form accent, and the celebration badge.
- **Accent Wash / Ink** (`primary-50` + `primary-800`, edge `primary-300`): SourceCitation chips and the class code, the two things the product most wants you to notice.

### Semantic (kept small)
- **Tutor Teal** (`info`): only the small **IA** tag and notices about the AI itself (such as the no-source notice). It is no longer a header band or avatar colour.
- **Hint Amber** (`warning`): guided mode, hint tags, the low allowance warning and other non-blocking cautions.
- **Success Green / Danger Red**: outcomes (correct answers, confirmations; errors, invalid fields, failed messages).

### Named Rules
**The One Accent Rule.** If it's not a primary action or a key highlight, it is neutral. Never use the accent for selection, navigation, icons in tiles, eyebrows or text links.

**The Meaning-Not-Category Rule.** Bars and badges are coloured by what the value means. Correct work is `success-600`. Error *volume* on the teacher dashboard is neutral ink (`neutral-800`), because it's data to read, not an alarm. Every bar keeps its number beside it.

**The Semantic Alias Rule.** Use the role aliases (`fg`, `fg-muted`, `surface*`, `border*`, `focus`) wherever a role exists. Raw colours exist only in `theme.css`, and Tailwind's default palette is erased.

**The Mirrored Pair Rule.** `neutral-900` + `fg-inverse` and `*-50` + `*-800` keep AA in both schemes without a `dark:` override.

## Typography

**Font:** Plus Jakarta Sans (variable, OFL, self-hosted woff2, latin + latin-ext). A metric-matched **Plus Jakarta Sans Fallback** (local Arial at `size-adjust: 109.3%` with matching ascent/descent) holds line breaks while it loads.

### Hierarchy
- **Display** (700, 2.5rem / 3rem, −0.03em): the page `h1` from `sm` up (`text-3xl sm:text-4xl`). A quiz score can go to `text-5xl`.
- **Headline** (700, 2rem / 2.5rem, −0.026em): the mobile `h1`.
- **Title** (700, 1.125rem): `h2`/`h3` card and section headings. All headings are 700.
- **Body** (400, 1rem / 1.5rem): answers, passages, inputs.
- **Body Small** (500–600, 0.875rem): buttons (600), navigation, chips and meta text (500).
- **Label** (600, 0.75rem, uppercase, tracked, `fg-muted`): micro-captions such as "Fuentes". Use them sparingly.

**The Tabular Data Rule.** Anything that renders a count, number, percentage, date or time sets `tabular-nums`.

**The Balanced Heading Rule.** Headings `text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Layout

- **Spacing: 8 px scale.** The Tailwind unit stays 4 px, but spacing uses even steps only: `2` (8), `4` (16), `6` (24), `8` (32), `10` (40), `12` (48). `1` (4 px) is the single half-step, for icon-to-label gaps and tight badges. Odd steps (`3`, `5`, `0.5`, `1.5`…) are not used for padding, margin or gaps.
- **Cards** pad 24 px (`p-6`), 16 px for dense list rows (`p-4`).
- **Containers:** shells at `max-w-6xl` with 16 px gutters (24 px from `sm`). Reading surfaces at `max-w-3xl`, single-task forms at `max-w-md`.
- **Header:** sticky, 64 px, translucent white with blur. The current nav item is a near-black pill.
- **The 44 px Rule.** Every touch target is at least 44 px tall (`min-h-11`, `size-11`). Dense desktop contexts may drop to 36–40 px from `md` up.

## Elevation, Shape & Motion

- **Rest:** a 1 px hairline, no shadow, on cards, bubbles and panels.
- **Hover** (`shadow-md`, very soft warm ink): interactive cards only (`<a>` cards and `data-component="Card"`), with the border moving to `neutral-300` over 200 ms.
- **Overlay** (`shadow-lg`): menus, dialogs, sheets and toasts.
- **Radius:** `sm` 6 px (badges), `md` 8 px (small controls), `lg` **10 px buttons** and inputs, `xl` **12 px cards**, `2xl` 16 px dialogs and chat bubbles, `full` for chips and avatars.
- **Press:** buttons scale to 0.98 over 80 ms, on press.
- **Transitions:** 150 ms `cubic-bezier(0.23, 1, 0.32, 1)` for colour, border and shadow. Menus reveal in 180 ms. Everything sits behind `prefers-reduced-motion: no-preference`.
- **The celebration** (`assets/js/celebrate.js`): when the quiz summary appears, the accent check badge pops (420 ms spring), ten small accent and gray dots burst once, and the supportive line rises in. It runs once per page view and not at all with reduced motion. **One moment only.** Don't add celebrations elsewhere without replacing this one.
- **Dashed borders** mean absence (empty states, unavailable citations), never decoration.

## Components

### Buttons
- **Primary:** solid accent, `fg-inverse` text, 10 px radius, 44 px tall, 600 weight. Hover deepens to `primary-700`. No shadow.
- **Secondary:** white with a `border-strong` border and ink text. Hover sinks to Sunken.
- **Ghost / text links:** ink text. Inline links are underlined with a `neutral-400` decoration that darkens on hover. Back links are muted and go to ink on hover.
- **Focus:** 2 px accent outline, 2 px offset, on every interactive element.

### Selection
Segmented controls (language, theme, dashboard view), current nav and active tabs use **near-black** (`neutral-900` + `fg-inverse`, or a `neutral-900` underline for tabs). Selected answer cards get a near-black border plus a 1 px ring and a Sunken fill.

### Cards
White, 1 px hairline, 12 px radius, 24 px padding, shadow on hover only. Icon tiles inside cards are neutral (Sunken circle, ink icon).

### ChatMessage
- **Student:** right-aligned near-black bubble with `fg-inverse` text, 16 px radius, a tight top-right corner.
- **Tutor:** a near-black sparkles avatar and a white bubble with a hairline border. The header shows the tutor name and the teal **IA** tag. A **Fuentes** footer holds the accent SourceCitation chips.
- **Failed:** a white bubble with a 2 px danger border, a plain explanation and Retry.

### NoSourceNotice
When the material doesn't cover a question, the tutor says so in a teal-wash bubble with no citations. Same pattern everywhere it occurs.

### AIDisclosure
A first-use dialog, plus a persistent Sunken strip under every student header ("Tutor IA · your teacher may review your conversations"). It's quiet but always there.

### States
Every data view has populated, empty, loading and error states. Empty states are a dashed panel with one clear action. Toasts are a success wash with the overlay shadow.

## Copy

Short, clear and warm, never childish. Use verbs on buttons. Errors say what happened and what to do, without blame ("We couldn't load your courses. Try again in a moment."). Empty states invite ("Upload your first document"). Exclamation marks only in success and celebration moments. No emojis or slang. Spanish (tú for students) and English say the same thing.

## Do's and Don'ts

### Do:
- **Do** take every colour from `theme.css` tokens and prefer the role aliases.
- **Do** keep the accent for primary actions, citations and the class code.
- **Do** keep layout spacing on even steps (8 px scale).
- **Do** check every pairing in light and dark.
- **Do** name components identically in the prototype (`data-component`) and in React.

### Don't:
- **Don't** use gradients, glows, decorative illustration or extra accent colours.
- **Don't** put a shadow on a resting card.
- **Don't** use the accent for selected/current states. Use ink.
- **Don't** write raw colours, arbitrary `[..]` utilities or raw pixel spacing outside `theme.css`.
- **Don't** style a "not covered" reply like a normal answer or show citations on it.
- **Don't** convey state by colour alone.
- **Don't** redraw or recolour the DocentAI logo, or drop the IMFAHE acknowledgement.
