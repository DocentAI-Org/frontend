// F1 · Teacher uploads and validates material (US2). Tasks T047; starts from My courses after T099.
import { expect, test } from "@playwright/test";
import { gotoState, scenario } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F1 · Upload and validate the course material", () => {
  scenario("US-02 AS1", "the empty state explains why material matters and lists formats and size", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "empty");
    const empty = page.locator('[data-component="EmptyState"]');
    await expect(empty).toContainText("PDF, DOCX, Markdown");
    await expect(empty).toContainText("20 MB");
    await expect(empty.getByRole("button", { name: /Selecciona archivos/ })).toBeVisible();
  });

  scenario("US-02 AS2", "each file shows its own progress: uploading, processing, ready", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "empty");
    await page.getByRole("button", { name: /Selecciona archivos/ }).click();
    const tema3 = page.locator('[data-component="FileUploadItem"]').filter({ hasText: "Tema 3 – Ecuaciones de primer grado.pdf" }).first();
    await expect(tema3).toContainText(/Subiendo 45\s%/);
    await expect(tema3.getByRole("progressbar")).toBeVisible();
    await expect(page).toHaveURL(/state=processing/, { timeout: 5000 });
    await expect(page.locator('[data-component="FileUploadItem"]:visible').filter({ hasText: "Tema 3 – Ecuaciones de primer grado.pdf" })).toContainText("Procesando");
    await expect(page).toHaveURL(/state=file-error/, { timeout: 5000 });
    await expect(page.locator('[data-component="FileUploadItem"]:visible').filter({ hasText: "Tema 3 – Ecuaciones de primer grado.pdf" })).toContainText("Listo");
  });

  scenario("US-02 AS3", "a failed file shows a specific error with remove and retry", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "file-error");
    const scanned = page.locator('[data-component="FileUploadItem"]:visible').filter({ hasText: "Hoja de ejercicios escaneada.pdf" });
    await expect(scanned).toContainText("No se ha encontrado texto legible");
    await expect(scanned.getByRole("button", { name: "Eliminar" })).toBeVisible();
    await expect(scanned.getByRole("button", { name: "Reintentar" })).toBeVisible();
    await expect(page.getByText("Formato no admitido")).toBeVisible();
    await expect(page.getByText("Supera el tamaño máximo")).toBeVisible();
  });

  scenario("US-02 AS4", "the fragment review lists ordered fragments with locations and a search", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "fragment review is a desktop page");
    await gotoState(page, "teacher/material.html");
    await page.getByRole("link", { name: /Revisar fragmentos.*Tema 3/ }).click();
    await expect(page).toHaveURL(/teacher\/fragments\.html/);
    const items = page.locator('[data-component="FragmentItem"]:visible');
    await expect(items.first()).toBeVisible();
    await expect(page.locator("main")).toContainText("p. 12");
    await expect(page.locator("main")).toContainText("§ 3.2");
    await page.getByRole("searchbox", { name: "Buscar en los fragmentos" }).fill("despejar");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.locator("mark").first()).toBeVisible();
  });

  scenario("US-02 AS5", "turning inclusion off marks the document as excluded at once", async ({ page }) => {
    await gotoState(page, "teacher/material.html");
    const row = page.locator('[data-component="DocumentRow"]:visible').filter({ hasText: "Tema 3" });
    await expect(row).toContainText("Incluido");
    await row.getByRole("switch", { name: /Incluir en la base de conocimiento/ }).click();
    await expect(row).toContainText("Excluido");
    await expect(row.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  scenario("US-02 AS6", "with everything excluded, a warning says the tutor has no material", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "all-excluded");
    await expect(page.getByRole("alert").filter({ hasText: "El tutor no tiene material" })).toBeVisible();
  });
});
