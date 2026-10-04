// T103 · Constitution VII: sample people are fictitious and every email uses the reserved example.org domain.
import { describe, expect, it } from "vitest";
import { flattenKeys, read } from "./files.js";

const FILES = ["assets/sample/es.json", "assets/sample/en.json", "assets/messages/es.json", "assets/messages/en.json"];

describe("sample data", () => {
  it("uses only @example.org email addresses", () => {
    const emails = FILES.flatMap((f) => [...read(f).matchAll(/[\w.+-]+@[\w.-]+\.\w+/g)].map((m) => `${f}: ${m[0]}`));
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.filter((e) => !e.endsWith("@example.org"))).toEqual([]);
  });

  it("keeps sample content out of the future i18n keys", () => {
    for (const f of ["assets/messages/es.json", "assets/messages/en.json"]) {
      expect(flattenKeys(JSON.parse(read(f))).filter((k) => k.startsWith("sample."))).toEqual([]);
    }
  });
});
