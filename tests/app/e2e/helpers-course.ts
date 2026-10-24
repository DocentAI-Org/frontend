// Course setup shared by the teacher stories.
import type { Page } from "@playwright/test";

import { USERS, expect, signIn } from "./helpers";

export async function newCourse(page: Page, name = "Álgebra") {
  await signIn(page, USERS.teacher);
  await page.goto("/profesor/cursos/nuevo");
  await page.getByLabel(/nombre del curso/i).fill(name);
  await page.getByRole("button", { name: /crear curso/i }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  return { url: page.url(), code: ((await page.getByTestId("class-code").textContent()) ?? "").trim() };
}
