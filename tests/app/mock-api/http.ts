import type { IncomingMessage, ServerResponse } from "node:http";

import { type State, type User, state } from "./state.ts";

export type Ctx = {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  params: Record<string, string>;
  body: unknown;
  rawBody: Buffer;
  state: State;
  user: User | null;
};

export type Handler = (ctx: Ctx) => unknown | Promise<unknown>;
/** `status` is the success code the real API uses (200 unless stated, e.g. 201 on create). */
export type Route = { method: string; path: string; handler: Handler; status?: number };

export class HttpError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown> | null;
  constructor(status: number, code: string, details: Record<string, unknown> | null = null) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function send(res: ServerResponse, status: number, body?: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

/** A non-JSON body, such as a file download. */
export class RawBody {
  contentType: string;
  body: Buffer;
  headers: Record<string, string>;
  constructor(contentType: string, body: Buffer, headers: Record<string, string> = {}) {
    this.contentType = contentType;
    this.body = body;
    this.headers = headers;
  }
}

export const NO_CONTENT = Symbol("no-content");

export function noContent(): typeof NO_CONTENT {
  return NO_CONTENT;
}

export function page<T>(items: T[], url: URL) {
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const offset = Number(url.searchParams.get("offset") ?? 0);
  return { items: items.slice(offset, offset + limit), total: items.length, limit, offset };
}

export function requireRole(ctx: Ctx, role: User["role"]): User {
  if (!ctx.user) throw new HttpError(401, "unauthenticated");
  if (ctx.user.role !== role) throw new HttpError(403, "forbidden");
  return ctx.user;
}

export function current(): State {
  return state.current;
}

/** Turns "/v1/teacher/courses/{course_id}" into a matcher with named params. */
export function compile(path: string): RegExp {
  const pattern = path.replace(/\{(\w+)\}/g, "(?<$1>[^/]+)");
  return new RegExp(`^${pattern}$`);
}
