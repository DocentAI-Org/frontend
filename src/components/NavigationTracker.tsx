"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

let current: string | null = null;
let previous: string | null = null;

/** The page the user came from inside the app, if any (spec 004 FR-004). */
export function previousPath() {
  return previous;
}

/** Records in-app navigations; lives in the root layout. */
export function NavigationTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === current) return;
    previous = current;
    current = pathname;
  }, [pathname]);
  return null;
}
