# Data Model (as seen in the UI): DocentAI MVP Prototype

**Feature**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md) · **Date**: 2026-10-04

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
| displayName | "Lucas Herrera" or "Estudiante-07" | shells, #16, #20, #23–27 | self; teacher (own course students); admin |
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
| includedInKnowledgeBase | true / false | #17 | teacher |
| fragmentCount | 58 | #17, #18 | teacher |
| uploadedAt | 6 oct 2026 | #17 | teacher |

Validation: accepted types PDF, DOCX, MD; maximum size shown in the empty state (value to be set
by the backend; prototype shows "20 MB" as an illustrative value). Uploading a file with an
existing name prompts replace or keep both.
State transitions: `uploading → processing → ready | error`; `ready: included ⇄ excluded`.
Derived UI state: "all excluded" warning when no ready document is included.

### Fragment

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| order | 12 | #18 | teacher |
| locationLabel | "p. 12" or "§ 3.2 Despejar la incógnita" | #18, #9 | teacher; student via citation |
| text | passage text | #18, #9 (quoted passage) | teacher; student only the cited passage |

### TutorSettings

| Field | Values | Shown on | Visible to |
|---|---|---|---|
| level | e.g. "Básico", "Intermedio", "Avanzado" | #19 | teacher (owner) |
| tone | e.g. "Cercano", "Neutro", "Formal" | #19 | teacher (owner) |
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
| flag | → TeacherFlag | #24, #25 | teacher only (not shown to students) |

State transitions for a student message: `sending → sent | failed`; `failed → retry → sending`.

### Citation

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| documentName | "Tema 3 – Ecuaciones…" | `SourceCitation` | anyone who can see the message |
| locationLabel | "p. 12" | `SourceCitation`, #9 | same |
| passage | quoted fragment text | #9 | same |
| available | false if the document was later excluded | `SourceCitation` (unavailable variant) | same |

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
| problemStatement | "Resuelve 2(x − 3) = 4x + 2" | #11, #12 | student (own); teacher in conversations (P2) |
| workedAnswer | typed steps | #11, #12 | same |
| photo | optional image of handwritten work | #11 | same |
| status | draft / submitted / feedback pending / feedback ready / error | #11, #12 | student (own) |
| verdict | correct / incorrect / partially correct | #12 | student (own) |
| mistakeLocation | "Paso 2" | #12 | student (own) |
| explanation | text with citations, or no-source notice | #12 | student (own) |
| repeatedPattern | → ErrorPattern (optional) | #12 | student (own) |

Validation: problem and answer required unless a readable photo is attached; photo types JPG/PNG.

### ErrorPattern

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| name | "Error de signo al quitar paréntesis" | #12, #31, #26, #27 | student (own); teacher (aggregated) |
| occurrences | 3 | #12, #26 | same |
| topic | "Ecuaciones de primer grado" | #26 | teacher |
| lastSeenAt | 9 oct 2026 | #27 | teacher |

### AtRiskIndicator

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| student | → User.displayName | #26, #27 | teacher (owner) |
| reasons | "Sin actividad en 7 días", "Tasa de error 60%" | #26, #27 | teacher |
| activitySeries | messages/exercises per week | #27 | teacher |
| exampleErrors | links to ErrorPattern / messages | #27 | teacher |

Constitution I: every at-risk item shows its reasons and data, never just a label.

### TeacherFlag

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| message | → Message | #24, #25 | teacher (owner) |
| category | incorrect / needs improvement | #24, #25 | teacher |
| comment | optional text | #24, #25 | teacher |
| createdAt | 10 oct 2026 | #25 | teacher |

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
| currentDifficulty | "Subimos el nivel" message | #29 | student (own) |
| scoreByTopic | Ecuaciones 4/5 | #30 | student (own) |

### TopicProgress (P3)

| Field | Example | Shown on | Visible to |
|---|---|---|---|
| topic | "Sistemas de ecuaciones" | #32 | student (own) |
| progressLabel | "6 de 10 ejercicios correctos" | #32 | student (own) |
| basis | quizzes completed, exercises correct | #32 | student (own) |

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
- A Course has one TutorSettings.
- A Student has one Conversation per Course, made of Messages; tutor Messages have Citations,
  which point to Fragments.
- A Student has one DailyMessageAllowance, shared across all their Courses.
- A Student has ExerciseSubmissions (one Feedback each), ErrorPatterns, QuizAttempts and
  TopicProgress per Course.
- A Teacher creates TeacherFlags on Messages in their own Courses.
- QuizQuestions belong to a Course and topic; only approved ones appear in QuizAttempts.
