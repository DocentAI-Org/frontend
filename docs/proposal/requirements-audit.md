# Requirements Audit: Proposal Scope and Differentiation

**Date**: 2026-10-06
**Scope**: Do DocentAI's requirements capture what the funded proposal says makes DocentAI different?
**Sources audited**

| Short name | File |
|---|---|
| PDF | `frontend/docs/proposal/Project Description - DocentAI.pdf` (cited by section and page) |
| REQ | `knowledge-base/docs/requirements.md` (cited as `REQ:line`) |
| SPEC | `frontend/specs/001-mvp-prototype/spec.md` (cited as `SPEC:line`) |
| CONST | `frontend/.specify/memory/constitution.md` (cited as `CONST:line`) |
| BUDGET | `knowledge-base/docs/budget.md`, used only to explain constraint changes (cited as `BUDGET:line`) |

No source file was edited. This report is the only output.

---

## Headline finding

**The Must-have set describes a generic grounded tutor.** All eight M requirements (T1, T2, T3, S1, S2, S3, S4, P1; `SPEC:9`) fail the genericity test in Step 3: comparable features already exist in NotebookLM (choosing sources, citations, "not in your sources"), custom GPTs and ChatGPT with files (teacher instructions, feedback on a worked answer) and Khanmigo (Socratic hints, classes). Only four requirements show the proposal's differentiation, and none of them is an M:

- T5 recurring-errors dashboard (S)
- T6 teacher flagging (S)
- T7 teacher approval of quiz items (S)
- S5 error-pattern detection (S)

Of the three things the proposal says DocentAI does beyond "answering questions about documents":

- **Detecting mistakes** is an M (S4).
- **Adapting explanations to each student** has no requirement.
- **Continuously tracking individual progress** is a Could (S7, P3).

If the team builds only the M set for the 1 December 2026 progress report (`REQ:11`), the demo cannot be told apart from ChatGPT-with-files.

---

## Step 1: Claims extracted from the proposal

Every quote is verbatim from the PDF.

