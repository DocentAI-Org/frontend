import type { ReactNode } from "react";

import { Icon } from "./Icon";

export type AlertTone = "danger" | "warning" | "info" | "success";

const TONES: Record<AlertTone, { box: string; text: string; icon: string }> = {
  danger: { box: "border border-danger-200 bg-danger-50", text: "text-danger-700", icon: "triangle-alert" },
  warning: { box: "bg-warning-200", text: "text-warning-900", icon: "clock" },
  info: { box: "border border-info-200 bg-info-50", text: "text-info-800", icon: "info" },
  success: { box: "border border-success-200 bg-success-50", text: "text-success-800", icon: "check" }
};

/** Inline message. Errors and warnings interrupt (role="alert"); the rest are polite. */
export function Alert({
  tone,
  title,
  children,
  icon,
  action
}: {
  tone: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: string;
  action?: ReactNode;
}) {
  const style = TONES[tone];
  const urgent = tone === "danger" || tone === "warning";
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={`flex items-start gap-4 rounded-lg p-4 ${style.box}`}
      data-component="Alert"
      data-variant={tone}
    >
      <Icon name={icon ?? style.icon} className={`mt-0.5 size-5 shrink-0 ${style.text}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className={`font-semibold ${style.text}`}>{title}</p>}
        {children && <div className={style.text}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
