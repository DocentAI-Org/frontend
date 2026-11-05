// 016 — search, sort and favourites in the lists (backend specs/016).
import type { APIRequestContext, Page } from "@playwright/test";

import { MOCK, USERS, chooseOption, expect, expectAccessible, scenario, signIn, test } from "./helpers";

async function courses(request: APIRequestContext, names: string[], enrol = false) {
  await request.post(`${MOCK}/__test/courses`, { data: { names, enrol } });
}

const search = (page: Page) => page.getByRole("searchbox", { name: /buscar/i });
const courseTitles = (page: Page) => page.getByRole("main").getByRole("heading", { level: 2 });
const star = (page: Page, name: string) => page.getByRole("button", { name: `Marcar ${name} como favorito` });

test.describe("016 US1 find something in a long list", () => {
  scenario("016-US1-AS1", "the search narrows the list, says how many and stays in the URL", async ({ page, request }) => {
    await courses(request, ["Álgebra 3º", "Geometría", "Historia del arte"]);
    await signIn(page, USERS.teacher);

    await search(page).fill("algebra");
    await expect(page).toHaveURL(/[?&]q=algebra/);
    await expect(courseTitles(page)).toHaveText(["Álgebra 3º"]);
    await expect(page.getByText(/mostrando 1 de 1/i)).toBeVisible();

    await page.reload();
    await expect(search(page)).toHaveValue("algebra");
    await expect(courseTitles(page)).toHaveText(["Álgebra 3º"]);
    await expectAccessible(page);
  });

  scenario("016-US1-AS2", "with no match the list says so and the search can be cleared", async ({ page, request }) => {
    await courses(request, ["Geometría"]);
    await signIn(page, USERS.teacher);

    await search(page).fill("zzz");
    await expect(page.getByText(/nada coincide con «zzz»/i)).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: /borrar la búsqueda/i }).click();

    await expect(search(page)).toHaveValue("");
    await expect(page).not.toHaveURL(/[?&]q=/);
    await expect(courseTitles(page).filter({ hasText: "Geometría" })).toBeVisible();
  });

  scenario("016-US1-AS3", "search and a list's own filters work together", async ({ page }) => {
    await signIn(page, USERS.admin);

    await search(page).fill("herrera");
    await expect(page.getByRole("main").getByText("Lucas Herrera").filter({ visible: true })).toBeVisible();
    await chooseOption(page.getByRole("combobox", { name: /rol/i }), /profesorado/i);

    await expect(page).toHaveURL(/role=teacher/);
    await expect(page.getByText(/nada coincide con «herrera»/i)).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("016 US2 sort and page a long list", () => {
  scenario("016-US2-AS1", "an order is applied and kept in the URL", async ({ page, request }) => {
    await courses(request, ["Zoología", "Astronomía"]);
    await signIn(page, USERS.teacher);
    await search(page).fill("o");

    await chooseOption(page.getByRole("combobox", { name: /ordenar/i }), /nombre/i);

    await expect(page).toHaveURL(/sort=name/);
    const titles = await courseTitles(page).allTextContents();
    expect(titles.indexOf("Astronomía")).toBeLessThan(titles.indexOf("Zoología"));
    await expectAccessible(page);
  });

  scenario("016-US2-AS2", "a long list shows 20 at a time with 'Mostrar más'", async ({ page, request }) => {
    await courses(request, Array.from({ length: 25 }, (_, i) => `Grupo ${String(i + 1).padStart(2, "0")}`));
    await signIn(page, USERS.teacher);
    await search(page).fill("grupo");

    await expect(courseTitles(page)).toHaveCount(20);
    await expect(page.getByText(/mostrando 20 de 25/i)).toBeVisible();
    await page.getByRole("link", { name: /mostrar más/i }).click();

    await expect(courseTitles(page)).toHaveCount(25);
    await expect(page.getByText(/mostrando 25 de 25/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /mostrar más/i })).toHaveCount(0);
    await expectAccessible(page);
  });
});

test.describe("016 US3 star the courses I use most", () => {
  scenario("016-US3-AS1", "a starred course moves to the top and stays after a reload", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo", "Tercero"]);
    await signIn(page, USERS.teacher);
    await expect(courseTitles(page).first()).not.toHaveText("Primero");

    await star(page, "Primero").click();

    await expect(star(page, "Primero")).toHaveAttribute("aria-pressed", "true");
    await expect(courseTitles(page).first()).toHaveText("Primero");
    await page.reload();
    await expect(courseTitles(page).first()).toHaveText("Primero");
    await expect(star(page, "Primero")).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page);
  });

  scenario("016-US3-AS2", "unstarring puts it back in its place", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo"]);
    await signIn(page, USERS.teacher);
    await star(page, "Primero").click();
    await expect(courseTitles(page).first()).toHaveText("Primero");

    await star(page, "Primero").click();

    await expect(star(page, "Primero")).toHaveAttribute("aria-pressed", "false");
    await expect(courseTitles(page).first()).not.toHaveText("Primero");
  });

  scenario("016-US3-AS3", "students star the courses they are in", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo"], true);
    await signIn(page, USERS.student);
    await expect(courseTitles(page).first()).not.toHaveText("Primero");

    await star(page, "Primero").click();

    await expect(courseTitles(page).first()).toHaveText("Primero");
    await expect(star(page, "Primero")).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page);
  });

  scenario("016-US3-AS4", "'Favoritos' shows only the starred courses, with their count", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo", "Tercero"]);
    await signIn(page, USERS.teacher);
    const scope = page.getByRole("navigation", { name: /filtrar cursos/i });
    await expect(scope.getByRole("link", { name: /favoritos/i })).toContainText("0");

    await star(page, "Segundo").click();
    await expect(scope.getByRole("link", { name: /favoritos/i })).toContainText("1");
    await scope.getByRole("link", { name: /favoritos/i }).click();

    await expect(page).toHaveURL(/only=favorites/);
    await expect(courseTitles(page)).toHaveText(["Segundo"]);
    await expect(scope.getByRole("link", { name: /favoritos/i })).toHaveAttribute("aria-current", "page");
    await expectAccessible(page);
  });

  scenario("016-US3-AS5", "a student's course row opens the tutor, with the rest in a menu", async ({ page, request }) => {
    await courses(request, ["Primero"], true);
    await signIn(page, USERS.student);

    await page.locator('summary[aria-label="Más acciones de Primero"]').click();

    await expect(page.getByRole("link", { name: /enviar un ejercicio/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /mi progreso/i })).toBeVisible();
    await expectAccessible(page);
  });
});

