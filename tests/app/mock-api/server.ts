// Typed mock of the DocentAI API and the Supabase Auth endpoints for the app E2E tests
// (research R7), served over HTTP. Run: node tests/app/mock-api/server.ts  (port MOCK_API_PORT,
// default 8010)
import { createServer } from "node:http";

import { createHandler } from "./app.ts";
import { state } from "./state.ts";

const handle = createHandler(() => state.current);

const server = createServer(async (req, res) => {
  // The app calls this server from Next.js on the server; browsers never do, so no CORS.
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(name, value);
  }
  const body = chunks.length && req.method !== "GET" && req.method !== "HEAD" ? Buffer.concat(chunks) : undefined;
  const response = await handle(new Request(new URL(req.url ?? "/", "http://mock"), { method: req.method, headers, body }));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

const port = Number(process.env.MOCK_API_PORT ?? 8010);
server.listen(port, "127.0.0.1", () => console.log(`Mock DocentAI API on http://127.0.0.1:${port}`));
