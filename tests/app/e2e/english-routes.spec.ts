// 003 — English routes for every language; English is the base language (spec 003 US1, US2).
import { USERS, chooseOption, expect, expectAccessible, openMenuIfNeeded, scenario, signIn, test } from "./helpers";
import { newCourse } from "./helpers-course";

test.describe("003 US1 English routes", () => {
  scenario("003-US1-AS1", "a protected page sends to sign-in and back", async ({ page }) => {
    await page.goto("/teacher/courses/new");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fteacher%2Fcourses%2Fnew$/);

    await page.getByLabel(/correo electrónico o código/i).fill(USERS.teacher);
    await page.getByLabel(/^contraseña/i).fill("docentai-dev-password");
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await expect(page).toHaveURL(/\/teacher\/courses\/new$/);
  });

  scenario("003-US1-AS2", "the invitation link uses /join/<code>", async ({ page }) => {
    const { code } = await newCourse(page);
    await expect(page.getByLabel(/enlace de invitación/i)).toHaveValue(new RegExp(`^https?://[^/]+/join/${code}$`));
  });

  scenario("003-US1-AS3", "an old /unirse/<code> link redirects to /join/<code>", async ({ request }) => {
    const response = await request.get("/unirse/ALG-7K3P", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/join/ALG-7K3P");
  });

  scenario("003-US1-AS4", "switching language keeps the URL", async ({ page }) => {
    await signIn(page, USERS.teacher);
    await expect(page).toHaveURL(/\/teacher\/courses$/);
    const url = page.url();

    await openMenuIfNeeded(page);
    await chooseOption(page.getByRole("combobox", { name: "Idioma" }).filter({ visible: true }), "English");
    await expect(page.getByRole("heading", { level: 1, name: "My courses" })).toBeVisible();
    expect(page.url()).toBe(url);
  });
});

test.describe("003 US2 default locale", () => {
  test.describe("browser in Spanish", () => {
    test.use({ locale: "es-ES" });
    scenario("003-US2-AS1", "a Spanish browser sees Spanish", async ({ page }) => {
      await page.goto("/sign-in");
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      await expect(page.getByRole("heading", { level: 1, name: /bienvenida a docentai/i })).toBeVisible();
      await expectAccessible(page);
    });
  });

  test.describe("browser in German", () => {
    test.use({ locale: "de-DE" });
    scenario("003-US2-AS2", "an unsupported browser language falls back to English", async ({ page }) => {
      await page.goto("/sign-in");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1, name: /welcome to docentai/i })).toBeVisible();
      await expectAccessible(page);
    });
  });

  test.describe("browser in English", () => {
    test.use({ locale: "en-US" });
    scenario("003-US2-AS3", "the language cookie wins over the browser", async ({ page, context, baseURL }) => {
      await context.addCookies([{ name: "NEXT_LOCALE", value: "es", url: baseURL! }]);
      await page.goto("/sign-in");
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      await expect(page.getByRole("heading", { level: 1, name: /bienvenida a docentai/i })).toBeVisible();
    });
  });
});
