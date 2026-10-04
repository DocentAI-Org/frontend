---
name: DocentAI
description: Teacher-guided AI tutor whose every answer shows its source.
colors:
  logo-indigo: "oklch(0.515 0.215 279)"
  logo-indigo-deep: "oklch(0.455 0.2 280)"
  logo-indigo-ink: "oklch(0.395 0.165 281)"
  logo-indigo-wash: "oklch(0.972 0.012 277)"
  logo-indigo-edge: "oklch(0.89 0.05 277)"
  tutor-teal-wash: "oklch(0.984 0.019 200)"
  tutor-teal-tint: "oklch(0.956 0.045 203)"
  tutor-teal-edge: "oklch(0.917 0.08 205)"
  tutor-teal-ink: "oklch(0.4 0.075 224)"
  hint-amber-wash: "oklch(0.987 0.022 95)"
  hint-amber-tint: "oklch(0.962 0.059 95)"
  hint-amber-edge: "oklch(0.879 0.169 91)"
  hint-amber-ink: "oklch(0.41 0.105 46)"
  success-green: "oklch(0.52 0.12 163)"
  success-green-wash: "oklch(0.979 0.021 166)"
  success-green-ink: "oklch(0.4 0.088 166)"
  danger-red: "oklch(0.53 0.2 27)"
  danger-red-ink: "oklch(0.47 0.18 27)"
  ink: "oklch(0.21 0.024 277)"
  ink-muted: "oklch(0.445 0.024 277)"
  canvas: "oklch(0.983 0.004 277)"
  paper: "oklch(0.996 0.002 277)"
  sunken: "oklch(0.963 0.007 277)"
  hairline: "oklch(0.918 0.01 277)"
  hairline-strong: "oklch(0.635 0.02 277)"
  scrim: "oklch(0.16 0.02 277)"
typography:
  headline:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "2.4rem"
    letterSpacing: "-0.024em"
  headline-compact:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.9rem"
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-small:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label:
    fontFamily: "Figtree, Figtree Fallback, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.025em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  sm: "0.3125rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  full: "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "10": "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.logo-indigo}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.logo-indigo-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  button-ghost:
    textColor: "{colors.logo-indigo-deep}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 1rem"
    height: "2.75rem"
  button-ghost-hover:
    backgroundColor: "{colors.logo-indigo-wash}"
  text-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 0.75rem"
    height: "2.75rem"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  source-citation:
    backgroundColor: "{colors.logo-indigo-wash}"
    textColor: "{colors.logo-indigo-ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "0 0.75rem"
    height: "2.75rem"
  chat-bubble-student:
    backgroundColor: "{colors.logo-indigo}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "0.75rem 1rem"
  chat-bubble-tutor:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  no-source-notice:
    backgroundColor: "{colors.tutor-teal-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "1rem"
  ai-tag:
    backgroundColor: "{colors.tutor-teal-tint}"
    textColor: "{colors.tutor-teal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
  hint-tag:
    backgroundColor: "{colors.hint-amber-tint}"
    textColor: "{colors.hint-amber-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
  nav-link:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-small}"
    rounded: "{rounded.lg}"
    padding: "0 0.75rem"
    height: "2.5rem"
  nav-link-current:
    backgroundColor: "{colors.logo-indigo-deep}"
    textColor: "{colors.canvas}"
---

# Design System: DocentAI

> **Source of truth.** `public/prototype/assets/theme.css` holds every token as `light-dark(light, dark)` in OKLCH and is imported unchanged by the React app (`src/app/globals.css`). The frontmatter above lists the **light-scheme** values under descriptive names. Code uses the Tailwind token names (`primary-600`, `info-50`, `fg-muted`, …), and the sidecar maps each descriptive name back to its token. When the two disagree, `theme.css` wins.

## Overview

**Creative North Star: "The Glass Classroom"**

Nothing in DocentAI happens behind the student's back or the teacher's. The interface works like a classroom with glass walls: the AI is always labelled as AI, the student can always see that their teacher may read the conversation, every answer shows the passage it came from, and every flag a teacher sees shows the data behind it. The visual system serves that transparency, not decoration. Surfaces stay quiet and near-white with a faint indigo tint, so colour is free to *mean* something. Indigo is the product and the source, teal is the AI speaking, amber is pedagogy at work (hints, guided mode, low allowance), and green and red report outcomes.

