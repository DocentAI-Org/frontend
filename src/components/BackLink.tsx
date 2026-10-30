"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Icon } from "./Icon";
import { previousPath } from "./NavigationTracker";

/**
 * "Back" to the page the user came from: the previous in-app page, else a same-site referrer,
 * else `fallback` (spec 004 FR-004). Without JavaScript it is a plain link to `fallback`.
 */
export function BackLink({ fallback = "/" as Route, children }: { fallback?: Route; children: ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      onClick={(event) => {
        const sameSiteReferrer = document.referrer && new URL(document.referrer).origin === window.location.origin;
        if (window.history.length > 1 && (previousPath() || sameSiteReferrer)) {
          event.preventDefault();
          router.back();
        }
      }}
      className="inline-flex w-fit items-center gap-1 rounded-sm bg-surface text-sm font-semibold text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Icon name="chevron-left" />
      <span>{children}</span>
    </Link>
  );
}
