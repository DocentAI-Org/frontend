import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/AppShell";
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
      profile={{ href: "/student/profile", label: t("nav.profile"), icon: "user" }}
      userName={access.me.display_name}
      roleLabel={t("role")}
    >
      {children}
    </AppShell>
  );
}
