// The Supabase Auth (GoTrue) endpoints the app uses: password sign-in, refresh, user, logout,
// recover. Tokens are unsigned look-alikes: the mock API only reads `sub`.
import { HttpError, type Route, noContent } from "../http.ts";
import { type User, now } from "../state.ts";

const LIFETIME = 3600;

function b64(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function tokenFor(user: User): string {
  const exp = Math.floor(Date.now() / 1000) + LIFETIME;
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    sub: user.id,
    email: user.email,
    aud: "authenticated",
    role: "authenticated",
    exp
  })}.mock`;
}

export function subjectOf(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return payload.exp * 1000 > Date.now() ? payload.sub : null;
  } catch {
    return null;
  }
}

function authUser(user: User) {
  return {
    id: user.id,
    aud: "authenticated",
    role: "authenticated",
    email: user.email,
    app_metadata: { provider: "email" },
    user_metadata: { display_name: user.display_name },
    created_at: user.created_at,
    updated_at: now()
  };
}

function session(user: User) {
  return {
    access_token: tokenFor(user),
    token_type: "bearer",
    expires_in: LIFETIME,
    expires_at: Math.floor(Date.now() / 1000) + LIFETIME,
    refresh_token: `refresh-${user.id}`,
    user: authUser(user)
  };
}

export const authRoutes: Route[] = [
  {
    method: "POST",
    path: "/auth/v1/token",
    handler: ({ url, body, state }) => {
      const input = body as { email?: string; password?: string; refresh_token?: string };
      if (url.searchParams.get("grant_type") === "refresh_token") {
        const user = state.users.find((u) => `refresh-${u.id}` === input.refresh_token);
        if (!user) throw new HttpError(400, "invalid_grant");
        return session(user);
      }
      const user = state.users.find(
        (u) => u.email === input.email?.toLowerCase() && u.password === input.password
      );
      if (!user || user.status !== "active") {
        throw new HttpError(400, "invalid_credentials");
      }
      return session(user);
    }
  },
  {
    method: "GET",
    path: "/auth/v1/user",
    handler: ({ user }) => {
      if (!user) throw new HttpError(401, "bad_jwt");
      return authUser(user);
    }
  },
  { method: "POST", path: "/auth/v1/logout", handler: () => noContent() },
  { method: "POST", path: "/auth/v1/recover", handler: () => ({}) }
];
