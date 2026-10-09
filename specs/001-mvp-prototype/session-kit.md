# Session Kit: DocentAI MVP Prototype

**Feature**: [spec.md](spec.md) · **Run guide**: [quickstart.md](quickstart.md) · **Notes**: [validation.md](validation.md)

Templates for task T107. **They contain no personal data and must stay that way.** Copy them to
the team's private storage before each session and fill in the copies there: filled session
sheets, signed consent forms and recordings never go into this repository (Constitution VII,
research R-18).

Before using this kit:

- [ ] Deploy a preview and replace `{PREVIEW}` with its URL (for example `https://docentai-git-001-….vercel.app`).
- [ ] Check whether Vercel Deployment Protection is on for previews. If it is, create a shareable
      link or a protection bypass for this deployment, otherwise participants will hit a Vercel login.
- [ ] Open every participant link once on a phone and once on a laptop.
- [ ] Have the consent form below reviewed and approved by whoever coordinates ethics.
- [ ] Prepare the private recording folder.
- [ ] Re-check that no sample name matches a participant (validation.md › Open items).
- [ ] Only then set the cover status in `public/prototype/index.html` to "En validación".

## 1. Links per flow

- **Participant link**: `?panel=0` hides the prototype panel for the whole browser session.
- **Facilitator link**: shows the panel ("Prototipo" pill), with every state of the page.
- **Simular**: error and limit branches to open on the facilitator device or send to the participant
  ("ahora imagina que pasa esto", quickstart B3).
- Add `&lang=en` to any link for English.

| Flow | Name | Role | Width | Participant link | Facilitator link | Simular |
|---|---|---|---|---|---|---|
| F1 | Subir y validar el material del curso | Teacher | 1440 | `{PREVIEW}/prototype/teacher/courses.html?panel=0` | `{PREVIEW}/prototype/teacher/courses.html` | `{PREVIEW}/prototype/teacher/material.html?state=file-error`<br>`{PREVIEW}/prototype/teacher/material.html?state=error` |
| F2 | Preguntar al tutor y ver las fuentes | Student | 390 | `{PREVIEW}/prototype/auth/sign-in.html?panel=0` | `{PREVIEW}/prototype/auth/sign-in.html` | `{PREVIEW}/prototype/student/chat.html?state=load-error` |
| F3 | El material no cubre la pregunta | Student | 390 | `{PREVIEW}/prototype/student/chat.html?state=answer&panel=0` | `{PREVIEW}/prototype/student/chat.html?state=answer` | — |
| F4 | Límite diario de mensajes | Student | 390 | `{PREVIEW}/prototype/student/chat.html?state=low-allowance&panel=0` | `{PREVIEW}/prototype/student/chat.html?state=low-allowance` | `{PREVIEW}/prototype/student/chat.html?state=limit-reached`<br>`{PREVIEW}/prototype/student/exercise.html?state=limit-reached` |
| F5 | Tareas mínimas de administración | Admin | 1440 | `{PREVIEW}/prototype/auth/sign-in.html?panel=0` | `{PREVIEW}/prototype/auth/sign-in.html` | `{PREVIEW}/prototype/admin/users.html?state=error` |
| F6 | Crear un curso y unirse | Teacher → Student | 1440 / 390 | `{PREVIEW}/prototype/teacher/course-new.html?panel=0` | `{PREVIEW}/prototype/teacher/course-new.html` | `{PREVIEW}/prototype/student/join.html?state=expired-code` |
| F7 | Configurar el tutor | Teacher | 1440 | `{PREVIEW}/prototype/teacher/tutor-settings.html?panel=0` | `{PREVIEW}/prototype/teacher/tutor-settings.html` | `{PREVIEW}/prototype/teacher/tutor-settings.html?state=save-failed` |
| F8 | Modo guiado | Student | 390 | `{PREVIEW}/prototype/student/chat-guided.html?panel=0` | `{PREVIEW}/prototype/student/chat-guided.html` | `{PREVIEW}/prototype/student/chat-guided.html?state=hints-done-hints-only`<br>`{PREVIEW}/prototype/student/chat-guided.html?state=limit-reached` |
| F9 | Corrección de un ejercicio | Student | 390 | `{PREVIEW}/prototype/student/exercise.html?panel=0` | `{PREVIEW}/prototype/student/exercise.html` | `{PREVIEW}/prototype/student/exercise.html?state=unreadable-photo`<br>`{PREVIEW}/prototype/student/exercise-feedback.html?state=no-source` |
| F10 | Errores de acceso y sesión | All | 390 / 1440 | `{PREVIEW}/prototype/auth/sign-in.html?panel=0` | `{PREVIEW}/prototype/auth/sign-in.html` | `{PREVIEW}/prototype/auth/sign-in.html?state=session-expired&next=../student/chat.html` |
| F11 | Revisar conversaciones y marcar respuestas | Teacher | 1440 | `{PREVIEW}/prototype/teacher/conversations.html?panel=0` | `{PREVIEW}/prototype/teacher/conversations.html` | — |
| F12 | Panel y estudiantes en riesgo | Teacher | 1440 | `{PREVIEW}/prototype/teacher/dashboard.html?panel=0` | `{PREVIEW}/prototype/teacher/dashboard.html` | `{PREVIEW}/prototype/teacher/dashboard.html?state=not-enough-data` |
| F13 | Revisar preguntas de cuestionario | Teacher | 1440 | `{PREVIEW}/prototype/teacher/questions.html?panel=0` | `{PREVIEW}/prototype/teacher/questions.html` | — |
| F14 | Cuestionario adaptativo | Student | 390 | `{PREVIEW}/prototype/student/quiz.html?panel=0` | `{PREVIEW}/prototype/student/quiz.html` | — |
| F15 | Ayuda con errores repetidos y progreso | Student | 390 | `{PREVIEW}/prototype/student/exercise-feedback.html?state=repeated-mistake&panel=0` | `{PREVIEW}/prototype/student/exercise-feedback.html?state=repeated-mistake` | — |

