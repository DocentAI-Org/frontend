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
      userName={access.me.display_name}
      roleLabel={t("shell.role")}
    >
      {children}
    </AppShell>
  );
}
