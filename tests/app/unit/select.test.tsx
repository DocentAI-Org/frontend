import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  describe("every key of the select-only combobox pattern", () => {
    // fireEvent.keyDown returns false when the handler called preventDefault.
    const press = (combobox: HTMLElement, key: string, init: Record<string, boolean> = {}) => fireEvent.keyDown(combobox, { key, ...init });
    const active = (combobox: HTMLElement) =>
      document.getElementById(combobox.getAttribute("aria-activedescendant") ?? "")?.textContent ?? null;
    const expanded = (combobox: HTMLElement) => combobox.getAttribute("aria-expanded");

    afterEach(() => vi.useRealTimers());

    it.each([
      ["ArrowDown", "Lucas Herrera"],
      ["ArrowUp", "Lucas Herrera"],
      ["Enter", "Lucas Herrera"],
      [" ", "Lucas Herrera"],
      ["Home", "Todos"],
      ["End", "Marta López"]
    ])("closed, %j opens the list on %s", (key, expected) => {
      const combobox = renderInForm();

      expect(press(combobox, key)).toBe(false);
      expect(expanded(combobox)).toBe("true");
      expect(active(combobox)).toBe(expected);
      expect(submitted()).toBe("s1");
    });

    it("closed, ignores other keys, modified letters and letters that match nothing", () => {
      const combobox = renderInForm();

      expect(press(combobox, "Tab")).toBe(true);
      expect(press(combobox, "Escape")).toBe(true);
      expect(press(combobox, "PageDown")).toBe(true);
      press(combobox, "m", { ctrlKey: true });
      press(combobox, "m", { altKey: true });
      press(combobox, "m", { metaKey: true });
      press(combobox, "z");

      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s1");
    });

    it("closed, a letter opens the list at the next option that starts with it, without preventing it", () => {
      const combobox = renderInForm();

      expect(press(combobox, "m")).toBe(true);
      expect(expanded(combobox)).toBe("true");
      expect(active(combobox)).toBe("Marta López");
      expect(submitted()).toBe("s1");
    });

    it("closed, type-ahead starts after the chosen option", () => {
      render(
        <Select
          aria-label="Persona"
          value="b"
          options={[
            { value: "b", label: "Bruno" },
            { value: "e", label: "Beatriz" }
          ]}
        />
      );
      const combobox = screen.getByRole("combobox", { name: "Persona" });

      press(combobox, "b");
      expect(active(combobox)).toBe("Beatriz");
    });

    it("closed, Alt+ArrowDown opens the list on the chosen option", () => {
      const combobox = renderInForm();

      expect(press(combobox, "ArrowDown", { altKey: true })).toBe(false);
      expect(expanded(combobox)).toBe("true");
      expect(active(combobox)).toBe("Lucas Herrera");
    });

    it("open, Shift+Tab chooses the active option and lets the focus move back", () => {
      const combobox = renderInForm();

      press(combobox, "ArrowDown");
      press(combobox, "ArrowDown");
      expect(press(combobox, "Tab", { shiftKey: true })).toBe(true);
      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s2");
    });

    it("open, the arrows, Home, End, PageUp and PageDown move within the list without choosing", () => {
      const combobox = renderInForm();
      press(combobox, "ArrowDown");

      const steps: [string, string][] = [
        ["ArrowDown", "Marta López"],
        ["ArrowDown", "Marta López"],
        ["ArrowUp", "Lucas Herrera"],
        ["ArrowUp", "Todos"],
        ["ArrowUp", "Todos"],
        ["End", "Marta López"],
        ["Home", "Todos"],
        ["PageDown", "Marta López"],
        ["PageUp", "Todos"]
      ];
      for (const [key, expected] of steps) {
        expect(press(combobox, key)).toBe(false);
        expect(active(combobox)).toBe(expected);
      }
      expect(expanded(combobox)).toBe("true");
      expect(submitted()).toBe("s1");
    });

    it("open, Space and Alt+ArrowUp choose the active option and close", () => {
      const onValueChange = vi.fn();
      const combobox = renderInForm(onValueChange);

      press(combobox, "ArrowDown");
      press(combobox, "ArrowDown");
      expect(press(combobox, " ")).toBe(false);
      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s2");

      press(combobox, "ArrowDown");
      press(combobox, "ArrowUp");
      expect(press(combobox, "ArrowUp", { altKey: true })).toBe(false);
      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s1");
      expect(onValueChange.mock.calls).toEqual([["s2"], ["s1"]]);
    });

    it("open, Escape closes without choosing and Enter on the chosen option changes nothing", () => {
      const onValueChange = vi.fn();
      const combobox = renderInForm(onValueChange);

      press(combobox, "ArrowDown");
      press(combobox, "ArrowDown");
      expect(press(combobox, "Escape")).toBe(false);
      expect(expanded(combobox)).toBe("false");

      press(combobox, "Enter");
      expect(press(combobox, "Enter")).toBe(false);
      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s1");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("open, Tab chooses the active option and lets the focus move on", () => {
      const combobox = renderInForm();

      press(combobox, "ArrowDown");
      press(combobox, "ArrowDown");
      expect(press(combobox, "Tab")).toBe(true);
      expect(expanded(combobox)).toBe("false");
      expect(submitted()).toBe("s2");
    });

    it("open, type-ahead moves to the next match, joins quick keys and starts again after a pause", () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));
      const later = (ms: number) => vi.setSystemTime(Date.now() + ms);
      render(
        <Select
          aria-label="Persona"
          options={[
            { value: "a", label: "Ana" },
            { value: "b", label: "Bruno" },
            { value: "e", label: "Beatriz" },
            { value: "c", label: "Carla" }
          ]}
        />
      );
      const combobox = screen.getByRole("combobox", { name: "Persona" });
      press(combobox, "ArrowDown");
      expect(active(combobox)).toBe("Ana");

      expect(press(combobox, "b")).toBe(true);
      expect(active(combobox)).toBe("Bruno");
      later(600);
      press(combobox, "b");
      expect(active(combobox)).toBe("Beatriz");
      later(600);
      press(combobox, "b");
      expect(active(combobox)).toBe("Bruno");

      later(600);
      press(combobox, "a");
      later(100);
      press(combobox, "n");
      expect(active(combobox)).toBe("Ana");
      later(100);
      press(combobox, "b");
      expect(active(combobox)).toBe("Ana");

      later(600);
      press(combobox, "c", { ctrlKey: true });
      press(combobox, "F2");
      expect(active(combobox)).toBe("Ana");
      press(combobox, "c");
      expect(active(combobox)).toBe("Carla");
      expect(expanded(combobox)).toBe("true");
    });
  });
});
