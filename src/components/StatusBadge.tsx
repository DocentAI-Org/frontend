import { Icon } from "./Icon";

const TONES = {
  success: "text-success-800",
  warning: "text-warning-900",
  danger: "text-danger-700",
  neutral: "text-fg-muted",
  info: "text-info-800"
} as const;

/** Text plus icon, never color alone (001 FR-004). */
export function StatusBadge({ tone, icon, label }: { tone: keyof typeof TONES; icon: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm py-0.5 text-sm font-semibold ${TONES[tone]}`} data-component="StatusBadge">
      <Icon name={icon} />
      <span>{label}</span>
    </span>
  );
}
