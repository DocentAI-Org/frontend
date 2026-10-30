import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions/session";

import { AppFooter } from "./AppFooter";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type NavItem, NavLinks } from "./NavLinks";
import { SkipLink } from "./SkipLink";
import { ThemeSwitcher } from "./ThemeSwitcher";

const SIGN_OUT =
  "flex min-h-11 w-full items-center gap-2 rounded-lg px-4 text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export async function SignOutButton() {
  const t = await getTranslations("common.actions");
  return (
    <form action={signOut}>
      <button type="submit" className={SIGN_OUT}>
        <Icon name="log-out" />
        <span>{t("signOut")}</span>
      </button>
    </form>
  );
}

/**
 * The teacher and admin shells of the prototype: a sidebar on desktop, a menu on mobile, the
 * user's display name and role, language and sign-out. Students get `StudentShell`.
 */
export async function AppShell({
  variant,
  home,
  nav,
  userName,
  roleLabel,
  banner,
  children
}: {
  variant: "admin" | "teacher";
  home: Route;
  nav: NavItem[];
  userName: string;
  roleLabel: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations("common.a11y");
  const homeLink = <Brand href={home} />;
  return (
    <div className="flex min-h-dvh flex-col bg-surface font-sans text-fg antialiased" data-component="AppShell" data-variant={variant}>
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-border-strong bg-surface-raised lg:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          {homeLink}
          <details className="relative ml-auto">
            <summary
              aria-label={t("openMenu")}
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Icon name="menu" className="size-6 shrink-0" />
            </summary>
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-surface-raised p-2 shadow-lg">
              <nav aria-label={t("mainNav")}>
                <NavLinks items={nav} variant="menu" />
              </nav>
              <div className="my-2 border-t border-border" />
              <p className="px-4 font-semibold text-fg">{userName}</p>
              <p className="px-4 pb-2 text-sm text-fg-muted">{roleLabel}</p>
              <div className="mx-1 mb-2 flex flex-col gap-2">
                <LanguageSwitcher stretch />
                <ThemeSwitcher stretch />
              </div>
              <SignOutButton />
            </div>
          </details>
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border-strong bg-surface-raised lg:flex">
        <div className="flex h-16 shrink-0 items-center px-6">{homeLink}</div>
        <nav aria-label={t("mainNav")} className="flex-1 overflow-y-auto px-4 py-4">
          <NavLinks items={nav} variant="sidebar" />
        </nav>
        <div className="flex flex-col gap-2 border-t border-border p-4">
          <div className="px-2">
            <p className="font-semibold text-fg">{userName}</p>
            <p className="text-sm text-fg-muted">{roleLabel}</p>
          </div>
          <LanguageSwitcher stretch />
          <ThemeSwitcher stretch />
          <SignOutButton />
        </div>
      </aside>
      {/* theme.css pads the body for the fixed sidebar (lg and up). */}
      <div className="flex flex-1 flex-col">
        {banner}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