The feel is **calm and precise**. Surfaces are flat, crisp hairlines carry structure, and soft shadows appear only where something is raised or interactive. Density is moderate. Teacher screens are scannable lists and cards on a 1440 px desktop, and student screens are a single readable column that works at 390 px with 44 px touch targets. The type is a single humanist sans (Figtree) with a short, practical scale. Hierarchy comes from weight and spacing, not size jumps.

The light and dark schemes are equal citizens. Every colour token carries both values, and the dark ramps mirror the light ones, so the same pairings keep their contrast in both. The header goes translucent, with blur and saturation, over scrolling content, and falls back to solid when the user asks for reduced transparency.

**Key Characteristics:**
- Colour is semantic, never decorative. Each hue family has one job.
- The tutor's voice is visibly distinct: a teal avatar, an "IA" tag, and a teal surface when the material does not cover the question.
- Citations are first-class objects: indigo pills that open the exact passage.
- Flat, hairline-structured surfaces with tinted, low-contrast shadows.
- One sans family, a compact type scale and an uppercase micro-label for section captions.
- WCAG 2.2 AA in both schemes: 3:1 control borders, a visible 2 px focus ring and no meaning carried by colour alone.

## Colors

The palette is a cool, indigo-tinted neutral field with five semantic hue families (primary, info, warning, success and danger), each a 10-step OKLCH ramp with mirrored dark values.

### Primary
- **Logo Indigo** (`primary-600`): the brand hue, sampled between the logo's sky blue and violet. Used for primary buttons, the student's own chat bubbles, the focus ring, form accent and caret, and the left rule of a cited passage.
- **Logo Indigo Deep** (`primary-700`): primary hover, ghost-button text, the brand wordmark link and the selected state of segmented controls.
- **Logo Indigo Ink** (`primary-800`): text on indigo washes, as in citation chips and the current navigation item.
- **Logo Indigo Wash / Edge** (`primary-50` / `primary-200`): the fill and border of citation chips, current navigation, ghost hover and text selection.

### Secondary
- **Tutor Teal** (`info` ramp: wash `info-50`, tint `info-100`, edge `info-200`, ink `info-800`): the AI's identity. It covers the tutor avatar, the "IA" tag, the persistent AI-disclosure strip in the chat header, and the whole **not covered by the material** notice. Teal sits deliberately apart from indigo, so the AI never borrows the product's or the teacher's authority colour.

### Tertiary
- **Hint Amber** (`warning` ramp: wash `warning-50`, tint `warning-100`, edge `warning-300`, ink `warning-800`): the colour of pedagogy at work and of caution. It marks the guided-mode indicator, the "Pista 1 de N" hint tag, the low message-allowance warning and other non-blocking warnings.

### Status
- **Success Green** (`success-600`, wash `success-50`, ink `success-800`): confirmations, toasts, "listo" processing status and correct quiz answers.
- **Danger Red** (`danger-600`, ink `danger-700`): failed messages (2 px border), errors, invalid fields and destructive confirmations.

### Neutral
- **Ink** (`neutral-900` → `fg`): primary text.
- **Ink Muted** (`neutral-600` → `fg-muted`): secondary text, helper text, inactive navigation and captions.
- **Canvas** (`neutral-50` → `surface`): the page background. It also serves as the inverse text colour on indigo (`fg-inverse`).
- **Paper** (`neutral-0` → `surface-raised`): cards, tutor bubbles, dialogs, inputs and the header.
- **Sunken** (`neutral-100` → `surface-sunken`): hover fills, inline equations, quoted passages and disabled fields.
- **Hairline** (`neutral-200` → `border`): resting borders on cards and dividers.
- **Hairline Strong** (`neutral-450` → `border-strong`): control borders (inputs, secondary buttons and dashed empty states), tuned to 3:1 on both canvas and paper.
- **Scrim** (fixed `oklch(0.16 0.02 277)`): the dialog backdrop at 50–60%, dark in both schemes.