| ID | Claim | Quote (PDF location) |
|---|---|---|
| C1 | Teacher-guided system with personalisation and curriculum alignment | "DocentAI, is a teacher-guided AI system designed to deliver personalised learning experiences while ensuring full alignment with formal curricula." (§2, p.1) |
| C2 | Curriculum alignment: responses consistent with curriculum objectives | "These resources are integrated through a retrieval-based architecture, ensuring that all AI-generated responses remain consistent with curriculum objectives." (§2, p.1). Problem framing: "These systems are not aligned with specific curricula, lack pedagogical supervision, and often provide content that is inconsistent with classroom objectives." (§1, p.1) |
| C3 | Teachers **select, curate and validate** the knowledge base | "A central component of the system is a controlled knowledge base, where teachers actively select, curate, and validate materials such as textbooks and course content." (§2, p.1) |
| C4 | Goes further than document Q&A (1): **detecting mistakes** | "Unlike most existing tools, which simply answer questions about documents, it goes further: detecting mistakes, adapting explanations to each student, and continuously tracking individual progress." (§2, p.1) |
| C5 | Goes further (2): **adapting explanations to each student** | Same sentence as C4. Also: "the system provides personalised and adaptive support to students while generating actionable insights for teachers." (§2, p.1) |
| C6 | Goes further (3): **continuously tracking individual progress** | Same sentence as C4. |
| C7 | Captures individual learning behaviours: recurring mistakes, **learning pace and style** | "current solutions do not fully capture individual learning behaviours, such as recurring mistakes or differences in learning pace and style." (§1, p.1) |
| C8 | Augmented educator: AI personalises at scale and the teacher keeps control, judgment and purpose | "DocentAI is not designed to replace teachers, but to turn them into augmented educators – expanding what they can do. AI handles personalisation and feedback at scale, while the teacher retains control, judgment, and educational purpose." (§2, p.1) |
| C9 | Key differentiator: teacher at the core of **content validation and pedagogical supervision** | "The key differentiating factor of this project lies in its teacher-centred approach. By placing educators at the core of the system, both in content validation and pedagogical supervision, the solution ensures a level of reliability, transparency, and alignment that is not commonly found in existing tools" (§2, p.2). Competitors "lack direct teacher control over the content" (§2, p.2). |
| C10 | **Transparency in decision-making** | "Such a solution must not only leverage the capabilities of AI but also ensure alignment with curricula, active teacher involvement, deep personalisation, and transparency in decision-making." (§1, p.1) |
| C11 | Detects error patterns, then gives targeted explanations **and** tailored practice | "when a student repeatedly makes errors in isolating variables in algebra exercises, the system detects this pattern and delivers targeted explanations and tailored practice tasks." (§2, p.1) |
| C12 | Teacher dashboard aggregates insights across students for **timely, data-informed classroom interventions** | "At the same time, the teacher dashboard aggregates these insights across students, enabling timely and data-informed classroom interventions." (§2, p.1). Also: "empower teachers with data-driven insights to support more effective decision-making." (§1, p.1) |
| C13 | Adaptive quizzes for exam preparation, with immediate, **specific** feedback | "During exam preparation, students receive adaptive quizzes that dynamically adjust in difficulty and provide immediate, specific feedback, improving both efficiency and confidence." (§2, p.1) |
| C14 | Learning KPIs: pre/post-test, **mastery rates**, fewer recurring errors | "Learning outcomes will be assessed through improvements in pre- and post-test scores, mastery rates, and reductions in recurring errors." (§2, p.1) |
| C15 | Engagement KPIs | "Student engagement will be measured through interaction frequency, task completion rates, and time on task." (§2, p.1) |
| C16 | Teaching KPIs: workload, feedback cycles, at-risk detection | "Teaching effectiveness will be evaluated based on reduced workload, faster feedback cycles, and the system's ability to identify at-risk students." (§2, p.2) |
| C17 | Adoption KPIs: satisfaction, usefulness, trust | "Adoption metrics will include user satisfaction, perceived usefulness, and trust in AI-generated support." (§2, p.2) |
| C18 | MVP limited to one subject and one educational context | "beginning with the design of a minimum viable product (MVP) focused on a specific subject area and educational context." (§2, p.1) |
| C19 | Retrieval-based, modular and scalable, ready to expand | "The platform will be built using scalable cloud infrastructure and a modular architecture, allowing future expansion across subjects, educational levels, and geographic contexts." (§2, p.1) |
| C20 | MVP scale: 60 students × 15 messages a day; 2 validation cohorts; GDPR review | "5.4M tokens/mo (60 students x 15 msg/day x 200 tok/msg)"; "Compensation for participants (2 validation cohorts)"; "Security review (GDPR) — Audit of data handling and privacy practices" (§4, p.2) |
| C21 | Positioning: complements formal education rather than replacing it | "positioning it as a specialised and complementary solution for formal education." (§2, p.2) |
| C22 | Impact claims that are not product behaviour | "increase student engagement by aligning learning methods with contemporary digital environments"; "promoting more equitable access to high-quality learning tools" (§1, p.1) |

The budget table also lists "Resend — Email notifications" and "Miscellaneous design — Onboarding flows, teacher analytics dashboard" (§4, p.2) but does not say what the notifications are for (see OQ8).

---

## Step 2: Traceability matrix

Ratings:

- **Cov**: Covered.
- **Part**: Partial.
- **Miss**: Missing.
- **MisP**: Mis-prioritised.

