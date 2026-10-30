import { getTranslations } from "next-intl/server";

import { StudentShell } from "@/components/StudentShell";
import { requireRole } from "@/lib/auth/guard";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("student");
  if ("screen" in access) return access.screen;

  const t = await getTranslations("student.shell");
  return (
    <StudentShell
      home="/alumno/cursos"
      nav={[
        { href: "/alumno/cursos", label: t("nav.courses"), icon: "book-open" },
        { href: "/alumno/perfil", label: t("nav.profile"), icon: "user" }
      ]}
      userName={access.me.display_name}
      roleLabel={t("role")}
    >
      {children}
    </StudentShell>
  );
}
