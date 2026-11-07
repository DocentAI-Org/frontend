# Feature Specification: AI Settings per Course

**Feature Branch**: `019-course-ai-settings`

**Created**: 2026-11-07

**Status**: Draft

**Input**: Frontend half of backend spec `019-course-ai-settings`: each teacher configures the AI
of their course — message limit, model per task, credentials for commercial models, custom
instructions and advanced options — following the study defaults the admin sets. Easy by
default, everything reachable.

**Visuals**: no prototype page; built with the design system's form components, like "Criterios".

## User Scenarios & Testing *(mandatory)*

### User Story 1 — The teacher sets the message limit (Priority: P1) 🎯

**Role**: Teacher · **Device**: desktop-first

1. **Given** a course, **When** the teacher opens the "IA" tab, **Then** "Límite de mensajes"
   shows "Los del estudio" with the study's values in a sentence ("Sin límite de mensajes.
   Cuentan: chat con el tutor, corrección de ejercicios y repaso de errores."), and the study's
   daily maximum across courses.
2. **When** they choose "Personalizar", set 20 per week, untick "Corrección de ejercicios" and
   save, **Then** "Guardado" is announced and the sentence follows the new values.
3. **When** they choose "Sin límite", **Then** a note says the study's daily ceiling still
   applies, if there is one.

### User Story 2 — The student sees their messages in the course (Priority: P1)

**Role**: Student · **Device**: mobile-first

1. **Given** a weekly limit, **Then** the chat shows "Te quedan 12 mensajes esta semana en este
   curso"; with no course limit, the daily maximum across courses is shown (nothing if there is
   none either).
2. **Given** the limit reached, **Then** the input is disabled with the reset day or time.
3. **Given** a course that does not count exercise feedback, **When** the tutor's limit is
   reached, **Then** exercises can still be sent (the page asks for the feedback allowance).

### User Story 3 — The teacher chooses the models (Priority: P1)

**Role**: Teacher · **Device**: desktop-first

1. **When** they personalise "Modelos", **Then** each task (Tutor, Corrección de ejercicios,
   Repaso de errores, Preguntas de quiz) has a model picker grouped by source: "En este
   servidor (local)" with size, and each credential; an unreachable source shows a note.
2. **When** they open "Opciones avanzadas" of a task, **Then** they can set temperature (hidden
   for models that do not take it), reasoning effort and reply length, each with a one-line
   explanation.
3. **Given** a task reset because the admin removed its key or model, **Then** a notice
   explains it until the settings are saved again.

### User Story 4 — Credentials (Priority: P1)

**Role**: Admin, Teacher · **Device**: desktop-first

1. **Given** an admin, **When** they open "Proveedores de IA", **Then** they see the server
   credential (read-only), can add a credential (provider, label, key), see `…last4`, choose
   the models courses may use, and switch "Los profesores pueden añadir sus claves".
2. **Given** that switch on (in "IA del estudio"), **Then** the teacher's "IA" tab offers "Tus
   claves", with a
   notice that the course's requests then go to that provider under their account.
3. **When** a key is rejected, **Then** the error says so and nothing is saved; deleting asks
   for confirmation.

### User Story 5 — Instructions, advanced options, test and usage (Priority: P2)

**Role**: Teacher · **Device**: desktop-first

1. **When** they personalise "Instrucciones", **Then** each task has a text area with a counter
   (2000), examples, and a note that they cannot change the safety rules.
2. **When** they personalise "Recuperación del material", **Then** fragments, minimum
   similarity (as a percentage) and history length can be set.
3. **When** they press "Probar" with unsaved settings and a message, **Then** the reply, model,
   time and estimated cost appear.
4. **Then** a "Consumo" panel shows messages and cost per task for 7 and 30 days, and the
   students closest to the limit.

### User Story 6 — The admin sets the study defaults (Priority: P1)

**Role**: Admin · **Device**: desktop-first

1. **When** the admin opens "IA del estudio", **Then** they edit the same groups plus the daily
   ceiling, and courses without their own values follow them.

## Requirements *(mandatory)*

- **FR-001**: The "IA" tab sits next to "Configuración del tutor" and "Criterios"; each group
  uses the "Los del estudio / Personalizar" switch of spec 015.
- **FR-002**: Keys are typed in a password field, never echoed back or kept in the page state
  after saving.
- **FR-003**: No new dependency.

## Success Criteria *(mandatory)*

- **SC-001**: E2E covers the scenarios with the mock API (axe, desktop and mobile); existing
  suites pass.
