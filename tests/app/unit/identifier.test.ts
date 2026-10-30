import { describe, expect, it } from "vitest";

import { toAuthEmail } from "@/lib/auth/identifier";

const DOMAIN = "students.docentai.invalid";

describe("toAuthEmail", () => {
  it("keeps emails, trimmed and lowercased", () => {
    expect(toAuthEmail("  Profesora@DocentAI.local ", DOMAIN)).toBe("profesora@docentai.local");
  });

  it("maps a pseudonymous code to the synthetic auth email", () => {
    expect(toAuthEmail("EST-7K3P9", DOMAIN)).toBe("est-7k3p9@students.docentai.invalid");
    expect(toAuthEmail(" est-7k3p9 ", DOMAIN)).toBe("est-7k3p9@students.docentai.invalid");
  });

  it("returns null for an empty identifier", () => {
    expect(toAuthEmail("   ", DOMAIN)).toBeNull();
  });
});
