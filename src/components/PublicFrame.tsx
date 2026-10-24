import type { ReactNode } from "react";

import { AppFooter } from "./AppFooter";
import { PublicHeader } from "./PublicHeader";
import { SkipLink } from "./SkipLink";

/** Header and footer without role navigation: public pages and access-denied screens. */
export function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface font-sans text-fg antialiased">
      <SkipLink />
      <PublicHeader />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-16">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
