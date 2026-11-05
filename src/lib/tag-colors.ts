/** The palette of course tags (spec 016 US4), on the design system's tokens so dark mode follows. */
export const TAG_COLORS = ["violet", "green", "blue", "amber", "red", "gray"] as const;
export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_STYLES: Record<TagColor, { dot: string; chip: string }> = {
  violet: { dot: "bg-primary-500", chip: "border-primary-200 bg-primary-50 text-primary-800" },
  green: { dot: "bg-success-500", chip: "border-success-200 bg-success-50 text-success-800" },
  blue: { dot: "bg-info-500", chip: "border-info-200 bg-info-50 text-info-800" },
  amber: { dot: "bg-warning-500", chip: "border-warning-200 bg-warning-50 text-warning-800" },
  red: { dot: "bg-danger-500", chip: "border-danger-200 bg-danger-50 text-danger-800" },
  gray: { dot: "bg-neutral-500", chip: "border-border bg-surface-sunken text-fg" }
};
