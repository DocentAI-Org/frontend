import { Brand } from "./Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function PublicHeader() {
  return (
    <header className="border-b border-border-strong bg-surface-raised" data-component="AppShell" data-variant="public">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <Brand />
        </span>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
