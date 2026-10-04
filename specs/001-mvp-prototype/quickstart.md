# Quickstart: Running and Validating the Prototype

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04

Part A shows how to open the prototype and check it. Part B shows how to run one moderated
validation session and record the results. The page paths and state IDs are in
[contracts/prototype-pages.md](contracts/prototype-pages.md). The protocol decisions are in
[research.md](research.md) R-18 and R-19.

# Part A — Run and check the prototype

## A1. Open it locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000/prototype`. Expected result:
- The index lists every page grouped by role, with links to each state and to the start of each
  flow F1–F15.
- The IMFAHE acknowledgement is visible.

On a Vercel preview, the same path works: `https://<preview-url>/prototype`.

## A2. Look at a state, a language and a width

| Try | Expected |
|---|---|
| `/prototype/student/chat.html?state=no-source` | The tutor reply shows "El material del curso no cubre esta pregunta", an info icon, no citations, and two next-step actions. |
| The same URL with `&lang=en` | All text, including the sample conversation, is in English; `<html lang="en">`. |
| Browser DevTools device mode at 390 × 844 | No horizontal scroll; the composer and primary actions are at least 44 px tall. |
| `?state=citation` at 390 px, then at 1440 px | A bottom sheet at 390 px, a side panel at 1440 px; closing it returns focus to the chip. |
| The state panel (bottom-right) | Lists every state of the page; clicking one updates the URL. |
| `?panel=0` | The panel is hidden on this and every following page in the tab. |

## A3. Automated checks

```sh
npm test            # Vitest: runtime modules, ES/EN key parity, no hardcoded values, manifest
npm run test:e2e    # Playwright: axe sweep of every page × state × width, flows F1–F15
```

Expected result: both pass. The flow tests report each acceptance scenario by ID (e.g.
`F2 › US-01 AS3 citation opens and closes`), which gives the FR-051 traceability.

## A4. Manual checks that tests cannot do

- A keyboard-only pass on every P1 page: Tab order follows the visual order, focus is always
  visible, dialogs trap focus and return it. Record the result in `validation.md`.
- Every P1 page reviewed in ES and EN at both widths. Log breakages (truncation, wrapping) in
  `validation.md` and fix them, or record why they are accepted.
- The sample content checked: no name matches a team member or participant.

# Part B — Run a validation session

## B1. Before the first session (once)

Links per flow, task cards, a consent-form draft and blank session sheets are in
[session-kit.md](session-kit.md).

- [ ] Flows F1–F5 at least are complete, and `npm test` and `npm run test:e2e` pass on the
      preview deployment's commit.
- [ ] The cover page (`/prototype`) shows status "En validación" with version and date.
- [ ] One link per flow with `?panel=0` (participant view), and the same links without it
      (facilitator view).
- [ ] The consent form is ready (purpose, recording, storage, deletion, right to withdraw), and
      reviewed by whoever coordinates ethics for the project.
- [ ] A private storage folder for recordings is ready (team institutional storage, **not** the
      repo).
- [ ] A session sheet (B6) is copied for each participant code (P-S01…, P-T01…).

## B2. Participants

| Group | Number | Device | Flows |
|---|---|---|---|
| Students (adults) | ≥5 | own phone, mobile browser, preview URL | F2, F3, F4, then F8, F9 if time allows |
| Teachers | ≥3 | desktop or laptop | F1, F6 (teacher part), F7, then F11–F13 |
| Admin (team member) | 1 | desktop | F5 |

Do not recruit future pilot participants.

## B3. Running a session (45–60 min)

1. **Welcome (5 min)**: we are testing the prototype, not them. It is a clickable mock-up, so some
   things will not work. Ask them to think aloud.
2. **Consent (3 min)**: get written consent. Start recording only after consent, and only screen
   plus audio.
3. **Language**: ask which language they prefer, then open the participant link with `&lang=es` or
   `&lang=en`.
4. **Tasks (30–40 min)**: give one task at a time as a scenario (B4). Help only if the participant
   is stuck for more than 2 minutes or asks twice, and mark the task "with help" if you do.
5. **Error branches**: on the facilitator device, open the "Simular" state link (network error,
   limit reached, upload failure) and send it to the participant, or ask them to tap it. Say:
   "now imagine this happens".
