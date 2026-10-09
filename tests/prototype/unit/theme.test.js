import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  THEME_KEY,
  applyTheme,
  getTheme,
  setTheme,
  syncThemeSwitchers
} from "../../../public/prototype/assets/js/theme.js";

const root = document.documentElement;

function setUrl(search) {
  window.history.replaceState(null, "", `/prototype/student/chat.html${search}`);
}

beforeEach(() => {
  localStorage.clear();
  root.removeAttribute("data-theme");
  setUrl("");
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("getTheme", () => {
  it("follows the system by default", () => {
    expect(getTheme("")).toBe("system");
  });

  it("reads a stored choice", () => {
    localStorage.setItem(THEME_KEY, "dark");
    expect(getTheme("")).toBe("dark");
  });

  it("lets ?theme= override the stored choice and ignores unknown values", () => {
    localStorage.setItem(THEME_KEY, "dark");
    expect(getTheme("?theme=light")).toBe("light");
    expect(getTheme("?theme=sepia")).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("sets data-theme for an explicit choice and removes it for system", () => {
    applyTheme("dark");
    expect(root.getAttribute("data-theme")).toBe("dark");
    applyTheme("system");
    expect(root.hasAttribute("data-theme")).toBe(false);
  });
});

describe("setTheme", () => {
  it("stores and applies the choice", () => {
    setTheme("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    expect(root.getAttribute("data-theme")).toBe("light");
  });

  it("updates ?theme= only when the URL already carries it", () => {
    setTheme("dark");
    expect(new URL(window.location.href).searchParams.has("theme")).toBe(false);
    setUrl("?theme=dark");
    setTheme("system");
    expect(new URL(window.location.href).searchParams.get("theme")).toBe("system");
  });

  it("ignores unknown values", () => {
    setTheme("sepia");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(root.hasAttribute("data-theme")).toBe(false);
  });
});

describe("syncThemeSwitchers", () => {
  it("presses only the button of the active choice", () => {
    document.body.innerHTML = `
      <button data-set-theme="system"></button>
      <button data-set-theme="light"></button>
      <button data-set-theme="dark"></button>`;
    syncThemeSwitchers("dark");
    const pressed = [...document.querySelectorAll("[data-set-theme]")].map((b) => b.getAttribute("aria-pressed"));
    expect(pressed).toEqual(["false", "false", "true"]);
  });
});
