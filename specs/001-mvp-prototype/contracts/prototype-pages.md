# Contract: Prototype Pages

**Feature**: [spec.md](../spec.md) · **Plan**: [plan.md](../plan.md) · **Date**: 2026-10-04

This is the interface the prototype offers to its users: reviewers, facilitators, the spec's
"Prototype pages" table and the test suite. Links in the spec and in `validation.md` depend on
it. A change to a page path or a state ID is a breaking change: update the spec links and the
tests in the same commit.

## 1. URLs

```text
/prototype/<page>.html[?state=<stateId>][&lang=es|en][&panel=0|1]
```

| Parameter | Values | Default | Effect |
|---|---|---|---|
| `state` | a state ID from the page's list (§4) | `default` | Shows the markup for that state. An unknown ID shows `default` and a warning in the state panel. |
| `lang` | `es`, `en` | stored preference, else `es` | Sets the copy language and `<html lang>`, and is stored as the preference. |
| `panel` | `0`, `1` | `1` | `0` hides the state panel for the rest of the browser session (participant sessions). |

- Paths are relative to `/prototype/`. `/prototype` redirects to `index.html`.
- Links between pages are relative and keep the current `lang` and `panel`.
- Spec links use the form `/prototype/student/chat.html?state=no-source`.

## 2. Page manifest (`assets/pages.json`)

There is one entry per page, and the index, state panel and tests read only this file:

```json
{
  "path": "student/chat.html",
  "screen": [8, 9],
  "role": "student",
  "titleKey": "student.chat.pageTitle",
  "stories": ["US-01"],
  "requirements": ["S1", "S2", "FR-010", "FR-011", "FR-012", "FR-013", "FR-014"],
  "priority": "P1",
  "mobile": true,
  "states": ["default", "loading", "load-error", "first-use", "tutor-writing", "answer", "citation",
             "citation-unavailable", "no-source", "low-allowance", "limit-reached", "failed"],
  "simulate": ["failed", "limit-reached", "load-error"]
}
```

Rules:
- `states[0]` is always `default`.
- State IDs are kebab-case and unique within a page.
- `mobile: true` means the page is reviewed and tested at 390 px as well as 1440 px.
- `simulate` (optional) lists the states the state panel offers under "Simular" (facilitator error
  branches). Every ID in it must be one of the page's states.
- Every file under `public/prototype/` except `index.html`, `design-system.html`, `partials/`
  (including the page skeleton `partials/_template.html`) and `assets/` must have an entry, and
  every entry must have a file. A test checks both.

## 3. Markup attributes

| Attribute | On | Meaning |
|---|---|---|
| `data-state="a b"` | any element | Shown only when the current state is one of the listed IDs. Elements without it are always shown. |
| `data-goto="<stateId>"` | button | Switches to that state on activation (same page). Links use `href="?state=<id>"` instead. |
| `data-advance="<stateId>"` | element of a loading state | Moves on to that state after 1.2 s, or at once with reduced motion. |
| `data-i18n="<key>"` | element | Sets `textContent` from the message files. |
| `data-i18n-attr="attr:key;attr:key"` | element | Sets attributes (`aria-label`, `alt`, `placeholder`, `title`). |
| `data-i18n-count="<n>"` | element with `data-i18n` | Picks `key_one` / `key_other` and fills `{count}`. |
| `data-i18n-vars='{"name":"…"}'` | element with `data-i18n` | Fills interpolation variables. A value may be a `sample.*` key, `date:2026-10-06T10:42`, `number:2.4` or `percent:0.45` (formatted for the current language). |
| `data-i18n-date="2026-10-04"` / `data-i18n-number="2.4"` | element | Formats with `Intl` for the current language. |
| `data-include="partials/<file>.html"` | empty element | Replaced by the partial's markup before copy and state are applied. Inside partials, `href`/`src` values starting with `~/` resolve from the prototype root, so one partial works at any folder depth. |
| `data-modal` + `data-close-state="<stateId>"` | `<dialog>` that has a `data-state` | Opened with `showModal()` while its state is current (focus trap, Esc). Closing it goes to `data-close-state` (`@back` goes back one step in history, to whichever state opened it), and focus returns to the element that opened it. |
| `data-dismissible="false"` | `<dialog data-modal>` | Esc does not close it (used when an acknowledgement is required). |
| `data-focus="<selector>"` | button | Moves focus to the matching element (e.g. "Reformular la pregunta" → the composer). |
| `data-switch` | `role="switch"` button | Toggles `aria-checked`. In the nearest `[data-switch-scope]`, `[data-switch-on]` content shows when checked and `[data-switch-off]` when not. |
| `data-checked-in="<stateId> …"` | radio or checkbox | Checked when the current state is one of the listed IDs (so each state shows the right selection). A radio with `data-goto` keeps its native check. |
| `data-leave-guard="<stateId> …"` + `data-leave-state="<stateId>"` | page container | While the current state is guarded, links to other pages open the leave state (e.g. an unsaved-changes dialog) instead; `[data-leave-link]` inside it gets the link's target. |
| `data-route` (+ `data-route-field`, `data-routes`, `data-route-default`, `data-route-empty`, `data-route-empty-target`) | `<form>` | On submit, picks the next state or page: if all `data-route-empty` fields are empty → the empty target; otherwise the `data-route-field` value is looked up (trimmed, case-insensitive) in the `data-routes` JSON, else the default. A target is a state ID, `?state=…`, `@next` (the `?next` parameter) or a page URL (keeps `lang` and `panel`). |
| `data-invalid-in="<stateId> …"` | form control | `aria-invalid="true"` only in the listed states. |
| `data-set-lang="es\|en"` | button (`LanguageSwitcher`, state panel) | Switches the language without reloading; `aria-pressed` marks the current one. |
| `data-nav` | navigation container | Links inside it that point to the current page get `aria-current="page"`. |
| `data-component="<Name>"` | component root | The future React component's name (plan.md › Components). `data-variant` is optional. |

