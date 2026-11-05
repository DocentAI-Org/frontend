import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/auth/guard";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("teacher");
  if ("screen" in access) return access.screen;
  const t = await getTranslations("teacher");
  return (
    <AppShell
      variant="teacher"
      home="/teacher/courses"
      nav={[{ href: "/teacher/courses", label: t("shell.nav.courses"), icon: "book-open" }]}
      course={{
        base: "/teacher/courses",
        label: t("shell.course"),
        sections: [
          { path: "", label: t("course.tab.students"), icon: "users", also: ["/students"] },
          { path: "/dashboard", label: t("course.tab.dashboard"), icon: "chart-column" },
          { path: "/conversations", label: t("course.tab.conversations"), icon: "message-circle", also: ["/exercises", "/corrections"] },
          { path: "/material", label: t("course.tab.material"), icon: "file-text" },
          { path: "/topics", label: t("course.tab.topics"), icon: "book-open" },
          { path: "/questions", label: t("course.tab.questions"), icon: "circle-help" },
          { path: "/test", label: t("course.tab.test"), icon: "check" },
          { path: "/tutor", label: t("course.tab.settings"), icon: "sparkles" },
          { path: "/criteria", label: t("course.tab.criteria"), icon: "settings" }
        ]
      }}
      userName={access.me.display_name}
      roleLabel={t("shell.role")}
    >
      {children}
    </AppShell>
  );
}
