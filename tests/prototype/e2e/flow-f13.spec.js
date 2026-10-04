// F13 · Teacher reviews AI-drafted quiz questions (US10). Tasks T091. Desktop page.
import { expect, gotoState, scenario, test } from "./helpers.js";

test.describe.configure({ mode: "serial" });

const card = (page, text) => page.locator('[data-component="QuizQuestion"]:visible').filter({ hasText: text });
const tab = (page, name) => page.getByRole("navigation", { name: "Estado de las preguntas" }).getByRole("link", { name: new RegExp(name) });

test.describe("F13 · Question review", () => {
  test.skip(({ isMobile }) => isMobile, "question review is a desktop page");

  scenario("US-10 AS1", "each pending question shows text, options, answer, difficulty, topic and source", async ({ page }) => {
    await gotoState(page, "teacher/questions.html");
    const q = card(page, "¿Cuál es la solución de 3x + 5 = 20?");
    await expect(q).toBeVisible();
    await expect(q.getByRole("listitem")).toHaveCount(3);
    await expect(q).toContainText("Respuesta correcta");
    await expect(q).toContainText("Fácil");
    await expect(q).toContainText("Ecuaciones de primer grado");
    await expect(q.locator('[data-component="SourceCitation"]')).toContainText("Tema 3 · p. 12");
  });

  scenario("US-10 AS2", "approve, edit-and-approve and reject move questions and update the counters", async ({ page }) => {
    await gotoState(page, "teacher/questions.html");
    await expect(tab(page, "Pendientes")).toContainText("3");
    await card(page, "¿Cuál es la solución de 3x + 5 = 20?").getByRole("button", { name: "Aprobar" }).click();
    await expect(page).toHaveURL(/state=approved/);
    await expect(tab(page, "Aprobadas")).toContainText("13");
    await expect(tab(page, "Pendientes")).toContainText("2");
    await expect(card(page, "¿Cuál es la solución de 3x + 5 = 20?")).toBeVisible();

    await gotoState(page, "teacher/questions.html");
    await card(page, "2(x − 3)").getByRole("button", { name: "Editar" }).click();
    await expect(page).toHaveURL(/state=editing/);
    await expect(page.getByRole("textbox", { name: "Enunciado" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar y aprobar" }).click();
    await expect(page).toHaveURL(/state=approved/);

    await gotoState(page, "teacher/questions.html");
    await card(page, "x + y = 5").getByRole("button", { name: "Rechazar" }).click();
    await expect(page).toHaveURL(/state=rejected/);
    await expect(tab(page, "Rechazadas")).toContainText("3");
  });

  scenario("US-10 AS3", "with nothing pending, the empty state offers to request questions for a topic", async ({ page }) => {
    await gotoState(page, "teacher/questions.html", "empty");
    const empty = page.locator('[data-component="EmptyState"]:visible');
    await expect(empty).toContainText("No hay preguntas pendientes");
    await expect(empty.getByRole("combobox", { name: "Tema" })).toBeVisible();
    await expect(empty.getByRole("button", { name: "Pedir preguntas nuevas" })).toBeVisible();
  });
});
