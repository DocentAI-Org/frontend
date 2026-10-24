# Research: DocentAI App connected to the API v1

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-24

## R1. Authentication and sessions

- **Decision**: Supabase Auth through `@supabase/ssr` with cookie sessions. Sign-in, sign-out and
  password recovery run in Server Actions; `src/proxy.ts` (Next 16's request proxy) refreshes the
  session and redirects signed-out users to `/entrar?next=<path>`. The access token is read on the
  server and sent to the API as `Authorization: Bearer`; it never reaches client JavaScript.
- **Pseudonymous sign-in**: an identifier without `@` is a code; the server maps it to
  `<code-lowercase>@<PSEUDONYM_EMAIL_DOMAIN>` (`students.docentai.invalid`), the same rule the
  backend uses (backend research R8).
- **Rationale**: Constitution VII forbids tokens in `localStorage`/`sessionStorage`; cookies set
  by the server (HttpOnly) satisfy FR-003. Server Components can authorize before rendering
  (Constitution II).
- **Alternatives**: `supabase-js` in the browser (tokens in storage); a custom auth proxy in the
  backend (more code, no gain).

## R2. Role areas

- **Decision**: App Router route groups `(public)`, `(admin)`, `(teacher)`, `(student)`, each with
  a server layout that loads `/v1/me` and renders the access-denied screen when the role does not
  match. Data for a page is fetched by Server Components through `src/lib/api`.
- **Rationale**: Constitution II (separate route groups, server-side enforcement); the API also
  enforces roles, so this is defense in depth (FR-005).

## R3. Typed API access

- **Decision**: `openapi-typescript` generates `src/lib/api/schema.d.ts` from a pinned copy of the
  backend contract (`contracts/backend-openapi.json`, recorded with its backend commit).
  `openapi-fetch` gives a typed client in `src/lib/api/client.ts` (`server-only`). Every call
  lives in `src/lib/api/*.ts` (per area); components never call the API. A `check` script fails
  when the generated file is stale.
- **Rationale**: Constitution VI (generated types, single access layer, pinned version); a
  breaking contract change fails typecheck (SC-003).
- **Alternatives**: `orval` / generated SDKs (heavier, generates React Query hooks we do not
  need); hand-written fetch (forbidden).

## R4. Mutations and refresh

- **Decision**: Mutations are Server Actions in `src/app/**/actions.ts` that call `src/lib/api`
  and `revalidatePath`. Client components exist only for interaction: forms with pending states,
  the chat composer, dialogs, copy buttons and the document-status poller. The poller calls a
  Server Action every 3 s while any document is `processing` and stops otherwise (FR-008).
- **Rationale**: Constitution IX (Server Components by default, smallest client components).
- **Alternatives**: a client data library (React Query/SWR): more client JavaScript for no need.

## R5. Internationalisation

- **Decision**: `next-intl` with locales `es` (default) and `en`, without locale prefixes in
  URLs. The locale comes from the user's profile (`preferred_language`) after sign-in, mirrored in
  a `NEXT_LOCALE` cookie (not personal data) for public pages. Catalogs
  `messages/{es,en}.json` start from the prototype's catalogs (same keys, ICU placeholders);
  API error codes map to `errors.<code>` keys. A unit test fails when the two catalogs differ in
  keys or a mapped error code has no message (FR-006, FR-007).
- **Rationale**: Constitution VIII; next-intl supports Server Components and ICU plurals/dates.
- **Alternatives**: `react-i18next` (client-first); a home-made loader (re-implements plurals and
  formatting).

## R6. Routes

- **Decision**: Spanish URLs, matching the invitation link the API returns (`/unirse/<code>`).
  The full route ↔ prototype page ↔ API table is in [contracts/routes.md](contracts/routes.md).

## R7. Tests

- **Decision**:
  - **Unit/component**: Vitest + Testing Library (`@testing-library/react`,
    `@testing-library/user-event`) in `tests/app/unit`, for client components, the error mapper,
    the identifier → email rule and the catalogs.
  - **E2E (CI)**: Playwright in `tests/app/e2e` against a **typed mock backend**
    (`tests/app/mock-api`): a small Node server, typed with the generated schema, that implements
    the `/v1` routes in scope and the four Supabase Auth endpoints the app uses (token, user,
    logout, recover) with in-memory state and seeded users. Playwright starts it with the app.
    Every acceptance scenario has one E2E test with axe (Constitution V, III).
  - **Integration (local, manual)**: the same E2E suite run against the real local stack
    (`npm run test:e2e:integration`), used for the quickstart validation (SC-001).
- **Rationale**: Server Components call the API from the Node server, so browser-level request
  interception cannot mock them; a mock server honoring the generated contract is what
  Constitution VI requires when the real backend is not available (CI has no access to the
  private backend repository).
- **Alternatives**: MSW inside the Next server (instrumentation hook; fragile across Next
  versions); running the real backend in CI (needs the private repo, Supabase and the fake model).

## R8. Prototype first for the new admin screen

- **Decision**: add `public/prototype/admin/students-new.html` (#35) with states default,
  loading, validation error, created (codes listed once), error, to the prototype and its
  manifest, before implementing it (Constitution IV, spec FR-012).

## R9. Error tracking

- **Decision**: Sentry is not added in this feature; it comes with deployment (December). No
  analytics are added either, so FR-010 holds by construction.

## R10. New dependencies (Constitution IX)

| Dependency | Why |
|---|---|
| `@supabase/ssr`, `@supabase/supabase-js` | Cookie-based Supabase Auth in Server Components and Actions (R1) |
| `openapi-fetch` | Typed client over the generated schema (R3) |
| `openapi-typescript` (dev) | Generates API types from the pinned contract (R3) |
| `next-intl` | ES/EN in Server and Client Components, ICU formatting (R5) |
| `@testing-library/react`, `@testing-library/user-event` (dev) | Component tests the constitution requires (R7) |
| `server-only` | Fails the build if the API client is imported into client code (R3) |
