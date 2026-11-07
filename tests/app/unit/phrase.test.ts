import { describe, expect, it } from "vitest";

import { samePhrase } from "@/lib/phrase";

describe("typed confirmation (spec 017)", () => {
  it("ignores case and surrounding spaces", () => {
    expect(samePhrase(" est-ab2cd ", "EST-AB2CD")).toBe(true);
    expect(samePhrase("lucas herrera", "Lucas Herrera")).toBe(true);
  });

  it("rejects anything else, and an empty phrase", () => {
    expect(samePhrase("EST-AB2C", "EST-AB2CD")).toBe(false);
    expect(samePhrase("Lucas  Herrera", "Lucas Herrera")).toBe(false);
    expect(samePhrase("", "")).toBe(false);
    expect(samePhrase("  ", " ")).toBe(false);
  });
});
