# Research: DocentAI MVP Prototype (Frontend UI)

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04

Design decisions for the static HTML prototype (constitution 2.1.0). Each entry gives the
decision, the rationale and the alternatives considered. This replaces the Figma-based research:
R-01 to R-06 and R-11 are new, R-12 to R-19 carry over the interaction and validation decisions,
with only their wording changed.

## Tooling and structure

### R-01 · Tailwind v4 browser build from a pinned CDN URL

- **Decision**: Load `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3`, with the version
  pinned to the app's `tailwindcss` 4.3.3 and upgraded together with it. `prototype.js` adds the
  script tag after it has injected the theme (R-02).
- **Rationale**: The constitution allows the browser CDN build for the prototype only, and the user
  asked for no build step. Pinning the version means the prototype generates the same utilities
  as the app.
- **Checked**: the 4.3.3 build processes `<style type="text/tailwindcss">` blocks and rebuilds
  through a `MutationObserver`. It throws "The browser build does not support @import" for any
  `@import` other than Tailwind's own, so the token file cannot be imported directly (R-02).
- **Privacy note**: each page load requests jsDelivr, which sees the visitor's IP address. No
  personal data is entered in the prototype, so this is acceptable for sessions with consenting
  adults. If whoever coordinates ethics for the project objects, the same pinned file can be
  copied to `assets/vendor/` with no other change.
- **Alternatives considered**: The Tailwind CLI: a build step, which was excluded. Play CDN v3:
  different syntax and tokens from the app's v4.

### R-02 · One token file shared by the prototype and the app

- **Decision**: `public/prototype/assets/theme.css` contains only the `@theme { … }` block.
  - **App**: `src/app/globals.css` does `@import "tailwindcss";` and then
    `@import "../../public/prototype/assets/theme.css";`, which PostCSS resolves at build time.
  - **Prototype**: `prototype.js` fetches `theme.css`, inserts its text into a
    `<style type="text/tailwindcss">` element together with `@import "tailwindcss";`, and only
    then adds the Tailwind script. The page body stays hidden (`visibility: hidden` set in a
    small inline style) until the first build, to avoid a flash of unstyled content.
- **Rationale**: Constitution IV requires the *same* tokens in both. A single file makes them
  identical by construction, with no sync script. The file sits in `public/` because the
  prototype is served from there, and the prototype is the visual source of truth.
- **Alternatives considered**: Two copies plus a diff test: they can drift between test runs.
  Tokens in `src/` copied to `public/` at build: a build step. A `<link>` to the CSS: the browser
  build ignores it.
- **Verify during implementation**: a Next.js production build resolves the relative import from
  `src/app/globals.css` into `public/` (it is a plain file path, so it should).

### R-03 · Token naming

- **Decision**: Use Tailwind v4 theme namespaces as they are (`--color-*`, `--spacing`,
  `--radius-*`, `--text-*`, `--font-*`, `--font-weight-*`, `--shadow-*`, `--ease-*`). Clear the
  default palette with `--color-*: initial;`. Semantic color names are short so their utilities
  read well: `--color-fg` → `text-fg`, `--color-surface-raised` → `bg-surface-raised`,
  `--color-focus` → `outline-focus`. Spacing uses v4's single `--spacing: 0.25rem` multiplier.
- **Rationale**: Namespaced variables are what generate utilities in v4, so the token name and the
  utility name stay predictable. Clearing defaults makes off-system colors (`bg-red-500`)
  impossible, not just discouraged.
- **Alternatives considered**: The previous `color/text/default` scheme from the Figma plan gives
  `text-text-default`, which is awkward. Named spacing steps (`--spacing-4`): redundant with v4's
  multiplier.

### R-04 · Fonts and icons

