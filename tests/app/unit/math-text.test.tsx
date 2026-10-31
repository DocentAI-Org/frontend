import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MathText, splitMath } from "@/components/MathText";

describe("splitMath", () => {
  it("finds inline and display formulas and leaves dollars alone (011-US1, FR-001)", () => {
    expect(splitMath("Si cuesta 12 $, \\(x = 2\\) y\n\\[\\frac{a}{b}\\]")).toEqual([
      { kind: "text", value: "Si cuesta 12 $, " },
      { kind: "inline", value: "x = 2" },
      { kind: "text", value: " y\n" },
      { kind: "display", value: "\\frac{a}{b}" }
    ]);
  });

  it("keeps an unclosed delimiter as text", () => {
    expect(splitMath("abre \\( y no cierra")).toEqual([{ kind: "text", value: "abre \\( y no cierra" }]);
  });
});

describe("MathText", () => {
  afterEach(cleanup);

  it("typesets an inline formula with MathML for screen readers (011-US1-AS1)", async () => {
    const { container } = render(<MathText text={"Divide: \\(\\frac{x}{2} = 3\\)."} />);

    await waitFor(() => expect(container.querySelector(".katex math")).not.toBeNull());
    expect(container.textContent).toContain("Divide: ");
    expect(container.querySelector(".katex-display")).toBeNull();
  });

  it("typesets a display formula on its own line (011-US1-AS2)", async () => {
    const { container } = render(<MathText text={"\\[x^2 = 4\\]"} />);

    await waitFor(() => expect(container.querySelector(".katex-display")).not.toBeNull());
  });

  it("shows text without formulas exactly as before (011-US1-AS3)", () => {
    const text = "La Revolución francesa empezó en 1789; el libro cuesta 12 $.";
    const { container } = render(<MathText text={text} />);

    expect(container.innerHTML).toBe(text);
  });

  it("shows the source of a formula with an error (011-US1-AS4)", async () => {
    const { container } = render(<MathText text={"Bien: \\(x\\). Mal: \\(\\frac{x}\\)"} />);

    await waitFor(() => expect(container.querySelectorAll(".katex")).toHaveLength(1));
    expect(container.textContent).toContain("Mal: \\(\\frac{x}\\)");
  });
});