### Named Rules
**The One Job Rule.** Each hue family means one thing: indigo is the product and its sources, teal is the AI, amber is hints and caution, green is done or correct, red is failed or wrong. Never use a hue for decoration, and never let teal stand in for indigo, or the reverse.

**The Meaning-Not-Category Rule.** Colour follows what a value *means*, never which feature it belongs to.
- **Bars:** wrong answers and errors use Danger (`danger-500`), correct answers and progress built from correct work use Success (`success-600`), and plain activity or volume uses neutral ink (`neutral-500`). Every bar keeps its numeric label beside it, so colour is never the only code.
- **Difficulty** (Fácil / Media / Difícil) is ordinal, not a judgement. It is a neutral tag (`border-strong` on Paper) with a three-step ascending meter (filled `neutral-700`, empty `neutral-300`) plus the word. It never borrows green, teal or amber, which would collide with "correct", "the AI" and "hint" on the same card.
- **Search matches** use the selection pairing (`primary-200` + `primary-900`), because a match is something found and selected, not a caution.
- **Non-AI notices** never use teal. A session that expired is a caution (amber). The "hints only" end-of-hints notice is pedagogy (amber, lightbulb icon). Teal stays for notices about the AI itself, such as revoked AI consent.

**The Full-Strength Signal Rule.** Where a hue carries the product's core promise, it runs at its `600`/`700` step as a solid fill with Canvas text, not as a wash: the AI-disclosure strip and tutor avatar (teal), the current navigation item and selected segments (indigo). Washes stay for supporting surfaces (citation chips, notices, tags) so the solid signals remain few and legible.

**The Semantic Alias Rule.** Components reach for the role aliases (`fg`, `fg-muted`, `surface`, `surface-raised`, `surface-sunken`, `border`, `border-strong`, `focus`) wherever a role exists, and use ramp steps only for tinted pairings. Raw colour values exist only in `theme.css`. Tailwind's default palette is erased (`--color-*: initial`).

**The Mirrored Pair Rule.** Pair washes with inks across the ramp (`*-50` fill + `*-800` text, `*-600` fill + `fg-inverse` text). The dark ramps are mirrored, so these pairings hold AA in both schemes without a `dark:` override.

## Typography

