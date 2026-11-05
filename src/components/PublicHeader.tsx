import { themeChoice } from "@/lib/theme-server";

import { Brand } from "./Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export async function PublicHeader() {
  const theme = await themeChoice();
  return (
    <header className="border-b border-border bg-surface-raised" data-component="AppShell" data-variant="public">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher initial={theme} />
        </div>
      </div>
    </header>
  );
}
