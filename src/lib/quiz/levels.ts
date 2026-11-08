/** Message keys of the three difficulty levels (backend specs/006: 1 basic … 3 advanced). */
export const LEVEL_KEYS = { 1: "easy", 2: "medium", 3: "hard" } as const;

export function levelKey(level: number): "easy" | "medium" | "hard" {
  return LEVEL_KEYS[level as 1 | 2 | 3] ?? "medium";
}

/** The topics of a quiz summary, missed most first (frontend 020 US3); ties keep their order. */
export function weakestFirst<T extends { correct: number; total: number }>(topics: T[]): T[] {
  return [...topics].sort((a, b) => a.correct / Math.max(a.total, 1) - b.correct / Math.max(b.total, 1));
}
