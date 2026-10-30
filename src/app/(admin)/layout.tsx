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
      home="/admin/usuarios"
      nav={[
        { href: "/admin/usuarios", label: t("nav.users"), icon: "users" },
        { href: "/admin/cursos", label: t("nav.courses"), icon: "book-open" }
      ]}
      userName={access.me.display_name}
      roleLabel={t("role")}
    >
      {children}
    </AppShell>
  );
}
