# Validation: quickstart B + C against the real local stack (T044)

**Date**: 2026-10-25 · **Frontend**: `002-app-api-integration` · **Backend**: `main` at `d8df95b`

## Setup (quickstart B)

- Docker Desktop, `npx supabase start` (4 migrations applied), `npx supabase db reset` and
  `uv run python scripts/seed_dev.py` for a clean database with the demo users.
- Ollama with `qwen2.5:7b` (chat) and `bge-m3` (embeddings); backend with
  `uv run uvicorn app.main:app --port 8000`.
- `frontend/.env.local` as in the quickstart; `npm run dev` on port 3000.

## Walkthrough (quickstart C, SC-001)

Driven with Playwright (desktop, Chromium) against the real stack, one step after the other.

| Step | Result |
|---|---|
| 1–2 Teacher signs in, creates "Álgebra", copies the invitation link | ✅ |
| 3 Uploads `ecuaciones.md` → "Pendiente de validar" in ~4 s; excludes 1 of 4 fragments; validates | ✅ |
| 4 Tutor settings → "Primero pistas, luego solución" | ✅ |
| 5 Student opens the invitation link → sign-in → study consent → joins | ✅ |
| 6 Disclosure → "¿Cómo despejo la x en 2x + 3 = 7?" → "Pista 1" citing `ecuaciones.md · § 3.1 Transponer términos`, passage opens; "¿Quién ganó el mundial de 2010?" → "El material del curso no cubre esta pregunta", no citations | ✅ (LLM answers in ~5–10 s) |
| 7 Teacher → Conversaciones ("4 mensajes", "Sin fuente") → flags the hint as "Mejorable" with a correction | ✅ |
| 8 Student reloads → "Corregida" + "Revisado por tu profesor/a" with the correction next to the hint | ✅ |
| 9 Admin creates 2 pseudonymous accounts → signs in with one code → study consent screen | ✅ |

**Total time**: 37 s automated (well under the 10-minute target of SC-001; a person clicking
through takes a few minutes).

## Deviations

None in the app. Notes:

- After joining, the student lands on the "Te has unido al curso" confirmation and opens the
  chat from "Mis cursos" (as in the prototype), not directly in the chat.
- `PRIVACY_CONTACT_EMAIL` is still empty: the real contact must be agreed with the Data
  Protection Officer before the pilot.
