/** Message keys of the three difficulty levels (backend specs/006: 1 basic … 3 advanced). */
export const LEVEL_KEYS = { 1: "easy", 2: "medium", 3: "hard" } as const;

export function levelKey(level: number): "easy" | "medium" | "hard" {
  return LEVEL_KEYS[level as 1 | 2 | 3] ?? "medium";
}
