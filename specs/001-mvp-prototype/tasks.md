---

description: "Task list for the DocentAI MVP static HTML prototype"
---

# Tasks: DocentAI MVP Prototype (Frontend UI)

**Input**: Design documents from `/specs/001-mvp-prototype/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/prototype-pages.md](contracts/prototype-pages.md),
[quickstart.md](quickstart.md)

**Tests**: Included. Constitution V (Test-First) applies to the prototype runtime and flows (see
plan.md › Constitution Check). Unit tests are written and seen failing before each runtime module.
Each story's Playwright flow tests are written before its pages and fail until they exist. Every acceptance scenario is its own `test()`, titled with its ID (e.g. `US-01 AS3 citation opens`), inside a serial `test.describe` per flow, so each scenario has at least one E2E test (Constitution V). The axe
sweep (Phase 2) covers every page and state as soon as it appears in the manifest.

**Organization**: Tasks are grouped by user story (US1 … US16, as numbered in spec.md) so each
story's pages and flows can be built and reviewed on their own.

**Revision 2026-10-06**: Phases 17–28 (T115–T156) add the spec revision of 2026-10-06 (plan.md ›
Revision, research R-21 to R-28) to the built prototype. Done tasks T001–T104 and T114 are kept
as they were. The open tasks T105–T113 now run **after** Phase 28, and T106, T108, T109 and T113
were updated for the revision.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: The user story the task belongs to

## Conventions used by every page task

Read these once. Every page task assumes them.

- **Paths**: pages live in `public/prototype/`; tests live in `tests/prototype/`.
- **Page skeleton**: copy `public/prototype/partials/_template.html` (T030). It loads
  `assets/js/prototype.js` as a module, has a skip link, `<main id="main">`, and a
  `data-include` for the role shell and the footer.
- **Contract**: page path, state IDs and markup attributes follow
  [contracts/prototype-pages.md](contracts/prototype-pages.md) exactly.
- **Manifest**: every page task adds the page's entry to `public/prototype/assets/pages.json`, with
  the state IDs from contract §4 and the requirement IDs from plan.md › Pages and states.
- **Copy**: every visible string, `alt` and `aria-label` uses `data-i18n` / `data-i18n-attr`. Keys
  go into **both** `assets/messages/es.json` and `assets/messages/en.json`. Sample content uses
  `sample.*` keys from `assets/sample/{es,en}.json`. Write no literal text in HTML.
- **Styling**: use only token utilities from `assets/theme.css`. No hex/rgb and no arbitrary
  `[..]` values. Copy component markup from `design-system.html` and keep its `data-component`
  attribute.
- **Responsive**: build each page once, responsive. Check it at 1440 px, and at 390 px when the
  manifest says `"mobile": true` (no horizontal scroll; primary student actions ≥44×44 px).
- **Done for a page**: `npm test` passes and `npm run test:e2e -- a11y-sweep` passes for the page.

---

## Phase 1: Setup

**Purpose**: Tooling, folders and serving

- [X] T001 Create the folders `public/prototype/{auth,admin,teacher,student,partials}`, `public/prototype/assets/{js,messages,sample,img}` and `tests/prototype/{unit,e2e}` (add a `.gitkeep` to any folder left empty)
- [X] T002 Add the devDependencies `vitest`, `jsdom`, `@testing-library/dom`, `@playwright/test` and `@axe-core/playwright` at their latest versions, pinned exactly (no `^`), and the scripts `"test": "vitest run"` and `"test:e2e": "playwright test"`, in package.json; run `npx playwright install chromium webkit`
- [X] T003 [P] Create vitest.config.ts: `environment: "jsdom"`, `include: ["tests/prototype/unit/**/*.test.js"]`
- [X] T004 [P] Create playwright.config.ts:
  - `testDir: "tests/prototype/e2e"`;
  - `webServer: { command: "npm run dev", url: "http://localhost:3000/prototype/index.html", reuseExistingServer: true }`;
  - projects `desktop` (chromium, viewport 1440×900) and `mobile` (webkit, viewport 390×844, `isMobile: true`, `hasTouch: true`)
- [X] T005 [P] Add an async `redirects()` (non-permanent) to next.config.ts that sends `/prototype` and `/prototype/` to `/prototype/index.html`, keeping `agentRules` and `typedRoutes` (research R-07). A redirect, not a rewrite, so relative asset paths resolve inside `/prototype/`
- [X] T006 [P] Add `test-results/`, `playwright-report/`, `blob-report/` and `playwright/.cache/` to .gitignore
- [X] T007 [P] Create .github/workflows/ci.yml (on `pull_request` and on `push` to `main`; Node 20; `npm ci`) running the constitution's CI gates in order: `npm run lint`, `npm run typecheck`, `npm test`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`, `npm run build`; upload `playwright-report/` as an artifact on failure. Add `"typecheck": "tsc --noEmit"` to package.json (Constitution › Technical Constraints › CI gates; III and VIII rely on it)
- [X] T008 Resolve the daily-limit scope open question in specs/001-mvp-prototype/data-model.md (`DailyMessageAllowance` › Scope) with `/speckit-clarify`, updating specs/001-mvp-prototype/spec.md first. The user has already said "one allowance per student across all courses"; record that. Blocks the final wording of the `student.chat.remaining_one` / `_other` keys (T044)

---

## Phase 2: Foundational (blocking)

**Purpose**: Tokens, runtime, copy infrastructure, shared components, shells and the axe sweep

**⚠️ CRITICAL**: No story page can be built until this phase is complete

### Tokens

- [X] T009 Write public/prototype/assets/theme.css containing only `@theme { … }` (research R-02, R-03):
  - **Reset**: `--color-*: initial;` first.
  - **Palettes**: `--color-{neutral,primary,success,warning,danger,info}-{50,100,200,300,400,500,600,700,800,900}` in `oklch()`; primary is a calm blue, and info is distinct from primary.
  - **Semantic aliases** via `var()`:
    - text: `--color-fg` (neutral-900), `--color-fg-muted` (neutral-600), `--color-fg-inverse` (neutral-50);
    - surfaces: `--color-surface` (neutral-50), `--color-surface-raised` (neutral-0, a `--color-neutral-0: oklch(1 0 0)` step added to the neutral palette), `--color-surface-sunken` (neutral-100);
    - borders: `--color-border` (neutral-200), `--color-border-strong` (neutral-400);
    - focus: `--color-focus` (primary-600).
  - **Other tokens**: `--spacing: 0.25rem`; `--radius-{sm,md,lg,xl}`; `--font-sans` (system stack: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif) and `--font-mono`; `--text-{xs,sm,base,lg,xl,2xl,3xl}` each with `--text-*--line-height`; `--font-weight-{normal,medium,semibold,bold}`; `--shadow-{sm,md,lg}` using palette colors; `--ease-standard`.
  - **Contrast**: fg on surface, fg-muted on surface and surface-raised, the white-on-600 steps of every palette and focus against surface must meet WCAG AA (≥4.5:1 text, ≥3:1 UI).
- [X] T010 Change src/app/globals.css:
  - keep `@import "tailwindcss";` and add `@import "../../public/prototype/assets/theme.css";`;
  - delete the old `@theme` block (`ink`, `paper`, `accent`, `success`);
  - make the `body` rules use `var(--color-surface)`, `var(--color-fg)` and `var(--font-sans)` instead of hex values and the literal font list;
  - in src/app/page.tsx change `bg-paper` to `bg-surface`.

  Run `npm run build` to verify the relative import resolves (research R-02 › Verify)

### Runtime (test-first)

- [X] T011 [P] Write tests/prototype/unit/i18n.test.js (Vitest + Testing Library, jsdom). It must fail before T014. Cases:
  - nested key lookup (`student.chat.title`);
  - a missing key renders `⟦key⟧`;
  - `data-i18n-attr="aria-label:k1;placeholder:k2"` sets both attributes;
  - `data-i18n-count` picks `_one`/`_other` with `Intl.PluralRules` for es and en and fills `{count}`;
  - `data-i18n-vars` fills `{name}`, and a value starting `sample.` is resolved from the sample files;
  - `data-i18n-date="2026-10-04"` formats as "4 oct 2026" (es) and "Oct 4, 2026" (en);
  - `data-i18n-number` formats per locale ("2,4" / "2.4");
  - `?lang=en` beats the stored preference, which beats the default `es`;
  - the language is stored as `localStorage["docentai.prototype.lang"]`, and storage errors are caught;
  - `<html lang>` is updated.
- [X] T012 [P] Write tests/prototype/unit/state.test.js. It must fail before T015. Cases:
  - **State selection**: no `?state` → `default`; an unknown state → `default` plus a warning in the panel; elements whose `data-state` list does not include the current state get the `hidden` attribute, and elements without `data-state` are untouched.
  - **Navigation**: a `data-goto` button switches state and pushes the URL (`history.pushState`, so Back works); `popstate` re-applies the state.
  - **Auto-advance**: `data-advance` moves on after 1200 ms, or at once when `matchMedia("(prefers-reduced-motion: reduce)")` matches.
  - **Links**: relative links get the current `lang` and `panel` appended.
  - **Panel**: `?panel=0` hides the panel and stores `sessionStorage["docentai.prototype.panel"]="0"`; the panel lists the manifest states as links and shows the page's stories and requirement IDs; the panel's own text uses `prototype.*` keys.
- [X] T013 [P] Write tests/prototype/unit/include.test.js. It must fail before T016. Cases (with `fetch` mocked):
  - `data-include` elements are replaced by the fetched markup;
  - several includes on a page all resolve before the returned promise settles;
  - a failed fetch renders a visible error box naming the partial;
  - nested `data-include` inside a partial is not processed (one level only, per research R-05).
