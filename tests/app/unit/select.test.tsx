import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Select } from "@/components/Select";

const OPTIONS = [
  { value: "", label: "Todos" },
  { value: "s1", label: "Lucas Herrera" },
  { value: "s2", label: "Marta López" }
];

function renderInForm(onValueChange?: (value: string) => void) {
  render(
    <form aria-label="Filtros">
      <label id="estudiante-label" htmlFor="estudiante">
        Estudiante
      </label>
      <Select id="estudiante" labelId="estudiante-label" name="estudiante" defaultValue="s1" options={OPTIONS} onValueChange={onValueChange} />
    </form>
  );
  return screen.getByRole("combobox", { name: "Estudiante" });
}

function submitted() {
  return new FormData(screen.getByRole("form", { name: "Filtros" }) as HTMLFormElement).get("estudiante");
}

describe("Select", () => {
  afterEach(cleanup);

  it("shows the chosen option and submits its value with the form", () => {
    const combobox = renderInForm();

    expect(combobox.textContent).toBe("Lucas Herrera");
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(submitted()).toBe("s1");
  });

  it("opens a listbox and picks an option with the pointer", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const combobox = renderInForm(onValueChange);

    await user.click(combobox);
    expect(combobox.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox", { name: "Estudiante" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Lucas Herrera" }).getAttribute("aria-selected")).toBe("true");

    await user.click(screen.getByRole("option", { name: "Marta López" }));

    expect(onValueChange).toHaveBeenCalledWith("s2");
    expect(combobox.textContent).toBe("Marta López");
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(submitted()).toBe("s2");
    expect(document.activeElement).toBe(combobox);
  });

  it("works with the keyboard: arrows, Enter, Escape and type-ahead", async () => {
    const user = userEvent.setup();
    const combobox = renderInForm();
    combobox.focus();

    await user.keyboard("{ArrowDown}");
    const active = () => document.getElementById(combobox.getAttribute("aria-activedescendant") ?? "")?.textContent;
    expect(active()).toBe("Lucas Herrera");

    await user.keyboard("{ArrowDown}{Enter}");
    expect(submitted()).toBe("s2");

    await user.keyboard("{ArrowDown}{Home}{Escape}");
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(submitted()).toBe("s2");

    await user.keyboard("l");
    expect(active()).toBe("Lucas Herrera");
    await user.keyboard("{Enter}");
    expect(submitted()).toBe("s1");
  });

  it("closes without choosing when the pointer goes elsewhere", async () => {
    const user = userEvent.setup();
    const combobox = renderInForm();

    await user.click(combobox);
    await user.click(document.body);

    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(submitted()).toBe("s1");
  });

  it("follows a controlled value and does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Idioma" value="en" disabled options={[{ value: "es", label: "Español" }, { value: "en", label: "English" }]} />);
    const combobox = screen.getByRole("combobox", { name: "Idioma" });

    expect(combobox.textContent).toBe("English");
    expect(document.getElementById(combobox.getAttribute("aria-controls") ?? "")?.getAttribute("aria-label")).toBe("Idioma");
    await user.click(combobox);
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
  });
});
