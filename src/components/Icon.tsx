/** Icons from the app's sprite, public/img/icons.svg (AGENTS.md IV: one design system). Always decorative. */
export function Icon({ name, className = "size-4 shrink-0" }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/img/icons.svg#${name}`} />
    </svg>
  );
}
