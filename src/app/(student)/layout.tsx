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
      home="/alumno/cursos"
      nav={[
        { href: "/alumno/cursos", label: t("nav.courses"), icon: "book-open" },
        { href: "/alumno/perfil", label: t("nav.profile"), icon: "user" }
      ]}
      userName={access.me.display_name}
      roleLabel={t("role")}
      banner={
        // Persistent AI and teacher-review notice (001 FR-010, FR-011).
        <div className="border-b border-border bg-surface">
          <p
            className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm text-fg-muted sm:px-6"
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