| Claim | REQ | SPEC | Rating | Evidence and gap |
|---|---|---|---|---|
| C1 Teacher-guided, personalised, aligned | T2, T3, T7 (`REQ:34-39`) | US2, US3, US10 | **Part** | Teacher control over content and tutor settings exists. Personalisation is almost absent from the M set (see C5 and C6). |
| C2 Curriculum objectives | S1 (`REQ:44`), only grounding in material | US1 | **Part** | S1 grounds answers in the material, which is how the proposal says alignment is achieved (C2 quote). No requirement records what the objectives are. "Topic" drives T5, S6, S7, the quiz items and the error taxonomy (`REQ:37`, `REQ:111`, `SPEC:220`), yet no requirement says who defines the topic list. See OQ1. |
| C3 Select, curate, **validate** | T2 "**include or exclude** each document" (`REQ:34`) | US2 AS5 toggle (`SPEC:63`); FR-021 (`SPEC:321`) | **Part** | Include/exclude per document is source selection, not validation. The teacher can view fragments but cannot exclude or approve them, and nothing records that the material was validated, when, or by whom. CONST I already asks for more than REQ and SPEC deliver: "the teacher-validated material" and "Teachers MUST be able to view, review and validate the material" (`CONST:13-17`). |
| C4 Detecting mistakes | S4 M (`REQ:47`) | US6 (`SPEC:127-144`) | **Cov** | Testable: "feedback on the specific mistake". Two gaps: mistakes are detected only in submitted exercises, and S4 does not say the mistake is classified or recorded. §5 requires classification for the KPI ("Each error classified by **type**", `REQ:111`), but no functional requirement produces it. |
| C5 Adapting explanations **to each student** | T3 is per course (`REQ:35`); S5 is S (`REQ:48`) | US3 is per course; US12 | **Miss** (only S5 is near it) **+ MisP** | T3 sets level, tone and solution policy for the whole course. No requirement makes an explanation depend on the individual student's record. S5 adapts only after a repeated error is detected, and it is an S. |
| C6 Continuously tracking individual progress | S7 **C** (`REQ:50`) | US13 **P3** (`SPEC:264-277`), FR-036 "MAY" (`SPEC:336`) | **MisP + Part** | One of the three named differentiators is a Could. Teachers have no per-student progress view: US9 opens only students flagged as at risk (`SPEC:203`). |
| C7 Recurring mistakes, pace, style | S5, T5, §5 error taxonomy | US9, US12 | Recurring mistakes **Cov**; pace **Miss**; style **Miss** | §5 logs session timestamps and time on task (`REQ:112`), but no requirement uses them to show or adapt to pace. "Style" is not mentioned anywhere. See OQ2. |
| C8 Teacher keeps control and **judgment** | T2, T3, T7 | US2, US3, US10 | **Part** | The teacher controls inputs (material, settings, quiz items). The teacher cannot exercise judgment over the AI's conclusions about students: no requirement lets them confirm or dismiss an at-risk flag or error pattern (T5 `REQ:37`, US9 `SPEC:190-204` are read-only). |
| C9 Content validation + **pedagogical supervision** | T4 S, T6 S (`REQ:36,38`) | US8 **P2** (`SPEC:170-187`) | **Part + MisP** | T6: the flag "feeds the evaluation" (`REQ:38`). The supervision loop stays open: the student who received the wrong answer never sees the teacher's correction, and the tutor does not change. US8 AS3 shows flags "with status", but no requirement defines what the status changes to. The core differentiator is an S. Content validation: see C3. |
| C10 Transparency in decision-making | §4.1 "students know they are talking to an AI" (`REQ:70`); T4 "transparency agreed with the students" (`REQ:36`) | FR-010/011 (`SPEC:312-313`), US9 AS2 (`SPEC:203`), CONST I (`CONST:18`) | **Part** | REQ uses "transparency" only for privacy and AI disclosure. Nothing asks the system to explain its decisions: why difficulty changed (US11 AS3 says *that* it changed, `SPEC:240`), why a pattern was flagged, why an explanation was adapted. US9 AS2 and CONST I cover only teacher-facing flags. See OQ4. |
| C11 Pattern, then targeted explanation **and** practice | S5 S (`REQ:48`) | US12 (`SPEC:246-260`) | **Cov** (minor) | Testable. S5 says "explanations **or** practice", the proposal says "and"; the spec offers both (`SPEC:258`). Depends on S4 classifying errors (see C4). |
| C12 Aggregated insights, **timely** classroom interventions | T5 S (`REQ:37`) | US9 (`SPEC:190-204`) | **Part** | Aggregation by topic and student is covered, with a time range (`SPEC:202`). "Timely" is not specified: no default recent window, no notion of what is new since the teacher last looked. "Interventions" are not supported: the dashboard does not show how many students share an error or example errors per topic group (examples appear only for at-risk students, `SPEC:203`). |
| C13 Adaptive quizzes, immediate **specific** feedback, exam prep | S6 S, T7 S (`REQ:39,49`) | US10, US11 | **Cov** (minor) | T7 (teacher approves AI quiz items) is genuinely DocentAI-specific. "Specific" feedback and "exam preparation" are weaker: the feedback is "short explanation, citation" (`SPEC:239`), and nothing scopes a quiz to an upcoming exam. |
| C14 Pre/post, **mastery rates**, recurring errors | P3 S (`REQ:57`), §5 (`REQ:110-111`) | Out of scope (`SPEC:438`) | Pre/post **Cov**; mastery **Miss**; recurring errors **Cov** | "Topic mastery" appears only as data to log (`REQ:110`). Mastery is not defined anywhere, and the only user-facing progress view (S7) is a C. The educational stream must still define study metrics (`REQ:24`). |
| C15 Engagement KPIs | P2, §5 (`REQ:56,112`) | n/a (backend) | **Cov** | Data capture is specified. |
| C16 Workload, feedback cycles, at-risk | T5; §5 (`REQ:113-114`) | US9 | At-risk **Part**; workload and feedback **Part** | Nobody owns the at-risk criteria. "Faster feedback cycles" is measured by "System response times" (`REQ:113`), a weak proxy (OQ5). Workload is measured only by a teacher survey (OQ6). |
| C17 Satisfaction, usefulness, trust | P4 S (`REQ:58`) | Out of scope (`SPEC:438`) | **Cov** | n/a |
| C18 One subject and context | §2 topic open (`REQ:18`) | Algebra placeholder (`SPEC:436`) | **Cov**, with open decisions | Undecided: the topic (one poll option is language learning) and the context. REQ says adults (`REQ:19`), CONST says possibly minors (`CONST:5-7`), and the proposal says "formal education" (OQ10). |
| C19 Retrieval-based, modular, expandable | §4.3, §4.5, §4.6 (`REQ:84,95-101`) | n/a | **Cov** | n/a |
| C20 60 students × 15 msg/day | §1 "$1,000 total budget" (`REQ:9`), §4.3 daily limit (`REQ:82`) | Placeholder "30 messages/day" (`SPEC:434`) | **Cov** (re-scoped), **inconsistent** | After the $1,000 grant, BUDGET plans for 30 students × 10 messages/day (`BUDGET:80-82`). The spec's placeholder of 30 a day is above both figures (see Step 4, SC3). |
| C21 Complementary to formal education | Implied by T-requirements | n/a | **Cov** | n/a |
| C22 Engagement and equity impact | none | n/a | n/a | Impact statements, not product behaviour. No requirement is expected. |