const scope = (page: Page) => page.getByRole("navigation", { name: /filtrar cursos/i }).filter({ visible: true });

async function newTag(page: Page, name: string, color = /verde/i) {
  await page.getByRole("button", { name: /nueva etiqueta/i }).filter({ visible: true }).click();
  const dialog = page.getByRole("dialog", { name: /nueva etiqueta/i });
  await dialog.getByLabel(/nombre/i).fill(name);
  await dialog.getByRole("radio", { name: color }).check();
  await dialog.getByRole("button", { name: /^crear$/i }).click();
}

async function tagCourse(page: Page, course: string, tag: string) {
  await page.locator(`summary[aria-label="Más acciones de ${course}"]`).click();
  await page.getByRole("button", { name: /^etiquetas…$/i }).filter({ visible: true }).click();
  const dialog = page.getByRole("dialog", { name: `Etiquetas de ${course}` });
  await dialog.getByRole("checkbox", { name: tag }).check();
  await expect(dialog.getByRole("checkbox", { name: tag })).toBeChecked();
  await dialog.getByRole("button", { name: /cerrar/i }).click();
}

test.describe("016 US4 organise my courses with my own tags", () => {
  scenario("016-US4-AS1", "a new tag is listed in the side filter with its count", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo"]);
    await signIn(page, USERS.teacher);

    await newTag(page, "Repaso");

    await expect(scope(page).getByRole("link", { name: /repaso/i })).toContainText("0");
    await expectAccessible(page);
  });

  scenario("016-US4-AS2", "a tagged course shows the chip and the tag filters the list", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo"]);
    await signIn(page, USERS.teacher);
    await newTag(page, "Repaso");

    await tagCourse(page, "Primero", "Repaso");

    const row = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Primero" }) });
    await expect(row.getByText("Repaso")).toBeVisible();
    await expect(scope(page).getByRole("link", { name: /repaso/i })).toContainText("1");
    await scope(page).getByRole("link", { name: /repaso/i }).click();
    await expect(page).toHaveURL(/tag=/);
    await expect(courseTitles(page)).toHaveText(["Primero"]);
    await expectAccessible(page);
  });

  scenario("016-US4-AS3", "editing and deleting a tag; the courses stay", async ({ page, request }) => {
    await courses(request, ["Primero"]);
    await signIn(page, USERS.teacher);
    await newTag(page, "Repaso");
    await tagCourse(page, "Primero", "Repaso");

    await page.getByRole("button", { name: "Opciones de la etiqueta Repaso" }).filter({ visible: true }).click();
    await page.getByRole("button", { name: /^editar$/i }).filter({ visible: true }).click();
    const edit = page.getByRole("dialog", { name: /editar etiqueta/i });
    await edit.getByLabel(/nombre/i).fill("Repaso final");
    await edit.getByRole("button", { name: /guardar/i }).click();
    await expect(scope(page).getByRole("link", { name: /repaso final/i })).toBeVisible();

    await page.getByRole("button", { name: "Opciones de la etiqueta Repaso final" }).filter({ visible: true }).click();
    await page.getByRole("button", { name: /borrar etiqueta/i }).filter({ visible: true }).click();
    await page.getByRole("dialog", { name: /borrar la etiqueta/i }).getByRole("button", { name: /^borrar$/i }).click();

    await expect(scope(page).getByRole("link", { name: /repaso final/i })).toHaveCount(0);
    await expect(courseTitles(page)).toHaveText(["Primero"]);
  });

  scenario("016-US4-AS4", "a name already in use is refused", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await newTag(page, "Repaso");
    await expect(scope(page).getByRole("link", { name: /repaso/i })).toBeVisible();

    await newTag(page, "repaso", /azul/i);

    await expect(page.getByRole("dialog", { name: /nueva etiqueta/i }).getByRole("alert")).toContainText(/ya tienes una etiqueta/i);
    await expect(scope(page).getByRole("link", { name: /repaso/i })).toHaveCount(1);
  });

  scenario("016-US4-AS5", "students tag the courses they are in", async ({ page, request }) => {
    await courses(request, ["Primero", "Segundo"], true);
    await signIn(page, USERS.student);
    await newTag(page, "Difícil", /rojo/i);

    await tagCourse(page, "Segundo", "Difícil");
    await scope(page).getByRole("link", { name: /difícil/i }).click();

    await expect(courseTitles(page)).toHaveText(["Segundo"]);
    await expectAccessible(page);
  });
});

