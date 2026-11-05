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
import { type CourseNav, type NavItem, SidebarNav } from "./SidebarNav";
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
 * The signed-in shell for every role, laid out like a project dashboard: a sidebar with the role's
 * sections (and the current course's), the account at its foot, and the page beside it. Phones get a
 * top bar whose menu holds the same sidebar. `banner` sits above every page (the student's AI notice).
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
  const homeLink = <Brand href={home} />;
  const navigation = (
    <nav aria-label={t("mainNav")}>
      <SidebarNav items={nav} course={course} />
    </nav>
  );
  const who = (
    <span className="flex min-w-0 flex-col text-left">
      <span className="truncate text-sm font-medium text-fg">{userName}</span>
      <span className="truncate text-xs text-fg-muted">{roleLabel}</span>
    </span>
  );

  return (
    <div className="flex min-h-dvh flex-col font-sans text-fg antialiased" data-component="SignedInShell" data-variant={variant}>
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-border bg-surface-raised lg:hidden">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          {homeLink}
          <details className="relative ml-auto">
            <summary
              aria-label={t("openMenu")}
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <Icon name="menu" className="size-5 shrink-0" />
            </summary>
            <div className="absolute right-0 mt-2 flex max-h-[calc(100dvh-5rem)] w-72 flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-surface-raised p-3 shadow-lg">
              {navigation}
              <div className="flex flex-col gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2 px-3">
                  <Avatar />
                  {who}
                </div>
                <AccountRows profile={profile} />
              </div>
            </div>
          </details>
        </div>
      </header>
      <aside data-sidebar className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface-raised lg:flex">
        <div className="flex h-14 shrink-0 items-center px-4">{homeLink}</div>
        <div className="flex-1 overflow-y-auto px-3 py-2">{navigation}</div>
        <details className="relative border-t border-border p-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-2 hover:bg-surface-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus">
            <Avatar />
            {who}
            {/* Not an aria-label: the accessible name must keep the visible name (WCAG 2.5.3). */}
            <span className="sr-only">{t("userMenu")}</span>
            <Icon name="chevron-right" className="ml-auto size-4 shrink-0 -rotate-90 text-fg-muted" />
          </summary>
          <div className="absolute bottom-full left-3 mb-2 w-64 rounded-lg border border-border bg-surface-raised p-2 shadow-lg">
            <AccountRows profile={profile} />
          </div>
        </details>
      </aside>
      {/* globals.css pads the body for the fixed sidebar (lg and up). */}
      <div className="flex flex-1 flex-col">
        {banner}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
