# Data Model (as seen in the UI): DocentAI MVP Prototype

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04 · **Revised**: 2026-10-06 (validation, topics, corrections, learning record, adaptation; screens #33–#34, #27 renamed)

This document lists the information each screen **displays or collects**, from the user's point
of view. It is not a database schema. It is the input for the future API contract, which will be
generated from the backend's OpenAPI schema (Constitution VI). Field names are descriptive. The
"Visible to" column applies Constitution II (role separation) and VII (minimum data per view).

Screen numbers (#) refer to the pages table in [plan.md](plan.md#pages-and-states); the page path and
state IDs for each number are in [contracts/prototype-pages.md](contracts/prototype-pages.md).
Example values are fictitious; in the prototype they come from `assets/sample/{es,en}.json`.

## Entities

### User

| Field | Example (ES) | Shown on | Visible to |
|---|---|---|---|
| displayName | "Lucas Herrera" or "Estudiante-07" | shells, #16, #20, #23–27 (#27 = student detail) | self; teacher (own course students); admin |
| role | admin / teacher / student | #20 | admin |
| email | `lucas.h@example.org` | #1, #20, #21 | self; admin |
| accountStatus | active / pending invitation / disabled | #20, #21 | admin |
| preferredLanguage | es / en | `LanguageSwitcher` | self |

Rules: students are never shown other students' data (#6, #8 show only the student's own). A
teacher sees only students enrolled in their own courses.

### Course

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| name | "Matemáticas 3º ESO – Álgebra" | #6, #14, #16, #22 | teacher (owner), enrolled students, admin |
| description | optional text | #7 (confirm), #16 | same |
| teacherName | "Prof. Elena Ruiz Navarro" | #7, #6 | enrolled students, admin |
| studentCount | 24 | #14, #16, #22 | teacher (owner), admin |
| classCode | "ALG-7K3P" | #16 | teacher (owner) |
| invitationLink | `…/unirse/ALG-7K3P` | #16 | teacher (owner) |
| codeStatus | active / disabled | #16, #7 (error) | teacher (owner); student sees only "invalid/expired/disabled" error |
| createdAt | 4 oct 2026 | #14, #22 | teacher, admin |

Validation: name is required (1–80 characters).
State transitions: code `active → disabled`; `regenerate` makes the previous code invalid.

### Enrolment

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| course | → Course | #6 | student (own) |
| joinedAt | 5 oct 2026 | #16 | teacher (owner) |
| status | active / revoked | #6, #16, access-denied | student (own), teacher |

### MaterialDocument

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| fileName | "Tema 3 – Ecuaciones de primer grado.pdf" | #17, #18, citations | teacher; students see the name only inside citations |
| fileType | PDF / DOCX / Markdown | #17 | teacher |
| sizeLabel | "2,4 MB" | #17 | teacher |
| pageCount | 24 | #17 | teacher |
| processingStatus | uploading (with %) / processing / ready / error | #17 | teacher |
| errorReason | unsupported format / too large / no readable text | #17 | teacher |
| validationStatus | pending validation / validated / excluded | #17 (`ValidationStatus`) | teacher |
| validatedBy / validatedAt | "Prof. Elena Ruiz Navarro" · 6 oct 2026 | #17 | teacher |
| fragmentCount / excludedFragmentCount | 58 / 3 | #17, #18 | teacher |
| topics | → Topic (confirmed assignments) | #17, #34 | teacher |
| uploadedAt | 6 oct 2026 | #17 | teacher |

Validation: accepted types PDF, DOCX, MD; maximum size shown in the empty state (value to be set
by the backend; prototype shows "20 MB" as an illustrative value). Uploading a file with an
existing name prompts replace or keep both.
State transitions: `uploading → processing → ready | error`. A ready document's validation status
goes `pending validation → validated`, `pending validation | validated → excluded`, and
`excluded → validated` (validating it again). Only validated documents, minus their excluded
fragments, are used by the tutor (T2).
Derived UI state: the "no validated material" warning (`no-validated`) shows when no ready document
is validated; the unassigned-topics warning shows when a validated document or section has no
confirmed topic.

### Fragment

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| order | 12 | #18 | teacher |
| locationLabel | "p. 12" or "§ 3.2 Despejar la incógnita" | #18, #9 | teacher; student via citation |
| text | passage text | #18, #9 (quoted passage) | teacher; student only the cited passage |
| excluded | true / false | #18 ("Excluido" tag) | teacher |

State transitions: `included ⇄ excluded` (teacher, US2 AS6).

### Topic (new, US14)

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| name | "Ecuaciones de primer grado" | #33, #34, #17, #26, #27, #29, #30, #32 | teacher (owner); students see topic names in quizzes, feedback and progress |
| order | 1 | #33 | teacher |
| assignmentCount | 4 secciones | #33 (delete confirmation) | teacher |

Validation: name required, 1–60 characters, unique within the course.
Deleting a topic unassigns its documents and sections; past mistakes keep the name, marked
"(tema eliminado)".

### TopicAssignment (new, US14)

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| document / section | "Tema 3 – Ecuaciones…" · "§ 3.2 Despejar la incógnita" | #34 | teacher |
| topic | → Topic | #34, #17 | teacher |
| status | suggested / confirmed | #34 ("Sugerido" tag) | teacher |

State transitions: `suggested → confirmed`; `suggested → changed → confirmed`; `confirmed →
removed`. Only confirmed assignments count as assigned.

### TutorSettings

| Field | Values | Shown on | Visible to |
|---|---|---|---|
| level | e.g. "Básico", "Intermedio", "Avanzado" | #19; #8 tutor information | teacher (owner); enrolled students (read only) |
| tone | e.g. "Cercano", "Neutro", "Formal" | #19; #8 tutor information | teacher (owner); enrolled students (read only) |
| solutionPolicy | direct solutions allowed / hints first, then solution / hints only | #19; student sees its effect (#10) | teacher; student sees `GuidedModeIndicator` and "hints only" note |
| lastSavedAt | 6 oct 2026, 10:42 | #19 | teacher |

Defaults (pre-selected): level "Intermedio", tone "Cercano", "hints first, then solution".

### Conversation

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| course | → Course | #8, #23 | student (own), teacher (owner) |
| student | → User.displayName | #23, #24 | teacher (owner) |
| startedAt / lastMessageAt | 7 oct 2026, 18:05 | #23 | teacher |
| messageCount | 14 | #23 | teacher |
| hasNoSourceAnswers | true | #23 (marker) | teacher |
| topic | "Ecuaciones de primer grado" | #23 (filter) | teacher |

### Message

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| author | student / tutor | #8, #10, #24 | student (own), teacher (owner) |
| text | question or answer (may contain math notation) | #8, #10, #24 | same |
| kind | answer / hint / no-source / failed | #8, #10, #24 | same |
| hintNumber | 2 (and total, if known) | #10 | same |
| citations | list of Citation | #8, #10, #24 | same |
| sentAt | 18:07 | #8, #24 | same |
| countsTowardLimit | false for failed messages | #8 | student |
| flag | → TeacherFlag | #24, #25 | teacher: category and correction; student: correction only (`TeacherCorrection`, #8, #10, #12) |
| adaptation | → Adaptation (optional) | #8, #10, #24 | student (own), teacher (owner) |

State transitions for a student message: `sending → sent | failed`; `failed → retry → sending`.

### Citation

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| documentName | "Tema 3 – Ecuaciones…" | `SourceCitation` | anyone who can see the message |
| locationLabel | "p. 12" | `SourceCitation`, #9 | same |
| passage | quoted fragment text | #9 | same |
| available | false if the document or the fragment was later excluded | `SourceCitation` (unavailable variant: "Documento ya no disponible" / "Fragmento ya no disponible") | same |

### Adaptation (new, US16)

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| reason | "Te lo explico paso a paso porque esta semana has fallado al despejar variables" | `AdaptedBadge` on #8, #10, #24 | student (own), teacher (owner) |
| basis | list of learning-record entries (error type, count, topic) | `AdaptationSheet` | same |

Present only on adapted answers. What adaptation is based on is illustrative (spec Assumptions,
requirements OQ3); the prototype adapts only to recurring error types.

### DailyMessageAllowance

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| limit | 30 (illustrative) | `MessageAllowance` | student (own) |
| remaining | 12 | #8, #10, #11 | student (own) |
| state | normal / low (≤5) / reached | #8, #10, #11 | student (own) |
| resetsAt | 00:00 | `LimitReachedBanner` | student (own) |

Scope — **resolved 2026-10-04** (spec › Clarifications): one allowance per student, shared
across all their courses (requirements §4.3). Every course's chat and exercise pages show the
same count, and the copy says it covers all courses ("Te quedan 12 mensajes hoy, en todos tus
cursos").

### ExerciseSubmission and Feedback

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| problemStatement | "Resuelve 2(x − 3) = 4x + 2" | #11, #12, #23, #24 | student (own); teacher (owner) in conversations |
| workedAnswer | typed steps | #11, #12 | same |
| photo | optional image of handwritten work | #11 | same |
| status | draft / submitted / feedback pending / feedback ready / error | #11, #12 | student (own) |
| verdict | correct / incorrect / partially correct | #12 | student (own) |
| mistakeLocation | "Paso 2" | #12 | student (own) |
| errorType | → ErrorType ("Error de signo al quitar paréntesis") | #12 (`ErrorTypeTag`), #27, #32 | student (own), teacher (owner) |
| topic | → Topic | #12, #27, #32 | same |
| savedToRecord | true ("Guardado en tu progreso") | #12 | student (own) |
| correction | → TeacherFlag correction (optional) | #12 | student (own), teacher (owner) |
| explanation | text with citations, or no-source notice | #12 | student (own) |
| repeatedPattern | → ErrorPattern (optional) | #12 | student (own) |

Validation: problem and answer required unless a readable photo is attached; photo types JPG/PNG.

### ErrorType and ErrorPattern

An **error type** classifies one mistake (from the sample taxonomy). An **error pattern** is an
error type the same student repeats in the same topic, 3 or more times in the prototype; it
triggers the repeated-mistake notice (US12).

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| errorType | → ErrorType ("Error de signo al quitar paréntesis") | #12, #31, #26, #27, #32 | student (own); teacher (aggregated, and per student on #27) |
| occurrences | 3 | #12, #26 | same |
| topic | "Ecuaciones de primer grado" | #26 | teacher |
| lastSeenAt | 9 oct 2026 | #27 | teacher |

### AtRiskIndicator

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| student | → User.displayName | #26, #27 (`at-risk` state) | teacher (owner) |
| reasons | "Sin actividad en 7 días", "Tasa de error 60%" | #26, #27 | teacher |
| activitySeries | messages/exercises per week | #27 | teacher |
| exampleErrors | links to ErrorPattern / messages | #27 | teacher |

Constitution I: every at-risk item shows its reasons and data, never just a label.

### TeacherFlag

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| message | → Message | #24, #25 | teacher (owner) |
| category | incorrect / needs improvement | #24, #25 | teacher only |
| correction | required text | #24, #25; `TeacherCorrection` on #8, #10, #12 | teacher (owner); the student who received the answer |
| createdAt / updatedAt | 10 oct 2026 | #25; date in `TeacherCorrection` | teacher; student sees the date |

Validation: correction required (1–1000 characters).
State transitions: `none → flagged with correction → edited → removed`. Removing it removes the
student's "Revisado por tu profesor/a" marker. A save failure keeps the typed text (US8 AS7).

### QuizQuestion

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| text | "¿Cuál es la solución de 3x + 5 = 20?" | #28, #29 | teacher; student only when approved |
| options / correctAnswer | a) 3 b) 5 c) 15 | #28, #29 | teacher; student after answering |
| difficulty | easy / medium / hard | #28; student sees level change text | teacher; student (indirect) |
| topic | "Ecuaciones de primer grado" | #28, #30 | both |
| citation | → Citation | #28, #29 feedback | both |
| approvalStatus | pending / approved / rejected | #28 | teacher |

