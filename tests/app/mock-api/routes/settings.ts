import { HttpError, type Route } from "../http.ts";
import { type S, now } from "../state.ts";
import { activeEnrolment, ownedCourse } from "./courses.ts";

const LEVELS = ["basic", "intermediate", "advanced"];
const TONES = ["friendly", "neutral", "formal"];
const POLICIES = ["direct", "hints_first", "hints_only"];

export const settingsRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/tutor-settings",
    handler: (ctx) => ownedCourse(ctx).settings
  },
  {
    method: "PUT",
    path: "/v1/teacher/courses/{course_id}/tutor-settings",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      if (ctx.state.faults.has("save_settings_fails")) throw new HttpError(503, "api_unreachable");
      const body = ctx.body as S["TutorSettingsUpdate"];
      if (!LEVELS.includes(body.level) || !TONES.includes(body.tone) || !POLICIES.includes(body.solution_policy)) {
        throw new HttpError(422, "validation_error");
      }
      course.settings = { ...body, updated_at: now() };
      return course.settings;
    }
  },
  {
    method: "GET",
    path: "/v1/student/courses/{course_id}/tutor-settings",
    handler: (ctx) => {
      const enrolment = activeEnrolment(ctx);
      const { level, tone, solution_policy } = ctx.state.courses.find((c) => c.id === enrolment.course_id)!.settings;
      return { level, tone, solution_policy };
    }
  }
];
