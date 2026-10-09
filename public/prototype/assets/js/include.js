// Partial injection for shells and the footer (contract §3; research R-05).
// One level only: data-include inside a partial is left untouched.
// In partials, href/src values starting with "~/" are resolved from the prototype root, so the same
// partial works on pages at any folder depth.

const PROTOTYPE_ROOT = new URL("../../", import.meta.url);

export function resolveRootUrl(path) {
  return new URL(path, PROTOTYPE_ROOT).href;
}

function rewriteRootPaths(fragment) {
  fragment.querySelectorAll("[href^='~/'], [src^='~/']").forEach((node) => {
    for (const attr of ["href", "src"]) {
      const value = node.getAttribute(attr);
      if (value?.startsWith("~/")) node.setAttribute(attr, resolveRootUrl(value.slice(2)));
    }
  });
}

function errorBox(path) {
  const box = document.createElement("div");
  box.setAttribute("role", "alert");
  box.className = "m-2 rounded-md border border-danger-700 bg-danger-50 p-2 text-sm text-danger-700";
  box.textContent = `Prototype: could not load ${path}`;
  return box;
}

async function includeOne(placeholder) {
  const path = placeholder.getAttribute("data-include");
  try {
    const res = await fetch(resolveRootUrl(path));
    if (!res.ok) throw new Error(String(res.status));
    const template = document.createElement("template");
    template.innerHTML = await res.text();
    rewriteRootPaths(template.content);
    placeholder.replaceWith(template.content);
  } catch {
    placeholder.replaceWith(errorBox(path));
  }
}

export function markCurrentLinks(root = document) {
  const here = window.location.pathname;
  root.querySelectorAll("[data-nav] a[href]").forEach((a) => {
    const target = new URL(a.getAttribute("href"), window.location.href).pathname;
    const isCurrent = target === here;
    a.toggleAttribute("data-current", isCurrent);
    if (isCurrent) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

export async function applyIncludes(root = document) {
  const placeholders = [...root.querySelectorAll("[data-include]")];
  await Promise.all(placeholders.map(includeOne));
}
