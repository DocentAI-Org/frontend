import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-fg-inverse hover:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-600",
  secondary:
    "border border-border-strong bg-surface-raised text-fg hover:bg-surface-sunken disabled:text-fg-muted",
  ghost: "text-fg hover:bg-surface-sunken disabled:text-fg-muted",
  danger:
    "bg-danger-600 text-fg-inverse hover:bg-danger-700 disabled:bg-neutral-200 disabled:text-neutral-600"
};

export function buttonClass(variant: ButtonVariant = "primary", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`.trim();
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  icon?: string;
  /** Shows the spinner and `pendingLabel`, and disables the button (Button "loading" state). */
  pending?: boolean;
  pendingLabel?: ReactNode;
};

export function Button({
  variant = "primary",
  icon,
  pending = false,
  pendingLabel,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClass(variant, className)}
      data-component="Button"
      data-variant={variant}
    >
      {pending ? (
        <Icon name="refresh-cw" className="size-4 shrink-0 motion-safe:animate-spin" />
      ) : (
        icon && <Icon name={icon} />
      )}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; icon?: string; iconEnd?: string };

export function LinkButton({ variant = "primary", icon, iconEnd, className = "", children, ...props }: LinkButtonProps) {
  return (
    <Link {...props} className={buttonClass(variant, className)} data-component="Button" data-variant={variant}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} />}
    </Link>
  );
}