### QuizAttempt

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| questionCount / answered | 10 / 4 | #29 | student (own) |
| perQuestionResult | correct / incorrect + explanation | #29 | student (own) |
| difficultyChange | up / down, with reason ("Subimos el nivel porque has acertado 3 seguidas") | #29 (`DecisionReason`) | student (own) |
| scoreByTopic | Ecuaciones 4/5 | #30 | student (own) |

### LearningRecord and TopicProgress (P2, US13, US15)

One learning record per student and course. It is shown to the student on #32 and to their
teacher on #27, with the same fields and the same wording.

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| topic | "Sistemas de ecuaciones" | #32, #27 | student (own), teacher (owner) |
| masteryLevel | Empezando / En progreso / Dominado (illustrative, requirements OQ9) | #32, #27 (`MasteryLevel`) | same |
| masteryBasis | "Porque has resuelto bien 6 de los últimos 8 ejercicios" | #32, #27 (`DecisionReason`) | same |
| progressLabel | "6 de 10 ejercicios correctos" | #32, #27 | same |
| history | dated level changes and activity ("12 oct · Pasó a En progreso") | #32, #27 (`ProgressTimeline`) | same |
| errorTypes | error type + count + example link | #32, #27 (`ErrorTypeList`) | same |
| activity | sessions, exercises and quizzes completed in the selected period | #27 | teacher (owner) |
| lastUpdatedAt | 12 oct 2026, 18:40 | #32 | student (own) |