**Tally** (C22 excluded): 9 Covered (C11 and C13 with minor gaps; the rest are mostly KPI, architecture and constraint claims), 9 Partial (C1, C2, C3, C6, C8, C9, C10, C12, C16), 3 with a Missing component (C5, C7 pace and style, C14 mastery), and 3 Mis-prioritised (C5, C6, C9). Some claims carry more than one rating. Most of the Covered claims are not differentiators. Most of the Partial ones are.

---

## Step 3: Genericity test

The test asks: "Would this sentence be equally true of a generic RAG chatbot or a competitor (ChatGPT tools, Khanmigo, Duolingo, NotebookLM)?"

### Functional requirements (REQ §3)

| ID | Prio | Verdict | What is missing to make it DocentAI-specific |
|---|---|---|---|
| T1 | M | Generic (acceptable enabler) | Nothing. Enrolment is plumbing and does not need to differentiate. |
| T2 | M | **Generic** | Picking which sources to include is what NotebookLM does. Missing: the teacher validates (records an approval, with status and date), the teacher curates at fragment level, and unvalidated material is never used. |
| T3 | M | **Generic** | Custom GPT instructions, and Khanmigo's teacher settings, do the same. The DocentAI-specific part, that students see these are their teacher's decisions, appears only in SPEC (US5 AS1/AS3, `SPEC:120,122`), not in REQ. Also missing: anything that varies per student. |
| T4 | S | Generic | Teacher visibility of student chats is common in classroom AI tools. Missing: what the teacher can do after reviewing (see T6). |
| T5 | S | Partly specific | Errors classified by a pedagogy-team taxonomy is specific. Missing: the share of the class affected, example errors, a "since last class" window, and teacher override of flags. |
| T6 | S | Partly specific | A thumbs-down flag is generic. Missing: the correction reaches the student, the teacher writes the correct answer, and the flag has a defined effect beyond the evaluation set. |
| T7 | S | **Specific** | This is the clearest "validate" requirement in REQ: no AI item reaches students without teacher approval. |
| S1 | M | **Generic** | NotebookLM cites sources. Missing: the source is **teacher-validated** material, which CONST I already says (`CONST:13-14`). |
| S2 | M | **Generic** | "Not in the sources" refusals are standard grounded behaviour. |
| S3 | M | Generic, with one specific clause | Socratic hinting is Khanmigo's core feature. "as configured in T3" is the specific part, because the teacher decides. Note that the proposal never mentions hints or Socratic mode (see Step 4). |
| S4 | M | **Generic** | ChatGPT gives feedback on a pasted solution. Missing: the mistake is classified by type and topic, kept in the student's record, and visible to the teacher. That record would turn feedback into tracking. |
| S5 | S | Partly specific | Missing: who owns the patterns (the taxonomy, `REQ:111`), the teacher seeing them, and "and practice" rather than "or". |
| S6 | S | **Generic** | Adaptive difficulty is what Duolingo does. It becomes specific only through T7, plus exam scoping by the teacher and feedback tied to error type. |
| S7 | C | **Generic** | Every learning app shows progress. Missing: tracking that updates continuously from every activity, a mastery definition, and the teacher seeing the same record. |
| P1 | M | Generic (enabler) | n/a |
| P2 | M | Generic (enabler) | n/a |
| P3, P4, P5 | S | Study-specific | Fine as written. They exist for the proposal's KPIs. |

