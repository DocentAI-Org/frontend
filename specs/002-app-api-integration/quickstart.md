# Quickstart: DocentAI App against the API v1

**Feature**: [spec.md](spec.md) · Validates SC-001 (full loop in under 10 minutes).

## A. With the mock backend (no backend needed)

```bash
npm install
npm run api:types                # regenerate src/lib/api/schema.d.ts from the pinned contract
npm run test                     # unit and component tests
npm run test:e2e:app             # starts the mock API and the app, runs Playwright + axe
```

## B. With the real local stack

1. Start the backend as in `backend/README.md` (`npx supabase start`, `uv run uvicorn …`, Ollama)
   and seed demo users with `uv run python scripts/seed_dev.py`.
2. In `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY from `npx supabase status -o env`>
   API_BASE_URL=http://localhost:8000
   PSEUDONYM_EMAIL_DOMAIN=students.docentai.invalid
   ```

3. `npm run dev` and open `http://localhost:3000`.

## C. Validation walkthrough (SC-001)

1. Sign in as `profesora@docentai.local` (password from the seed script) → "Mis cursos".
2. Create "Álgebra" → copy the invitation link.
3. Material → upload `backend/tests/fixtures/ecuaciones.md` → watch "Procesando" → "Listo";
   open fragments, exclude one, validate the document.
4. Tutor settings → "Pistas primero" → save.
5. In a private window, sign in as `alumno@docentai.local` → study consent → open the invitation
   link → join.
6. Chat → acknowledge the AI disclosure → ask "¿Cómo despejo la x en 2x + 3 = 7?" → hint with a
   citation; open it. Ask "¿Quién ganó el mundial de 2010?" → "no cubierto".
7. As the teacher → Conversaciones → open it → flag the hint with a correction.
8. As the student → reload → "Revisado por tu profesor/a" with the correction.
9. As `admin@docentai.local` → create 2 pseudonymous accounts → sign in with one code.

Record the time and any deviation in `validation.md`.
