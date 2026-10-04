// Light and dark themes: the footer ThemeSwitcher follows the system by default, and an explicit
// choice applies at once and persists across pages.
import { expect, gotoState, test } from "./helpers.js";

const background = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test("the theme follows the system until the user picks one, and the choice persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await gotoState(page, "student/courses.html");
  const switcher = page.locator('footer [data-component="ThemeSwitcher"]');
  await expect(switcher.getByRole("button", { name: "Tema del sistema" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  const systemDark = await background(page);

  await switcher.getByRole("button", { name: "Tema claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(switcher.getByRole("button", { name: "Tema claro" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => background(page)).not.toBe(systemDark);

  await gotoState(page, "student/progress.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.locator('footer [data-component="ThemeSwitcher"]').getByRole("button", { name: "Tema del sistema" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
  await expect.poll(() => background(page)).toBe(systemDark);
});

test("?theme=dark opens a page in the dark theme for a session link", async ({ page }) => {
  await page.goto("/prototype/auth/sign-in.html?panel=0&theme=dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator('footer [data-set-theme="dark"]')).toHaveAttribute("aria-pressed", "true");
});
