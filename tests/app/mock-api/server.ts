// Typed mock of the DocentAI API and the Supabase Auth endpoints for the app E2E tests
// (research R7). Run: node tests/app/mock-api/server.ts  (port MOCK_API_PORT, default 8010)
import { createServer } from "node:http";

import { type Ctx, HttpError, NO_CONTENT, RawBody, type Route, compile, send } from "./http.ts";
import { authRoutes, subjectOf } from "./routes/auth.ts";
import { adminRoutes } from "./routes/admin.ts";
import { chatRoutes } from "./routes/chat.ts";
import { consentRoutes } from "./routes/consent.ts";
import { courseRoutes } from "./routes/courses.ts";
import { dashboardRoutes } from "./routes/dashboard.ts";
import { documentRoutes } from "./routes/documents.ts";
import { exerciseRoutes, recordRoutes } from "./routes/exercises.ts";
import { reviewRoutes } from "./routes/review.ts";
import { mistakeReviewRoutes } from "./routes/reviews.ts";
import { quizRoutes } from "./routes/quizzes.ts";
import { progressRoutes } from "./routes/progress.ts";
import { courseTestRoutes } from "./routes/course-tests.ts";
import { settingsRoutes } from "./routes/settings.ts";
import { topicRoutes } from "./routes/topics.ts";
import { meRoutes } from "./routes/me.ts";
import { questionnaireRoutes } from "./routes/questionnaires.ts";
import { seed, state } from "./state.ts";

const testRoutes: Route[] = [
  { method: "GET", path: "/__test/health", handler: () => ({ ok: true }) },
  {
    method: "POST",
    path: "/__test/reset",
    handler: () => {
      state.current = seed();
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

const routes = [...testRoutes, ...authRoutes, ...meRoutes, ...consentRoutes, ...courseRoutes, ...documentRoutes, ...topicRoutes, ...settingsRoutes, ...chatRoutes, ...exerciseRoutes, ...recordRoutes, ...reviewRoutes, ...mistakeReviewRoutes, ...quizRoutes, ...progressRoutes, ...courseTestRoutes, ...dashboardRoutes, ...questionnaireRoutes, ...adminRoutes].map((route) => ({
  ...route,
  matcher: compile(route.path)
}));

const server = createServer(async (req, res) => {
  // The app calls this server from Next.js on the server; browsers never do, so no CORS.
  const url = new URL(req.url ?? "/", "http://mock");
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const rawBody = Buffer.concat(chunks);
  let body: unknown = null;
  if (rawBody.length && req.headers["content-type"]?.includes("application/json")) {
    body = JSON.parse(rawBody.toString());
  }
  const token = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
  const subject = token ? subjectOf(token) : null;
  const current = state.current;
  let user = current.users.find((u) => u.id === subject) ?? null;
  // Simulates an access token the API no longer accepts (001 US7 AS7).
  if (current.faults.has("expire_sessions") && url.pathname.startsWith("/v1/")) user = null;

  for (const route of routes) {
    const match = route.matcher.exec(url.pathname);
    if (!match || route.method !== req.method) continue;
    const ctx: Ctx = { req, res, url, params: match.groups ?? {}, body, rawBody, state: current, user };
    try {
      const result = await route.handler(ctx);
      if (result === NO_CONTENT) {
        res.writeHead(204).end();
      } else if (result instanceof RawBody) {
        res.writeHead(route.status ?? 200, { "content-type": result.contentType, ...result.headers });
        res.end(result.body);
      } else {
        send(res, route.status ?? 200, result);
      }
    } catch (error) {
      if (error instanceof HttpError) {
        const payload = url.pathname.startsWith("/auth/")
          ? { error: error.code, error_description: error.code, msg: error.code }
          : { error: { code: error.code, message: error.code, details: error.details } };
        send(res, error.status, payload);
      } else {
        console.error(error);
        send(res, 500, { error: { code: "unknown", message: String(error), details: null } });
      }
    }
    return;
  }
  send(res, 404, { error: { code: "not_found", message: `No mock for ${req.method} ${url.pathname}`, details: null } });
});

const port = Number(process.env.MOCK_API_PORT ?? 8010);
server.listen(port, "127.0.0.1", () => console.log(`Mock DocentAI API on http://127.0.0.1:${port}`));
