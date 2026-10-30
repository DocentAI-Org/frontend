// US3 — teacher uploads, reviews and validates material (spec 002 US3, 001 US2).
import type { Page } from "@playwright/test";

import { USERS, expect, expectAccessible, scenario, signIn, test } from "./helpers";

const MARKDOWN = `# Tema 3: Ecuaciones de primer grado

Una ecuación de primer grado es una igualdad con una incógnita.

## 3.1 Transponer términos

Un término que suma en un miembro pasa restando al otro.

## 3.2 Despejar la incógnita

Se divide entre el número que multiplica a la incógnita.
`;

async function courseMaterial(page: Page) {
  await signIn(page, USERS.teacher);
  await page.goto("/teacher/courses/new");
  await page.getByLabel(/nombre del curso/i).fill("Álgebra");
  await page.getByRole("button", { name: /crear curso/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Álgebra" })).toBeVisible();
  await page.getByRole("link", { name: /^material$/i }).click();
  await expect(page.getByRole("heading", { level: 2, name: /sube tu primer documento/i })).toBeVisible();
}

async function upload(page: Page, name: string, content: string | Buffer, mimeType = "text/markdown") {
  await page.getByLabel(/selecciona archivos/i).setInputFiles({ name, mimeType, buffer: Buffer.from(content) });
}

async function readyDocument(page: Page, name = "ecuaciones.md") {
  await upload(page, name, MARKDOWN);
  const row = page.getByRole("listitem").filter({ hasText: name }).filter({ has: page.getByText(/pendiente de validar/i) });
  await expect(row).toBeVisible({ timeout: 20_000 });
  return row;
}

test.describe("US3 material", () => {
  scenario("001-US2-AS1", "an empty course explains why material matters and how to upload", async ({ page }) => {
    await courseMaterial(page);

    await expect(page.getByText(/el tutor solo responde con el material/i).first()).toBeVisible();
    await expect(page.getByText(/pdf, docx, markdown/i).first()).toBeVisible();
    await expectAccessible(page);
  });

  scenario("001-US2-AS2", "each file shows its own progress and status until ready", async ({ page }) => {
    await courseMaterial(page);

    await upload(page, "ecuaciones.md", MARKDOWN);

    await expect(page.getByText(/procesando/i).first()).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "ecuaciones.md" }).getByText(/pendiente de validar/i)).toBeVisible({
      timeout: 20_000
    });
    await expectAccessible(page);
  });

  scenario("001-US2-AS3", "a failing file shows a specific error with a remove action", async ({ page }) => {
    await courseMaterial(page);

    await upload(page, "foto.png", "png", "image/png");
    await expect(page.getByText(/formato no admitido/i)).toBeVisible();

    await upload(page, "escaneo.pdf", "not a real pdf", "application/pdf");
    const row = page.getByRole("listitem").filter({ hasText: "escaneo.pdf" });
    await expect(row.getByText(/formato no admitido|no se ha encontrado texto/i)).toBeVisible({ timeout: 20_000 });
    await expectAccessible(page);
    await row.getByRole("button", { name: /eliminar/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /eliminar/i }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "escaneo.pdf" })).toHaveCount(0);
  });

  scenario("001-US2-AS4", "the fragment review lists fragments with their location and can search", async ({ page }) => {
    await courseMaterial(page);
    const row = await readyDocument(page);

    await row.getByRole("link", { name: /revisar fragmentos/i }).click();

    await expect(page.getByRole("heading", { level: 1, name: /revisión de fragmentos/i })).toBeVisible();
    await expect(page.getByText("§ 3.1 Transponer términos")).toBeVisible();
    await expectAccessible(page);
    await page.getByLabel(/buscar en los fragmentos/i).fill("despejar");
    await page.getByLabel(/buscar en los fragmentos/i).press("Enter");
    await expect(page.getByText(/1 fragmento contiene «despejar»/i)).toBeVisible();
    await expect(page.getByText("§ 3.1 Transponer términos")).toHaveCount(0);
  });

  scenario("001-US2-AS5", "validating a document records who and when", async ({ page }) => {
    await courseMaterial(page);
    const row = await readyDocument(page);
    await expect(row.getByText(/el tutor no lo usa hasta que lo valides/i)).toBeVisible();

    await row.getByRole("button", { name: /^validar/i }).click();
    await expectAccessible(page);
    await page.getByRole("dialog").getByRole("button", { name: /validar documento/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /está validado/i })).toBeVisible();
    const validated = page.getByRole("listitem").filter({ hasText: "ecuaciones.md" });
    await expect(validated.getByText(/^validado$/i)).toBeVisible();
    await expect(validated.getByText(/por Prof\. Elena Ruiz/)).toBeVisible();
    await expect(page.getByText(/el tutor usa 1 de 1 documentos/i)).toBeVisible();
  });

  scenario("001-US2-AS6", "excluding a fragment marks it and counts it on the document", async ({ page }) => {
    await courseMaterial(page);
    const row = await readyDocument(page);
    await row.getByRole("link", { name: /revisar fragmentos/i }).click();

    const fragment = page.getByRole("listitem").filter({ hasText: "§ 3.1 Transponer términos" });
    await fragment.getByRole("button", { name: /excluir fragmento/i }).click();
    await expect(fragment.getByText(/excluido: el tutor no usa este fragmento/i)).toBeVisible();
    await expect(page.getByText(/1 fragmento excluido/i).first()).toBeVisible();
    await fragment.getByRole("button", { name: /incluir/i }).click();
    await expect(fragment.getByText(/excluido: el tutor no usa/i)).toHaveCount(0);
  });

  scenario("001-US2-AS7", "excluding a document stops the tutor from using it; it can be validated again", async ({ page }) => {
    await courseMaterial(page);
    const row = await readyDocument(page);
    await row.getByRole("button", { name: /^validar/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /validar documento/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /está validado/i })).toBeVisible();

    await page.getByRole("listitem").filter({ hasText: "ecuaciones.md" }).getByRole("button", { name: /excluir documento/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /excluir documento/i }).click();

    await expect(page.getByRole("status").filter({ hasText: /está excluido/i })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "ecuaciones.md" }).getByText(/^excluido$/i)).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "ecuaciones.md" }).getByRole("button", { name: /^validar/i })).toBeVisible();
  });

  scenario("001-US2-AS8", "no validated material shows a warning", async ({ page }) => {
    await courseMaterial(page);
    await readyDocument(page);

    await expect(page.getByRole("alert").filter({ hasText: /no tiene material validado/i })).toBeVisible();
  });

  scenario("002-US3-AS2", "a duplicate name asks to replace or keep both", async ({ page }) => {
    await courseMaterial(page);
    await readyDocument(page);

    await upload(page, "ecuaciones.md", MARKDOWN);
    await expect(page.getByRole("dialog")).toContainText(/ya existe un documento con este nombre/i);
    await page.getByRole("dialog").getByRole("button", { name: /reemplazar/i }).click();

    await expect(page.getByRole("listitem").filter({ hasText: "ecuaciones.md" }).filter({ has: page.getByText(/pendiente de validar/i) })).toHaveCount(1, {
      timeout: 20_000
    });
  });

  scenario("002-US3-AS4", "the original file opens through a short-lived link", async ({ page }) => {
    await courseMaterial(page);
    const row = await readyDocument(page);

    const link = row.getByRole("link", { name: /ver original/i });
    await expect(link).toHaveAttribute("href", /\/file$/);
  });
});
