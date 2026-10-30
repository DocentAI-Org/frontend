// 004 — theme switcher, home link and navigation fixes (spec 004 US1–US3).
import { USERS, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, test } from "./helpers";

const theme = (page: import("@playwright/test").Page) =>
  page.getByRole("group", { name: "Tema" }).filter({ visible: true });

test.describe("004 US1 theme switcher", () => {
  scenario("004-US1-AS1", "the dark theme applies at once and survives a reload", async ({ page }) => {
    await page.goto("/sign-in");
    await theme(page).getByRole("button", { name: "Tema oscuro" }).click();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(theme(page).getByRole("button", { name: "Tema oscuro" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAccessible(page);
  });

  scenario("004-US1-AS2", "the system theme follows the operating system again", async ({ page }) => {
    await page.goto("/sign-in");
    await theme(page).getByRole("button", { name: "Tema claro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await theme(page).getByRole("button", { name: "Tema del sistema" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    await expect(theme(page).getByRole("button", { name: "Tema del sistema" })).toHaveAttribute("aria-pressed", "true");
  });

  scenario("004-US1-AS3", "signed-in users find it next to the language selector", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await openMenuIfNeeded(page);
    await expect(theme(page)).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Idioma" }).filter({ visible: true })).toBeVisible();
    await theme(page).getByRole("button", { name: "Tema oscuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expectAccessible(page);
  });
});

test.describe("004 US2 home link", () => {
  scenario("004-US2-AS1", "signed out, the brand goes to sign-in", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: "DocentAI, inicio" }).click();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  scenario("004-US2-AS2", "signed in, the brand goes to the role's home", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/about");
    await page.getByRole("link", { name: "DocentAI, inicio" }).click();
    await expect(page).toHaveURL(/\/teacher\/courses$/);
  });
});

test.describe("004 US3 navigation", () => {
  scenario("004-US3-AS1", "back from about returns to the previous page, or home", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/teacher/courses/new");
    await page.getByRole("contentinfo").getByRole("link", { name: "Acerca de DocentAI" }).click();
    await expect(page).toHaveURL(/\/about$/);
    await page.getByRole("link", { name: /^volver$/i }).click();
    await expect(page).toHaveURL(/\/teacher\/courses\/new$/);

    const direct = await page.context().newPage();
    await direct.goto("/about");
    await direct.getByRole("link", { name: /^volver$/i }).click();
    await expect(direct).toHaveURL(/\/teacher\/courses$/);
  });

  scenario("004-US3-AS2", "signed-in users are not shown the sign-in form", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/teacher\/courses$/);
    await page.goto("/sign-in?next=%2Fteacher%2Fcourses%2Fnew");
    await expect(page).toHaveURL(/\/teacher\/courses\/new$/);
    await page.goto("/sign-in?next=%2F%2Fevil.example");
    await expect(page).toHaveURL(/\/teacher\/courses$/);
  });
});
