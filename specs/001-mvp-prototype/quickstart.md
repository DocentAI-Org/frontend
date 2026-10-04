# Quickstart: Running a Validation Session with the Prototype

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04

This guide explains how to run one moderated validation session with the DocentAI Figma
prototype and how to record the results. The protocol decisions are in
[research.md](research.md) R-15 to R-17.

## 1. Before the first session (once)

- [ ] The Figma file is complete for the flows you will test (F1–F5 at least), and the Cover page
      shows status "In validation".
- [ ] Every P1 screen has been checked in **ES** and **EN** modes; any layout breakage is logged
      on the Validation Notes page.
- [ ] The contrast table on the Design System page shows every pair passing AA (SC-005).
- [ ] The sample content has been checked: no name matches a team member or participant.
- [ ] A prototype share link with **view** access only has been created. It starts at the
      relevant flow, and comments are hidden from participants.
- [ ] Consent form ready (purpose, recording, storage, deletion, right to withdraw). Wording has
      been reviewed by whoever coordinates ethics for the project.
- [ ] Private storage folder for recordings is ready (team institutional storage, **not** the
      repo or Figma).
- [ ] The session sheet below has been copied for each participant code (P-S01…, P-T01…).

## 2. Participants

| Group | Number | Device | Flows |
|---|---|---|---|
| Students (adults) | ≥5 | own phone (Figma app or mobile browser) | F2, F3, F4, then F8, F9 if time allows |
| Teachers | ≥3 | desktop or laptop | F1, F6 (teacher part), F7, then F11–F15 happy paths |
| Admin (team member) | 1 | desktop | F5 |

Do not recruit future pilot participants (spec Assumptions).

## 3. Running a session (45–60 min)

1. **Welcome (5 min)**: explain that we are testing the prototype, not them; that it is a
   clickable mock-up, so some things will not work; and that they should think aloud.
2. **Consent (3 min)**: get written consent. Start recording only after consent, and only screen
   plus audio.
3. **Language**: ask which language they prefer. Run the session in that mode, switching with
   the prototype's language control.
4. **Tasks (30–40 min)**: give one task at a time, as a scenario and not as instructions (see
   section 4). Do not help unless the participant is stuck for more than 2 minutes or asks twice;
   if you do help, mark the task "with help".
5. **Error branches**: use the facilitator-only "Simular" panel to trigger network errors, the
   limit being reached or upload failures (R-15). Tell the participant "now imagine this
   happens".
6. **Comprehension questions (5 min)**: ask the questions in section 5. These measure SC-002 and
   SC-003.
7. **Wrap-up (3 min)**: ask an open question about what was confusing and what was useful. Stop
   the recording.

## 4. Tasks (derived from acceptance scenarios)

| Task | Flow | Scenario prompt for the participant (ES used in session) | Pass condition | Spec refs |
|---|---|---|---|---|
| S-1 | F2 | "Tienes dudas con 3x + 5 = 20. Pregunta al tutor y averigua de qué parte del material sale la respuesta." | Sends question, opens a citation, names document + page | US-01 AS1–3; S1 |
| S-2 | F3 | "Pregunta al tutor quién inventó el álgebra." | Recognises the tutor didn't answer from the material and picks a next step | US-01 AS4; S2 |
| S-3 | F4 | "Sigue preguntando hasta que el sistema te avise de algo." | Notices low-allowance warning, understands limit reached and when it resets | US-01 AS5–6 |
| S-4 | F8 | "Pide ayuda para resolver 2x − 4 = 10 sin que te den la solución directamente." | Uses "Otra pista" and reaches the end of the hints | US-05; S3 |
| S-5 | F9 | "Envía tu solución a este ejercicio y averigua en qué te has equivocado." | Submits and identifies the wrong step from the feedback | US-06; S4 |
| T-1 | F1 | "Sube el tema 3 y asegúrate de que el tutor no use el documento de ejercicios escaneado." | Uploads, sees the error, reviews fragments, toggles inclusion | US-02; T2 |
| T-2 | F6 | "Crea el curso de álgebra y consigue el código para tus alumnos." | Creates the course, copies the code | US-04; T1 |
| T-3 | F7 | "Haz que el tutor solo dé pistas, nunca la solución." | Selects hints only and saves (and recovers from save failure) | US-03; T3 |
| A-1 | F5 | "Da de alta a una nueva profesora." | Creates the teacher and sees the pending invitation | US-07; P1 |

Timing goal for SC-004: teachers complete T-2 + T-1 + T-3 within 10 minutes in total. For
students, the join step in F6 through to the first question in S-1 takes under 2 minutes.

## 5. Comprehension questions (after tasks)

Students:

1. "¿Con quién estabas hablando?" — pass: says it's an AI (SC-002).
2. "¿Quién más puede ver tus conversaciones?" — pass: mentions the teacher (SC-002).
3. Show an answer: "¿De dónde sale esta respuesta?" — pass: names document and page (SC-003).
4. Show a no-source reply next to a normal one: "¿Qué diferencia hay?" — pass: identifies that the
   material didn't cover it (SC-003).

Teachers:

1. "¿Qué material está usando ahora mismo el tutor?" — pass: points to the included documents.
2. "¿Qué verán tus estudiantes cuando pregunten algo que no está en el material?"

## 6. Session sheet (one per participant)

```text
Participant: P-__   Role: student / teacher / admin   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
...
Comprehension Q1–Q4: pass / fail each
Top 3 issues observed:
```

## 7. After each session

- Within 24 h, write findings on the **Validation Notes** page using participant codes only:
  finding, screen frame name, severity (critical / major / minor / cosmetic), affected spec IDs.
- Delete the recording once its findings are written, and note the deletion date on the
  session sheet.

## 8. After all sessions: deciding "validated"

1. Fill in the results table:

| Criterion | Target | Result | Pass? |
|---|---|---|---|
| SC-001 unaided P1 task completion | ≥80% per task | | |
| SC-002 AI and teacher-review recall | ≥90% of students | | |
| SC-003 find source / tell no-source apart | ≥90% of students | | |
| SC-004 setup time / time to first question | <10 min / <2 min | | |
| SC-005 states and contrast coverage | 100% | | |
| SC-006 pedagogy sign-off and traceability | signed | | |
| SC-007 IMFAHE visible, ≤1 tap/click | yes | | |

2. For each critical or major finding:
   - **If it changes behavior**: update `spec.md` first (`/speckit-clarify` or a spec edit),
     then Figma.
   - **If it is visual only**: update Figma.

   Log the decision and the spec revision on Validation Notes.
3. Re-test changed P1 flows with at least 2 new participants if any critical finding was fixed.
4. When every criterion passes, set the Cover status to **Validated**, record the date and
   version, and link the frames in the spec's "Figma frames" table (FR-052).