### Non-functional requirements (REQ §4–§5)

| Section | Verdict | Note |
|---|---|---|
| §4.1 Privacy, §4.2 Security, §4.3 Cost, §4.5 Portability, §4.6 Other | Generic | Expected for NFRs. NFRs are not where differentiation belongs, so this is not a defect. One exception: §4.1's "Transparency" bullet (`REQ:70`) is the only place REQ uses the word, and it means privacy disclosure, not decision transparency (C10). |
| §4.4 Pedagogical and RAG quality | Partly specific | Building the evaluation set "with the teacher" (`REQ:90`) is teacher-centred. Missing: T6 flags feeding the evaluation set is mentioned only in T6 itself and the risks table (`REQ:135`). |
| §5 KPI data | Specific | Maps directly to C14–C17. This is the most proposal-faithful section of REQ. |

### Spec inheritance

SPEC inherits the genericity of REQ (FR-012, FR-013, FR-021, FR-022, FR-031 to FR-036). In three places the spec differentiates **more** than REQ, and REQ should catch up:

- `SPEC:122`: the UI explains that "the teacher has chosen hints only".
- `SPEC:203`: an at-risk flag shows the indicators behind it.
- `SPEC:313`: students are told that their teacher may review conversations.

---

## Step 4: Scope creep check

Items the proposal does not support, or that go beyond the MVP's single subject, budget and student numbers. No new features are proposed here.

| # | Item | Where | Why it is out of proportion | Severity |
|---|---|---|---|---|
| SC1 | **Full English localisation from the MVP** | CONST VIII (`CONST:102-111`), FR-002 (`SPEC:304`) | The proposal supports *future* expansion across "geographic contexts" (C19). REQ asks only for a Spanish MVP with strings "kept ready for translation" (`REQ:101`). A complete EN version, with CI failing on missing keys, doubles copy and validation work in a pilot that runs entirely in Spanish. | Medium |
| SC2 | **Photo of handwritten work** in exercise submission | US6 AS1 (`SPEC:139`), FR-033 (`SPEC:333`) | Not in S4 (`REQ:47`) or the proposal. It needs a vision-capable model, which the 200-token-per-message LLM budget (C20) and the re-scoped $330 LLM line (BUDGET) do not cover. The spec already admits it can be dropped (`SPEC:435`). | Medium |
| SC3 | **Placeholder daily limit of 30 messages** | `SPEC:434` | Twice the proposal's 15 (C20) and three times BUDGET's 10 (`BUDGET:82`). Showing 30 in validation sessions sets the wrong expectation and invites feedback about a limit that will not exist. | Low effort, should be fixed |
| SC4 | **Multiple courses per student** (course switcher, allowance shared across courses) | `SPEC:19`, `SPEC:287`, FR-030 | The MVP is one subject and one context (C18). Multi-course states are designed and tested for a case the pilot is unlikely to have. Cheap to keep, but low value. | Low |
| SC5 | **"Students may be minors"** as a design baseline | `CONST:5-7`, `CONST:91-97` | REQ settled on participants over 18 (`REQ:19`). SPEC resolves this for the MVP (`SPEC:429`), but the constitution still requires age-appropriate consent wording. Not creep in features, but extra copy and consent work. | Low |
| SC6 | **Desktop-first for students** | `CONST:127`, FR-003 (`SPEC:305`) | Not creep, but misdirected effort. REQ says "students will mostly use their phones" (`REQ:102`). Reference designs are made at 1440 px for a population that will mostly use a 390 px screen. | Low–Medium |
| SC7 | **Light/dark theme** | Commit `9a940be` (git history; not in REQ, SPEC or PDF) | Not justified by any source document. | Low |
| SC8 | **Guided (Socratic) mode as an M** | S3 (`REQ:46`), US5 P1 | Not creep in the sense of being unjustified: it follows from teacher control (C8). But the proposal never mentions hints or Socratic tutoring. An M that the proposal never names is prioritised above S7 (C6) and S5 (C11), which the proposal does name. This is the clearest symptom of the inverted priorities. | Priority issue |