Demo sign-in for F2, F5 and F10: the sign-in page has one demo button per role. With the form,
`lucas.herrera@example.org`, `elena.ruiz@example.org` and `admin@example.org` sign in as student,
teacher and admin (any password); any other email shows the invalid-credentials error. Join codes
for F6: `ALG-7K3P` valid, `ALG-4X2B` expired, `ALG-8M1D` disabled, anything else invalid.

## 2. Task cards (read aloud or print, one per card)

| Card | Flow | Prompt (ES) | Prompt (EN) |
|---|---|---|---|
| S-1 | F2 | Tienes dudas con 3x + 5 = 20. Pregunta al tutor y averigua de qué parte del material sale la respuesta. | You're stuck on 3x + 5 = 20. Ask the tutor and find out which part of the material the answer comes from. |
| S-2 | F3 | Pregunta al tutor quién inventó el álgebra. | Ask the tutor who invented algebra. |
| S-3 | F4 | Sigue preguntando hasta que el sistema te avise de algo. | Keep asking until the system warns you about something. |
| S-4 | F8 | Pide ayuda para resolver 2x − 4 = 10 sin que te den la solución directamente. | Ask for help solving 2x − 4 = 10 without being given the answer straight away. |
| S-5 | F9 | Envía tu solución a este ejercicio y averigua en qué te has equivocado. | Send your solution to this exercise and find out where you went wrong. |
| T-1 | F1 | Sube el tema 3 y asegúrate de que el tutor no use el documento de ejercicios escaneado. | Upload unit 3 and make sure the tutor doesn't use the scanned exercise sheet. |
| T-2 | F6 | Crea el curso de álgebra y consigue el código para tus alumnos. | Create the algebra course and get the code for your students. |
| T-3 | F7 | Haz que el tutor solo dé pistas, nunca la solución. | Make the tutor give hints only, never the solution. |
| A-1 | F5 | Da de alta a una nueva profesora. | Add a new teacher account. |

