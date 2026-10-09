# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences of equal weight, each with its own surfaces:

- **Students** use the course's AI tutor to ask questions, work through problems with hints, submit worked exercises, take quizzes and follow their progress. They mostly use their phones (requirements §4.6), although every screen is designed desktop-first at 1440 px and must also work fully at 390 px.
- **Teachers** create courses, upload and curate the material the tutor may use, set the tutor's pedagogical behaviour, review student conversations, flag poor answers, approve AI-drafted quiz questions and watch for recurring errors and at-risk students. They work mainly on desktop.

A third role, **admin**, is deliberately minimal: it creates teacher accounts and lists users and courses. Nothing else.

**Student age range: undecided.** `knowledge-base/docs/requirements.md` §2 records pilot participants as over 18, but the target education level (secondary and/or university) is still open. The constitution therefore writes every rule for the most restrictive case, where students may be minors. Design work must respect that constraint until the age range is decided.

## Product Purpose

DocentAI is a teacher-guided AI platform for personalised education. A tutor answers students **only** from material their teacher has selected and validated, cites the exact source of every answer, says plainly when the material does not cover a question, and gives step-by-step hints instead of solutions when the teacher asks for it. Beyond answering questions, it detects a student's recurring mistakes, offers targeted explanations and practice, adapts quiz difficulty, and gives teachers aggregated insights into errors and students who may be falling behind.

The project is funded by an IMFAHE grant. Success is measured in a student pilot (Feb–Mar 2027) through pre/post-test improvement, fewer recurring errors, engagement, lower teacher workload, at-risk detection, and user satisfaction and trust in the AI's help.

## Positioning

The teacher controls the content and the AI assists. ChatGPT-based tools, Khan Academy's AI tutor and Duolingo rely on general-purpose models with no direct teacher control over the content. In DocentAI, every answer comes from the teacher's curated knowledge base, carries a visible citation (document plus page or section), and never invents an answer when the material is silent. The teacher can see the material, the conversations and the data behind every flag, so DocentAI complements formal education instead of replacing the teacher.

## Operating Context

- **Course lifecycle:** a teacher creates a course and shares a class code or link. Students join, the teacher uploads PDF, DOCX or Markdown material, reviews how each document was split into fragments, includes or excludes documents, and configures level, tone and solution policy (direct solutions / hints first, then the solution / hints only).
- **Student loop:** chat with citations, guided (Socratic) mode, worked-exercise submission (typed text, optionally a photo) with feedback on the specific mistake, notices about repeated mistakes, adaptive quizzes, and per-topic progress.
- **Limits:** each student has one daily message allowance shared across all their courses. It is visible, warns near the limit and blocks with a reset time once the limit is reached.
- **Transparency rituals:** before first use, students acknowledge that they are talking to an AI and that their teacher may review their conversations. Both facts stay visible in the chat. Consent can be reviewed and revoked from the student's profile.
- **Language:** Spanish is the pilot language and the default. English must be complete for every feature.
- **Timeline:** progress report on Dec 1, 2026; deployment and teacher validation in Dec 2026–Jan 2027; student pilot in Feb–Mar 2027; final report on May 25, 2027.
- **Validation:** usability sessions with at least 5 students on phones and 3 teachers. The pedagogy team signs off the student-facing copy and the guided-mode flow.

## Capabilities and Constraints

- **Stack (existing):** Next.js 16 App Router, React 19, strict TypeScript and Tailwind v4, deployed on Vercel, with Supabase Auth, Sentry and a FastAPI backend whose OpenAPI schema generates the API types.
- **Design source of truth:** a static HTML prototype in `public/prototype/` (plain HTML, Tailwind v4 browser build, tokens in `@theme`). Figma is not used. The prototype's tokens and component names must match the React app exactly. Hardcoded visual values are forbidden outside token definitions. `spec.md` owns behaviour.
- **Accessibility:** WCAG 2.2 AA is non-negotiable (see below).
- **Bilingual:** ES and EN. All strings are externalized, and dates, numbers and plurals follow the active locale.
- **Required states:** every data-driven screen has populated, empty, loading and error states. Errors explain the problem in plain language and offer a recovery action.
- **Shared answer patterns:** the "not covered by the material" pattern is distinct from a normal answer, shows no citations and suggests next steps. It is reused in chat, guided mode, exercise feedback and explanations.
- **Role separation:** each role has its own routes, navigation and layout, and access control is enforced server-side. No view mixes data across roles or students.
- **Privacy (GDPR):** the client receives only the minimum data a view needs. Personal data stays out of logs, analytics and `localStorage`. Students may appear under a pseudonym.
- **Budget:** about $1,000 in total, so the platform favours a simple stack with few dependencies.
- **Undecided:** the student age range and education level, the evaluation topic (one poll option is language learning), the pilot participants, the course material rights, the LLM provider, the daily limit value (the prototype shows 30 per day as an illustration) and the exact IMFAHE acknowledgement wording (draft: "Proyecto financiado por la Fundación IMFAHE").

## Brand Commitments

- **DocentAI logo:** the official mark in `public/prototype/assets/img/docentai-logo.png` (derivatives `docentai-logo-96.png` and `docentai-logo-144.png` have a transparent background) is the fixed identity. Do not redraw or reinterpret it.
- **IMFAHE acknowledgement (grant obligation):** the IMFAHE logo (`imfahe.logo.webp`; derivative `imfahe-logo-transparent.webp`) and an acknowledgement of IMFAHE as a funding organisation must appear on the sign-in screen and the public "Acerca de" page, and be reachable in at most one click or tap from every role's home. They must also appear in public materials (website, slides, posters).

The current Spanish copy addresses students informally ("tú") and uses inclusive forms ("profesor/a"). This reflects current practice and is not a confirmed brand rule.

## Evidence on Hand

- Proposal: `docs/proposal/Project Description - DocentAI.pdf`. Requirements, budget, timeline and grant obligations are in `../knowledge-base/docs/`.
- Feature spec, plan and validation notes are in `specs/001-mvp-prototype/`. The clickable prototype (ES/EN, every state reachable through `?state=`) is in `public/prototype/`.
- **All prototype content is fictional** (sample secondary-school algebra course, sample names). Deployments carry `noindex` for that reason.
- **No real** users, testimonials, pilot results, metrics, partner institutions or customer logos exist yet. Do not fabricate any.

## Product Principles

1. **The teacher is in control and the AI assists.** Every surface should make the teacher's authority over content and behaviour visible, never hide it behind the AI.
2. **Show the source, or say there isn't one.** Every answer, hint, feedback item, metric and flag shows what it is based on. The honest "not covered" reply is a feature, not an error.
3. **No hidden machinery.** Students always know they are talking to an AI, that their teacher may read their conversations and how much of their daily allowance is left.
4. **Help students learn rather than handing out answers.** Hints come before solutions, feedback names the specific mistake and repeated mistakes lead to targeted practice.
5. **Equal care for both audiences.** Phone-first comfort for students and desktop efficiency for teachers carry equal weight. Neither audience is a secondary surface.

## Accessibility & Inclusion

- WCAG 2.2 AA on every screen and state: contrast, full keyboard operation, visible focus, semantic HTML, screen reader support, `prefers-reduced-motion`, minimum touch targets, and no information conveyed by colour alone. Automated axe checks in E2E tests block merges.
- Plain language suited to the student's age, with consent wording to match. Rules assume possible minors until the age range is decided.
- Full usability at 390 px with no horizontal scroll, in both Spanish and English.
- Long answers and math notation (KaTeX) must stay readable on narrow screens if the subject is STEM.
