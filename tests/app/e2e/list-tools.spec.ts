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
});
