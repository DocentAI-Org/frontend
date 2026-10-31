// 011 — math notation (spec 011 US1).
import { expect, expectAccessible, scenario, test } from "./helpers";
import { classroom } from "./helpers-student";

test.describe("011 US1 formulas read as formulas", () => {
  scenario("011-US1-AS1", "a formula in the feedback is typeset, with MathML", async ({ page, request }) => {
    await classroom(request, page, { path: "/exercise" });
    await page.getByLabel(/enunciado del ejercicio/i).fill("Despeja la incógnita en 2x = 4");
    await page.getByLabel(/tu solución, paso a paso/i).fill("2x = 4\nx = 4 - 2\nx = 2");
    await page.getByRole("button", { name: /revisar antes de enviar/i }).click();
    await page.getByRole("button", { name: /enviar ejercicio/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /corrección del ejercicio/i })).toBeVisible();

    const formula = page.locator(".katex").first();
    await expect(formula).toBeVisible();
    await expect(formula.locator("math")).toHaveCount(1);
    // The source stays only in KaTeX's hidden annotation; the delimiters are not shown.
    await expect(page.getByText("\\(x", { exact: false })).toHaveCount(0);
    await expectAccessible(page);
  });

  scenario("011-US1-AS3", "text without formulas downloads no math code", async ({ page, request }) => {
    const katex: string[] = [];
    page.on("request", (r) => {
      if (/katex/i.test(r.url())) katex.push(r.url());
    });
    await classroom(request, page, { path: "/exercise" });

    await expect(page.getByLabel(/enunciado del ejercicio/i)).toBeVisible();
    expect(katex).toEqual([]);
  });
});
