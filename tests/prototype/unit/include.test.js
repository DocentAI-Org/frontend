import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyIncludes, resolveRootUrl } from "../../../public/prototype/assets/js/include.js";

const partials = {
  "partials/header.html": '<header id="h"><a id="home" href="~/student/courses.html">Inicio</a></header>',
  "partials/footer.html": '<footer id="f"><img id="logo" src="~/assets/img/imfahe-logo.svg" alt=""></footer>',
  "partials/nested.html": '<div id="outer"><div data-include="partials/footer.html"></div></div>'
};

beforeEach(() => {
  globalThis.fetch = vi.fn(async (url) => {
    const key = Object.keys(partials).find((k) => String(url).endsWith(k));
    if (!key) return { ok: false, status: 404, text: async () => "" };
    return { ok: true, status: 200, text: async () => partials[key] };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("applyIncludes", () => {
  it("replaces data-include elements with the partial markup", async () => {
    document.body.innerHTML = '<div data-include="partials/header.html"></div><main>x</main>';
    await applyIncludes(document.body);
    expect(document.getElementById("h")).toBeTruthy();
    expect(document.querySelector("[data-include]")).toBeNull();
  });

  it("resolves every include before the promise settles", async () => {
    document.body.innerHTML =
      '<div data-include="partials/header.html"></div><div data-include="partials/footer.html"></div>';
    await applyIncludes(document.body);
    expect(document.getElementById("h")).toBeTruthy();
    expect(document.getElementById("f")).toBeTruthy();
  });

  it("rewrites ~/ links and sources to the prototype root", async () => {
    document.body.innerHTML = '<div data-include="partials/header.html"></div><div data-include="partials/footer.html"></div>';
    await applyIncludes(document.body);
    expect(document.getElementById("home").getAttribute("href")).toBe(resolveRootUrl("student/courses.html"));
    expect(document.getElementById("logo").getAttribute("src")).toBe(resolveRootUrl("assets/img/imfahe-logo.svg"));
  });

  it("shows a visible error naming the partial when the fetch fails", async () => {
    document.body.innerHTML = '<div data-include="partials/missing.html"></div>';
    await applyIncludes(document.body);
    const alert = document.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain("partials/missing.html");
  });

  it("does not process nested includes (one level only)", async () => {
    document.body.innerHTML = '<div data-include="partials/nested.html"></div>';
    await applyIncludes(document.body);
    expect(document.getElementById("outer")).toBeTruthy();
    expect(document.querySelector('#outer [data-include="partials/footer.html"]')).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

describe("markCurrentLinks", () => {
  it("sets aria-current=page on links to the current page only", async () => {
    const { markCurrentLinks } = await import("../../../public/prototype/assets/js/include.js");
    window.history.replaceState(null, "", "/prototype/student/courses.html?state=empty");
    document.body.innerHTML = `
      <nav data-nav>
        <a id="a" href="/prototype/student/courses.html">Mis cursos</a>
        <a id="b" href="/prototype/student/progress.html">Mi progreso</a>
      </nav>`;
    markCurrentLinks(document.body);
    expect(document.getElementById("a").getAttribute("aria-current")).toBe("page");
    expect(document.getElementById("a").hasAttribute("data-current")).toBe(true);
    expect(document.getElementById("b").hasAttribute("aria-current")).toBe(false);
    expect(document.getElementById("b").hasAttribute("data-current")).toBe(false);
  });
});
