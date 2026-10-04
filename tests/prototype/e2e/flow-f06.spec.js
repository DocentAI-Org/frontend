// F6 · Teacher creates a course, student joins (US4). Tasks T056.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F6 · Create a course and join it", () => {
  scenario("US-04 AS1", "a teacher with no courses is invited to create the first one", async ({ page }) => {
    await gotoState(page, "teacher/courses.html", "empty");
    const empty = page.locator('[data-component="EmptyState"]');
    await expect(empty).toContainText("Crea tu primer curso");
    await expect(empty.getByRole("link", { name: "Crear curso" })).toHaveAttribute("href", /course-new\.html/);
  });

  scenario("US-04 AS2", "creating a course shows the class code and link with copy actions", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "create course is a desktop page");
    await gotoState(page, "teacher/course-new.html");
    await page.getByRole("button", { name: "Crear curso" }).click();
    await expect(page).toHaveURL(/state=validation-error/);
    await expect(page.getByRole("textbox", { name: /Nombre del curso/ })).toHaveAttribute("aria-invalid", "true");
    await page.getByRole("textbox", { name: /Nombre del curso/ }).fill("Matemáticas 3º ESO – Álgebra");
    await page.getByRole("button", { name: "Crear curso" }).click();
    await expect(page).toHaveURL(/teacher\/course\.html\?.*state=no-students/);
    await waitForReady(page);
    const code = page.locator('[data-component="ClassCode"]:visible');
    await expect(code).toContainText("ALG-7K3P");
    await expect(code.getByRole("textbox", { name: "Enlace de invitación" })).toHaveValue(/unirse\/ALG-7K3P/);
    await code.getByRole("button", { name: "Copiar código" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Copiado" })).toBeVisible();
  });

  scenario("US-04 AS3", "the students tab lists students or points to the code", async ({ page }) => {
    await gotoState(page, "teacher/course.html");
    await expect(page.getByRole("link", { name: "Estudiantes" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main")).toContainText("Estudiante-07");
    await gotoState(page, "teacher/course.html", "no-students");
    await expect(page.locator('[data-component="EmptyState"]')).toContainText("ALG-7K3P");
  });

  scenario("US-04 AS4", "regenerating or disabling the code changes its state", async ({ page }) => {
    await gotoState(page, "teacher/course.html");
    await page.getByRole("button", { name: "Generar código nuevo" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Generar un código nuevo?" });
    await expect(dialog).toContainText("ALG-7K3P");
    await dialog.getByRole("button", { name: "Generar código nuevo" }).click();
    await expect(page).toHaveURL(/state=code-regenerated/);
    await expect(page.locator('[data-component="ClassCode"]:visible')).toContainText("ALG-9Q2M");
    await expect(page.getByText("El código anterior ya no funciona")).toBeVisible();

    await gotoState(page, "teacher/course.html");
    await page.getByRole("button", { name: "Desactivar código" }).click();
    await expect(page).toHaveURL(/state=code-disabled/);
    await expect(page.locator('[data-component="ClassCode"][data-variant="disabled"]')).toContainText("Desactivado");
  });

  scenario("US-04 AS5", "a valid code shows the course and teacher, and joining adds it to the list", async ({ page }) => {
    await gotoState(page, "student/join.html");
    await page.getByRole("textbox", { name: "Código de clase" }).fill("alg-7k3p");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/state=confirm/);
    await expect(page.locator("main")).toContainText("Matemáticas 3º ESO – Álgebra");
    await expect(page.locator("main")).toContainText("Prof. Elena Ruiz Navarro");
    await page.getByRole("link", { name: "Unirme al curso" }).click();
    await expect(page).toHaveURL(/student\/courses\.html/);
    await waitForReady(page);
    await expect(page.getByRole("heading", { name: "Matemáticas 3º ESO – Álgebra" })).toBeVisible();
  });

  scenario("US-04 AS6", "invalid, expired and disabled codes explain the problem", async ({ page }) => {
    const cases = [
      ["XYZ-0000", "invalid-code", "no corresponde a ningún curso"],
      ["ALG-4X2B", "expired-code", "ha caducado"],
      ["ALG-8M1D", "disabled-code", "ha desactivado"]
    ];
    for (const [code, state, text] of cases) {
      await gotoState(page, "student/join.html");
      const field = page.getByRole("textbox", { name: "Código de clase" });
      await field.fill(code);
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(page).toHaveURL(new RegExp(`state=${state}`));
      await expect(field).toHaveAttribute("aria-invalid", "true");
      await expect(field).toHaveAccessibleDescription(new RegExp(text));
      await expect(field).toHaveAccessibleDescription(/profesor\/a/);
    }
  });
});
