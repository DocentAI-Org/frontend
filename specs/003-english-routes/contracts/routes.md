# Routes: 002 → 003

**Feature**: [spec.md](../spec.md). Pages, roles, prototype screens and API calls are those of
[002 routes](../../002-app-api-integration/contracts/routes.md); only the paths change.

## Paths

| 002 | 003 |
|---|---|
| `/entrar` | `/sign-in` |
| `/recuperar` | `/forgot-password` |
| `/acceso-denegado` | `/access-denied` |
| `/acerca` (`#privacidad`) | `/about` (`#privacy`) |
| `/unirse/[codigo]` | `/join/[code]` (old path redirects) |
| `/alumno/consentimiento` | `/student/consent` |
| `/alumno/cursos` | `/student/courses` |
| `/alumno/unirse` | `/student/join` |
| `/alumno/cursos/[id]` | `/student/courses/[id]` |
| `/alumno/cursos/[id]/conversaciones/[conversacion]` | `/student/courses/[id]/conversations/[conversationId]` |
| `/alumno/cursos/[id]/ejercicio` | `/student/courses/[id]/exercise` |
| `/alumno/cursos/[id]/ejercicios/[envio]` | `/student/courses/[id]/exercises/[submissionId]` |
| `/alumno/perfil` | `/student/profile` |
| `/profesor/cursos` | `/teacher/courses` |
| `/profesor/cursos/nuevo` | `/teacher/courses/new` |
| `/profesor/cursos/[id]` | `/teacher/courses/[id]` |
| `/profesor/cursos/[id]/material` | `/teacher/courses/[id]/material` |
| `/profesor/cursos/[id]/material/[documento]` | `/teacher/courses/[id]/material/[documentId]` |
| `/profesor/cursos/[id]/tutor` | `/teacher/courses/[id]/tutor` |
| `/profesor/cursos/[id]/temas` | `/teacher/courses/[id]/topics` |
| `/profesor/cursos/[id]/temas/asignacion` | `/teacher/courses/[id]/topics/assignment` |
| `/profesor/cursos/[id]/conversaciones` | `/teacher/courses/[id]/conversations` |
| `/profesor/cursos/[id]/conversaciones/[conversacion]` | `/teacher/courses/[id]/conversations/[conversationId]` |
| `/profesor/cursos/[id]/ejercicios/[envio]` | `/teacher/courses/[id]/exercises/[submissionId]` |
| `/profesor/cursos/[id]/correcciones` | `/teacher/courses/[id]/corrections` |
| `/admin/usuarios` | `/admin/users` |
| `/admin/profesores/nuevo` | `/admin/teachers/new` |
| `/admin/estudiantes/nuevos` | `/admin/students/new` |
| `/admin/cursos` | `/admin/courses` |

## Query parameters

| Page | 002 | 003 |
|---|---|---|
| `/sign-in` | `expirada` | `expired` (`next` unchanged) |
| `/student/consent` | `paso` | `step` |
| `/student/join` | `unido` | `joined` |
| `/teacher/courses/[id]` | `codigo` | `code` (`error` unchanged) |
| `…/material` | `validado`, `excluido` | `validated`, `excluded` |
| `…/topics` | `anadido`, `movido` | `added`, `moved` |
| `…/topics/assignment`, `…/conversations/[conversationId]`, `…/exercises/[submissionId]` | `guardado` | `saved` |
| `…/conversations` | `estudiante`, `desde`, `sinFuente`, `corregida` | `student`, `since`, `noSource`, `corrected` |
