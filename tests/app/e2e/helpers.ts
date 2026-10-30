// Shared helpers for the app E2E tests (tasks T012).
import AxeBuilder from "@axe-core/playwright";
import { type Locator, type Page, test as base, expect } from "@playwright/test";

export { expect };

const MOCK = "http://127.0.0.1:8010";
const integration = process.env.E2E_TARGET === "integration";
export const PASSWORD = "docentai-dev-password";

export const USERS = {
  admin: "admin@docentai.local",
  teacher: "profesora@docentai.local",
  student: "alumno@docentai.local",
  otherTeacher: "otro.profesor@docentai.local",
  pseudonymous: "EST-DEMO1"
} as const;

/** Every test starts from the seeded mock state (no-op against the real stack). */
export const test = base.extend<{ mock: { faults: (names: string[]) => Promise<void> } }>({
  mock: [
    async ({ request }, provide) => {
      if (!integration) await request.post(`${MOCK}/__test/reset`);
      await provide({
        faults: async (names) => {
          if (!integration) await request.post(`${MOCK}/__test/faults`, { data: { faults: names } });
        }
      });
    },
    { auto: true }
  ]
});

/** One acceptance scenario = one test, titled with its ID (Constitution V). */
export function scenario(id: string, title: string, fn: Parameters<typeof test>[2]) {
  test(`${id} ${title}`, fn);
}

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function expectAccessible(page: Page) {
  // Next streams metadata after the content: wait for the page title to be in place. Callers
  // must first wait for the page they navigated to (e.g. its heading), or the previous page's
  // title satisfies this check.
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.title.trim() !== "");
  // Entrance animations (e.g. the menu's fade-in) would be measured half-transparent.
  // Spinners loop forever, so only finite animations are awaited.
  // WebKit never settles some animations of hidden elements, hence the 1 s cap.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          // A cancelled animation rejects `finished` with AbortError: nothing left to wait for.
          .map((animation) => animation.finished.catch(() => undefined))
      ),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ])
  );
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const report = violations
    .map((v) => `${v.id}: ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(" ")}`).join("\n")}`)
    .join("\n");
  expect(violations, report).toEqual([]);
}

/** Signs in through the form and, unless a failure is expected, waits until it has left /sign-in. */
export async function signIn(page: Page, identifier: string, password = PASSWORD, { expectFailure = false } = {}) {
  await page.goto("/sign-in");
  await page.getByLabel(/correo electrónico o código/i).fill(identifier);
  await page.getByLabel(/^contraseña/i).fill(password);
  await page.getByRole("button", { name: /^entrar$/i }).click();
  if (!expectFailure) await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));
}

/** Opens the mobile menu (sidebar hidden at 390 px) or the student user menu, if not open yet. */
export async function openMenuIfNeeded(page: Page) {
  const menu = page.getByLabel(/^(abrir menú|open menu|menú de usuario|user menu)$/i).filter({ visible: true });
  if ((await menu.count()) && !(await page.locator("details[open]").count())) await menu.click();
}

/** Picks an option in a Select (the app's combobox, not a native select). */
export async function chooseOption(combobox: Locator, label: string | RegExp) {
  await combobox.click();
  const list = combobox.page().locator(`#${await combobox.getAttribute("aria-controls")}`);
  await list.getByRole("option", { name: label, exact: typeof label === "string" }).click();
  // The combobox may be renamed by the choice (language), so check the list instead.
  await expect(list).toBeHidden();
}

export async function signOut(page: Page) {
  await openMenuIfNeeded(page);
  await page.getByRole("button", { name: /cerrar sesión|sign out/i }).filter({ visible: true }).click();
  await page.waitForURL(/\/sign-in/);
}