Comprehension questions are in quickstart.md B5.

## 3. Consent form (DRAFT — for ethics review, not approved)

> Fill in the bracketed parts and have the whole text approved before the first session.

**Prueba de un prototipo de DocentAI — consentimiento para participar**

- **Para qué**: estamos probando un prototipo de DocentAI, una herramienta de tutoría con
  inteligencia artificial. Queremos saber si las pantallas se entienden. Evaluamos el prototipo,
  no a ti.
- **Qué harás**: unas tareas cortas con el prototipo mientras dices en voz alta lo que piensas,
  y unas preguntas al final. Dura entre 45 y 60 minutos.
- **Qué se graba**: solo la pantalla y el audio, y solo si das tu permiso abajo. No se graba tu cara.
- **Dónde se guarda y cuánto tiempo**: en el almacenamiento privado de [institución]. La grabación
  se borra cuando hayamos anotado las conclusiones, como máximo [plazo]. Las notas usan un código
  (por ejemplo P-S01), nunca tu nombre.
- **Es voluntario**: puedes dejar la sesión o retirar tu consentimiento en cualquier momento, sin
  dar explicaciones. Si lo retiras, borramos tu grabación y tus notas.
- **Datos ficticios**: todo lo que verás en el prototipo es inventado. No introduzcas datos personales.
- **Contacto**: [persona responsable] — [correo institucional].

☐ Acepto participar en la sesión.
☐ Acepto que se grabe la pantalla y el audio.

Código de participante: ______   Fecha: ______   Firma: ______

## 4. Session sheets

### P-S01 (student)

```text
Participant: P-S01   Role: student   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
S-2  |                                        |      |                      |
S-3  |                                        |      |                      |
S-4  |                                        |      |                      |
S-5  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail   Q3: pass / fail   Q4: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-S02 (student)

```text
Participant: P-S02   Role: student   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
S-2  |                                        |      |                      |
S-3  |                                        |      |                      |
S-4  |                                        |      |                      |
S-5  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail   Q3: pass / fail   Q4: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-S03 (student)

```text
Participant: P-S03   Role: student   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
S-2  |                                        |      |                      |
S-3  |                                        |      |                      |
S-4  |                                        |      |                      |
S-5  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail   Q3: pass / fail   Q4: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-S04 (student)

```text
Participant: P-S04   Role: student   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
S-2  |                                        |      |                      |
S-3  |                                        |      |                      |
S-4  |                                        |      |                      |
S-5  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail   Q3: pass / fail   Q4: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-S05 (student)

```text
Participant: P-S05   Role: student   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
S-1  |                                        |      |                      |
S-2  |                                        |      |                      |
S-3  |                                        |      |                      |
S-4  |                                        |      |                      |
S-5  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail   Q3: pass / fail   Q4: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-T01 (teacher)

```text
Participant: P-T01   Role: teacher   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
T-1  |                                        |      |                      |
T-2  |                                        |      |                      |
T-3  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-T02 (teacher)

```text
Participant: P-T02   Role: teacher   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
T-1  |                                        |      |                      |
T-2  |                                        |      |                      |
T-3  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-T03 (teacher)

```text
Participant: P-T03   Role: teacher   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
T-1  |                                        |      |                      |
T-2  |                                        |      |                      |
T-3  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail
Top 3 issues observed:
1.
2.
3.
```
### P-A01 (admin)

```text
Participant: P-A01   Role: admin   Device: ______   Language: ES / EN
Date: ____   Facilitator: ____   Note-taker: ____   Consent signed: yes / no
Recording started after consent: yes / no   Recording deleted on: ____

Task | Result (unaided / with help / failed) | Time | Errors / hesitations | Quote
A-1  |                                        |      |                      |
Comprehension Q1: pass / fail   Q2: pass / fail
Top 3 issues observed:
1.
2.
3.
```

