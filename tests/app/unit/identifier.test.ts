import { describe, expect, it } from "vitest";

import { isEmail, toAuthEmail } from "@/lib/auth/identifier";

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

describe("isEmail", () => {
  it.each(["ana@example.org", "a.b+c@mail.example.org"])("accepts %s", (value) => {
    expect(isEmail(value)).toBe(true);
  });

  it.each(["", "ana", "ana@example", "ana@example.", "ana@.org", "a b@example.org", "@example.org", "ana@example..org"])(
    "rejects %j",
    (value) => {
      expect(isEmail(value)).toBe(false);
    }
  );

  // A server action accepts up to 1 MB; the check must stay linear in the input.
  it("answers quickly for a long input that is not an email", () => {
    const start = performance.now();
    expect(isEmail(`a@${".".repeat(200_000)}@`)).toBe(false);
    expect(performance.now() - start).toBeLessThan(200);
  });
});
