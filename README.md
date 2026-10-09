# DocentAI Frontend

Minimal base with Next.js App Router, TypeScript, and Tailwind.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app expects the backend at `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8000`.

## Deployment (Vercel)

The project deploys to Vercel as a Next.js app; the clickable prototype is served from
`public/prototype/`. Build settings live in `vercel.ts` (install with `npm ci`, build with
`npm run build`). The deployment root redirects to the prototype, and every response carries
`X-Robots-Tag: noindex` because the prototype shows fictional data.

One-time setup:

1. In the Vercel dashboard, import the `DocentAI-Org/frontend` GitHub repository
   (framework preset: Next.js, root directory: repository root).
2. Set `NEXT_PUBLIC_API_BASE_URL` for Preview and Production once a backend is deployed.
   The prototype does not need it.
3. Check Settings → Deployment Protection. If previews require a Vercel login, create a
   shareable link or a protection bypass before sharing a preview with session participants.

After that, every push gets a preview URL (`https://<preview-url>/prototype`) and every merge to
`main` deploys to production.