Items checked and **justified**:

- Minimal admin area (P1)
- Password recovery and session-expired screens
- WCAG 2.2 AA (`CONST:39-48`): stricter than REQ's "basic accessibility" (`REQ:103`), but defensible under "equitable access" (C22)
- Teacher approval of quiz items (T7)
- Pre/post-tests and questionnaires (P3, P4)
- Anonymised export (P5)
- GDPR controls (C20 "Security review (GDPR)")

---

## Step 5: Proposals

Each proposal gives replacement or new requirement text in REQ's style, the matching SPEC change (limited to visible UI per `SPEC:9`), and the claim it traces to.

- **Must fix**: the differentiator is otherwise invisible.
- **Nice to have**: strengthens a claim that is already partly visible.

### Must fix

#### PR-01: T2, from "include/exclude" to "validate" · traces C3, C9 (CONST I)

**REQ, replace T2:**

| ID | Requirement | Prio |
|---|---|---|
| T2 | Upload material (PDF, DOCX, Markdown), review how it was split into fragments, exclude individual fragments, and **validate** each document before the tutor may use it. Each document shows its status (*pending validation · validated · excluded*), who validated it and when. Only validated, non-excluded fragments can be retrieved or cited. | M |

If fragment-level exclusion is too costly for v1, split it into a separate S requirement (T2b). Keep the validation status as M.

**SPEC:**

- US2: rename it "Teacher uploads, curates and validates the course material".
- US2 AS5 (`SPEC:63`): replace the include toggle with a "Validar" action. A processed document starts as "Pendiente de validar" and is not used by the tutor until validated. The list shows status, validator and date.
- US2 new AS: in fragment review, the teacher can exclude a fragment, and excluded fragments are visibly marked.
- FR-021 (`SPEC:321`): add validation status and fragment exclusion.
- Key entity "Material document" (`SPEC:404`): add the validation status, validator and timestamp.

#### PR-02: S4 records each mistake in a learner record · traces C4, C6, C7, C11, C14

This is the cheapest fix with the widest reach. S5, T5, S7, the mastery KPI and the "reduction in recurring errors" KPI all depend on classified mistakes that no functional requirement currently produces.

**REQ, replace S4:**

| ID | Requirement | Prio |
|---|---|---|
| S4 | Submit a worked exercise and get feedback on the specific mistake. Each mistake is **classified by error type and topic** (taxonomy in §5) and stored in the student's **learning record**, which the student and their teacher can see. | M |

**SPEC:**

- US6 AS3 (`SPEC:141`): the feedback shows the error type and topic in plain language (e.g. "Tipo de error: despejar la variable · Tema: ecuaciones lineales").
- Key entities: add "Learning record: a student's classified mistakes, activity and topic progress over time, in one course".

#### PR-03: close the supervision loop (T6) and raise T4 and T6 to M · traces C8, C9

**REQ, replace T4 and T6:**

| ID | Requirement | Prio |
|---|---|---|
| T4 | Review their students' conversations and exercise feedback, with the transparency agreed with the students | **M** |
| T6 | Flag a tutor answer or feedback as wrong or poor and **write a correction**. The student sees the correction on the original message, marked as reviewed by the teacher. Flags and corrections also feed the evaluation set (§4.4). | **M** |

**Trade-off.** This adds two items to a 9-week v1 (`REQ:11`) for 1–2 developers (`REQ:13`). The minimum that keeps the differentiator visible is a flag, a correction text, and the correction shown to the student. Whether a correction should also change the tutor's future answers is OQ7. It is not proposed here.

**SPEC:**

- US8: raise the priority P2 → P1.
- US8 AS2 (`SPEC:183`): add a "Corrección" text field.
- US1 new AS: "**Given** the teacher corrected a tutor answer, **When** the student views that conversation, **Then** the answer shows a 'Revisado por tu profesor/a' marker and the teacher's correction."
- FR-023 (`SPEC:324`): add the correction and its display to the student.
- Edit the student chat prototype page to show this state.

#### PR-04: per-student adaptation as a requirement · traces C5, C10

**REQ, new requirement:**

