// F16 · Teacher defines the course topics (US14). Task T135. Desktop pages.
import { expect, gotoState, scenario, test, waitForReady } from "./helpers.js";

test.describe.configure({ mode: "serial" });

test.describe("F16 · Course topics", () => {
  test.skip(({ isMobile }) => isMobile, "the topic pages are desktop pages");

  scenario("US-14 (start)", "the teacher reaches the topics from the course tabs", async ({ page }) => {
    await gotoState(page, "teacher/course.html");
    await page.getByRole("link", { name: "Temas" }).click();
    await expect(page).toHaveURL(/teacher\/topics\.html/);
    await waitForReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Temas del curso");
  });

  scenario("US-14 AS1", "with no topics, an empty state explains them and offers to add the first one", async ({ page }) => {
    await gotoState(page, "teacher/topics.html", "empty");
    const empty = page.locator('[data-component="EmptyState"]:visible');
    await expect(empty).toContainText("objetivos de aprendizaje");
    await expect(empty.getByRole("textbox", { name: "Nombre del tema" })).toBeVisible();
    await expect(empty.getByRole("button", { name: "Añadir el primer tema" })).toBeVisible();
  });

  scenario("US-14 AS2", "topics can be added, renamed, reordered and deleted after confirming", async ({ page }) => {
    await gotoState(page, "teacher/topics.html");
    const list = () => page.locator('[data-component="TopicList"]:visible');
    await expect(list().locator("li")).toHaveCount(4);
    const add = page.getByRole("textbox", { name: "Nuevo tema" });
    await page.getByRole("button", { name: "Añadir tema" }).click();
    await expect(page).not.toHaveURL(/state=added/);
    expect(await add.evaluate((el) => el.validity.valid)).toBe(false);
    await add.fill("Inecuaciones");
    await page.getByRole("button", { name: "Añadir tema" }).click();
    await expect(page).toHaveURL(/state=added/);
    await expect(list().locator("li")).toHaveCount(5);
    await expect(list()).toContainText("Inecuaciones");

    await gotoState(page, "teacher/topics.html");
    await page.getByRole("button", { name: /Renombrar\s?:\s?Factorización/ }).click();
    await expect(page).toHaveURL(/state=editing/);
    await expect(page.getByRole("textbox", { name: "Nombre del tema" })).toHaveValue("Factorización");
    await page.getByRole("button", { name: "Guardar nombre" }).click();
    await expect(page).toHaveURL(/state=default/);

    await page.getByRole("button", { name: /Subir\s?:\s?Polinomios/ }).click();
    await expect(page).toHaveURL(/state=reordered/);
    await expect(list().locator("li").nth(1)).toContainText("Polinomios");
    await expect(page.getByRole("button", { name: /Subir\s?:\s?Ecuaciones de primer grado/ })).toBeDisabled();

    await gotoState(page, "teacher/topics.html");
    await page.getByRole("button", { name: /Eliminar\s?:\s?Polinomios/ }).click();
    await expect(page).toHaveURL(/state=delete-confirm/);
    const dialog = page.getByRole("dialog", { name: "¿Eliminar «Polinomios»?" });
    await expect(dialog).toContainText("2 secciones quedarán sin tema");
    await dialog.getByRole("button", { name: "Eliminar tema" }).click();
    await expect(page).toHaveURL(/state=unassigned/);
    await expect(list()).not.toContainText("Polinomios");
  });

  scenario("US-14 AS3", "suggested topics stay provisional until the teacher confirms or changes them", async ({ page }) => {
    await gotoState(page, "teacher/topic-assignment.html");
    const rows = page.locator('[data-component="TopicAssignmentRow"]:visible');
    await expect(page.locator('[data-tag="suggested"]:visible')).toHaveCount(3);
    const first = rows.filter({ hasText: "§ 3.1" });
    await first.getByRole("switch", { name: /Confirmado/ }).click();
    await expect(first.locator('[data-tag="suggested"]')).toBeHidden();
    await expect(first.locator('[data-tag="confirmed"]')).toBeVisible();
    const last = rows.filter({ hasText: "§ 3.4" });
    await last.getByRole("combobox").selectOption({ label: "Ecuaciones de primer grado" });
    await page.getByRole("button", { name: "Confirmar todas" }).click();
    await expect(page).toHaveURL(/state=confirmed/);
    await expect(page.locator('[data-tag="suggested"]:visible')).toHaveCount(0);
  });

  scenario("US-14 AS4", "sections without a topic are listed on the topics page and on the material page", async ({ page }) => {
    await gotoState(page, "teacher/topics.html");
    await expect(page.getByRole("alert").filter({ hasText: "sin tema" })).toContainText("§ 4 Factorizar trinomios");
    await gotoState(page, "teacher/material.html", "unassigned-topics");
    await expect(page.getByRole("alert").filter({ hasText: "sin tema" })).toContainText("Ejercicios resueltos – Polinomios");
    await expect(page.locator('[data-component="DocumentRow"]:visible').first()).toContainText("Temas:");
  });

  scenario("US-14 AS5", "if suggestions cannot be loaded, topics can still be assigned by hand", async ({ page }) => {
    await gotoState(page, "teacher/topic-assignment.html", "suggestions-error");
    await expect(page.getByRole("alert")).toContainText("No hemos podido cargar las sugerencias");
    const select = page.locator('[data-component="TopicAssignmentRow"]:visible').first().getByRole("combobox");
    await expect(select).toBeEnabled();
    await select.selectOption({ label: "Ecuaciones de primer grado" });
  });
});
