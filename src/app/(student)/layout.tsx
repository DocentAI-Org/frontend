import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { requireRole } from "@/lib/auth/guard";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("student");
  if ("screen" in access) return access.screen;

  const t = await getTranslations("student.shell");
  return (
    <AppShell
      variant="student"
      home="/student/courses"
      nav={[{ href: "/student/courses", label: t("nav.courses"), icon: "book-open" }]}
      course={{
        base: "/student/courses",
        label: t("course.label"),
        sections: [
          { path: "", label: t("course.tutor"), icon: "message-circle", also: ["/conversations"] },
          { path: "/exercise", label: t("course.exercise"), icon: "file-text", also: ["/exercises"] },
          { path: "/quiz", label: t("course.quiz"), icon: "lightbulb", also: ["/quizzes"] },
          { path: "/progress", label: t("course.progress"), icon: "chart-column" }
        ]
      }}
      profile={{ href: "/student/profile", label: t("nav.profile"), icon: "user" }}
      userName={access.me.display_name}
      roleLabel={t("role")}
      banner={
        // Persistent AI and teacher-review notice (001 FR-010, FR-011), above every student page.
        <div className="border-b border-border bg-surface">
          <p
            className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm text-fg-muted sm:px-6 lg:px-8"
            data-component="AIDisclosure"
            data-variant="header-label"
          >
            <Icon name="sparkles" />
            <span>
              <strong className="font-semibold text-fg">{t("aiLabel")}</strong>: {t("teacherReview")}
            </span>
          </p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