| ID | Requirement | Prio |
|---|---|---|
| S8 | The tutor adapts its explanations to the individual student, using their learning record (recurring error types, topic progress) and within the teacher's T3 settings. An adapted explanation says that it was adapted and why, in one sentence. | S |

The adaptation dimensions are not specified in the proposal (OQ3). The requirement fixes only that adaptation is per student, uses the learning record, and is disclosed.

**SPEC:**

- US1 and US5 new AS: an adapted answer shows a "Adaptado para ti" label with a one-line reason (e.g. "porque esta semana has fallado al despejar variables"). Tapping the label shows the record entries used.
- Add FR-037.
- Show the same label on the teacher's conversation detail (US8).

#### PR-05: continuous progress tracking, raised to S, plus a teacher-side view · traces C6, C12, C14

**REQ, replace S7 and add T8:**

| ID | Requirement | Prio |
|---|---|---|
| S7 | View their own progress by topic **over time**, updated after every exercise and quiz, with the mastery level per topic (definition agreed by the educational stream, §2) | **S** |
| T8 | View each student's learning record (progress by topic over time, recurring error types, activity), not only students flagged as at risk | S |

**SPEC:**

- US13: raise P3 → P2. FR-036 "MAY" → "MUST".
- US13 AS1: add "over time" and the mastery level.
- US9: add an AS saying the teacher can open any student from the "by student" view and see the same learning record. This generalises `student-risk.html` into a student detail page that has an at-risk state.

#### PR-06: course topics as the anchor for curriculum objectives · traces C2, C14 (mastery)

**REQ, new requirement:**

| ID | Requirement | Prio |
|---|---|---|
| T9 | Define the course's **topics (learning objectives)** and assign each document, or each section of it, to its topics. The AI may suggest assignments, and the teacher confirms them. Error patterns, quizzes, the dashboard and progress all use this topic list. | M |

This requirement depends on OQ1. If "curriculum objectives" means an official curriculum framework, this is not enough. If it means the teacher's course objectives, it is enough and costs little.

**SPEC:**

- New US "Teacher defines course topics" (P1, Teacher) on the material or course page. Acceptance scenarios: empty state, add/edit topics, review AI-suggested assignments, unassigned-document warning.
- Add FR-026.
- Add a "Topic" key entity.

#### PR-07: transparency of adaptive decisions · traces C10

**REQ, new §4.7 (NFR):**

> **4.7 Transparency of decisions.** Every decision the system makes about a student (difficulty change, error pattern, adapted explanation, mastery level, at-risk flag) shows its basis in one plain-language sentence to the student it affects, and the same basis to their teacher.

**SPEC:**

- New cross-cutting FR-016.
- US11 AS3 (`SPEC:240`): state why the difficulty changed (e.g. "Subimos el nivel porque has acertado 3 seguidas").
- US12 AS1 already complies (`SPEC:258`).
- US9 AS2 already complies for teachers (`SPEC:203`).

### Nice to have

#### PR-08: an actionable, time-bounded T5 with teacher override · traces C8, C12, C16

**REQ, replace T5:**

| ID | Requirement | Prio |
|---|---|---|
| T5 | Dashboard of recurring errors grouped by topic and error type, showing the share of students affected and example errors, defaulting to the last 7 days, so the teacher can plan a classroom intervention. A list of at-risk students shows the criteria used. The teacher can **dismiss** an at-risk flag or an error pattern they judge wrong, with a reason. | S |

**SPEC:**

- US9 AS1 (`SPEC:202`): add the share of students and example errors per group.
- New AS: dismiss with a reason. The flag is then marked "Descartado por el profesor/a".

#### PR-09: S6 scoped to exam preparation, with specific feedback · traces C13

**REQ, replace S6:**

| ID | Requirement | Prio |
|---|---|---|
| S6 | Adaptive quizzes (difficulty follows performance) on the topics the teacher selects, for example for an upcoming exam, with immediate feedback that names the specific mistake (error type, as in S4) | S |

**SPEC:**

- US11 AS1: show the topics chosen by the teacher.
- US11 AS2 (`SPEC:239`): incorrect-answer feedback names the error type.
- US10 new AS: the teacher selects topics for a quiz.

#### PR-10: show learning pace on the teacher's student view · traces C7

The data is already logged (`REQ:112`). Add to T8 (PR-05): "including pace (activity and time spent per topic)". SPEC: one extra row in the student detail page. Learning style is excluded until OQ2 is answered.

#### PR-11: S1 grounded in **validated** material · traces C3, C9

