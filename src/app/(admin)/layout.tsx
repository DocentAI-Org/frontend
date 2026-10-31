import { getTranslations } from "next-intl/server";

import { AppShell } from "@/components/AppShell";
import { requireRole } from "@/lib/auth/guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("admin");
  if ("screen" in access) return access.screen;
  const t = await getTranslations("admin.shell");
  return (
    <AppShell
      variant="admin"
      home="/admin/users"
      nav={[
        { href: "/admin/users", label: t("nav.users"), icon: "users" },
        { href: "/admin/courses", label: t("nav.courses"), icon: "book-open" },
        { href: "/admin/study-export", label: t("nav.studyExport"), icon: "file-text" }
      ]}
      userName={access.me.display_name}
      roleLabel={t("role")}
    >
      {children}
    </AppShell>
  );
}
