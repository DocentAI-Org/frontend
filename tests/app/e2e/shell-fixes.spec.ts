// 004 — theme switcher, home link and navigation fixes (spec 004 US1–US3).
import { USERS, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, test } from "./helpers";

const themeButton = (page: import("@playwright/test").Page, name: RegExp) =>
  page.getByRole("button", { name }).filter({ visible: true });

test.describe("004 US1 theme switcher", () => {
  test.describe("system in light mode", () => {
    test.use({ colorScheme: "light" });

    scenario("004-US1-AS1", "switching to dark applies at once and survives a reload", async ({ page }) => {
      await page.goto("/sign-in");
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
      await themeButton(page, /cambiar a tema oscuro/i).click();

      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(themeButton(page, /cambiar a tema claro/i)).toBeVisible();
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectAccessible(page);
    });

    scenario("004-US1-AS3", "signed-in users find it on the language selector's line", async ({ page }) => {
      await signIn(page, USERS.teacher);
      await openMenuIfNeeded(page);
      const language = page.getByRole("combobox", { name: "Idioma" }).filter({ visible: true });
      const button = themeButton(page, /cambiar a tema oscuro/i);
      await expect(button).toBeVisible();
      const [a, b] = [await language.boundingBox(), await button.boundingBox()];
      expect(Math.abs(a!.y + a!.height / 2 - (b!.y + b!.height / 2))).toBeLessThan(4);
      await button.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expectAccessible(page);
    });
  });

  test.describe("system in dark mode", () => {
    test.use({ colorScheme: "dark" });

    scenario("004-US1-AS2", "with no saved choice it follows the system", async ({ page }) => {
      await page.goto("/sign-in");
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
      await themeButton(page, /cambiar a tema claro/i).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await expect(themeButton(page, /cambiar a tema oscuro/i)).toBeVisible();
    });
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
