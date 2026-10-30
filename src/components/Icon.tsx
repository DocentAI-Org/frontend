/** Icons from the prototype's sprite (Constitution IV: one design system). Always decorative. */
export function Icon({ name, className = "size-4 shrink-0" }: { name: string; className?: string }) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`/prototype/assets/img/icons.svg#${name}`} />
    </svg>
  );
}
