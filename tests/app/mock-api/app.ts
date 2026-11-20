// The typed mock of the DocentAI API and the Supabase Auth endpoints (research R7), as a
// Fetch-style handler: the E2E server (server.ts) serves it over HTTP and the demo deployment
// (demo.ts) calls it in process.
import { type Ctx, HttpError, NO_CONTENT, RawBody, type Route, compile } from "./http.ts";
import { authRoutes, subjectOf } from "./routes/auth.ts";
import { adminRoutes } from "./routes/admin.ts";
import { aiRoutes } from "./routes/ai.ts";
import { chatRoutes } from "./routes/chat.ts";
import { consentRoutes } from "./routes/consent.ts";
import { courseRoutes } from "./routes/courses.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";
import { documentRoutes } from "./routes/documents.ts";
import { exerciseRoutes, recordRoutes } from "./routes/exercises.ts";
import { reviewRoutes } from "./routes/review.ts";
import { mistakeReviewRoutes } from "./routes/reviews.ts";
import { quizRoutes } from "./routes/quizzes.ts";
import { nextStepsRoutes } from "./routes/next-steps.ts";
import { progressRoutes } from "./routes/progress.ts";
import { courseTestRoutes } from "./routes/course-tests.ts";
import { settingsRoutes } from "./routes/settings.ts";
import { topicRoutes } from "./routes/topics.ts";
import { meRoutes } from "./routes/me.ts";
import { pedagogyRoutes } from "./routes/pedagogy.ts";
import { questionnaireRoutes } from "./routes/questionnaires.ts";
import { type State, seed } from "./state.ts";

const testRoutes: Route[] = [
  { method: "GET", path: "/__test/health", handler: () => ({ ok: true }) },
  {
    method: "POST",
    path: "/__test/reset",
    handler: ({ state: current }) => {
      Object.assign(current, seed());
      return { ok: true };
    }
  },
  {
    method: "POST",
    path: "/__test/faults",
    handler: ({ body, state: current }) => {
      current.faults = new Set((body as { faults: string[] }).faults);
      return { ok: true };
    }
  }
];

const routes = [...testRoutes, ...authRoutes, ...meRoutes, ...consentRoutes, ...courseRoutes, ...documentRoutes, ...topicRoutes, ...settingsRoutes, ...chatRoutes, ...exerciseRoutes, ...recordRoutes, ...reviewRoutes, ...mistakeReviewRoutes, ...quizRoutes, ...progressRoutes, ...nextStepsRoutes, ...courseTestRoutes, ...dashboardRoutes, ...questionnaireRoutes, ...pedagogyRoutes, ...aiRoutes, ...adminRoutes].map((route) => ({
  ...route,
  matcher: compile(route.path)
}));

function json(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** Answers one request against the state `current()` returns. */
export function createHandler(current: () => State) {
  return async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const rawBody = Buffer.from(await request.arrayBuffer());
    let body: unknown = null;
    if (rawBody.length && request.headers.get("content-type")?.includes("application/json")) {
      body = JSON.parse(rawBody.toString());
    }
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
    const subject = token ? subjectOf(token) : null;
    const state = current();
    let user = state.users.find((u) => u.id === subject) ?? null;
    // Simulates an access token the API no longer accepts (001 US7 AS7).
    if (state.faults.has("expire_sessions") && url.pathname.startsWith("/v1/")) user = null;

    for (const route of routes) {
      const match = route.matcher.exec(url.pathname);
      if (!match || route.method !== request.method) continue;
      const ctx: Ctx = { headers: request.headers, url, params: match.groups ?? {}, body, rawBody, state, user };
      try {
        const result = await route.handler(ctx);
        if (result === NO_CONTENT) return new Response(null, { status: 204 });
        if (result instanceof RawBody) {
          return new Response(new Uint8Array(result.body), {
            status: route.status ?? 200,
            headers: { "content-type": result.contentType, ...result.headers }
          });
        }
        return json(route.status ?? 200, result);
      } catch (error) {
        if (error instanceof HttpError) {
          const payload = url.pathname.startsWith("/auth/")
            ? { error: error.code, error_description: error.code, msg: error.code }
            : { error: { code: error.code, message: error.code, details: error.details } };
          return json(error.status, payload);
        }
        console.error(error);
        return json(500, { error: { code: "unknown", message: String(error), details: null } });
      }
    }
    return json(404, { error: { code: "not_found", message: `No mock for ${request.method} ${url.pathname}`, details: null } });
  };
}
