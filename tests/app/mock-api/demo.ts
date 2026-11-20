// The demo deployment's backend: the same typed mock as the E2E tests, called in process, with
// sample data built through the mock's own test helpers so it stays consistent with the
// contract. Changes live in memory and the data starts over every hour. Fictitious people only
// (AGENTS.md VII).
import { createHandler } from "./app.ts";
import { type State, resetIds, seed } from "./state.ts";

const RESET_MS = 60 * 60 * 1000;

const ALGEBRA_PROGRESS = [
  { topic: "Transponer términos", kind: "exercise", result: "correct", days_ago: 12 },
  { topic: "Transponer términos", kind: "exercise", result: "incorrect", days_ago: 11, error_type: "procedural" },
  { topic: "Transponer términos", kind: "quiz", result: "correct", days_ago: 10 },
  { topic: "Despejar la incógnita", kind: "exercise", result: "partially_correct", days_ago: 8, error_type: "conceptual" },
  { topic: "Despejar la incógnita", kind: "exercise", result: "correct", days_ago: 6 },
  { topic: "Despejar la incógnita", kind: "quiz", result: "incorrect", days_ago: 5 },
  { topic: "Paréntesis", kind: "exercise", result: "incorrect", days_ago: 3, error_type: "procedural" },
  { topic: "Paréntesis", kind: "quiz", result: "correct", days_ago: 1 }
] as const;

async function build(): Promise<State> {
  // Same ids on every build: a session token names its user by id.
  resetIds();
  const state = seed();
  const handle = createHandler(() => state);
  const post = async <T = unknown>(path: string, body: object): Promise<T> => {
    const response = await handle(
      new Request(`http://demo${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    );
    if (!response.ok) throw new Error(`Demo seed failed at ${path}: ${response.status}`);
    return (response.status === 204 ? null : await response.json()) as T;
  };

  // Álgebra last, so it heads the "most recent" lists; consent is given by the first call.
  await post("/__test/courses", { names: ["Geometría", "Funciones lineales"], enrol: true });
  const { course_id } = await post<{ course_id: string }>("/__test/classroom", { policy: "hints_first", disclosure: true, consent: false });
  await post("/__test/progress", { course_id, topics: ["Transponer términos", "Despejar la incógnita", "Paréntesis"], items: ALGEBRA_PROGRESS });
  await post("/__test/activity", { course_id });
  await post("/__test/mistakes", { course_id, count: 2 });
  await post("/__test/questions", { course_id, topic: "Paréntesis" });
  await post("/__test/questions", { course_id, topic: "Despejar la incógnita" });
  await post("/__test/course-test", { course_id, count: 4, open: ["pre"], answered: { pre: [true, false, true, false] } });
  await post("/__test/suggestion", { topic_name: "Despejar la incógnita", section: "3.2 Despejar la incógnita" });
  await post("/__test/dashboard", { course_id, mode: "busy" });
  return state;
}

// On globalThis, so every bundle in one process (the proxy and the app) shares one state.
const store = globalThis as typeof globalThis & { __docentaiDemo?: { state: Promise<State>; built: number } };

function current(): Promise<State> {
  if (!store.__docentaiDemo || Date.now() - store.__docentaiDemo.built > RESET_MS) {
    store.__docentaiDemo = { state: build(), built: Date.now() };
  }
  return store.__docentaiDemo.state;
}

/** Answers one request of the app's API or Auth client from the demo state. */
export async function handleDemo(request: Request): Promise<Response> {
  const state = await current();
  // The test helpers build the data; visitors only reach the API and Auth endpoints.
  if (new URL(request.url).pathname.startsWith("/__test/")) return new Response(null, { status: 404 });
  return createHandler(() => state)(request);
}