Change S1 (`REQ:44`) from "only from the teacher's material" to "only from material the teacher has validated (T2)". In SPEC, the US1 disclosure copy (`SPEC:37`) says "material validado por tu profesor/a".

#### PR-12: say in T3 that students see the teacher's choices · traces C8, C10

Append to T3 (`REQ:35`): "Students see which settings their teacher chose." SPEC already does this (`SPEC:120,122`). This only aligns REQ with it.

#### PR-13: scope corrections (Step 4)

These are recorded here for the team's decision. They are not differentiation fixes.

- SC3: change the placeholder limit in `SPEC:434` to 10 a day (BUDGET).
- SC2: mark the photo upload as optional or deferred.
- SC1: discuss deferring complete EN copy while keeping externalised strings.

---

## Open questions

These are ambiguities in the proposal. They are listed here, not resolved.

| # | Question | Why it matters | Source |
|---|---|---|---|
| OQ1 | Does "curriculum objectives" mean an official curriculum framework or the teacher's own course objectives? Which formal curriculum applies to adult university participants? | Decides whether PR-06 is sufficient | C2, C21; `REQ:19` |
| OQ2 | What does "learning style" mean, and should the MVP act on it? The learning-styles hypothesis is contested in the research literature, so the behavioural-sciences lead (Laura) should decide. | No requirement can be written without a definition | C7 |
| OQ3 | Along which dimensions should explanations adapt to each student: prior errors, level, examples, pace? | Determines what PR-04 builds | C5 |
| OQ4 | Transparency of *whose* decisions (the AI's, the teacher's, or both) and to *whom* (students, teachers)? | Scope of PR-07 | C10 |
| OQ5 | "Faster feedback cycles": the delay before a student gets feedback, or the delay between an error emerging and the teacher intervening? Compared against what baseline? | `REQ:113` measures system response times, which may be the wrong metric | C16 |
| OQ6 | "Reduced workload": which teacher tasks are measured, and against what baseline? | A survey alone cannot show a reduction | C16 |
| OQ7 | Does "pedagogical supervision" mean teacher corrections should change the tutor's future answers, or only correct the student's record? | Decides whether PR-03 needs a backend feedback loop | C9 |
| OQ8 | "Timely" interventions and the Resend "Email notifications" budget line: does the proposal expect notifications to teachers, such as a digest of new at-risk students? | A pull-only dashboard may not be "timely" | C12, C20 |
| OQ9 | "Mastery rates": what counts as mastery of a topic? | Blocks S7 and the KPI. Already listed as a blocking study-metrics decision (`REQ:24`) | C14 |
| OQ10 | Educational context: the proposal speaks of "formal education" and "classroom", REQ says over 18, CONST says possibly minors | Affects consent, copy and what "curriculum" means | C18, C21 |
| OQ11 | Is there a real exam during the pilot (Feb–Mar 2027) for "exam preparation"? | Decides whether PR-09 has a use | C13 |
| OQ12 | Who defines the at-risk criteria, and are they fixed or set by the teacher? | Transparency (CONST I) needs stated criteria | C16 |
| OQ13 | Which scale governs the MVP: the proposal's 60 students × 15 messages a day, or BUDGET's 30 × 10 after the $1,000 grant? REQ follows the grant (`REQ:9`). | Fixes the daily limit and load assumptions | C20 |

---

## Executive summary

1. **Is DocentAI's differentiation visible in the requirements? No.** All eight Must-have requirements describe a generic grounded tutor that NotebookLM, custom GPTs or Khanmigo already cover. The proposal's differentiators exist only as Should (T5, T6, T7, S5) or Could (S7), or are missing entirely (per-student adaptation, decision transparency, curriculum objectives).
2. Of the three named ways DocentAI "goes further", only detecting mistakes is an M. Adapting to each student is missing, and continuous progress tracking is a Could.
3. **Fix 1 (PR-01 + PR-02):** turn T2 "include/exclude" into a recorded teacher **validation**, and make S4 classify every mistake into a **learning record**. Both are cheap and are the foundation for tracking, patterns and the KPIs.
4. **Fix 2 (PR-03):** close the **supervision loop**. T6 corrections must reach the student, and T4 and T6 become M, so teacher supervision appears in the December demo.
5. **Fix 3 (PR-04 + PR-05 + PR-07):** add per-student adaptation (S8), raise progress tracking to S with a teacher-side view (S7, T8), and require every adaptive decision to explain its basis (§4.7).
