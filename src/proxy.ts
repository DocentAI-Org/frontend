import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { safeNext } from "@/lib/auth/home";
import { PATHNAME_HEADER } from "@/lib/request-path";

/** Routes reachable without a session; everything else needs one. */
const PUBLIC_PATHS = ["/sign-in", "/forgot-password", "/about", "/access-denied"];


function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Request headers only reach Server Components when passed through NextResponse.next.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PATHNAME_HEADER, `${pathname}${search}`);
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();

  // Refreshes the session cookies (research R1).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          for (const { name, value } of list) request.cookies.set(name, value);
          requestHeaders.set("cookie", request.cookies.toString());
          response = next();
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
        }
      }
    }
  );
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && !isPublic(pathname)) {
    const signIn = new URL("/sign-in", request.url);
    if (pathname !== "/") signIn.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }
  // Signed-in users skip the form (spec 004 FR-005); an expired API session still needs it.
  if (user && pathname === "/sign-in" && !request.nextUrl.searchParams.has("expired")) {
    const target = safeNext(request.nextUrl.searchParams.get("next")) ?? "/";
    return NextResponse.redirect(new URL(target, request.url));
  }
  return response;
}

export const config = {
  // Not for static files, the prototype or Next.js internals.
  matcher: ["/((?!_next/|prototype/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2?|css|js)$).*)"]
};