**Body Font:** Figtree (self-hosted variable woff2, latin + latin-ext). While it loads, a metric-matched **Figtree Fallback** (local Arial with `size-adjust: 99.28%` and Figtree's ascent and descent) holds the same line breaks and line heights, so the swap does not reflow the page. `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto` follow as the last resort.
**Mono Font:** `ui-monospace, SFMono-Regular, Menlo, Consolas`, used for inline equations and token names.

**Character:** a friendly, geometric-humanist sans that reads clearly at small sizes on phones and stays neutral enough for a teacher's dashboard. A single family carries all hierarchy through weight (400 / 500 / 600 / 700) and slight negative tracking on larger sizes.

### Hierarchy
- **Headline** (700, 2rem / 2.4rem, −0.024em): the page `h1` at ≥640 px. It steps down to 1.5rem on phones (`text-2xl sm:text-3xl`).
- **Headline Compact** (700, 1.5rem / 1.9rem, −0.018em): the mobile `h1`, and section titles on documentation pages.
- **Title** (600, 1.125rem / 1.75rem, −0.005em): `h2` card and section headings, the most common heading on every screen.
- **Prompt** (600, 1.25rem / 1.75rem, −0.01em): the one thing the student must answer or is talking about. It is used for the quiz question and the course title in the chat header (`text-xl`, stepping to `text-2xl` from `sm` in the chat). Use it nowhere else.
- **Body** (400, 1rem / 1.5rem): chat answers, passages and form input text. Tutor bubbles cap at `max-w-prose` (65ch).
- **Body Small** (500–600, 0.875rem / 1.25rem): buttons, navigation, chips, helper and meta text.
- **Label** (600, 0.75rem / 1rem, 0.025em, UPPERCASE): micro-captions such as "Fuentes", "Fragmento citado" and state names. Use them sparingly, as section captions inside a component.

### Named Rules
**The Weight-Not-Size Rule.** The scale tops out at 2rem. Build hierarchy with weight, colour (`fg` vs `fg-muted`) and space, never with display sizes. There is no hero type in the product UI.

**The Tabular Data Rule.** Every element that renders a count, number, percentage, date or time (anything carrying `data-i18n-count`, `data-i18n-number`, or a `number:`, `percent:`, `date:` or `time:` variable) sets `tabular-nums`. Figtree's default figures are proportional (the 1 is a third narrower than the 0), so without it counts, scores and timestamps jitter and fail to line up in lists. Long prose paragraphs (`max-w-*`) keep proportional figures.

**The Balanced Heading Rule.** Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`. Long Spanish compounds and German-length English strings must wrap gracefully at 390 px.

## Layout

- **Spacing:** Tailwind's single 4 px base unit (`--spacing: 0.25rem`). The working rhythm is 8 / 12 / 16 px gaps inside components (`gap-2`, `gap-3`, `gap-4`), 16–20 px card padding (`p-4`, `p-5`) and 40 px between major sections.
- **Page header rhythm:** the `h1` and its context line (the course or document name, `mt-0.5`, never above the heading) form one tight group. The lead follows at `mt-2`, and the whole header is separated from the content by 32 px on phones and 40 px from `sm` (`pb-2 sm:pb-4` on top of the 24 px page gap). Sibling sections inside the content keep the 24 px gap, so the header reads as its own band. One exception: when tabs are the page's own sub-navigation (the course page), they stay on the 24 px gap, close to the header they belong to.
- **Containers:** role shells are centred at `max-w-6xl` (72rem) with 16 px gutters (24 px from `sm`). Reading surfaces such as chat threads and documentation narrow to `max-w-3xl`. Single-task forms and auth screens narrow to `max-w-md`, and tutor text caps at `max-w-prose`.
- **Breakpoints:** Tailwind defaults. `sm` (640px) widens gutters and type, `md` (768px) swaps the mobile menu for inline navigation and shrinks chip touch heights to 36 px, and `lg` (1024px) reveals side tables of contents.
- **Responsive stance:** desktop-first composition (1440 px reference), fully functional at 390 px with no horizontal scroll. On phones, navigation collapses into a 44 px menu button that opens a dropdown sheet. Citation sheets gain a grab handle and dock as bottom sheets.
- **Header:** sticky, 64 px tall, translucent paper (`surface-raised/85`) with `backdrop-blur-lg` and saturation.

### Named Rules
**The 44 px Rule.** Every interactive target is at least 44 px tall on touch layouts (`min-h-11`, `size-11`). Dense desktop contexts may drop to 36–40 px only from `md` up.

## Elevation & Depth

The system is a **hybrid that is flat by default**. Hairline borders carry resting structure, and shadows are small, soft and tinted with the indigo-neutral ink (never pure black), so raised things feel lifted rather than floating. In dark mode, the shadows deepen in opacity rather than changing colour.

### Shadow Vocabulary
- **Rest** (`shadow-sm`: `0 1px 2px 0` ink at 5%): cards, tutor bubbles and primary buttons, a whisper of lift on top of the border.
- **Hover** (`shadow-md`: `0 6px 16px -6px` at 14% + `0 2px 4px -2px` at 6%): interactive cards on hover, paired with a border shift to `border-strong`, and toasts.
- **Overlay** (`shadow-lg`: `0 18px 40px -12px` at 22% + `0 4px 10px -4px` at 8%): dialogs, sheets and menus, always over a scrim or above content.

### Named Rules
**The Border-First Rule.** Resting elevation comes from a hairline border, not a shadow. A shadow without a border is reserved for overlays.

**The State-Only Lift Rule.** A surface moves from `shadow-sm` to `shadow-md` only in response to hover on something clickable. Static containers never animate their shadow.

## Shapes

The corners are gently rounded and step up with the size of the container: badges and inner bits use `sm` (5px) and `md` (8px), controls such as buttons, inputs, icon buttons and nav items use `lg` (10px), cards, toasts and dialogs use `xl` (14px), and large panels, chat bubbles and the AI-disclosure dialog use `2xl` (18px). Pills (`full`) are reserved for chips: citations, AI and hint tags, status badges and avatars.

Chat bubbles signal who is speaking through their silhouette as well as their colour. The corner nearest the speaker tightens to `sm` (`rounded-tl-sm` on the tutor's left, `rounded-tr-sm` on the student's right). Quoted passages use a 4 px Logo Indigo left rule with the right corners rounded. Dashed borders (`border-strong`, dashed) mean *absence*: empty states and the "document no longer available" citation.

### Named Rules
**The Dashed-Means-Missing Rule.** A dashed border signals that something is not there yet or no longer exists. Never use it decoratively.

## Components

### Buttons
Quiet and exact. A button reads as a button because of its fill or its 3:1 border, not because of shadow or gradient.
- **Shape:** gently rounded (10px), 44 px minimum height, 16 px horizontal padding, 600-weight Body Small with an optional leading 16 px icon and an 8 px gap.
- **Primary:** Logo Indigo fill with Canvas text and `shadow-sm`. Hover deepens it to Logo Indigo Deep.
- **Secondary:** Paper fill, Hairline Strong border and Ink text. Hover sinks the fill to Sunken.
- **Ghost:** no fill, with Logo Indigo Deep text. Hover adds a Logo Indigo Wash.
- **Compact:** a 36 px tall variant with 12 px padding, for actions inside messages (Rephrase, Retry).
- **Focus:** a 2 px Logo Indigo outline with a 2 px offset on every interactive element.
- **Press:** scales to 0.98 over 80 ms, with feedback on press, not on release. Disabled buttons drop to a `neutral-200` fill with `neutral-600` text and no shadow.

### Chips
- **SourceCitation:** a pill with a Logo Indigo Wash fill, a `primary-300` border, 600-weight Logo Indigo Ink text and a leading file icon in Logo Indigo, labelled "document · page/section". It is 44 px tall on touch and 36 px from `md`, and hover deepens it to `primary-100` with a `primary-400` border. The **unavailable** variant is dashed, sunken and muted, and disabled.
- **Tags:** small pills (2 px × 8 px padding, Label type, not uppercase). The **IA** tag is Tutor Teal tint on ink, and the **hint** tag is Hint Amber tint on ink.

### Cards / Containers
- **Corner Style:** 14px (`xl`).
- **Background:** Paper on Canvas.
- **Shadow Strategy:** Rest at rest. The interactive variant shifts its border to Hairline Strong and moves to Hover.
- **Border:** a 1 px Hairline.
- **Internal Padding:** 20px (`p-5`), 16px for dense list items.

### Inputs / Fields
- **Style:** a Paper fill with a 1 px Hairline Strong border, 10 px radius, 44 px minimum height, 12 px horizontal padding and 16 px text (never smaller, so iOS does not zoom). A 500-weight Body Small label sits above, and muted helper text sits below with `aria-describedby`.
- **Focus:** the shared 2 px Logo Indigo outline with a 2 px offset.
- **Error / Disabled:** `aria-invalid` turns the border Danger Red, with a specific message below. Disabled fields sink to Sunken with muted text.
- **Toggle, RadioGroup, Select and TextArea** follow the same border, radius and focus language. Each radio is named by its option and described by its explanation.

### Sign-in
At `lg` the sign-in screen splits in two: the heading, lead and an inert, `aria-hidden` specimen of the student chat (the solid teal disclosure strip, tutor bubbles with the **IA** tag, a student bubble and a cited answer) on the left; the form, demo access, IMFAHE acknowledgement and privacy link on the right. Below `lg` the specimen is hidden and the page is the single centred `max-w-md` column. The specimen uses only real components and existing copy; it shows the product's transparency instead of describing it.

### Navigation
- **AppShell:** one per role (student, teacher, admin, public). It has a sticky translucent header at 64 px, with the logo at 32 px and the "DocentAI" wordmark in 700 Ink.
- **Links:** Body Small 500 in Ink Muted on a 40 px tall pill (`lg` radius). Hover fills them with Sunken and Ink. The **current** link carries `data-current` and a solid Logo Indigo Deep fill with 600-weight Canvas text, the same "selected" treatment as segmented controls, so wayfinding reads at a glance.
- **Mobile:** below `md`, a 44 px menu button opens a Paper dropdown (`xl`, Overlay shadow) with 44 px links in Body. The account menu groups the language and theme switchers as segmented controls, whose selected segment takes a Logo Indigo Deep fill.

### ChatMessage (signature)
The heart of the Glass Classroom: who is speaking and where the answer came from are never ambiguous.
- **Student:** a right-aligned Logo Indigo bubble with Canvas text, `2xl` radius and a tight top-right corner, capped at `max-w-md`.
- **Tutor answer:** a solid Tutor Teal sparkles avatar (32 px `info-600` circle with Canvas icon) beside a Paper bubble with a Hairline border, Rest shadow, `2xl` radius and a tight top-left corner. A header line shows the tutor name and the **IA** tag. A divided **Fuentes** footer, captioned in Logo Indigo Ink, holds the SourceCitation chips. Equations sit in Sunken mono blocks.
- **Tutor hint:** the same as a tutor answer, plus a Hint Amber "Pista n de N" tag. It still carries citations.
- **Failed:** the student bubble on Paper with a 2 px Danger Red border, a red alert line, a plain explanation and a compact Retry button.
- **Writing:** three bouncing neutral dots plus "El tutor está escribiendo". The dots only bounce under `motion-safe`.

### NoSourceNotice (signature)
When the material is silent, the tutor says so in a distinct voice. It is a tutor bubble rebuilt in Tutor Teal wash with a teal edge and no shadow. It has an info icon, a bold heading ("El material del curso no cubre esta pregunta"), plain body text, compact secondary actions (Rephrase / Ask the teacher) and **no citations**. The same pattern is reused in guided mode, exercise feedback and explanations.

### CitationSheet
A Paper dialog with `2xl` radius and the Overlay shadow. It docks as a bottom sheet with a grab handle on phones. It shows a document icon tile, the document name and location, a "Fragmento citado" caption, and the passage as a Sunken blockquote with a 4 px Logo Indigo left rule. It ends with a validated-by-teacher check line.

### Status surfaces
- **MessageAllowance:** muted inline text at normal levels. It becomes a Hint Amber wash strip when the allowance runs low, and gives way to LimitReachedBanner when the limit is reached.
- **GuidedModeIndicator:** a Hint Amber wash strip with an `xl` radius, explaining hints before solutions.
- **AIDisclosure:** a first-use modal dialog (`2xl`, cannot be dismissed without acknowledging) and a persistent header strip in solid Tutor Teal (`info-600` fill, Canvas text) that sits under every student header and cannot be mistaken for decoration.
- **EmptyState:** a centred dashed `border-strong` panel on Paper with an icon, a heading, an explanation and one clear action.
- **Skeleton / ErrorState / Toast:** every data view ships populated, empty, loading and error states. Toasts are a Success wash with the Hover shadow, announced politely.

## Do's and Don'ts

### Do:
- **Do** take every colour from `theme.css` tokens and prefer the role aliases (`fg`, `surface-raised`, `border-strong`, `focus`) over ramp steps.
- **Do** keep each hue on its one job: indigo for the product and its sources, teal for the AI, amber for hints and caution, green and red for outcomes.
- **Do** label every tutor message with the teal avatar and the **IA** tag, and give every grounded answer its SourceCitation chips.
- **Do** render "not covered by the material" with the NoSourceNotice pattern, everywhere it occurs.
- **Do** give every interactive element a 44 px touch target and the 2 px Logo Indigo focus ring with a 2 px offset.
- **Do** check every pairing in both light and dark. Use mirrored wash/ink pairs so no `dark:` override is needed.
- **Do** put motion behind `prefers-reduced-motion: no-preference`, at 150 ms with `ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) for state changes.
- **Do** name new components identically in the HTML prototype (`data-component`) and in React.

### Don't:
- **Don't** write hex, rgb or raw oklch values, arbitrary `[..]` utilities or raw pixel spacing outside `theme.css`.
- **Don't** style a "not covered" reply like a normal answer, or show citations on it.
- **Don't** use teal for brand actions or indigo for the AI's voice.
- **Don't** convey state by colour alone. Pair it with an icon, a label or text (for example "Pista 1 de 3" or "Excluido").
- **Don't** add display-size type, gradients, glows or decorative illustration to product screens.
- **Don't** use dashed borders except for missing or empty things.
- **Don't** redraw, recolour or crop the DocentAI logo, and don't drop the IMFAHE acknowledgement from the sign-in screen, the About page or the role footers.
