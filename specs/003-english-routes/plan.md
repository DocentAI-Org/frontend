# Implementation Plan: English as the Base Language — Routes and Default Locale

**Branch**: `003-english-routes` · **Spec**: [spec.md](spec.md) · **Routes**: [contracts/routes.md](contracts/routes.md)

## Summary

Rename every App Router folder, dynamic segment, query parameter and anchor to English, keep each
page's code and behavior, and make English the default locale with `Accept-Language` detection.
The invitation link is built from the class code by the app, and the old `/unirse/<code>` path
redirects.

## Technical Context

Same stack as 002 (Next.js 16 App Router, next-intl 4, Vitest, Playwright + axe). No new
dependency: `Accept-Language` is parsed by a small function in `src/i18n/locales.ts`, unit-tested.

- **Folders**: `git mv` of the route folders so history follows each page; `params` names follow
  the new dynamic segments (`[conversationId]`, `[submissionId]`, `[documentId]`, `[code]`).
- **Links**: `src/lib/routes.ts` and every literal path, `src/proxy.ts` public paths, the session
  expiry redirect in `src/lib/api/client.ts`.
- **Locale**: `DEFAULT_LOCALE = "en"`; `src/i18n/request.ts` reads the cookie, then the header.
- **Redirect**: `/unirse/:code` → `/join/:code` (308) in `next.config.ts`, which Vercel also applies.
- **Tests**: E2E paths updated; Playwright projects pin `locale: "es-ES"` so the Spanish
  assertions of 002 keep testing the pilot language; new E2E for the default locale with other
  browser languages; unit test for header matching; unit test that fails on Spanish paths in
  `src/` (SC-001). The mock API returns `invitation_path: "/join/<code>"`.

## Constitution Check

| Principle | Pre | Post | Evidence |
|---|---|---|---|
| I. Teacher control & transparency | ✅ | ✅ | No behavior change |
| II. Role separation | ✅ | ✅ | Same route groups and layouts; role-separation E2E (002 T041) runs on the new paths |
| III. Accessibility WCAG 2.2 AA | ✅ | ✅ | `<html lang>` follows the detected locale; axe in every E2E |
| IV. Design system first | ✅ | ✅ | No visual change |
| V. Test-first | ✅ | ✅ | Locale and path tests written first and seen failing |
| VI. Typed backend contract | ✅ | ✅ | Contract unchanged; `invitation_path` no longer used for the link |
| VII. Privacy by design | ✅ | ✅ | `Accept-Language` read only to pick the locale; nothing stored |
| VIII. Bilingual | ✅ | ✅ | Spanish and English stay complete; adding a language needs no route change |
| IX. Simplicity | ✅ | ✅ | No new dependency; no localized pathnames or locale prefixes |

No violations.
