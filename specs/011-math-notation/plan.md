# Implementation Plan: Math Notation

**Branch**: `011-math-notation` · **Spec**: [spec.md](spec.md)

## Summary

A `MathText` component splits a text on `\( … \)` and `\[ … \]`. Without formulas it returns the
text unchanged. With formulas it loads KaTeX with a dynamic `import()` and renders each formula
to HTML and MathML; until then, and on a LaTeX error, it shows the source.

## Technical Context

Same stack as 010. **New dependency: `katex` 0.19.0** (exact pin; 0.19.1 is under two weeks old).

- **Why**: §4.4 names KaTeX; it renders on the server or the client, outputs MathML for screen
  readers (Principle III) and has no runtime dependencies. Writing a LaTeX renderer is not an
  option; MathJax is several times larger.
- **Cost**: about 270 kB of JavaScript and 23 kB of CSS, in their own chunk, fetched only by a
  page that shows a formula (FR-002). Fonts are fetched by the browser only for glyphs in use.
- **Security**: output comes from KaTeX with `trust: false`; the input text is escaped by it.
- **Where**: `src/components/MathText.tsx`; used where the spec lists. `whitespace-pre-line`
  parents keep line breaks around formulas.
- **Tests**: `tests/app/unit/math-text.test.tsx`; E2E in `tests/app/e2e/math-notation.spec.ts`
  with a mock exercise whose explanation has a formula.

## Constitution Check

| Principle | Pre | Post | Evidence |
|---|---|---|---|
| I. Teacher control & transparency | ✅ | ✅ | Text unchanged; only its typesetting |
| II. Role separation | ✅ | ✅ | No route or data change |
| III. Accessibility WCAG 2.2 AA | ✅ | ✅ | KaTeX MathML for screen readers; axe in E2E |
| IV. Design system first | ✅ | ✅ | Formulas inherit the text's color and size |
| V. Test-first | ✅ | ✅ | Unit and E2E tests written first and seen failing |
| VI. Typed backend contract | ✅ | ✅ | Contract unchanged |
| VII. Privacy by design | ✅ | ✅ | Rendering is local; nothing sent |
| VIII. Bilingual | ✅ | ✅ | No new strings |
| IX. Simplicity | ⚠️ | ✅ | New dependency, justified above; loaded on demand |

No violations.