- [X] T014 Implement public/prototype/assets/js/i18n.js as an ES module that exports `loadMessages(lang)`, `applyI18n(root, lang)`, `getLang()` and `setLang(lang)`. It fetches `../messages/<lang>.json` and `../sample/<lang>.json` relative to the module URL, and T011 must pass
- [X] T015 Implement public/prototype/assets/js/state.js as an ES module that exports `applyState(root, manifestEntry)`, `renderPanel(manifestEntry)` and `bindNavigation()`. The panel is a fixed, collapsible `<aside>` in the bottom-right corner. It is labelled with `prototype.panel.notProduct` ("Prototipo – no forma parte del producto"), uses only token utilities and has a "Simular" group listing the states in the entry's optional `simulate` field (T012 must pass)
- [X] T016 Implement public/prototype/assets/js/include.js as an ES module that exports `applyIncludes(root)`, and T013 must pass
- [X] T017 Implement public/prototype/assets/js/prototype.js (entry module). It runs these steps in order:
  1. add `<style>body{visibility:hidden}</style>`;
  2. fetch `../theme.css`;
  3. insert `<style type="text/tailwindcss">@import "tailwindcss";` + the theme text;
  4. append `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3">`;
  5. fetch `../pages.json` and find the entry for the current path;
  6. `applyIncludes` → `applyI18n` → `applyState` → `renderPanel` → `bindNavigation`;
  7. reveal the body after the first Tailwind build (wait for the script's `load` event plus one animation frame).

  Also set the document title from the entry's `titleKey`.

### Static checks (test-first; they guard every later task)

- [X] T018 [P] Write tests/prototype/unit/messages.test.js:
  - `assets/messages/es.json` and `en.json` have identical key sets, and so do `assets/sample/es.json` and `en.json`;
  - every `data-i18n` and `data-i18n-attr` key used in `public/prototype/**/*.html` exists in both locales;
  - when `data-i18n-count` is present, `key_one` and `key_other` both exist.
- [X] T019 [P] Write tests/prototype/unit/no-hardcoded-values.test.js. It fails on any of these in `public/prototype/**/*.html` or `assets/js/*.js`: `#[0-9a-fA-F]{3,8}\b` inside `class`/`style`, `rgb(`, `hsl(`, `oklch(`, or a Tailwind arbitrary value matching `-\[[^\]]+\]`. `assets/theme.css` is excluded
- [X] T020 [P] Write tests/prototype/unit/manifest.test.js, which reads `assets/pages.json`:
  - every entry's file exists, and every page under `auth/`, `admin/`, `teacher/`, `student/`, plus `about.html`, has an entry;
  - `states[0] === "default"`, and state IDs are unique kebab-case;
  - every `data-state` value used in a page is one of that page's states;
  - every entry has `stories`, `requirements`, `priority` and `mobile`;
  - every ID in the optional `simulate` array is one of the entry's states.
- [X] T021 [P] (Component list extended on 2026-10-06 by T115.) Write tests/prototype/unit/components.test.js. Every `data-component` value in `public/prototype/**/*.html` must be in the list from plan.md › Components (Button, IconButton, TextField, TextArea, Select, Toggle, RadioGroup, Card, Dialog, Toast, EmptyState, ErrorState, Skeleton, AccessDenied, AppShell, LanguageSwitcher, ImfaheAcknowledgement, ChatMessage, ChatComposer, SourceCitation, CitationSheet, NoSourceNotice, AIDisclosure, MessageAllowance, LimitReachedBanner, GuidedModeIndicator, FileUploadItem, DocumentRow, FragmentItem, ClassCode, FlagControl, QuizQuestion, ProgressByTopic)

### Manifest, copy and assets

- [X] T022 Create public/prototype/assets/pages.json as an empty array `[]`. Story tasks add their entries
- [X] T023 [P] Create public/prototype/assets/messages/es.json and en.json with:
  - `common.actions.*`: retry, cancel, back, close, save, continue, copy, copied, confirm, delete, search, send, signOut, menu;
  - `common.states.*`: loading, empty, errorTitle, errorBody (in plain language);
  - `common.errors.*`: network, generic, sessionExpired;
  - `common.a11y.*`: skipToContent, openMenu, closeMenu, language;
  - `common.imfahe.*`: acknowledgement = "Proyecto financiado por la Fundación IMFAHE" / "Project funded by the IMFAHE Foundation", logoAlt, aboutLink;
  - `common.language.*`: es "Español", en "English";
  - `prototype.*`: panel title, notProduct, states, simulate, hide, show, unknownState, stories, requirements.
- [X] T024 [P] Create public/prototype/assets/sample/es.json and en.json with the fictitious content from plan.md › Sample Content, under `sample.course.*`, `sample.documents.*`, `sample.people.*`, `sample.questions.*`, `sample.answers.*`, `sample.exercise.*` and `sample.topics.*`:
  - course "Matemáticas 3º ESO – Álgebra" / "Year 9 Maths – Algebra";
  - the four documents, including the scanned PDF;
  - the people, with `@example.org` emails;
  - the questions "¿Cómo despejo x en 3x + 5 = 20?" and "¿Quién inventó el álgebra?";
  - the exercise "2(x − 3) = 4x + 2" with a sign error in step 2;
  - topics: linear equations, systems of equations, polynomials, factorisation.

  Add a top-level `"_note": "Fictitious sample content. Not i18n keys."`
- [X] T025 [P] Create public/prototype/assets/img/icons.svg, a sprite of `<symbol id="…">` copied from Lucide (ISC license; keep the license text in an XML comment): message-circle, send, book-open, file-text, upload, alert-triangle, info, check, x, chevron-left, chevron-right, menu, globe, lock, user, users, settings, flag, bar-chart-3, lightbulb, help-circle, refresh-cw, copy, search, log-out, graduation-cap, camera, clock, sparkles, eye, eye-off, plus, trash-2. Icons use `stroke="currentColor"`
- [X] T026 [P] Add public/prototype/assets/img/docentai-mark.svg (a simple wordmark using `currentColor`) and public/prototype/assets/img/imfahe-logo.svg:
  - use the official IMFAHE file if the team has it;
  - otherwise use a neutral placeholder box with the text "Logo IMFAHE – pendiente", and record "official IMFAHE logo pending" in specs/001-mvp-prototype/validation.md (research R-10). Do not recreate or trace the IMFAHE logo.

### Shared components (canonical markup on the design-system page)

- [X] T027 Create public/prototype/design-system.html with a page-level table of contents and these sections:
  - token swatches (each swatch shows its token name and its computed value, read from `getComputedStyle` by a small inline module);
  - type scale, spacing scale, radius and shadows;
  - focus ring spec: `focus-visible:outline-2 outline-offset-2 outline-focus`;
  - motion spec: `motion-safe:` transitions ≤200 ms with `--ease-standard`, and no motion under reduced motion;
  - the icon grid.

  It uses `prototype.ds.*` keys.
- [X] T028 Add `Button` (primary, secondary, ghost, danger × sm/md × default, hover, focus, disabled, loading with spinner and `aria-busy`) and `IconButton` (each with an `aria-label` key; minimum 24×24, and a 44×44 mobile-primary size) to public/prototype/design-system.html
- [X] T029 Add `TextField`, `TextArea`, `Select`, `Toggle` (`role="switch"`) and `RadioGroup` (fieldset + legend) to public/prototype/design-system.html, each in the states default, focus, error (`aria-invalid`, plus error text linked by `aria-describedby`), disabled and with helper text
- [X] T030 Add `Card` (default, interactive), `Dialog` (native `<dialog>`, title, body, actions; focus goes to the first action and returns to the opener on close), `Toast` (`role="status"`, `aria-live="polite"`), `EmptyState` (icon, title, body, action), `ErrorState` (plain-language message + retry), `Skeleton` (`aria-hidden`, with a visually hidden `common.states.loading` text) and `AccessDenied` to public/prototype/design-system.html. Also create public/prototype/partials/_template.html, the page skeleton described in Conventions
- [X] T031 [P] Create public/prototype/partials/footer.html:
  - an `ImfaheAcknowledgement` footer variant (logo + `common.imfahe.acknowledgement` + link to `about.html`);
  - a `LanguageSwitcher` (two buttons, `aria-pressed` on the current language, calling `setLang`).
- [X] T032 [P] Create public/prototype/partials/shell-admin.html and public/prototype/partials/shell-teacher.html (`AppShell`). Each has the DocentAI mark, its role's navigation, a user menu with `LanguageSwitcher` and "sign out" (→ `../auth/sign-in.html`), and a compact header with a menu button under `md:`:
  - admin navigation: Usuarios → admin/users.html, Cursos → admin/courses.html;
  - teacher navigation: Mis cursos → teacher/courses.html, Conversaciones, Panel, Preguntas.
- [X] T033 [P] Create public/prototype/partials/shell-student.html (`AppShell` student) with:
  - navigation: Mis cursos, Mi progreso, Perfil;
  - a course switcher slot;
  - the persistent `AIDisclosure` header label ("Tutor IA · tu profesor/a puede revisar esta conversación", FR-010/FR-011);
  - a mobile bottom-friendly layout at 390 px.
- [X] T034 Create public/prototype/index.html (cover). It shows:
  - the project name, version, date and status "Borrador" (Draft);
  - a link to spec.md on the repository;
  - the IMFAHE acknowledgement;
  - a page index built at runtime from pages.json, grouped by role, with one link per state and a ✓ for P1;
  - a "Flujos" list of F1–F15 with a start link each, taken from plan.md › Flows; flows whose pages do not exist yet are shown disabled.

  It uses `prototype.index.*` keys.
- [X] T035 Create specs/001-mvp-prototype/validation.md with these sections:
  - Status;
  - Open items (IMFAHE logo, IMFAHE wording);
  - ES/EN review log;
  - Keyboard pass log (page, date, result);
  - Session plan;
  - Findings table (participant code, page + state link, severity, spec IDs, decision);
  - Decision log;
  - the SC-001–SC-007 results table from quickstart.md B8.

### Verification harness

- [X] T036 [P] Write tests/prototype/e2e/helpers.js. It exports:
  - `gotoState(page, path, state, { lang = "es", panel = 0 })`, which waits for the body to be visible;
  - `scenario(id, title, fn)`, which declares `test(`${id} ${title}`, fn)` (e.g. `US-01 AS3 citation opens`), so every acceptance scenario is its own test;
  - `readManifest()`.
- [X] T037 Write tests/prototype/e2e/a11y-sweep.spec.js. For every entry in pages.json, every state and each project (skipping `mobile` when the entry has `"mobile": false`), it opens the state and runs `AxeBuilder` with tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`. It expects zero violations, and the failure message lists rule, target and page+state. It repeats with `lang=en` for P1 entries, and also sweeps index.html and design-system.html

**Checkpoint**: `npm test` and `npm run test:e2e` pass with an empty manifest. design-system.html shows every shared component. Story pages can now be built in parallel.

---

## Phase 3: User Story 1 — Student asks the tutor and sees sources (Priority: P1) 🎯 MVP

**Goal**: Consent and AI disclosure, the course chat with citations, the "not covered" reply, the daily limit and failed messages (S1, S2)

**Independent Test**: Open `student/chat.html?state=first-use`, acknowledge the disclosure, ask, read a cited answer, open and close a citation, get the no-source reply, then reach the limit (flows F2 from consent, F3, F4 chat part)

### Tests for User Story 1 ⚠️ (write first, must fail)

- [X] T038 [P] [US1] Write tests/prototype/e2e/flow-f02.spec.js (US1 part, starting at `student/consent.html`) with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-07 AS4` consent must be accepted before continuing;
  - `US-01 AS1` the first-use disclosure dialog blocks sending until it is acknowledged, and states AI, material-only and teacher review;
  - `US-01 AS2` sending shows "tutor writing" (`aria-live`), then an answer with ≥1 citation chip "Tema 3 · p. 12";
  - `US-01 AS3` the chip opens the citation sheet (bottom sheet in `mobile`, side panel in `desktop`) with document, page and passage; Close returns focus to the chip;
  - `US-01 AS7` the failed-message state shows the error text, "Reintentar" and "no cuenta para tu límite".
- [X] T039 [P] [US1] Write tests/prototype/e2e/flow-f03.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-01 AS4`: the no-source reply has the heading "El material del curso no cubre esta pregunta", an info icon with an accessible name, no citation chips, and the actions "Reformular la pregunta" and "Preguntar al profesor/a";
  - its `data-component` is `ChatMessage` with variant `tutor-no-source`;
  - "Reformular la pregunta" returns focus to the composer.
- [X] T040 [P] [US1] Write tests/prototype/e2e/flow-f04.spec.js (chat part) with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-01 AS5` the default state shows "Te quedan 12 mensajes hoy"; low-allowance shows "Te quedan 3 mensajes hoy" with an icon and text, not color alone;
  - `US-01 AS6` limit-reached replaces the composer with `LimitReachedBanner` ("Podrás escribir de nuevo a las 00:00"), the draft text is still visible, and earlier messages are still visible and focusable.

### Components for User Story 1

- [X] T041 [US1] Add these to public/prototype/design-system.html (research R-12 to R-15):
  - `SourceCitation`: chip "Tema 3 · p. 12", at least 44 px tall on mobile; an unavailable variant "Documento ya no disponible" with `aria-disabled`.
  - `CitationSheet`: a `<dialog>` that is a bottom sheet below `md:` and a right side panel from `lg:`.
  - `NoSourceNotice`: info icon and info palette, not danger.
  - `AIDisclosure`: the first-use dialog with a required acknowledgement checkbox and continue button.
  - `MessageAllowance`: normal, low (≤5) and reached.
  - `LimitReachedBanner`: chat and exercise variants.
  - `ChatMessage`: student, tutor-answer with an "IA" tag and citation row, tutor-hint, tutor-no-source and failed.
  - `ChatComposer`: default, sending and disabled-by-limit.

### Pages for User Story 1

- [X] T042 [P] [US1] Build public/prototype/student/consent.html (#5) with states `default`, `ai-disclosure`, `error` and `revoked`:
  - **default**: plain-language consent covering the purpose, that the tutor is an AI, that it answers only from the course material, teacher review of conversations, data use, and the right to revoke; an explicit checkbox; "Aceptar y continuar" → `courses.html`.
  - **ai-disclosure**: the AI-transparency step.
  - **error**: saving the consent failed, with a retry.
  - **revoked**: what revocation means and how to consent again.

  Add its manifest entry and `student.consent.*` keys
- [X] T043 [US1] Build public/prototype/student/chat.html (#8 and #9) with the student shell and the states from contract §4:
  - **default**: a conversation with one cited answer and `MessageAllowance` at 12.
  - **first-use**: an empty chat with the `AIDisclosure` dialog open.
  - **tutor-writing**: the "Escribiendo…" indicator in `aria-live="polite"`, with `data-advance="answer"`.
  - **answer**: the answer to `sample.questions.covered` with chips.
  - **citation**: `CitationSheet` open with "Tema 3 – Ecuaciones de primer grado.pdf", "p. 12" and the passage.
  - **citation-unavailable**: the chip shows "Documento ya no disponible".
  - **no-source**: `NoSourceNotice` reply to `sample.questions.notCovered`.
  - **low-allowance**: 3 left.
  - **limit-reached**: banner replaces the composer, the draft is kept, history is readable.
  - **failed**: the last student message is marked failed, with "Reintentar" and "no cuenta para tu límite".
  - **loading**: the conversation history is loading (`Skeleton` messages); the composer is disabled.
  - **load-error**: the history could not be loaded (`ErrorState` with "Reintentar").

  The `answer` state includes one long tutor answer with math notation (e.g. `2(x − 3) = 2x − 6`, `x²` with `<sup>`) that stays readable with no horizontal scroll at 390 px (spec Edge Cases). Set `"simulate": ["failed", "limit-reached", "load-error"]` in the manifest entry.

  The composer's send button links to `?state=tutor-writing`, and the chips link to `?state=citation`. Add its manifest entry
- [X] T044 [US1] Add the `student.chat.*` keys (ES/EN) to public/prototype/assets/messages/es.json and en.json: header label, allowance as `remaining_one` / `remaining_other` (wording per T008), low warning, `limitReached`, reset time, writing indicator, failed and retry, "not counted", the no-source heading and actions, citation sheet labels, the disclosure dialog text and acknowledgement. Also add the sample conversation lines to `assets/sample/{es,en}.json`
- [X] T045 [US1] Make flows F2 (consent → chat part), F3 and F4 (chat part) pass: wire the links between consent.html and chat.html states, then run `npm run test:e2e -- flow-f02 flow-f03 flow-f04 a11y-sweep`
- [X] T046 [US1] Review consent.html and chat.html in ES and EN at 1440 px and 390 px, and do a keyboard-only pass (Tab order, visible focus, dialog focus trap and return). Log the results and any breakage in specs/001-mvp-prototype/validation.md, and fix breakages before moving on

**Checkpoint**: The MVP student experience is clickable and can be shown on its own.

---

## Phase 4: User Story 2 — Teacher uploads and curates material (Priority: P1)

**Goal**: Upload, per-file processing, fragment review, include/exclude (T2)

**Independent Test**: Open `teacher/material.html?state=empty`, upload, watch the progress, see the scanned-PDF error, open fragment review, exclude and include a document, and see the all-excluded warning (flow F1)

### Tests for User Story 2 ⚠️

- [X] T047 [P] [US2] Write tests/prototype/e2e/flow-f01.spec.js (starting at `teacher/material.html?state=empty`; the tests from My courses are added in T099) with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-02 AS1` the empty state lists "PDF, DOCX, Markdown" and "20 MB";
  - `US-02 AS2` uploading shows per-file "Subiendo 45 %", then "Procesando", then "Listo";
  - `US-02 AS3` the scanned PDF shows "No se ha encontrado texto legible" with "Eliminar" and "Reintentar";
  - `US-02 AS4` the fragment review lists ordered fragments with "p. 12" / "§ 3.2" and a search;
  - `US-02 AS5` the "Incluir en la base de conocimiento" toggle switches the status to "Excluido";
  - `US-02 AS6` all-excluded shows the warning that the tutor has no material.

### Implementation for User Story 2

- [X] T048 [US2] Add these to public/prototype/design-system.html:
  - `FileUploadItem`: uploading with % in a `<progress>` with a label, processing, ready, and error with a reason;
  - `DocumentRow`: included, excluded, processing and error, with the include `Toggle`;
  - `FragmentItem`: default and search-match, with the match highlighted by `<mark>`.
- [X] T049 [US2] Build public/prototype/teacher/material.html (#17) with the teacher shell and the states `default`, `empty`, `loading`, `uploading`, `processing`, `file-error`, `all-excluded` and `duplicate`:
  - **empty**: accepted types "PDF, DOCX, MD", max size "20 MB" (illustrative), and an upload drop zone that is also a button.
  - **file-error**: the reasons unsupported format / too large / no readable text.
  - **duplicate**: a `Dialog` offering "Reemplazar" or "Conservar ambos" ("Uploading a file with an existing name prompts replace or keep both").
  - **all-excluded**: the warning banner.

  Use the documents from `sample.documents.*`. Add its manifest entry
- [X] T050 [P] [US2] Build public/prototype/teacher/fragments.html (#18) with the states `default`, `loading`, `error`, `search-results` and `search-empty`. Show the ordered fragments of "Tema 3" with location labels "p. 12" and "§ 3.2 Despejar la incógnita", and a search field. Add its manifest entry
- [X] T051 [US2] Add the `teacher.material.*` and `teacher.fragments.*` keys (ES/EN), wire flow F1 between material.html and fragments.html, and run `npm run test:e2e -- flow-f01 a11y-sweep`
- [X] T052 [US2] Do the ES/EN review and keyboard pass for material.html and fragments.html, and log them in specs/001-mvp-prototype/validation.md

---

## Phase 5: User Story 3 — Teacher configures the tutor (Priority: P1)

**Goal**: Level, tone and solution policy, with a preview (T3)

**Independent Test**: Change to "Solo pistas", see the preview, try to leave with unsaved changes, save, recover from a save failure (flow F7)

- [X] T053 [P] [US3] Write tests/prototype/e2e/flow-f07.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-03 AS1` the defaults are level "Intermedio", tone "Cercano" and "Primero pistas, luego solución", each with a one-line explanation;
  - `US-03 AS2` selecting "Solo pistas (modo guiado)" and saving shows a confirmation and a preview exchange with step hints;
  - `US-03 AS3` leaving with unsaved changes opens the warning dialog;
  - `US-03 AS4` save-failed keeps the changes visible and offers "Reintentar".
- [X] T054 [US3] Build public/prototype/teacher/tutor-settings.html (#19) with the states `default`, `loading`, `load-error`, `hints-only`, `preview`, `unsaved`, `saved` and `save-failed` (`load-error`: the settings could not be loaded; `save-failed`: saving failed):
  - three `RadioGroup`s for level, tone and solution policy (direct solutions allowed / hints first, then solution / hints only), each option with a one-line explanation;
  - a preview `Card` with an example exchange;
  - the unsaved-changes `Dialog`, triggered by the nav links when in `hints-only`;
  - a saved `Toast` showing "Guardado · 6 oct 2026, 10:42" through `data-i18n-date`.

  Add its manifest entry and the `teacher.tutorSettings.*` keys
- [X] T055 [US3] Wire flow F7, run `npm run test:e2e -- flow-f07 a11y-sweep`, then do the ES/EN review and keyboard pass and log them in specs/001-mvp-prototype/validation.md

---

## Phase 6: User Story 4 — Teacher creates a course and students join (Priority: P1)

**Goal**: Course creation, class code and link, student join (T1)

**Independent Test**: Create a course, copy the code, then as a student enter an invalid code, then "ALG-7K3P", confirm, and see the course in the list (flow F6)

- [X] T056 [P] [US4] Write tests/prototype/e2e/flow-f06.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-04 AS1` teacher courses empty state;
  - `US-04 AS2` creating a course shows the code "ALG-7K3P" and the link with copy actions and "Copiado";
  - `US-04 AS3` the students tab, or its empty state, points to the code;
  - `US-04 AS4` regenerate-confirm and code-disabled;
  - `US-04 AS5` a student enters a valid code, sees the course and teacher, confirms, and the course appears in `student/courses.html`;
  - `US-04 AS6` invalid, expired and disabled codes each show a specific message suggesting to ask the teacher.
- [X] T057 [US4] Add `ClassCode` (active, copied, disabled) to public/prototype/design-system.html
- [X] T058 [P] [US4] Build public/prototype/teacher/courses.html (#14) with the states `default`, `empty`, `loading` and `error`. Course cards show the name, student count and created date (`data-i18n-date`). Add its manifest entry
- [X] T059 [P] [US4] Build public/prototype/teacher/course-new.html (#15) with the states `default`, `validation-error` and `loading`. Fields: name (validation: "name is required (1–80 characters)", with the error shown under the field) and an optional description. Add its manifest entry
- [X] T060 [US4] Build public/prototype/teacher/course.html (#16) with the states `default`, `no-students`, `loading`, `error`, `code-copied`, `code-disabled` and `regenerate-confirm`:
  - `ClassCode` "ALG-7K3P" and the invitation link `…/unirse/ALG-7K3P`;
  - the students list shows display names and pseudonyms ("Estudiante-07");
  - tabs: Material → material.html, Configuración del tutor → tutor-settings.html, Estudiantes, Conversaciones.

  Add its manifest entry
- [X] T061 [P] [US4] Build public/prototype/student/courses.html (#6) with the states `default`, `empty` ("Unirse a un curso"), `loading`, `error` and `several-courses` (course switcher; allowance per T008). Add its manifest entry
- [X] T062 [P] [US4] Build public/prototype/student/join.html (#7) with the states `default`, `loading`, `invalid-code`, `expired-code`, `disabled-code` and `confirm` (shows the course name and "Prof. Elena Ruiz Navarro"). Add its manifest entry
- [X] T063 [US4] Add the `teacher.courses.*`, `teacher.course.*`, `teacher.courseNew.*`, `student.courses.*` and `student.join.*` keys (ES/EN), wire flow F6 and run `npm run test:e2e -- flow-f06 a11y-sweep`
- [X] T064 [US4] Do the ES/EN review and keyboard pass for the five US4 pages and log them in specs/001-mvp-prototype/validation.md

---

## Phase 7: User Story 5 — Student guided (Socratic) mode (Priority: P1)

**Goal**: Numbered hints, "Otra pista", solution only if allowed (S3)

**Independent Test**: In the guided chat get hint 1, ask for another, reach the end in both policy variants (flow F8)

- [X] T065 [P] [US5] Write tests/prototype/e2e/flow-f08.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-05 AS1` the "Modo guiado" indicator explains hints before solutions;
  - `US-05 AS2` the reply is labelled "Pista 1" and offers "Otra pista" and "Intentarlo yo";
  - `US-05 AS3` hints-done-solution shows "Ver solución", and hints-done-hints-only explains that the teacher chose hints only;
  - `US-05 AS4` hints carry citation chips.
- [X] T066 [US5] Add `GuidedModeIndicator` (on, with a hint counter) to public/prototype/design-system.html
- [X] T067 [US5] Build public/prototype/student/chat-guided.html (#10) with the states `default`, `loading`, `load-error`, `hint-1`, `hint-2`, `hints-done-solution`, `hints-done-hints-only`, `solution`, `no-source` and `limit-reached`. It reuses the chat.html markup and the `tutor-hint` `ChatMessage` variant for "2x − 4 = 10". Add its manifest entry and the `student.guided.*` keys
- [X] T068 [US5] Wire flow F8, run `npm run test:e2e -- flow-f08 a11y-sweep`, then do the ES/EN review and keyboard pass and log them in specs/001-mvp-prototype/validation.md

---

## Phase 8: User Story 6 — Student submits a worked exercise (Priority: P1)

**Goal**: Submit work and get feedback on the specific mistake (S4)

**Independent Test**: Submit "2(x − 3) = 4x + 2" and read feedback pointing to "Paso 2" (flow F9); at the limit, submission is blocked (F4 exercise branch)

- [X] T069 [P] [US6] Write tests/prototype/e2e/flow-f09.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-06 AS1` review before sending;
  - `US-06 AS2` the pending state says the student can leave and come back;
  - `US-06 AS3` the feedback gives the verdict, "Paso 2", an explanation with citations, and no full solution;
  - `US-06 AS4` no-source uses `NoSourceNotice`;
  - `US-06 AS5` empty-submission and unreadable-photo show specific fix-it messages.

  Also add a test `US-06 AS6` to tests/prototype/e2e/flow-f04.spec.js: on `student/exercise.html?state=limit-reached` the same `LimitReachedBanner` (exercise variant) blocks submission
- [X] T070 [US6] Build public/prototype/student/exercise.html (#11) with the states `default`, `review`, `loading`, `empty-submission`, `unreadable-photo` and `limit-reached`:
  - problem statement and worked-steps `TextArea`s, and an optional photo upload (JPG/PNG);
  - validation: "problem and answer required unless a readable photo is attached".

  Add its manifest entry
- [X] T071 [US6] Build public/prototype/student/exercise-feedback.html (#12) with the states `default`, `pending` (`data-advance="default"`), `no-source` and `error`. Default shows the verdict "Incorrecta", the mistake location "Paso 2", the explanation of the sign error with citation chips, and no full solution. Add its manifest entry. The `repeated-mistake` state is added in US12
- [X] T072 [US6] Add the `student.exercise.*` keys (ES/EN), wire flow F9 and the F4 exercise branch, and run `npm run test:e2e -- flow-f09 flow-f04 a11y-sweep`
- [X] T073 [US6] Do the ES/EN review and keyboard pass for exercise.html and exercise-feedback.html and log them in specs/001-mvp-prototype/validation.md

---

## Phase 9: User Story 7 — Sign-in, role separation and minimal admin (Priority: P1)

**Goal**: Sign-in, a home per role, access denied, consent on first use, admin user management (P1)

**Independent Test**: Admin, teacher and student sign-ins reach three different homes; another role's page shows access denied; admin creates a teacher (flows F5, F10)

- [X] T074 [P] [US7] Write tests/prototype/e2e/flow-f05.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-07 AS1` sign-in shows the DocentAI identity, form, IMFAHE logo and acknowledgement, and privacy link;
  - `US-07 AS2` the admin link lands on `admin/users.html`, and the teacher link lands on `teacher/courses.html`;
  - `US-07 AS6` users empty → create teacher → created with "Invitación pendiente";
  - `US-07 AS5` the access-denied page explains and links home.
- [X] T075 [P] [US7] Write tests/prototype/e2e/flow-f10.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-07 AS3` invalid-credentials shows "Correo o contraseña incorrectos" with a recovery link;
  - recovery → sent;
  - `US-07 AS7` session-expired asks to sign in again and returns to the page in `?next=`.
- [X] T076 [P] [US7] Build public/prototype/auth/sign-in.html (#1) with the states `default`, `loading`, `invalid-credentials` and `session-expired`. It has no role shell, and includes `ImfaheAcknowledgement` (sign-in variant) and `LanguageSwitcher`. For the prototype, three demo buttons stand in for signing in as each role:
  - "Entrar como estudiante" → `../student/consent.html`;
  - "Entrar como profesora" → `../teacher/courses.html`;
  - "Entrar como admin" → `../admin/users.html`.

  In `session-expired`, signing in returns to the page in `?next=`. Add its manifest entry
- [X] T077 [P] [US7] Build public/prototype/auth/password-recovery.html (#2) with the states `default`, `loading`, `error` and `sent` (the message does not reveal whether the email exists). Add its manifest entry
- [X] T078 [P] [US7] Build public/prototype/auth/access-denied.html (#3) with the states `default`, `not-found` and `course-removed`, using `AccessDenied` with a link to the role's home. Add its manifest entry
- [X] T079 [P] [US7] Build public/prototype/about.html (#4) with `ImfaheAcknowledgement` (about variant), a short project description and privacy information. Add its manifest entry
- [X] T080 [P] [US7] Build public/prototype/student/profile.html (#13) with the states `default` (consent accepted on "5 oct 2026"), `loading`, `error`, `revoke-confirm` (`Dialog`) and `revoked` (no tutor access, and how to consent again → consent.html). Add its manifest entry
- [X] T081 [P] [US7] Build public/prototype/admin/users.html (#20) with the states `default`, `empty`, `loading` and `error`. It is a table of display name, role, email (`@example.org`) and status (active / pending invitation / disabled), shown as a stacked list at 390 px. Add its manifest entry
- [X] T082 [P] [US7] Build public/prototype/admin/teacher-new.html (#21) with the states `default`, `validation-error`, `loading` and `created` ("Invitación pendiente"). Add its manifest entry
- [X] T083 [P] [US7] Build public/prototype/admin/courses.html (#22) with the states `default`, `empty`, `loading` and `error`, showing course name, teacher, student count and created date. Add its manifest entry
- [X] T084 [US7] Add the `common.auth.*`, `common.errors.*` (access denied, not found, course removed), `about.*`, `admin.users.*`, `admin.teacherNew.*`, `admin.courses.*` and `student.profile.*` keys (ES/EN). Wire flows F5 and F10, and run `npm run test:e2e -- flow-f05 flow-f10 a11y-sweep`
- [X] T085 [US7] Do the ES/EN review and keyboard pass for the eight US7 pages. Check that no page shows another student's data or another teacher's course (Constitution II, FR-041), and log the results in specs/001-mvp-prototype/validation.md

**Checkpoint**: All P1 stories are clickable; flows F1–F10 exist and their tests pass.

---

## Phase 10: User Story 8 — Teacher reviews conversations and flags answers (Priority: P2; P1 since 2026-10-06, see Phase 21)

**Goal**: Conversation review and flagging (T4, T6)

**Independent Test**: Filter conversations, open one, flag a tutor answer (flow F11)

- [X] T086 [P] [US8] Write tests/prototype/e2e/flow-f11.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-08 AS1` the list can be filtered by student, date and topic, and shows message counts and a no-source marker;
  - `US-08 AS2` flag as "Incorrecta" or "Mejorable" with a comment, shown on the message;
  - `US-08 AS3` the flags list links back to the message;
  - `US-08 AS4` the empty state;
  - `US-08 AS5` `student/chat.html` shows the teacher-review label.
- [X] T087 [US8] Add `FlagControl` (none, incorrect, needs improvement) to public/prototype/design-system.html, then build three pages, each with its manifest entry:
  - public/prototype/teacher/conversations.html (#23): states `default`, `empty`, `loading`, `error`, `filtered` and `no-results`;
  - public/prototype/teacher/conversation.html (#24): states `default` (cited answer + no-source message), `loading`, `error`, `flag-dialog` and `flagged`;
  - public/prototype/teacher/flags.html (#25): states `default`, `empty`, `loading` and `error`.
- [X] T088 [US8] Add the `teacher.conversations.*` and `teacher.flags.*` keys (ES/EN), wire flow F11, run `npm run test:e2e -- flow-f11 a11y-sweep`, and log the ES/EN review in specs/001-mvp-prototype/validation.md

---

## Phase 11: User Story 9 — Teacher dashboard (Priority: P2)

**Goal**: Errors by topic and by student; at-risk list with the data behind it (T5)

**Independent Test**: Switch the grouping, open an at-risk student to see why (flow F12)

- [X] T089 [P] [US9] Write tests/prototype/e2e/flow-f12.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-09 AS1` by-topic ↔ by-student with counts and a time range;
  - `US-09 AS2` the at-risk detail shows "Sin actividad en 7 días" and "Tasa de error 60%", an activity series and example errors;
  - `US-09 AS3` not-enough-data.
- [X] T090 [US9] Build public/prototype/teacher/dashboard.html (#26: `default` by topic, `by-student`, `not-enough-data`, `loading`, `error`) and public/prototype/teacher/student-risk.html (#27: `default`, `loading`, `error`). Charts are simple HTML/SVG bars that use text labels and values, so color is never the only signal. Add the manifest entries and the `teacher.dashboard.*` keys, wire flow F12, and run `npm run test:e2e -- flow-f12 a11y-sweep`

---

## Phase 12: User Story 10 — Teacher approves quiz questions (Priority: P2)

**Goal**: Review, edit, approve and reject AI-drafted questions (T7)

**Independent Test**: Edit one pending question, approve one, reject one (flow F13)

- [X] T091 [P] [US10] Write tests/prototype/e2e/flow-f13.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-10 AS1` each question shows text, options and answer, difficulty, topic and citation;
  - `US-10 AS2` approve, edit-and-approve and reject move the question between tabs and update the counters;
  - `US-10 AS3` the empty state offers to request questions for a topic.
- [X] T092 [US10] Add `QuizQuestion` (unanswered, correct, incorrect, teacher-review) to public/prototype/design-system.html, then build public/prototype/teacher/questions.html (#28) with the states `default` (pending), `editing`, `approved`, `rejected`, `empty`, `loading` and `error`. Tabs show counters. Add its manifest entry and the `teacher.questions.*` keys, wire flow F13, and run `npm run test:e2e -- flow-f13 a11y-sweep`

---

## Phase 13: User Story 11 — Student adaptive quizzes (Priority: P2)

**Goal**: Immediate feedback per question and difficulty that adapts (S6)

**Independent Test**: Answer correctly and incorrectly, see feedback, reach the summary (flow F14)

**Depends on**: T092 (`QuizQuestion`)

- [X] T093 [P] [US11] Write tests/prototype/e2e/flow-f14.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-11 AS1` the question count and topic are shown;
  - `US-11 AS2` correct and incorrect feedback with an explanation and citation;
  - `US-11 AS3` difficulty-up "Subimos el nivel";
  - `US-11 AS4` the summary shows score by topic and next steps;
  - `US-11 AS5` the empty state says the teacher has not published questions.
- [X] T094 [US11] Build public/prototype/student/quiz.html (#29: `default`, `correct`, `incorrect`, `difficulty-up`, `empty`, `loading`, `error`) and public/prototype/student/quiz-summary.html (#30: `default`, `loading`, `error`). Add the manifest entries and the `student.quiz.*` keys, wire flow F14, and run `npm run test:e2e -- flow-f14 a11y-sweep`

---

## Phase 14: User Story 12 — Targeted help for repeated mistakes (Priority: P2)

**Goal**: Repeated-mistake notice with an explanation or practice (S5)

**Independent Test**: After feedback, see "Has cometido este error 3 veces" and open the explanation (flow F15, first part)

**Depends on**: T071 (exercise-feedback.html)

- [X] T095 [P] [US12] Write the US12 part of tests/prototype/e2e/flow-f15.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe`:
  - `US-12 AS1` the notice names "Error de signo al quitar paréntesis" and offers "Ver explicación" and "Practicar";
  - `US-12 AS2` the explanation has citations;
  - `US-12 AS3` the dismissed notice is hidden and stays hidden after navigating away and back (dismissal kept in `sessionStorage` for the session).
- [X] T096 [US12] Add the `repeated-mistake` state to public/prototype/student/exercise-feedback.html and to its manifest entry, then build public/prototype/student/practice.html (#31: `default` with citations, `no-source`, `loading`, `error`). Add its manifest entry and the `student.errorPatterns.*` keys, and run `npm run test:e2e -- flow-f15 a11y-sweep`

---

## Phase 15: User Story 13 — Student views progress by topic (Priority: P3; P2 since 2026-10-06, see Phase 26)

**Goal**: Progress per topic from the student's own activity (S7)

**Independent Test**: Open "Mi progreso" and see per-topic progress with its basis in text (flow F15, second part)

- [X] T097 [P] [US13] Add the US13 tests to tests/prototype/e2e/flow-f15.spec.js:
  - `US-13 AS1` each topic shows a text basis such as "6 de 10 ejercicios correctos";
  - `US-13 AS2` the empty state invites the student to start with the tutor or a quiz.

  This edits the same file as T095, so run it after T095 when both are in progress
- [X] T098 [US13] Add `ProgressByTopic` (a bar with a text label) to public/prototype/design-system.html, then build public/prototype/student/progress.html (#32: `default`, `empty`, `loading`, `error`). Add its manifest entry and the `student.progress.*` keys, and run `npm run test:e2e -- flow-f15 a11y-sweep`

---

## Phase 16: Polish, validation and sign-off

**Purpose**: Cross-story flows, coverage audits, usability validation and spec traceability

- [X] T099 Extend tests/prototype/e2e/flow-f02.spec.js to start at `auth/sign-in.html` and add the tests `US-07 AS1` and `US-07 AS2` (student link → consent → courses → chat). Point the "Entendido, continuar" link in public/prototype/student/consent.html to `courses.html` (it goes to `chat.html?state=first-use` until the US4 pages exist). Extend tests/prototype/e2e/flow-f01.spec.js to start at `teacher/courses.html` → course.html → material.html. Wire any missing links and run `npm run test:e2e`
- [X] T100 [P] Coverage audit (superseded on 2026-10-06 by T116 and T153, 33 pages): compare pages.json with the contract §4 state table and plan.md › Pages and states (31 pages, every listed state, `mobile` matches "M"), then fix any gaps in public/prototype/ (SC-005)
- [X] T101 [P] Check that `ImfaheAcknowledgement` is on sign-in.html and about.html, and reachable in ≤1 click/tap from every role's home through the footer partial (SC-007). Add a test for this to tests/prototype/e2e/flow-f05.spec.js
- [X] T102 [P] Check that every chat, guided-chat and exercise page shows the AI label, the teacher-review notice and `MessageAllowance` (FR-010, FR-011, FR-014). Add an assertion over those pages to tests/prototype/e2e/a11y-sweep.spec.js or a new tests/prototype/e2e/student-shell.spec.js
- [X] T103 [P] Check that no sample name matches a team member or participant and that every email uses `example.org`, in public/prototype/assets/sample/es.json and en.json. Record the check in specs/001-mvp-prototype/validation.md
- [X] T104 [P] Do the ES/EN review (1440 px, and 390 px where `mobile`) and the keyboard-only pass (Tab order follows the visual order, visible focus, dialog focus trap and return) for every P2/P3 page (US8–US13), and log the results in specs/001-mvp-prototype/validation.md (FR-004)
- [ ] T105 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` and `npm run build`; all must pass. Then deploy a Vercel preview and confirm that `/prototype` loads on a phone over mobile data in under 2 s
- [ ] T106 **(Team)** Get the pedagogy team's review of the student-facing copy (ES/EN), the guided-mode flow, and the wording of adaptation reasons, difficulty-change reasons and teacher corrections (SC-006 as revised 2026-10-06), and record the sign-off in specs/001-mvp-prototype/validation.md
- [ ] T107 **(Team)** Check whether the Vercel preview has Deployment Protection enabled; if so, create a shareable preview link or protection bypass for the session deployment so participants can open it without a Vercel login. Then prepare the sessions per quickstart.md B1: participant links (`?panel=0`) and facilitator links per flow, consent form, private recording storage, and session sheets (materials outside the repo); then set the cover status in public/prototype/index.html to "En validación"
- [ ] T108 **(Team)** Run ≥5 student sessions (own phone) with tasks S-1 to S-6 and comprehension questions 1–6 (questions 5–6 measure SC-008), per specs/001-mvp-prototype/quickstart.md B3–B5
- [ ] T109 [P] **(Team)** Run ≥3 teacher sessions (desktop) with tasks T-1 to T-6 (T-6 measures SC-008), plus 1 admin run (A-1), per specs/001-mvp-prototype/quickstart.md
- [ ] T110 **(Team)** Write anonymised findings in specs/001-mvp-prototype/validation.md within 24 h of each session (participant codes, page + state link, severity, spec IDs), then delete the recordings and note the deletion date
- [ ] T111 Apply the critical and major findings: behavior changes go into specs/001-mvp-prototype/spec.md first, then public/prototype/; log each decision with its spec revision in specs/001-mvp-prototype/validation.md; keep `npm test` and `npm run test:e2e` green
- [ ] T112 **(Team)** If any critical finding was fixed, re-test the changed P1 flows with ≥2 new participants (quickstart.md B8)
- [ ] T113 Fill in the SC-001 to SC-008 results table in specs/001-mvp-prototype/validation.md. When all pass, set the cover status in public/prototype/index.html to "Validado" with the date and version
- [X] T114 Fill the "Prototype pages" table in specs/001-mvp-prototype/spec.md with links (`/prototype/<page>.html`) per user story (FR-052)

---

## Phase 17: Revision foundation (2026-10-06)

**Purpose**: Shared checks, sample data, components and the two breaking renames that the
revision's story phases build on. Contract and plan already describe 33 pages, so the coverage
test (T116) stays red until Phase 28; every other unit test must stay green.

- [X] T115 [P] Extend `COMPONENTS` in tests/prototype/unit/components.test.js with the new names from plan.md › Components: `TeacherCorrection`, `ValidationStatus`, `AdaptedBadge`, `AdaptationSheet`, `DecisionReason`, `ErrorTypeTag`, `ErrorTypeList`, `MasteryLevel`, `ProgressTimeline`, `TopicList`, `TopicAssignmentRow`. Run `npm test -- components` (passes: none is used yet)
- [X] T116 [P] Change tests/prototype/unit/coverage.test.js from 31 to 33 pages (title and both `toHaveLength`). Run `npm test -- coverage` and confirm it fails only on the pages and states added on 2026-10-06 (contract revision note); it must pass at T153
- [X] T117 [P] Add the 2026-10-06 sample content from plan.md › Sample Content to public/prototype/assets/sample/es.json and en.json: validation (validator and date for "Tema 3", "Apuntes – Sistemas" pending, 3 excluded fragments), the ordered topic list and the unassigned section, the three error types, the learning records of Lucas (not at risk), Estudiante-07 (at risk, the existing at-risk sample, "Error de signo…" ×5) and Mateo (no activity), the two corrections and the adaptation reason. Keep every name fictitious and every email on `example.org`; run `npm test -- sample-data messages`
- [X] T118 Add these shared components to public/prototype/design-system.html, each with its `data-component` and ES/EN keys under `common.*`:
  - `DecisionReason` (R-24): info icon + one sentence; inline variant, and a "¿Por qué?" disclosure variant (`button` with `aria-expanded`, `aria-controls`);
  - `ErrorTypeTag` (R-27): "Tipo de error: … · Tema: …" plus "Guardado en tu progreso" link;
  - `ErrorTypeList` (R-26): error type, count (`_one`/`_other`), link to an example;
  - `MasteryLevel` (R-26): "Empezando", "En progreso", "Dominado" as text plus a three-segment indicator that is `aria-hidden`;
  - `ProgressTimeline` (R-26): an ordered list of dated entries (`data-i18n-date`);
  - `TeacherCorrection` (R-22): student view (teacher icon, "Revisado por tu profesor/a", date, correction text; the corrected answer gets a "Corregida" tag, no strikethrough) and teacher view (adds the flag category and "Editar corrección" / "Quitar corrección").

  Run `npm test` (except coverage) and `npm run test:e2e -- a11y-sweep`
- [X] T119 Breaking rename, in **one commit** (contract revision note, R-28): `git mv public/prototype/teacher/student-risk.html public/prototype/teacher/student.html`; update its entry in public/prototype/assets/pages.json (path, `titleKey`, stories `US-09`, `US-15`, requirements `T5`, `T8`); update every link to it in public/prototype/teacher/dashboard.html and any other page (`grep -rn student-risk public tests`); update tests/prototype/e2e/flow-f12.spec.js; update the US9 row of the "Prototype pages" table in specs/001-mvp-prototype/spec.md to `teacher/student.html`. Leave historical mentions in validation.md as they are. Run `npm run test:e2e -- flow-f12 a11y-sweep`
- [X] T120 Breaking rename, in **one commit**: state `all-excluded` → `no-validated` on public/prototype/teacher/material.html (`data-state` values, any `href="?state=…"` and `data-goto`), its pages.json entry, and tests/prototype/e2e/flow-f01.spec.js. Rename the copy key to `teacher.material.noValidated` (ES/EN) with the new wording: "El tutor no tiene material validado y responderá que el material no cubre las preguntas". Run `npm run test:e2e -- flow-f01 a11y-sweep`

---

## Phase 18: User Story 2 — Teacher validates material (revision, Priority: P1)

**Goal**: Validation as an explicit, recorded act; fragment and document exclusion (T2, R-21)

**Independent Test**: Exclude a fragment, validate a document, exclude another (flow F1)

**Depends on**: T117, T120

- [X] T121 [US2] Update tests/prototype/e2e/flow-f01.spec.js (tests fail until T125):
  - `US-02 AS5` a processed document shows "Pendiente de validar" and "the tutor does not use it yet"; "Validar" → confirm → "Validado" with "Prof. Elena Ruiz Navarro" and the date;
  - `US-02 AS6` in fragments.html, excluding a fragment shows the "Excluido" tag, an include-again action and the excluded count;
  - `US-02 AS7` "Excluir documento" → confirm → "Excluido"; the row offers "Validar" again;
  - `US-02 AS8` `no-validated` shows the no-validated-material warning.
- [X] T122 [US2] In public/prototype/design-system.html, add `ValidationStatus` (pending validation: warning tone; validated: success tone with "por {name} · {date}"; excluded: neutral; each with icon and text), and update `DocumentRow` (status badge, validator and date, actions "Validar" and "Excluir documento") and `FragmentItem` (excluded variant: "Excluido" tag in text, an "Excluir fragmento" `Toggle`)
- [X] T123 [US2] In public/prototype/teacher/material.html, add the states `pending-validation`, `validate-confirm` (`Dialog` with `data-modal`: "El tutor empezará a usar este documento en sus respuestas"), `validated`, `exclude-confirm`, `document-excluded` and keep `no-validated` (T120). The `default` state shows "Tema 3" validated and "Apuntes – Sistemas" pending, with a line stating which documents the tutor uses. Update the pages.json states to match contract §4
- [X] T124 [P] [US2] In public/prototype/teacher/fragments.html, add the state `fragment-excluded`: each `FragmentItem` has the "Excluir fragmento" switch; the excluded fragment shows the "Excluido" tag and "Volver a incluir"; the header shows "3 fragmentos excluidos" (`_one`/`_other`). Update pages.json
- [X] T125 [US2] Add the `teacher.material.*` and `teacher.fragments.*` keys (ES/EN), wire flow F1 through the new states, run `npm run test:e2e -- flow-f01 a11y-sweep`, then do the ES/EN review and keyboard pass (confirm dialogs trap and return focus) and log them in specs/001-mvp-prototype/validation.md

---

## Phase 19: User Story 1 — Validated material and the teacher's settings in the chat (revision, Priority: P1)

**Goal**: Disclosure names validated material; students can see the teacher's settings; corrected answers (US1 AS8, tested in F11) (S1, T3)

**Independent Test**: Open the tutor information in the chat header and read level, tone and solution policy (flow F2)

**Depends on**: T118

- [X] T126 [US1] Update tests/prototype/e2e/flow-f02.spec.js (tests fail until T127): `US-01 AS1` expects the disclosure to say the tutor answers from "material validado por tu profesor/a"; add `US-01 AS9` the chat header's tutor information (`?state=tutor-info`) lists level "Intermedio", tone "Cercano", and the solution policy, and says the teacher chose them
- [X] T127 [US1] In public/prototype/student/chat.html, add the states `tutor-info` (header `IconButton` "Cómo responde el tutor" opens a `Dialog` listing the three settings in plain language, "Lo ha elegido tu profesor/a") and `corrected` (the second tutor answer carries `TeacherCorrection`, student view, with the correction from sample data). Update the `AIDisclosure` copy (first-use and consent.html) to "material validado por tu profesor/a", and add the "Fragmento ya no disponible" text to the unavailable `SourceCitation` variant on design-system.html. Update pages.json, add the `student.chat.*` keys (ES/EN), and run `npm run test:e2e -- flow-f02 a11y-sweep student-shell`

---

## Phase 20: User Story 6 — Classified mistake and corrected feedback (revision, Priority: P1)

**Goal**: Feedback names the error type and topic and links to the learning record; teacher corrections show on feedback (S4, T6)

**Independent Test**: Submit, read the error type and "Guardado en tu progreso", open the corrected variant (flow F9)

**Depends on**: T118

- [X] T128 [US6] Update tests/prototype/e2e/flow-f09.spec.js (tests fail until T129): `US-06 AS3` the feedback shows "Error de signo al quitar paréntesis", "Ecuaciones de primer grado" and a "Guardado en tu progreso" link to `progress.html`; add `US-06 AS7` `?state=corrected` shows "Revisado por tu profesor/a" with the correction
- [X] T129 [US6] In public/prototype/student/exercise-feedback.html, add `ErrorTypeTag` to `default` (under the verdict), and the state `corrected` with `TeacherCorrection` (student view). Update pages.json, add the `student.exercise.*` keys (ES/EN), run `npm run test:e2e -- flow-f09 a11y-sweep`, and log the ES/EN review in validation.md

---

## Phase 21: User Story 8 — Teacher corrects answers (revision, Priority: P1)

**Goal**: A flag requires a correction that the student sees; edit, remove, save failure; exercise feedback in the list (T4, T6, R-22)

**Independent Test**: Flag an answer, write a correction, preview it, save; the student chat shows it (flow F11)

**Depends on**: T118, T127, T129

- [X] T130 [US8] Rewrite tests/prototype/e2e/flow-f11.spec.js (tests fail until T134):
  - `US-08 AS1` the list includes exercise-feedback rows and a "Corregida" marker;
  - `US-08 AS2` the flag dialog's save stays blocked with an error while the correction is empty; with text, the preview shows "Revisado por tu profesor/a"; after saving, the message shows the flag and the correction;
  - `US-08 AS3` the flags list shows type, correction, date and a link back;
  - `US-08 AS4` empty state; `US-08 AS5` the student chat's teacher-review label (unchanged);
  - `US-08 AS6` "Editar corrección" opens `correction-editing`; "Quitar corrección" → `remove-correction-confirm` → the marker is gone;
  - `US-08 AS7` `save-failed` keeps the typed text and offers "Reintentar";
  - `US-01 AS8` (student side) `student/chat.html?state=corrected` shows the marker and the correction, and the original answer is still readable.
- [X] T131 [US8] Update `FlagControl` on public/prototype/design-system.html: the dialog has the category (`RadioGroup`: "Incorrecta", "Mejorable"), a required `TextArea` "Corrección para el estudiante" (validation from data-model.md: "correction required (1–1000 characters)", with `aria-invalid` and an error message), and a live student-view preview using `TeacherCorrection`
- [X] T132 [US8] In public/prototype/teacher/conversation.html, update `flag-dialog` (with the correction field) and `flagged` (flag plus `TeacherCorrection` teacher view), and add the states `correction-preview`, `correction-editing`, `remove-correction-confirm` and `save-failed` (dialog stays open with the text and a "Reintentar" action). Update pages.json
- [X] T133 [P] [US8] In public/prototype/teacher/conversations.html, add exercise-feedback rows (type "Ejercicio") and a "Corregida" marker to `default`; in public/prototype/teacher/flags.html, show flag type, an excerpt of the correction, the date and the link back in `default`
- [X] T134 [US8] Add the `teacher.conversations.*`, `teacher.conversation.*` and `teacher.flags.*` keys (ES/EN), wire flow F11, run `npm run test:e2e -- flow-f11 a11y-sweep`, then do the ES/EN review and keyboard pass and log them in validation.md

---

## Phase 22: User Story 14 — Teacher defines course topics (Priority: P1)

**Goal**: Topic list and confirmed topic assignments (T9, R-25)

**Independent Test**: Add and rename a topic, confirm one suggestion and change another, see unassigned documents (flow F16)

**Depends on**: T117

- [X] T135 [US14] Write tests/prototype/e2e/flow-f16.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe` (fails until T139):
  - `US-14 AS1` `teacher/topics.html?state=empty` explains topics and offers to add the first one;
  - `US-14 AS2` add, rename, "Subir"/"Bajar" reorder, and delete with a confirmation that states how many assignments become unassigned;
  - `US-14 AS3` `teacher/topic-assignment.html` marks suggestions "Sugerido"; confirming one removes the tag; changing another updates its select;
  - `US-14 AS4` the unassigned warning lists "Ejercicios resueltos – Polinomios" on topics.html and on material.html (`?state=unassigned-topics`);
  - `US-14 AS5` `suggestions-error` explains the failure and the selects still work.
- [X] T136 [US14] Add `TopicList` (row, editing row, "Subir"/"Bajar" `IconButton`s, delete) and `TopicAssignmentRow` (section label, topic `Select`, "Sugerido" tag, "Confirmar") to public/prototype/design-system.html
- [X] T137 [US14] Build public/prototype/teacher/topics.html (#33) with the teacher shell and the states `default`, `empty`, `loading`, `error`, `added`, `editing`, `reordered`, `delete-confirm` and `unassigned` (`added` and `reordered` were added to the contract during implementation so that adding and reordering visibly update the list). Name validation from data-model.md: "name required, 1–60 characters, unique within the course" (show the error in `editing`). Add its pages.json entry (`mobile: false`, P1, stories `US-14`, requirements `T9`, `FR-026`)
- [X] T138 [P] [US14] Build public/prototype/teacher/topic-assignment.html (#34) with the states `default` (sections of "Tema 3" with suggestions and "Confirmar todas"), `confirmed`, `suggestions-error`, `loading` and `error`. Add its pages.json entry (`mobile: false`, P1)
- [X] T139 [US14] In public/prototype/teacher/material.html, show each document's confirmed topics with a link to topic-assignment.html, and add the state `unassigned-topics`. Add a "Temas" tab to the course navigation in public/prototype/teacher/course.html, between "Material" and "Configuración del tutor" (the course tabs live there, not in the shell). Add the `teacher.topics.*` and `teacher.topicAssignment.*` keys (ES/EN), wire flow F16, run `npm run test:e2e -- flow-f16 flow-f01 a11y-sweep`, then do the ES/EN review and keyboard pass (reorder works without dragging) and log them in validation.md

---

## Phase 23: User Story 15 — Teacher views a student's learning record (Priority: P2)

**Goal**: One detail page for every student, with the at-risk state (T8, R-26)

**Independent Test**: Open a student not at risk and one at risk, and read progress, error types and activity (flow F17)

**Depends on**: T117, T118, T119

- [X] T140 [US15] Write tests/prototype/e2e/flow-f17.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe` (fails until T141):
  - `US-15 AS1` Lucas's page shows mastery per topic, a timeline, error types with counts and activity, with a period `Select`;
  - `US-15 AS2` `?state=at-risk` (Estudiante-07) shows the at-risk indicators and a `DecisionReason`;
  - `US-15 AS3` selecting an error type (`error-type`) lists that student's mistakes with links to exercise feedback or a conversation;
  - `US-15 AS4` `empty` (Mateo) says there is no activity;
  - `US-15 AS5` only the display name or pseudonym is shown (no email).
- [X] T141 [US15] Rebuild public/prototype/teacher/student.html (#27) with the states `default` (not at risk), `at-risk` (keep the existing indicators, activity series and example errors, plus `DecisionReason`), `error-type`, `empty`, `loading` and `error`, using `ProgressByTopic`, `MasteryLevel`, `ProgressTimeline` and `ErrorTypeList`. Update pages.json, add the `teacher.student.*` keys (ES/EN), wire flow F17, run `npm run test:e2e -- flow-f17 a11y-sweep`, and log the ES/EN review in validation.md

---

## Phase 24: User Story 9 — Dashboard opens every student (revision, Priority: P2)

**Goal**: Every student in the dashboard opens the detail page (T5, T8)

**Independent Test**: Dashboard by student → any student → detail (flow F12)

**Depends on**: T141

- [X] T142 [US9] Update tests/prototype/e2e/flow-f12.spec.js (fails until T143): `US-09 AS2` the at-risk item opens `student.html?state=at-risk`; add `US-09 AS4` a student who is not at risk in `by-student` opens `student.html`
- [X] T143 [US9] In public/prototype/teacher/dashboard.html, link every row of `by-student` to student.html (at-risk rows to `?state=at-risk`) and the at-risk list to `?state=at-risk`. Run `npm run test:e2e -- flow-f12 a11y-sweep`

---

## Phase 25: User Story 11 — Reason for each difficulty change (revision, Priority: P2)

**Goal**: Difficulty up and down, each with its reason (S6, FR-016)

**Independent Test**: Reach both difficulty changes and read their reasons (flow F14)

**Depends on**: T118

- [X] T144 [US11] Update tests/prototype/e2e/flow-f14.spec.js (fails until T145): `US-11 AS3` `difficulty-up` shows "Subimos el nivel porque has acertado 3 seguidas" and `difficulty-down` shows "Bajamos el nivel porque has fallado 2 seguidas"
- [X] T145 [US11] In public/prototype/student/quiz.html, add `DecisionReason` to `difficulty-up` and add the state `difficulty-down`. Update pages.json, add the `student.quiz.*` keys (ES/EN), and run `npm run test:e2e -- flow-f14 a11y-sweep`

---

## Phase 26: User Story 13 — Progress over time (revision, Priority: P2)

**Goal**: Mastery per topic over time, error types per topic, the basis of each level (S7, S4, R-26)

**Independent Test**: Open "Mi progreso", a topic and a mastery basis (flow F15, second part)

**Depends on**: T117, T118

- [X] T146 [US13] Replace the US13 tests in tests/prototype/e2e/flow-f15.spec.js (fail until T147):
  - `US-13 AS1` each topic shows a `MasteryLevel` in text, a timeline and a text basis;
  - `US-13 AS2` the empty state (unchanged);
  - `US-13 AS3` `topic-detail` lists the most frequent error types with links to an example;
  - `US-13 AS4` `default` shows when the page was last updated;
  - `US-13 AS5` `mastery-basis` expands the "¿Por qué?" disclosure with one sentence.
- [X] T147 [US13] Update `ProgressByTopic` on public/prototype/design-system.html to contain `MasteryLevel` and `ProgressTimeline`, then update public/prototype/student/progress.html: `default` (all topics, last updated), and the new states `topic-detail` and `mastery-basis`; keep `empty`, `loading` and `error`. Set the pages.json priority to P2, add the `student.progress.*` keys (ES/EN), run `npm run test:e2e -- flow-f15 flow-f09 a11y-sweep`, and log the ES/EN review in validation.md

---

## Phase 27: User Story 16 — Adapted explanations (Priority: P2)

**Goal**: "Adaptado para ti" with a reason and its basis, for students and teachers (S8, R-23)

**Independent Test**: Read an adapted answer and open its basis; see the same label in the teacher's conversation detail (flow F18)

**Depends on**: T118, T127, T132

- [X] T148 [US16] Write tests/prototype/e2e/flow-f18.spec.js with one `test()` per acceptance scenario, titled with its ID, in a serial `test.describe` (fails until T150):
  - `US-16 AS1` `student/chat.html?state=adapted` shows "Adaptado para ti", the reason sentence and citations;
  - `US-16 AS2` activating the badge opens `adapted-basis` (bottom sheet at 390 px, side panel at 1440 px) with error type, count and topic and a link to "Mi progreso"; closing returns focus to the badge;
  - `US-16 AS3` the `answer` state has no badge;
  - `US-16 AS4` `student/chat-guided.html?state=adapted-hint` shows the badge on a hint and no "Ver solución" when the setting is hints only;
  - `US-16 AS5` `teacher/conversation.html?state=adapted` shows the same badge and reason.
- [X] T149 [US16] Add `AdaptedBadge` (chip + `DecisionReason` inline) and `AdaptationSheet` (the `CitationSheet` layout and behaviour) to public/prototype/design-system.html
- [X] T150 [US16] Add the states `adapted` and `adapted-basis` to public/prototype/student/chat.html, `adapted-hint` to public/prototype/student/chat-guided.html, and `adapted` to public/prototype/teacher/conversation.html. Update pages.json, add the `student.chat.adapted*` and `teacher.conversation.adapted*` keys (ES/EN), wire flow F18, run `npm run test:e2e -- flow-f18 a11y-sweep student-shell`, and log the ES/EN review and keyboard pass in validation.md

---

## Phase 28: Revision polish

**Purpose**: Coverage, cover page, traceability and full gates for the revision. T105–T113 follow.

- [X] T151 Update public/prototype/index.html: list pages #33 and #34 and the renamed #27, and add start links for flows F16, F17 and F18; keep the status "Borrador"
- [X] T152 [P] Update the "Prototype pages" table in specs/001-mvp-prototype/spec.md: links for US14 (`teacher/topics.html`, `teacher/topic-assignment.html`), US15 (`teacher/student.html`) and US16 (`student/chat.html?state=adapted`, `student/chat-guided.html?state=adapted-hint`, `teacher/conversation.html?state=adapted`); remove "Not built yet" and the sentence about states not built yet (FR-052)
- [X] T153 Coverage audit for the revision (SC-005): `npm test -- coverage` must now pass (33 pages, every contract state, `mobile` matching "M"); fix any gaps in public/prototype/
- [X] T154 [P] Do the ES/EN review (1440 px, and 390 px where `mobile`) and keyboard-only pass for every page changed or added in Phases 17–27 that a story task did not already log, and record the revision in the Status table of specs/001-mvp-prototype/validation.md (version 0.2.0, 2026-10-06)
- [X] T155 [P] Check that the new sample content (T117) has no name matching a team member or participant and that every email uses `example.org`; record it in validation.md
- [X] T156 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` and `npm run build` locally; all must pass. Then continue with T105

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: starts immediately. T008 must finish before T044 sets the allowance wording.
- **Foundational (Phase 2)**: depends on Setup and blocks all story phases. Within it:
  - T014–T016 each need their test (T011–T013); T017 needs T014–T016;
  - T027–T030 edit the same file, so they run in order;
  - T034 needs T017 and T022.
- **Story phases (3–15)**: each depends only on Foundational, except:
  - US11 needs T092 (`QuizQuestion`);
  - US12 needs T071 (exercise-feedback.html);
  - T097 runs after T095 (same test file).

  Recommended order is by priority: US1 → US2 → US3 → US4 → US5 → US6 → US7 (P1), then US8–US12 (P2), then US13 (P3).
- **Polish (Phase 16)**: T099 needs US1, US2, US4 and US7. The sessions (T108/T109) need all P1 phases (flows F1–F10). T113/T114 need T111/T112.
- **Revision (Phases 17–28, 2026-10-06)**: Phase 17 first; T119 and T120 are breaking renames and each is one commit. Then, by priority: Phase 18 (US2), 19 (US1), 20 (US6), 21 (US8, needs T127 and T129), 22 (US14) for P1; then 23 (US15, needs T119), 24 (US9, needs T141), 25 (US11), 26 (US13), 27 (US16, needs T127 and T132) for P2; then Phase 28. **T105–T113 run after T156**, so the sessions test the revised prototype (R-28).

### Shared files (run edits to them in sequence)

- `public/prototype/design-system.html`: T027–T030, T041, T048, T057, T066, T087, T092, T098; revision: T118, T122, T127, T131, T136, T147, T149.
- `public/prototype/student/chat.html`: T127, T150. `public/prototype/teacher/conversation.html`: T132, T150. `public/prototype/teacher/material.html`: T120, T123, T139. `tests/prototype/e2e/flow-f01.spec.js`: T120, T121. `tests/prototype/e2e/flow-f12.spec.js`: T119, T142.
- `public/prototype/assets/pages.json` and `assets/messages/{es,en}.json`: every page task adds to them. When working in parallel, add entries in separate commits and rebase; the files are JSON, so keep keys sorted to make conflicts trivial.

### Within each story

Flow test (fails) → story components → pages (all states) → copy keys → wire flow (test passes) → ES/EN review and keyboard pass.

### Parallel opportunities

- Phase 1: T003–T007 in parallel after T002.
- Phase 2: T011–T013 together; T018–T021 together; T023–T026 together; T031–T033 together; T036 at any time.
- Within stories: page tasks marked [P] are different files. For example, in US7, T076–T083 can be built by different people at the same time.
- Across stories: after Phase 2, different people can take different stories. For example, one on student pages (US1, US5, US6), one on teacher pages (US2, US3, US4) and one on admin and auth (US7).

---

## Parallel Example: User Story 1

```text
# Tests first, in parallel:
Task: "T038 [US1] flow-f02.spec.js (consent → chat)"
Task: "T039 [US1] flow-f03.spec.js (no-source)"
Task: "T040 [US1] flow-f04.spec.js (limit, chat part)"

# Then:
Task: "T041 [US1] Student AI components on design-system.html"
Task: "T042 [US1] consent.html"   # [P] alongside T043 once T041 is done
Task: "T043 [US1] chat.html"
```

## Parallel Example: Revision

```text
# Phase 17, together:
Task: "T115 components.test.js list"
Task: "T116 coverage.test.js 33 pages"
Task: "T117 sample data ES/EN"

# After Phase 17, different people:
Task: "Phase 18 (US2) material and fragments"     # teacher material
Task: "Phase 19–20 (US1, US6) student pages"      # student chat and feedback
Task: "Phase 22 (US14) topics pages"              # new teacher pages
```

## Parallel Example: User Story 7

```text
Task: "T076 [US7] auth/sign-in.html"
Task: "T077 [US7] auth/password-recovery.html"
Task: "T078 [US7] auth/access-denied.html"
Task: "T081 [US7] admin/users.html"
Task: "T082 [US7] admin/teacher-new.html"
Task: "T083 [US7] admin/courses.html"
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1 Setup → Phase 2 Foundational.
2. Phase 3 (US1): consent, chat, citations, no-source reply, limit and disclosure.
3. **Stop and validate**: run 2–3 quick student sessions on the chat flows (F2 from consent, F3,
   F4) on a Vercel preview. This tests the core value proposition before building teacher pages.

### Incremental delivery

1. Add US2 (F1) and US7 (F5, F10). With US1, these give the five required flows F1–F5.
2. Add US3, US4, US5 and US6 to complete P1 (F6–F9), then run the full validation (T106–T113).
3. Add the P2 stories (US8–US12) as happy paths, and validate them with teachers in the same round
   or a later one.
4. Add US13 (P3) last, if time allows before the progress report due December 1st, 2026.

### Revision delivery (2026-10-06)

1. Phase 17, then the P1 revision phases (18–22). Stop and check flows F1, F2, F9, F11 and F16.
2. The P2 revision phases (23–27), then Phase 28.
3. Only then T105 (preview) and the validation sessions T106–T113, with the revised tasks and
   SC-008.

---

## Notes

- **Commits**: use Conventional Commits that reference the task ID: `feat(prototype): T043 student chat page`, `test(prototype): T038 flow F2`, `docs(tasks): …`.
- **Tests**: never skip a test to get a green run (Constitution V). If an axe rule is truly a false positive, document it in validation.md and disable only that rule for that one selector, with a comment.
- **Behavior changes** found at any point go into spec.md first, then the prototype.
- **Team tasks**: tasks marked **(Team)** need people (sessions, pedagogy review) and cannot be completed by an agent.
