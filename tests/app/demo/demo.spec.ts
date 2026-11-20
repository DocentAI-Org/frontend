// The demo deployment: sample accounts on the sign-in page, one-click sign-in, sample data.
import { test } from "@playwright/test";

import { expect, expectAccessible } from "../e2e/helpers";

test("the sign-in page shows the demo notice and the sample accounts", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByText(/demo con datos ficticios/i)).toBeVisible();
  const accounts = page.getByRole("region", { name: /prueba la demo/i });
  await expect(accounts.getByText("profesora@docentai.local")).toBeVisible();
  await expect(accounts.getByText("docentai-dev-password")).toBeVisible();
  await expectAccessible(page);
});

test("a sample account signs in with one click and finds sample courses", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByRole("button", { name: /entrar como profesora/i }).click();

  await expect(page.getByRole("heading", { level: 1, name: /mis cursos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Álgebra" })).toBeVisible();
  await expect(page.getByText(/demo con datos ficticios/i)).toBeVisible();
  await expectAccessible(page);
});

test("the sample student asks the tutor and gets an answer from the material", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: /entrar como alumno/i }).click();
  await page.getByRole("link", { name: /álgebra/i }).first().click();

  await page.getByRole("textbox", { name: /pregunta/i }).fill("¿Cómo despejo la incógnita en 2x = 4?");
  await page.getByRole("button", { name: /enviar/i }).click();

  await expect(page.getByText(/ecuaciones\.md/).last()).toBeVisible();
});
