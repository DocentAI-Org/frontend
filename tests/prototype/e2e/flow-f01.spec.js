// F1 · Teacher uploads and validates material (US2). Tasks T047, T121 (validation, 2026-10-06); starts from My courses after T099.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F1 · Upload and validate the course material", () => {
  scenario("US-02 (start)", "the teacher reaches the material from My courses and the course", async ({ page }) => {
    await gotoState(page, "teacher/courses.html");
    await page.getByRole("link", { name: /Matemáticas 3º ESO – Álgebra/ }).click();
    await expect(page).toHaveURL(/teacher\/course\.html/);
    await waitForReady(page);
    await page.getByRole("link", { name: "Material" }).click();
    await expect(page).toHaveURL(/teacher\/material\.html/);
  });

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

  scenario("US-02 AS5", "a processed document waits for validation, and validating it records who and when", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "pending-validation");
    const row = page.locator('[data-component="DocumentRow"]:visible').filter({ hasText: "Tema 3" });
    await expect(row.locator('[data-component="ValidationStatus"]')).toHaveText("Pendiente de validar");
    await expect(row).toContainText("El tutor no lo usa hasta que lo valides");
    await row.getByRole("button", { name: /^Validar/ }).click();
    await expect(page).toHaveURL(/state=validate-confirm/);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("El tutor empezará a usar este documento");
    await dialog.getByRole("button", { name: "Validar documento" }).click();
    await expect(page).toHaveURL(/state=validated/);
    const validated = page.locator('[data-component="DocumentRow"]:visible').filter({ hasText: "Tema 3" });
    await expect(validated.locator('[data-component="ValidationStatus"]')).toHaveText("Validado");
    await expect(validated).toContainText("Prof. Elena Ruiz Navarro");
    await expect(validated).toContainText("6 oct 2026");
    await expect(page.locator("main")).toContainText("El tutor usa 2 de 3 documentos");
  });

  scenario("US-02 AS6", "excluding a fragment marks it, offers to include it again and counts it", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "fragment review is a desktop page");
    await gotoState(page, "teacher/fragments.html");
    const first = page.locator('[data-component="FragmentItem"]:visible').first();
    await first.getByRole("switch", { name: /Excluir fragmento/ }).click();
    await expect(page).toHaveURL(/state=fragment-excluded/);
    const excluded = page.locator('[data-component="FragmentItem"][data-variant="excluded"]:visible').first();
    await expect(excluded).toContainText("Excluido");
    await expect(excluded.getByRole("switch", { name: /Excluir fragmento/ })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("main")).toContainText("3 fragmentos excluidos");
  });

  scenario("US-02 AS7", "excluding a whole document asks first and can be undone by validating again", async ({ page }) => {
    await gotoState(page, "teacher/material.html");
    const row = page.locator('[data-component="DocumentRow"]:visible').filter({ hasText: "Tema 3" });
    await row.getByRole("button", { name: /Excluir documento/ }).click();
    await expect(page).toHaveURL(/state=exclude-confirm/);
    await page.getByRole("dialog").getByRole("button", { name: "Excluir documento" }).click();
    await expect(page).toHaveURL(/state=document-excluded/);
    const excluded = page.locator('[data-component="DocumentRow"]:visible').filter({ hasText: "Tema 3" });
    await expect(excluded.locator('[data-component="ValidationStatus"]')).toHaveText("Excluido");
    await expect(excluded.getByRole("button", { name: /^Validar/ })).toBeVisible();
  });

  scenario("US-02 AS8", "with no validated material, a warning says the tutor has none", async ({ page }) => {
    await gotoState(page, "teacher/material.html", "no-validated");
    await expect(page.getByRole("alert").filter({ hasText: "El tutor no tiene material validado" })).toBeVisible();
  });
});
