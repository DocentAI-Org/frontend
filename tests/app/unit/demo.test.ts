// @vitest-environment node
import { describe, expect, it } from "vitest";

import { handleDemo } from "../mock-api/demo.ts";

const PASSWORD = "docentai-dev-password";

async function call(path: string, init: RequestInit = {}) {
  return handleDemo(new Request(`https://demo.invalid${path}`, init));
}

async function tokenOf(email: string): Promise<string> {
  const response = await call("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD })
  });
  return ((await response.json()) as { access_token: string }).access_token;
}

describe("demo backend", () => {
  it("signs in the sample teacher and lists her sample courses, Álgebra first", async () => {
    const token = await tokenOf("profesora@docentai.local");
    const response = await call("/v1/teacher/courses", { headers: { authorization: `Bearer ${token}` } });
    const { items } = (await response.json()) as { items: { name: string }[] };
    expect(items.map((c) => c.name)).toEqual(["Álgebra", "Funciones lineales", "Geometría"]);
  });

  it("gives the sample student a course with material to ask about", async () => {
    const token = await tokenOf("alumno@docentai.local");
    const response = await call("/v1/student/courses", { headers: { authorization: `Bearer ${token}` } });
    const { items } = (await response.json()) as { items: { name: string }[] };
    expect(items.map((c) => c.name)).toContain("Álgebra");
  });

  it("keeps the test helpers out of reach", async () => {
    const response = await call("/__test/reset", { method: "POST" });
    expect(response.status).toBe(404);
  });
});
