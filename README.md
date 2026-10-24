# DocentAI Frontend

Next.js 16 (App Router) app for DocentAI, the teacher-controlled AI tutor: students chat with a
tutor that only answers from material their teacher has validated, teachers manage courses,
material, tutor settings and corrections, and admins manage accounts. It talks to the DocentAI
API v1 ([`DocentAI-Org/backend`](https://github.com/DocentAI-Org/backend)) and uses Supabase Auth
for sessions.

The validated clickable prototype lives in `public/prototype/` and is the design reference for
every screen (same tokens in `public/prototype/assets/theme.css`, same component names).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Auth URL (`http://127.0.0.1:54321` locally) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `PUBLISHABLE_KEY` from `npx supabase status -o env` in the backend repo |
| `API_BASE_URL` | DocentAI API, called from the Next.js server only (`http://localhost:8000`) |
| `PSEUDONYM_EMAIL_DOMAIN` | Pseudonymous students sign in with a code; their auth email is `<code>@<domain>` |
| `PRIVACY_CONTACT_EMAIL` | Contact shown on `/acerca` |

To run against the real backend, start it as described in its README (Supabase, Ollama,
`uvicorn`, `scripts/seed_dev.py`); the full walkthrough is in
[`specs/002-app-api-integration/quickstart.md`](specs/002-app-api-integration/quickstart.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js development server, production build, production server |
| `npm run lint` · `npm run typecheck` | ESLint · route types and TypeScript |
| `npm run test` | Unit and component tests (Vitest + Testing Library, `tests/app/unit`) |
| `npm run test:e2e:app` | App E2E with axe (Playwright, desktop 1440 px and mobile 390 px) against the typed mock backend in `tests/app/mock-api`; starts the mock and the app itself |
| `npm run test:e2e:integration` | The same suite against the real local stack and an app started with `npm run dev` |
| `npm run test:e2e` | Prototype tests (`tests/prototype`) |
| `npm run api:types` · `api:check` | Regenerate / check `src/lib/api/schema.d.ts` from the pinned contract `specs/002-app-api-integration/contracts/backend-openapi.json` |

## Structure

```text
src/
├── proxy.ts            # Supabase session refresh, signed-out redirect to /entrar
├── lib/api/            # typed API client (server-only), one module per area
├── lib/auth/           # Supabase server client, role guards, sign-in identifiers
├── components/         # ported prototype components (AppShell, StudentShell, …)
└── app/                # (public), (student), (teacher), (admin) route groups
messages/es.json · en.json   # ES and EN catalogs (next-intl)
specs/                       # Spec Kit features (001 prototype, 002 app)
```

Routes, their prototype pages and API calls are listed in
[`specs/002-app-api-integration/contracts/routes.md`](specs/002-app-api-integration/contracts/routes.md).

## Deployment (Vercel)

The project deploys to Vercel as a Next.js app; build settings live in `vercel.ts` (install with
`npm ci`, build with `npm run build`). Every response carries `X-Robots-Tag: noindex`.

While no backend is deployed, the deployment root still redirects to the static prototype
(`vercel.ts`), so a bare preview URL can be shared with session participants. Remove that
redirect once the app has a backend to talk to, and set the variables above for Preview and
Production.

One-time setup:

1. In the Vercel dashboard, import the `DocentAI-Org/frontend` GitHub repository
   (framework preset: Next.js, root directory: repository root).
2. Check Settings → Deployment Protection. If previews require a Vercel login, create a
   shareable link or a protection bypass before sharing a preview with session participants.

After that, every push gets a preview URL (`https://<preview-url>/prototype`) and every merge to
`main` deploys to production.