6. **Comprehension questions (5 min)**: B5 (SC-002, SC-003).
7. **Wrap-up (3 min)**: ask what was confusing and what was useful. Stop the recording.

## B4. Tasks (derived from acceptance scenarios)

| Task | Flow | Scenario prompt (ES used in session) | Pass condition | Spec refs |
|---|---|---|---|---|
| S-1 | F2 | "Tienes dudas con 3x + 5 = 20. Pregunta al tutor y averigua de qué parte del material sale la respuesta." | Sends question, opens a citation, names document + page | US-01 AS1–3; S1 |
| S-2 | F3 | "Pregunta al tutor quién inventó el álgebra." | Recognises the tutor didn't answer from the material and picks a next step | US-01 AS4; S2 |
| S-3 | F4 | "Sigue preguntando hasta que el sistema te avise de algo." | Notices the low-allowance warning, understands the limit and when it resets | US-01 AS5–6 |
| S-4 | F8 | "Pide ayuda para resolver 2x − 4 = 10 sin que te den la solución directamente." | Uses "Otra pista" and reaches the end of the hints | US-05; S3 |
| S-5 | F9 | "Envía tu solución a este ejercicio y averigua en qué te has equivocado." | Submits and identifies the wrong step from the feedback | US-06; S4 |
| T-1 | F1 | "Sube el tema 3 y asegúrate de que el tutor no use el documento de ejercicios escaneado." | Uploads, sees the error, reviews fragments, toggles inclusion | US-02; T2 |
| T-2 | F6 | "Crea el curso de álgebra y consigue el código para tus alumnos." | Creates the course, copies the code | US-04; T1 |
| T-3 | F7 | "Haz que el tutor solo dé pistas, nunca la solución." | Selects hints only and saves (recovers from save failure) | US-03; T3 |
| A-1 | F5 | "Da de alta a una nueva profesora." | Creates the teacher and sees the pending invitation | US-07; P1 |

SC-004 timing: teachers complete T-2 + T-1 + T-3 within 10 minutes in total. Students go from the
join step in F6 to the first question in S-1 in under 2 minutes.

## B5. Comprehension questions

Students:

1. "¿Con quién estabas hablando?" — pass: says it's an AI (SC-002).
2. "¿Quién más puede ver tus conversaciones?" — pass: mentions the teacher (SC-002).
3. Show an answer: "¿De dónde sale esta respuesta?" — pass: names the document and page (SC-003).
4. Show a no-source reply next to a normal one: "¿Qué diferencia hay?" — pass: the material didn't
   cover it (SC-003).

Teachers:

1. "¿Qué material está usando ahora mismo el tutor?" — pass: points to the included documents.
2. "¿Qué verán tus estudiantes cuando pregunten algo que no está en el material?"

## B6. Session sheet

```text
Participant: P-__   Role: student / teacher / admin   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
...
Comprehension Q1–Q4: pass / fail each
Top 3 issues observed:
```

## B7. After each session

- Within 24 h, add findings to `specs/001-mvp-prototype/validation.md` using participant codes
  only. Record the finding, the page and state (link), the severity (critical / major / minor /
  cosmetic) and the affected spec IDs.
- Delete the recording once its findings are written, and note the deletion date on the session
  sheet.

## B8. After all sessions: deciding "validated"

1. Fill in the results table in `validation.md`:

| Criterion | Target | Result | Pass? |
|---|---|---|---|
| SC-001 unaided P1 task completion | ≥80% per task | | |
| SC-002 AI and teacher-review recall | ≥90% of students | | |
| SC-003 find source / tell no-source apart | ≥90% of students | | |
| SC-004 setup time / time to first question | <10 min / <2 min | | |
| SC-005 states and contrast coverage | 100% (axe sweep green) | | |
| SC-006 pedagogy sign-off and traceability | signed; flow tests green | | |
| SC-007 IMFAHE visible, ≤1 tap/click | yes | | |

2. For each critical or major finding: if it changes behavior, update `spec.md` first, then the
   prototype; if it is visual only, update the prototype. Log the decision and the spec revision.
3. Re-test changed P1 flows with at least 2 new participants if any critical finding was fixed.
4. When every criterion passes, set the cover status to **Validado** with date and version, and
   fill the spec's "Prototype pages" table with links (FR-052).
