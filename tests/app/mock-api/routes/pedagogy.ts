import { HttpError, type Route, requireRole } from "../http.ts";
import { type S, type State, now } from "../state.ts";
import { ownedCourse } from "./courses.ts";

const GROUPS = ["inactive", "error_rate", "repeated_mistakes", "adaptation", "mastery"] as const;

/** The backend's rules (specs/015), enough for the E2E. */
function check(groups: Partial<S["Criteria"]>) {
  const invalid = () => {
    throw new HttpError(422, "validation_error", { fields: [{ loc: ["body", "criteria"] }] });
  };
  const { inactive, error_rate, repeated_mistakes, mastery } = groups;
  if (inactive && inactive.days < 1) invalid();
  if (error_rate && (error_rate.rate <= 0 || error_rate.rate > 1 || error_rate.min_exercises < 1)) invalid();
  if (repeated_mistakes && repeated_mistakes.count < 1) invalid();
  if (mastery && (mastery.progressing >= mastery.mastered || mastery.min_items > mastery.window)) invalid();
}

function courseView(state: State, courseId: string): S["CourseCriteria"] {
  const own = state.courseCriteria.get(courseId) ?? {};
  const study = state.studyCriteria.criteria;
  const effective = Object.fromEntries(GROUPS.map((g) => [g, own[g] ?? study[g]])) as S["Criteria"];
  const custom = Object.fromEntries(GROUPS.map((g) => [g, Boolean(own[g])])) as S["CourseCriteria"]["custom"];
  return { study, provisional: state.studyCriteria.provisional, custom, effective };
}

export const pedagogyRoutes: Route[] = [
  {
    method: "GET",
    path: "/v1/admin/pedagogy-criteria",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      return ctx.state.studyCriteria;
    }
  },
  {
    method: "PUT",
    path: "/v1/admin/pedagogy-criteria",
    handler: (ctx) => {
      requireRole(ctx, "admin");
      const body = ctx.body as S["StudyCriteriaUpdate"];
      check(body.criteria);
      ctx.state.studyCriteria = { criteria: body.criteria, provisional: body.provisional, updated_at: now() };
      return ctx.state.studyCriteria;
    }
  },
  {
    method: "GET",
    path: "/v1/teacher/courses/{course_id}/pedagogy-criteria",
    handler: (ctx) => courseView(ctx.state, ownedCourse(ctx).id)
  },
  {
    method: "PUT",
    path: "/v1/teacher/courses/{course_id}/pedagogy-criteria",
    handler: (ctx) => {
      const course = ownedCourse(ctx);
      const body = ctx.body as S["CourseCriteriaUpdate"];
      check(Object.fromEntries(GROUPS.filter((g) => body[g]).map((g) => [g, body[g]])));
      ctx.state.courseCriteria.set(course.id, body);
      return courseView(ctx.state, course.id);
    }
  }
];
