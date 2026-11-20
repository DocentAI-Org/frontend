// @vitest-environment node
import { describe, expect, it } from "vitest";

import { handleDemo } from "../mock-api/demo.ts";

const PASSWORD = "docentai-dev-password";

async function call(path: string, init: RequestInit = {}) {
  return handleDemo(new Request(`https://demo.invalid${path}`, init));
}

async function get<T>(path: string, token: string): Promise<T> {
  return (await call(path, { headers: { authorization: `Bearer ${token}` } })).json() as Promise<T>;
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
  it("signs in the sample teacher and lists her courses, starred first", async () => {
    const token = await tokenOf("profesora@docentai.local");
    const { items } = await get<{ items: { name: string; student_count: number }[] }>("/v1/teacher/courses", token);
    expect(items.map((c) => c.name)).toEqual(["Álgebra", "Funciones lineales", "Geometría", "Estadística y probabilidad"]);
    for (const course of items) expect(course.student_count).toBeGreaterThanOrEqual(25);
  });

  it("computes the teacher dashboard from the class's activity, with Lucas Herrera at risk", async () => {
    const token = await tokenOf("profesora@docentai.local");
    const { items } = await get<{ items: { id: string; name: string }[] }>("/v1/teacher/courses", token);
    const algebra = items.find((c) => c.name === "Álgebra")!;
    const dashboard = await get<{
      enough_data: boolean;
      errors_by_topic: { topic_name: string | null }[];
      at_risk: { display_name: string }[];
    }>(`/v1/teacher/courses/${algebra.id}/dashboard?period=30d`, token);
    expect(dashboard.enough_data).toBe(true);
    expect(dashboard.errors_by_topic.length).toBeGreaterThanOrEqual(3);
    expect(dashboard.at_risk.map((s) => s.display_name)).toContain("Lucas Herrera");
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
