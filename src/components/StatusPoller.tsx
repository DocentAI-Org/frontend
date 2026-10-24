"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refreshes the page every `interval` ms while `active` (spec FR-008: processing documents). */
export function StatusPoller({ active, interval = 3000 }: { active: boolean; interval?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => router.refresh(), interval);
    return () => clearInterval(timer);
  }, [active, interval, router]);
  return null;
}
