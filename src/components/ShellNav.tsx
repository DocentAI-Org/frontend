"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { Icon } from "./Icon";

export type NavItem = { href: Route; label: string; icon: string };

/** A section of the course the user is in; `path` is appended to the course URL ("" is the course itself). */
export type CourseSection = { path: string; label: string; icon: string; also?: string[] };
export type CourseNav = { base: string; label: string; sections: CourseSection[] };

const TAB =
  "relative flex h-11 shrink-0 items-center gap-2 rounded-md px-3 md:h-14 text-sm whitespace-nowrap text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent data-current:font-medium data-current:text-fg data-current:after:bg-neutral-900";

function Tab({ href, icon, label, current }: { href: Route; icon: string; label: string; current: boolean }) {
  return (
    <li className="flex">
      <Link href={href} aria-current={current ? "page" : undefined} data-current={current ? "" : undefined} className={TAB}>
        <Icon name={icon} />
        <span>{label}</span>
      </Link>
    </li>
  );
}

/**
 * The signed-in shell's tabs, in the header like a project dashboard's: the role's sections
 * and, inside a course, that course's sections after a divider. The course is read from the URL.
 */
export function ShellNav({ items, course }: { items: NavItem[]; course?: CourseNav }) {
  const pathname = usePathname();
  const heading = useId();
  const match = course ? pathname.match(new RegExp(`^${course.base}/([^/]+)`)) : null;
  const courseId = match && match[1] !== "new" ? match[1] : null;
  const courseUrl = courseId && course ? `${course.base}/${courseId}` : null;

  return (
    <div className="flex items-stretch gap-2">
      <ul className="flex items-stretch gap-1">
        {items.map((item) => (
          <Tab key={item.href} {...item} current={!courseUrl && (pathname === item.href || pathname.startsWith(`${item.href}/`))} />
        ))}
      </ul>
      {course && courseUrl && (
        <>
          <span aria-hidden="true" className="my-3 w-px shrink-0 bg-border md:my-4" />
          <span id={heading} className="sr-only">
            {course.label}
          </span>
          <ul aria-labelledby={heading} className="flex items-stretch gap-1">
            {course.sections.map((section) => {
              const href = `${courseUrl}${section.path}`;
              const current =
                pathname === href ||
                (section.path !== "" && pathname.startsWith(`${href}/`)) ||
                (section.also ?? []).some((extra) => pathname.startsWith(`${courseUrl}${extra}`));
              return <Tab key={section.path} href={href as Route} icon={section.icon} label={section.label} current={current} />;
            })}
          </ul>
        </>
      )}
    </div>
  );
}
