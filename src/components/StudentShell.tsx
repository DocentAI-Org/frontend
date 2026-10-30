import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SignOutButton } from "./AppShell";
import { AppFooter } from "./AppFooter";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { type NavItem, NavLinks } from "./NavLinks";
import { SkipLink } from "./SkipLink";
import { ThemeSwitcher } from "./ThemeSwitcher";

/**
 * The student shell of the prototype (partials/shell-student.html): header tabs and a user menu,
 * the persistent AI notice, and a bottom tab bar on phones (theme.css keeps room for it).
 */
export async function StudentShell({
  home,
  nav,
  userName,
  roleLabel,
  children
}: {
  home: Route;
  nav: NavItem[];
  userName: string;
  roleLabel: string;
  children: ReactNode;
}) {
  const t = await getTranslations();
  return (
    <div className="flex min-h-dvh flex-col bg-surface font-sans text-fg antialiased" data-component="AppShell" data-variant="student">
      <SkipLink />
      <header className="sticky top-0 z-40">
        <div className="border-b border-border-strong bg-surface-raised">
          <div className="mx-auto flex h-16 max-w-6xl items-stretch gap-6 px-4 sm:px-6">
            <div className="flex self-center">
              <Brand href={home} />
            </div>
            <nav aria-label={t("common.a11y.mainNav")} className="hidden items-end md:flex">
              <NavLinks items={nav} variant="tabs" />
            </nav>
            <details className="relative ml-auto self-center">
              <summary
                aria-label={t("common.a11y.userMenu")}
                className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-2 text-sm font-medium text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-border-strong bg-surface text-fg">
                  <Icon name="user" />
                </span>
                <span className="hidden sm:inline">{userName}</span>
              </summary>
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface-raised p-2 shadow-lg">
                <p className="px-4 pt-2 font-semibold text-fg sm:hidden">{userName}</p>
                <p className="px-4 pt-1 pb-2 text-sm text-fg-muted">{roleLabel}</p>
                <div className="mx-1 mb-2 flex gap-2">
                  <LanguageSwitcher stretch />
                  <ThemeSwitcher />
                </div>
                <SignOutButton />
              </div>
            </details>
          </div>
        </div>
        {/* Persistent AI and teacher-review notice (001 FR-010, FR-011). */}
        <div className="border-b border-border bg-surface">
          <p
            className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm text-fg-muted sm:px-6"
            data-component="AIDisclosure"
            data-variant="header-label"
          >
            <Icon name="sparkles" />
            <span>
              <strong className="font-semibold text-fg">{t("student.shell.aiLabel")}</strong>: {t("student.shell.teacherReview")}
            </span>
          </p>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <AppFooter />
      <nav
        aria-label={t("common.a11y.mainNav")}
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-surface-raised md:hidden"
      >
        <NavLinks items={nav} variant="tabbar" />
      </nav>
    </div>
  );
}
