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

const ROW =
  "flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-fg-muted hover:bg-surface-sunken hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-current:bg-surface-sunken data-current:font-medium data-current:text-fg";

function Row({ href, icon, label, current }: { href: Route; icon: string; label: string; current: boolean }) {
  return (
    <li>
      <Link href={href} aria-current={current ? "page" : undefined} data-current={current ? "" : undefined} className={ROW}>
        <Icon name={icon} />
        <span>{label}</span>
      </Link>
    </li>
  );
}

/**
 * The sidebar of the signed-in shell, like a project dashboard: the role's sections and, inside a
 * course, that course's sections as a second group. The course is read from the URL.
 */
export function SidebarNav({ items, course }: { items: NavItem[]; course?: CourseNav }) {
  const pathname = usePathname();
  const heading = useId();
  const match = course ? pathname.match(new RegExp(`^${course.base}/([^/]+)`)) : null;
  const courseId = match && match[1] !== "new" ? match[1] : null;
  const courseUrl = courseId && course ? `${course.base}/${courseId}` : null;

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <Row
            key={item.href}
            {...item}
            current={!courseUrl && (pathname === item.href || pathname.startsWith(`${item.href}/`))}
          />
        ))}
      </ul>
      {course && courseUrl && (
        <div className="flex flex-col gap-1">
          <p id={heading} className="px-3 text-xs font-medium text-fg-muted">
            {course.label}
          </p>
          <ul aria-labelledby={heading} className="flex flex-col gap-1">
            {course.sections.map((section) => {
              const href = `${courseUrl}${section.path}`;
              const current =
                pathname === href ||
                (section.path !== "" && pathname.startsWith(`${href}/`)) ||
                (section.also ?? []).some((extra) => pathname.startsWith(`${courseUrl}${extra}`));
              return <Row key={section.path} href={href as Route} icon={section.icon} label={section.label} current={current} />;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