Rule: updated after every exercise and quiz (S7). The teacher's period selector (7 days, 30 days,
all) only filters the view.

### ConsentRecord

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| status | accepted / revoked / not yet given | #5, #13 | student (own) |
| acceptedAt | 5 oct 2026 | #13 | student (own) |
| revokedAt | — | #13 | student (own) |

State transitions: `not given → accepted → revoked → accepted`. While `revoked` or `not given`,
the student cannot reach the tutor (#8, #10, #11 redirect to #5).

## Relationships (summary)

- A Teacher owns many Courses; a Course has one Teacher.
- A Student has many Enrolments; each Enrolment links one Student and one Course.
- A Course has many MaterialDocuments; each document has many Fragments.
- A Course has many Topics; TopicAssignments link a document or section to a Topic.
- A Course has one TutorSettings.
- A Student has one Conversation per Course, made of Messages; tutor Messages have Citations,
  which point to Fragments.
- A Student has one DailyMessageAllowance, shared across all their Courses.
- A Student has ExerciseSubmissions (one Feedback each), ErrorPatterns, QuizAttempts and one
  LearningRecord (TopicProgress per Topic) per Course.
- A Teacher creates TeacherFlags, each with a correction, on Messages and Feedback in their own
  Courses; the student who received the answer sees the correction.
- A tutor Message may have one Adaptation, based on entries of the student's LearningRecord.
- QuizQuestions belong to a Course and topic; only approved ones appear in QuizAttempts.
