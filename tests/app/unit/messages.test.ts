import { describe, expect, it } from "vitest";

import { API_ERROR_CODES } from "@/lib/api/errors";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";

type Tree = { [key: string]: string | Tree };

function keys(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`)
  );
}

describe("message catalogs (Constitution VIII)", () => {
  it("have the same keys in Spanish and English", () => {
    expect(keys(en as Tree).sort()).toEqual(keys(es as Tree).sort());
  });

  it("have no empty messages", () => {
    for (const catalog of [es, en] as Tree[]) {
      const empty = keys(catalog).filter((key) => {
        const value = key.split(".").reduce<string | Tree>((node, part) => (node as Tree)[part], catalog);
        return typeof value === "string" && value.trim() === "";
      });
      expect(empty).toEqual([]);
    }
  });

  it("have a message for every API error code and the fallback", () => {
    const esKeys = new Set(keys(es as Tree));
    for (const code of [...API_ERROR_CODES, "unknown"]) {
      expect(esKeys).toContain(`errors.${code}`);
    }
  });
});
