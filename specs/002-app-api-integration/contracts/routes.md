# Routes: app ↔ prototype ↔ API

**Feature**: [spec.md](../spec.md) · Prototype numbers (#) refer to the 001 plan's page table.
API paths are relative to `/v1`; types come from the pinned `backend-openapi.json`.

| Route | Group | # | Prototype page | API |
|---|---|---|---|---|
| `/` | — | — | — | redirects to the role home or `/entrar` |
| `/entrar` | public | 1 | `auth/sign-in.html` | Supabase Auth token |
| `/recuperar` | public | 2 | `auth/password-recovery.html` | Supabase Auth recover |
| `/acceso-denegado` | public | 3 | `auth/access-denied.html` | — |
| `/acerca` | public | 4 | `about.html` | — |
| `/unirse/[codigo]` | student | 7 | `student/join.html` | `POST /student/enrolments` |
| `/alumno/consentimiento` | student | 5 | `student/consent.html` | `GET/POST /student/consent` |
| `/alumno/cursos` | student | 6 | `student/courses.html` | `GET /student/courses` |
| `/alumno/unirse` | student | 7 | `student/join.html` | `POST /student/enrolments` |
| `/alumno/cursos/[id]` | student | 8, 9, 10 | `student/chat.html`, `student/chat-guided.html` | `GET /student/courses/{id}`, `/tutor-settings`, `/conversations`, `POST /disclosure`, `GET /student/allowance` |
| `/alumno/cursos/[id]/conversaciones/[conversacion]` | student | 8, 9, 10 | same | `GET …/conversations/{c}`, `POST …/messages`, `POST …/messages/{m}/retry` |
| `/alumno/cursos/[id]/ejercicio` | student | 11 | `student/exercise.html` | `POST /student/courses/{id}/submissions` |
| `/alumno/cursos/[id]/ejercicios/[envio]` | student | 12 | `student/exercise-feedback.html` | `GET …/submissions/{s}` |
| `/alumno/perfil` | student | 13 | `student/profile.html` | `GET/PATCH /me`, `GET/DELETE /student/consent`, `GET /student/consent/history` |
| `/profesor/cursos` | teacher | 14 | `teacher/courses.html` | `GET /teacher/courses` |
| `/profesor/cursos/nuevo` | teacher | 15 | `teacher/course-new.html` | `POST /teacher/courses` |
| `/profesor/cursos/[id]` | teacher | 16 | `teacher/course.html` | `GET/PATCH /teacher/courses/{id}`, class-code, `GET/DELETE …/students` |
| `/profesor/cursos/[id]/material` | teacher | 17 | `teacher/material.html` | `GET/POST …/documents`, validate, exclude, delete, `file-url` |
| `/profesor/cursos/[id]/material/[documento]` | teacher | 18 | `teacher/fragments.html` | `GET …/fragments` (all pages), `PATCH …/fragments/{f}` |
| `/profesor/cursos/[id]/tutor` | teacher | 19 | `teacher/tutor-settings.html` | `GET/PUT …/tutor-settings` |
| `/profesor/cursos/[id]/temas` | teacher | 33 | `teacher/topics.html` | topics CRUD, `PUT …/topics/order` |
| `/profesor/cursos/[id]/temas/asignacion` | teacher | 34 | `teacher/topic-assignment.html` | topic-assignments, `unassigned-material` |
| `/profesor/cursos/[id]/conversaciones` | teacher | 23 | `teacher/conversations.html` | `GET …/conversations` (filters, `has_correction`), `GET …/submissions` |
| `/profesor/cursos/[id]/conversaciones/[conversacion]` | teacher | 24 | `teacher/conversation.html` | `GET …/conversations/{c}`, `PUT/DELETE …/messages/{m}/flag` |
| `/profesor/cursos/[id]/ejercicios/[envio]` | teacher | 24 | `teacher/conversation.html` (feedback variant) | `GET …/submissions/{s}`, `PUT/DELETE …/submissions/{s}/flag` |
| `/profesor/cursos/[id]/correcciones` | teacher | 25 | `teacher/flags.html` | `GET …/flags` (backend 002) |
| `/admin/usuarios` | admin | 20 | `admin/users.html` | `GET /admin/users` |
| `/admin/profesores/nuevo` | admin | 21 | `admin/teacher-new.html` | `POST /admin/teachers` |
| `/admin/estudiantes/nuevos` | admin | 35 | `admin/students-new.html` (new, R8) | `POST /admin/students/pseudonymous` |
| `/admin/cursos` | admin | 22 | `admin/courses.html` | `GET /admin/courses` |

Out of scope (P2): #26 dashboard, #27 student detail, #28–#32 quizzes, practice and progress.

## Guards

- Signed out → `/entrar?next=<path>` (proxy). After sign-in → `next` or the role home.
- Wrong role for a group → access denied (`/acceso-denegado`), rendered by the group layout.
- Student without current study consent → `/alumno/consentimiento?next=<path>` for every student
  route except the profile and the consent page itself.
- API `not_found`/`forbidden`/`enrolment_revoked` on a page → access-denied state with the
  matching reason (not found, no access, removed from course).
