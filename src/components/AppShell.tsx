import type { Route } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions/session";
import { themeChoice } from "@/lib/theme-server";

import { AppFooter } from "./AppFooter";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { LanguageMenuRow } from "./LanguageSwitcher";
import { type CourseNav, type NavItem, ShellNav } from "./ShellNav";
import { SkipLink } from "./SkipLink";
import { ThemeMenuRow } from "./ThemeSwitcher";

/** A row of the account menu: profile, theme, sign out. */
export const MENU_ITEM =
  "flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-sm text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

export async function SignOutButton() {
  const t = await getTranslations("common.actions");
  return (
    <form action={signOut}>
      <button type="submit" className={MENU_ITEM}>
        <Icon name="log-out" />
        <span>{t("signOut")}</span>
      </button>
    </form>
  );
}

/** Profile, language, theme and sign out: the rows of the account menu. */
async function AccountRows({ profile }: { profile?: NavItem }) {
  return (
    <div className="flex flex-col gap-1">
      {profile && (
        <Link href={profile.href} className={MENU_ITEM}>
          <Icon name={profile.icon} />
          <span>{profile.label}</span>
        </Link>
      )}
      <LanguageMenuRow />
      <ThemeMenuRow initial={await themeChoice()} />
      <div className="my-1 border-t border-border" />
      <SignOutButton />
    </div>
  );
}

function Avatar() {
  return (
    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-fg">
      <Icon name="user" />
    </span>
  );
}

/**
 * The signed-in shell for every role, laid out like a project dashboard: a header with the brand
 * and the account menu, and under it the role's sections as tabs (and the current course's after a
 * divider), scrolling sideways when they do not fit. `banner` sits above every page (the student's
 * AI notice).
 */
export async function AppShell({
  variant,
  home,
  nav,
  course,
  profile,
  userName,
  roleLabel,
  banner,
  children
}: {
  variant: "admin" | "teacher" | "student";
  home: Route;
  nav: NavItem[];
  course?: CourseNav;
  profile?: NavItem;
  userName: string;
  roleLabel: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const t = await getTranslations("common.a11y");
  return (
    <div className="flex min-h-dvh flex-col font-sans text-fg antialiased" data-component="SignedInShell" data-variant={variant}>
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-border bg-surface-raised">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Brand href={home} />
          <details className="relative ml-auto">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <Avatar />
              <span className="hidden min-w-0 flex-col text-left sm:flex">
                <span className="truncate text-sm font-medium text-fg">{userName}</span>
                <span className="truncate text-xs text-fg-muted">{roleLabel}</span>
              </span>
              {/* Not an aria-label: the accessible name must keep the visible name (WCAG 2.5.3). */}
              <span className="sr-only">{t("userMenu")}</span>
              <Icon name="chevron-right" className="hidden size-4 shrink-0 rotate-90 text-fg-muted sm:block" />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
              <div className="flex flex-col px-3 pt-1 pb-2 sm:hidden">
                <span className="text-sm font-medium text-fg">{userName}</span>
                <span className="text-xs text-fg-muted">{roleLabel}</span>
              </div>
              <AccountRows profile={profile} />
            </div>
          </details>
        </div>
        <nav aria-label={t("mainNav")} className="overflow-x-auto px-2 sm:px-4 lg:px-6">
          <ShellNav items={nav} course={course} />
        </nav>
      </header>
      {banner}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
