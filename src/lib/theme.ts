/** The user's theme choice (spec 004 FR-001). No cookie means the system theme. */
export const THEME_COOKIE = "docentai-theme";

export type ThemeChoice = "system" | "light" | "dark";

export function themeFromCookie(value: string | undefined): "light" | "dark" | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
