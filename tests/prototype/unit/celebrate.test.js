import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { celebrate, resetCelebration } from "../../../public/prototype/assets/js/celebrate.js";

function mockReducedMotion(reduce) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce });
}

beforeEach(() => {
  resetCelebration();
  mockReducedMotion(false);
  document.body.innerHTML = `
    <div data-state="loading" hidden><section data-celebrate><span data-celebrate-badge></span></section></div>
    <div data-state="default"><section data-celebrate id="visible"><span data-celebrate-badge></span></section></div>`;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("celebrate", () => {
  it("animates the visible block and bursts dots from its badge", () => {
    expect(celebrate()).toBe(true);
    const block = document.getElementById("visible");
    expect(block.classList.contains("is-celebrating")).toBe(true);
    expect(block.querySelectorAll("[data-celebrate-dot]").length).toBeGreaterThan(0);
    expect(document.querySelector("[hidden] .is-celebrating")).toBeNull();
  });

  it("runs only once per page view", () => {
    celebrate();
    const dots = document.querySelectorAll("[data-celebrate-dot]").length;
    expect(celebrate()).toBe(false);
    expect(document.querySelectorAll("[data-celebrate-dot]").length).toBe(dots);
  });

  it("does not animate with reduced motion", () => {
    mockReducedMotion(true);
    expect(celebrate()).toBe(true);
    expect(document.querySelector(".is-celebrating")).toBeNull();
    expect(document.querySelector("[data-celebrate-dot]")).toBeNull();
  });

  it("does nothing when no celebration block is visible", () => {
    document.querySelector('[data-state="default"]').hidden = true;
    expect(celebrate()).toBe(false);
  });
});