- **Decision** (revised 2026-10-05, redesign): Plus Jakarta Sans (variable, SIL OFL 1.1) self-hosted from
  `assets/fonts/` and declared in `assets/fonts/fonts.css`, with the system font stack as fallback in
  `--font-sans`. Only the Latin file (~27 KB) is preloaded; Latin Extended loads on demand through
  `unicode-range`. There is still no third-party font request. Icons are an inline
  SVG sprite (`assets/img/icons.svg`) of [Lucide](https://lucide.dev) icons (ISC license), used
  with `<svg><use href="…#name"/></svg>`. Decorative icons get `aria-hidden="true"`, and
  meaningful ones get a translated `aria-label`.
- **Rationale**: A brand face gives the prototype its own voice at a small cost, while self-hosting
  keeps the privacy and speed reasons for avoiding third-party font requests. Copying ISC-licensed SVGs
  adds no dependency. Lucide is also available as a React package for the app later, under the
  same icon names.
- **Alternatives considered**: Google Fonts: an external request that has been ruled a GDPR issue
  in the EU. Icon fonts: worse accessibility.

### R-05 · Reusing markup without a build step

- **Decision**: Shells (`AppShell` per role) and the footer with `ImfaheAcknowledgement` are
  partials, injected by `include.js` from `data-include="partials/shell-student.html"`. Every other
  component is copied markup marked `data-component="Name"`, and its canonical version lives on
  `design-system.html`. A unit test lists every `data-component` name used and fails on names that
  are not in the component list (plan.md › Components).
- **Rationale**: Shells appear on every page and must not drift. Most other components differ per
  instance (text, state), and templating them in vanilla JS would go beyond "minimal JS".
- **Alternatives considered**: Custom elements (`<dai-button>`): the names cannot match the React
  names (a hyphen is required). JS render functions for every component: in effect a framework.

### R-06 · States, the state panel and "Simular"

- **Decision**:
  - **Marking states**: each page declares its states in `pages.json`. Markup that belongs to
    particular states carries `data-state="loading"` or a list (`data-state="default empty"`).
    Markup without the attribute is always shown.
  - **Choosing a state**: `state.js` reads `?state=` (default `default`) and hides non-matching
    elements with the `hidden` attribute, so hidden markup is also removed from the accessibility
    tree.
  - **Moving between states**: in-page actions are links (`href="?state=tutor-writing"`) or
    buttons with `data-goto`. Loading states can advance on their own (`data-advance="answer"`
    after 1.2 s, or immediately when the user prefers reduced motion).
  - **State panel**: a fixed, collapsible panel lists the page's states, has an ES/EN switch and
    shows the page's story and requirement IDs. It is labelled "Prototipo – no forma parte del
    producto". `?panel=0` hides it for participants, and that choice is kept for the session in
    `sessionStorage` (no personal data). Error branches for facilitators ("Simular": network
    error, limit reached, upload failure) are the states listed in the manifest entry's
    `simulate` field, shown as links in a separate group of the same panel.
- **Rationale**: This satisfies FR-050 (query parameter *and* visible toggle) with one mechanism.
  Every state has a shareable link for reviews, and facilitators reach error branches without
  scripted wrong paths.
- **Alternatives considered**: One HTML file per state: about 150 files, and shared markup would
  drift. A hash (`#state`): conflicts with in-page anchors and skip links.

### R-07 · Serving at `/prototype`

- **Decision**: Files in `public/prototype/` are served by Next.js. A non-permanent redirect in
  `next.config.ts` sends `/prototype` and `/prototype/` to `/prototype/index.html`. A rewrite would
  serve the index at `/prototype` (no trailing slash), where relative asset paths resolve against
  `/` and break. Links between pages are relative
  and include `.html`.
- **Rationale**: Next.js does not serve `index.html` for a `public/` folder on its own. With
  relative links the prototype also works under any preview URL.
- **Alternatives considered**: A separate static host: more setup, and no Vercel previews per PR.

### R-08 · Responsive approach

- **Decision**: Design priority is desktop-first (constitution). Each page is built once and
  responsive, with Tailwind's standard breakpoints, where unprefixed utilities apply to the
  smallest width and `md:`/`lg:` apply from there up. This is the same convention the React app
  will use. Every page is reviewed at 1440 px and, where marked "M", at 390 px. At 390 px:
  - `CitationSheet` is a bottom sheet;
  - shells switch to a compact header with a menu;
  - primary student actions are at least 44×44 px.
- **Rationale**: CSS authoring direction is an implementation convention, and the design
  priority stays as the constitution says. One page per screen keeps the "one page per screen"
  rule (FR-050) at both widths.
- **Alternatives considered**: Separate mobile pages: these double the files and drift.

### R-09 · Copy files and sample content

- **Decision**:
  - **Files**: `assets/messages/{es,en}.json` hold nested keys (`student.chat.limitReached`) in
    the format the app's i18n library will load. `assets/sample/{es,en}.json` hold `sample.*`
    content, kept apart so it never enters the app's keys.
  - **Plurals**: `key_one` / `key_other`, chosen with `Intl.PluralRules(locale)`.
  - **Interpolation**: `{name}`.
  - **Missing keys**: shown as `⟦key⟧`, so they are visible on the page and also fail the
    key-parity test.
  - **Language**: kept in `localStorage` (`docentai.prototype.lang`), a preference and not
    personal data.
- **Rationale**: Constitution VIII: no hardcoded text, and missing keys fail CI. Switching
  language changes the whole page, including the conversation, so the EN check is real.
- **Alternatives considered**: Spanish text inline as a fallback: two sources of truth.
  Per-page message files: shared keys get duplicated.
- **Note**: the app's i18n library is not chosen yet. If it uses ICU plurals instead of suffixes,
  the `_one`/`_other` pairs convert mechanically.

### R-10 · IMFAHE and DocentAI logos

- **Decision**: Use the official IMFAHE logo file supplied by IMFAHE or by the grant documents,
  stored in `assets/img/` (originals `imfahe.logo.webp` and `docentai-logo.png`; pages use transparent derivatives).
  Both logos always appear next to text that names them, so their images have empty alt text. Until it is received, use a
  clearly labelled placeholder ("Logo IMFAHE – pendiente") so no logo is invented or traced. The
  acknowledgement text stays the draft "Proyecto financiado por la Fundación IMFAHE" until it is
  confirmed (spec Assumptions).
- **Rationale**: FR-005 and SC-007. A third party's brand mark has to come from them.
- **Alternatives considered**: Recreating the logo from a web image: risks an incorrect or
  unlicensed mark.

### R-11 · Verification tooling

- **Decision**:
  - **Vitest + `@testing-library/dom` with jsdom**, for:
    - `i18n.js`, `state.js` and `include.js`, each written test-first;
    - static checks over the files: ES/EN key parity; every `data-i18n` key exists; no `#hex`,
      `rgb(` or `-[` arbitrary values in pages or partials; every `pages.json` entry has a file;
      `data-component` names are known.
  - **Playwright + `@axe-core/playwright`**, for:
    - one sweep over every page × state × {390, 1440} in ES, with WCAG 2.2 A/AA tags (plus EN on
      P1 pages);
    - one test per acceptance scenario, titled with its ID (e.g. `US-01 AS3 citation opens`) and
      grouped in a serial `test.describe` per flow F1–F15, as Constitution V requires.

  The server is `next dev`. Scripts: `npm test` and `npm run test:e2e`.
- **Rationale**: Constitution III (axe blocks merge) and V (Vitest, Testing Library, Playwright).
  axe checks contrast on rendered pages, which replaces the hand-made contrast table, and SC-005's
  "100% pass" becomes a test result. Flow tests make the FR-051 traceability checkable.
- **Alternatives considered**: `node:test`: no new dependency, but the constitution names Vitest.
  Manual checks only: they do not scale to about 150 states × 2 widths.
- **Limits**: axe does not judge focus order or whether copy is understandable. Those stay manual:
  a keyboard pass on every P1 page and the pedagogy review.

## Interaction patterns (carried over)

### R-12 · Citation display (S1)

- **Decision**: A row of `SourceCitation` chips under each grounded answer ("Tema 3 · p. 12").
  Tapping one opens `CitationSheet` (bottom sheet at 390 px, side panel at 1440 px) with the
  document name, the page or section and the quoted passage. Excluded documents show "Documento
  ya no disponible" and cannot be activated.
- **Rationale**: Chips are tappable, labelled in text and keep the student in the chat (AS3).
- **Alternatives considered**: Superscript numbers (too small to tap); always-expanded quotes
  (long on mobile); opening the PDF (leaves the chat).

### R-13 · "No validated source" answer (S2)

- **Decision**: `ChatMessage` variant `tutor-no-source`. It uses `NoSourceNotice`: an info icon,
  info color (not red), the heading "El material del curso no cubre esta pregunta", and actions
  "Reformular la pregunta" and "Preguntar al profesor/a". It has no citations, and the same notice
  is reused in hints, feedback and explanations.
- **Rationale**: SC-003 needs it to be clearly different, without relying on color. Red would
  suggest a malfunction.
- **Alternatives considered**: Plain text (indistinguishable); warning styling (implies an error).

### R-14 · Daily message limit

- **Decision**: `MessageAllowance` always shows the remaining count ("Te quedan 12 mensajes
  hoy"). At 5 or fewer it switches to the low state, with an icon and text. When the limit is
  reached, `LimitReachedBanner` replaces the composer: it shows the reset time ("Podrás escribir
  de nuevo a las 00:00"), keeps the draft and leaves the history readable. Failed messages are
  marked as not counted.
- **Rationale**: Showing the limit early avoids a surprise (AS5), and with no modal the history
  can still be read (AS6).
- **Alternatives considered**: Telling the student only at the limit; a blocking modal; a bar
  only.

### R-15 · AI disclosure

- **Decision**: Three layers:
  - a first-use `AIDisclosure` dialog that the student must acknowledge;
  - a persistent header label ("Tutor IA · tu profesor/a puede revisar esta conversación");
  - an "IA" tag on every tutor message.
- **Rationale**: FR-010, FR-011 and SC-002 recall. A one-time notice alone is easily forgotten.
- **Alternatives considered**: Mentioning it only in the consent text; a banner on every message.

### R-16 · Guided mode hints (S3)

- **Decision**: `tutor-hint` messages labelled "Pista 1", "Pista 2", and so on, with quick
  replies "Otra pista" and "Intentarlo yo". After the last hint, either "Ver solución" (if
  allowed) or a note that the teacher chose hints only. `GuidedModeIndicator` in the header.
- **Rationale**: It stays in the chat, numbered hints show progress, and quick replies keep
  mobile typing short.
- **Alternatives considered**: An accordion of all hints; a separate exercise mode.

### R-17 · Accessibility specifics

- **Decision**:
  - **Focus**: a 2 px `outline-focus` ring with a 2 px offset (`focus-visible:`), ≥3:1 contrast.
  - **Targets**: ≥24×24 px, and ≥44×44 px for primary student mobile actions.
  - **Skip link**: "Saltar al contenido" on every page.
  - **Dialogs**: native `<dialog>` with focus return.
  - **Live updates**: `aria-live="polite"` for the tutor-writing indicator and toasts.
  - **Motion**: transitions only through `motion-safe:`.
  - **Focus order**: the DOM order. Every P1 page gets a keyboard pass, recorded in
    `validation.md`.
- **Rationale**: WCAG 2.2 AA (2.4.7, 2.4.11, 2.5.8, 1.4.3, 1.4.11, 4.1.3) and Constitution III.
  In HTML, focus order is the real DOM order, so no separate annotation is needed.
- **Alternatives considered**: Leaving focus states for the app: they get skipped and cannot be
  validated.

## Validation (carried over)

### R-18 · Participants and recording

- **Decision**: At least 5 students (adults, own phones, using the Vercel preview URL) and at
  least 3 teachers, from the team's network. Sessions are moderated, 45–60 min, think-aloud.
  Recordings are made only with written consent, kept in private institutional storage and
  deleted after the findings are written. Findings use participant codes (P-S01, P-T01).
- **Rationale**: SC-001 minimums, Constitution VII and GDPR.
- **Alternatives considered**: Unmoderated tools (a third-party processor); pilot participants
  (would contaminate the study).

### R-19 · How findings change the spec and the prototype

- **Decision**: Rate each finding critical / major / minor / cosmetic. A finding that changes
  behavior updates `spec.md` first (`/speckit-clarify` or a reviewed edit), then the prototype.
  Visual-only findings update the prototype directly. Every change is logged in
  `validation.md` with the spec revision it relates to.
- **Rationale**: The constitution's workflow puts the spec first for behavior.
- **Alternatives considered**: Editing the prototype during sessions, which leaves the spec
  behind.

### R-20 · Light and dark themes

- **Decision** (2026-10-05): Every color token in `assets/theme.css` holds both values as
  `light-dark(light, dark)`. The page follows the system preference (`color-scheme: light dark`);
  a footer `ThemeSwitcher` (system / light / dark) sets `data-theme` on `<html>`, stored in
  `localStorage` under `docentai.prototype.theme`, and `?theme=` overrides it for session links.
  Dark scales mirror the light ones (50 is the darkest tint, 900 the lightest), so existing class
  pairings keep their contrast without page changes. A `dark:` variant covers the few things tokens
  cannot flip (the black-ink IMFAHE logo is inverted). The axe sweep runs every page × state in both
  schemes.
- **Rationale**: One token definition per color, no duplicated dark block, no class changes in the
  31 pages. The stored value is a display preference, not personal data (Constitution VII).
- **Alternatives considered**: A separate `[data-theme="dark"]` block plus a media-query copy:
  two places to keep in sync. Tailwind `dark:` classes on every element: hundreds of edits and easy
  to miss one.
