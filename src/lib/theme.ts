/** Color scheme choice (spec 004 FR-001). No cookie means the system theme. */
export const THEMES = ["system", "light", "dark"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = "docentai-theme";

export function themeFromCookie(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