Processing order on load: include → i18n → state → reveal the page.

## 4. Pages and state IDs

The required states per screen come from the spec's Screen Inventory and plan.md. Flows reach the
states below.

| # | Page | State IDs |
|---|---|---|
| 1 | `auth/sign-in.html` | default, loading, invalid-credentials, session-expired |
| 2 | `auth/password-recovery.html` | default, loading, error, sent |
| 3 | `auth/access-denied.html` | default (access denied), not-found, course-removed |
| 4 | `about.html` | default |
| 5 | `student/consent.html` | default, ai-disclosure, error, revoked |
| 6 | `student/courses.html` | default, empty, loading, error, several-courses |
| 7 | `student/join.html` | default, loading, invalid-code, expired-code, disabled-code, confirm |
| 8–9 | `student/chat.html` | default, loading, load-error, first-use, tutor-writing, answer, citation, citation-unavailable, no-source, low-allowance, limit-reached, failed |
| 10 | `student/chat-guided.html` | default, loading, load-error, hint-1, hint-2, citation, hints-done-solution, hints-done-hints-only, solution, no-source, limit-reached |
| 11 | `student/exercise.html` | default, review, loading, empty-submission, unreadable-photo, limit-reached |
| 12 | `student/exercise-feedback.html` | default, pending, no-source, error, repeated-mistake |
| 13 | `student/profile.html` | default, loading, error, revoke-confirm, revoked |
| 14 | `teacher/courses.html` | default, empty, loading, error |
| 15 | `teacher/course-new.html` | default, validation-error, loading |
| 16 | `teacher/course.html` | default, no-students, loading, error, code-copied, code-disabled, regenerate-confirm, code-regenerated |
| 17 | `teacher/material.html` | default, empty, loading, error, uploading, processing, file-error, all-excluded, duplicate |
| 18 | `teacher/fragments.html` | default, loading, error, search-results, search-empty |
| 19 | `teacher/tutor-settings.html` | default, loading, load-error, hints-only, preview, unsaved, saved, save-failed |
| 20 | `admin/users.html` | default, empty, loading, error |
| 21 | `admin/teacher-new.html` | default, validation-error, loading, created |
| 22 | `admin/courses.html` | default, empty, loading, error |
| 23 | `teacher/conversations.html` | default, empty, loading, error, filtered, no-results |
| 24 | `teacher/conversation.html` | default, loading, error, flag-dialog, flagged |
| 25 | `teacher/flags.html` | default, empty, loading, error |
| 26 | `teacher/dashboard.html` | default (by topic), by-student, not-enough-data, loading, error |
| 27 | `teacher/student-risk.html` | default, loading, error |
| 28 | `teacher/questions.html` | default (pending), editing, approved, rejected, empty, loading, error |
| 29 | `student/quiz.html` | default, correct, incorrect, difficulty-up, empty, loading, error |
| 30 | `student/quiz-summary.html` | default, loading, error |
| 31 | `student/practice.html` | default, no-source, loading, error |
| 32 | `student/progress.html` | default, empty, loading, error |

On `student/exercise-feedback.html`, `default` is the feedback-ready view. Flows arrive at
`?state=pending` after a submission, and it advances to `default`.

## 5. Copy keys

- Shape: nested JSON, with the path joined by `.` (`student.chat.limitReached`).
  - Roles: `admin`, `teacher`, `student`.
  - Shared namespaces: `common.actions.*`, `common.states.*`, `common.errors.*`, `common.auth.*`,
    `common.imfahe.*`, `common.a11y.*`.
  - Prototype-only namespace: `prototype.*`, used by the state panel and not a future app key.
- Plurals: `<key>_one`, `<key>_other`.
- Sample content: `sample.*` in `assets/sample/{es,en}.json`. These are not future i18n keys.
- Every key used in a page or partial must exist in both `es` and `en`, and no key may exist in
  only one of the two. A test checks both.

## 6. Guarantees checked by tests

| Guarantee | Test |
|---|---|
| Every manifest state renders with no axe violations (WCAG 2.2 A/AA) at 1440 px, and at 390 px when `mobile` | `e2e/a11y-sweep` |
| Each flow F1–F15 can be clicked through, and every acceptance scenario it covers is its own `test()` titled with its ID | `e2e/flow-f01` … `flow-f15` |
| ES/EN key parity; no missing keys | `unit/messages` |
| No hex/rgb or arbitrary `[..]` values outside `theme.css` | `unit/no-hardcoded-values` |
| Manifest ↔ files consistent; every `data-state` value is a declared state; every declared state has markup | `unit/manifest` |
| `data-component` names are in the known component list | `unit/components` |
