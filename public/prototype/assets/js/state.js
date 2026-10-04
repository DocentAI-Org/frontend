// Page states, in-page navigation and the facilitator state panel (contract §1, §3; research R-06).

export const PANEL_KEY = "docentai.prototype.panel";
const ADVANCE_MS = 1200;

let current = { root: null, entry: null };
let advanceTimer = null;
let lastOpener = null;
let navigator = (url) => window.location.assign(url);

/** Replace how page-to-page navigation happens (tests use this to observe it). */
export function setNavigator(fn) {
  navigator = fn;
}

export function resolveState(entry, search = window.location.search) {
  const requested = new URLSearchParams(search).get("state");
  if (!requested) return { state: "default", unknown: null };
  if (entry.states.includes(requested)) return { state: requested, unknown: null };
  return { state: "default", unknown: requested };
}

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function applyState(root, entry, search = window.location.search) {
  current = { root, entry };
  const result = resolveState(entry, search);
  const { state } = result;

  root.querySelectorAll("[data-state]").forEach((el) => {
    const states = el.getAttribute("data-state").split(/\s+/).filter(Boolean);
    el.hidden = !states.includes(state);
  });
  root.querySelectorAll("[data-invalid-in]").forEach((input) => {
    if (input.getAttribute("data-invalid-in").split(/\s+/).includes(state)) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  });
  root.querySelectorAll("[data-checked-in]").forEach((input) => {
    input.checked = input.getAttribute("data-checked-in").split(/\s+/).includes(state);
  });
  root.querySelectorAll("[data-mirror]").forEach((el) => {
    const value = document.querySelector(el.getAttribute("data-mirror"))?.value?.trim();
    if (value) el.textContent = value;
  });
  document.documentElement.dataset.state = state;
  syncDialogs(root);

  clearTimeout(advanceTimer);
  const advancing = [...root.querySelectorAll("[data-advance]")].find((el) => !el.closest("[hidden]"));
  if (advancing) {
    const target = advancing.getAttribute("data-advance");
    advanceTimer = setTimeout(() => goto(target, { replace: true }), prefersReducedMotion() ? 0 : ADVANCE_MS);
  }

  syncPanel(state);
  document.dispatchEvent(new CustomEvent("prototype:state", { detail: result }));
  return result;
}

// A <dialog data-modal> that belongs to the current state opens with showModal() (focus trap,
// Esc to close). Closing it goes to its data-close-state and returns focus to the opener.
function syncDialogs(root) {
  root.querySelectorAll("dialog[data-modal]").forEach((dialog) => {
    if (!dialog.dataset.bound) {
      dialog.dataset.bound = "true";
      dialog.addEventListener("cancel", (event) => {
        if (dialog.getAttribute("data-dismissible") === "false") event.preventDefault();
      });
      dialog.addEventListener("close", () => {
        // A close caused by a state change (syncing) must not navigate again. The close event can fire
        // asynchronously, so the flag is cleared here rather than right after close().
        if (dialog.dataset.syncing) {
          delete dialog.dataset.syncing;
          return;
        }
        const target = dialog.getAttribute("data-close-state");
        if (target === "@back") window.history.back();
        else if (target) goto(target);
        if (lastOpener?.isConnected) lastOpener.focus();
      });
    }
    const visible = !dialog.hidden;
    if (visible && !dialog.open && typeof dialog.showModal === "function") {
      dialog.removeAttribute("hidden");
      dialog.showModal();
    } else if (!visible && dialog.open) {
      dialog.dataset.syncing = "true";
      dialog.close();
    }
  });
}

export function goto(stateId, { replace = false } = {}) {
  const url = new URL(window.location.href);
  url.searchParams.set("state", stateId);
  if (replace) window.history.replaceState(null, "", url);
  else window.history.pushState(null, "", url);
  if (current.root && current.entry) applyState(current.root, current.entry);
}

function isSamePageStateLink(a) {
  const href = a.getAttribute("href");
  return href !== null && href.startsWith("?");
}

// A role="switch" button with data-switch toggles aria-checked; inside its nearest
// [data-switch-scope], [data-switch-on] content shows when checked and [data-switch-off] when not.
function syncSwitch(button) {
  const scope = button.closest("[data-switch-scope]") ?? button.parentElement;
  const on = button.getAttribute("aria-checked") === "true";
  scope.querySelectorAll("[data-switch-on]").forEach((el) => (el.hidden = !on));
  scope.querySelectorAll("[data-switch-off]").forEach((el) => (el.hidden = on));
}

// [data-leave-guard="s1 s2"] with data-leave-state="unsaved": while the current state is guarded,
// following a link to another page opens the leave state instead; [data-leave-link] gets the target.
function guardLeave(link, event) {
  const guard = document.querySelector("[data-leave-guard]");
  if (!guard || link.closest("dialog") || link.hasAttribute("data-leave-link")) return false;
  const guarded = guard.getAttribute("data-leave-guard").split(/\s+/);
  if (!guarded.includes(document.documentElement.dataset.state)) return false;
  event.preventDefault();
  document.querySelectorAll("[data-leave-link]").forEach((a) => a.setAttribute("href", link.getAttribute("href")));
  lastOpener = link;
  goto(guard.getAttribute("data-leave-state"));
  return true;
}

function keepParams(target) {
  const url = new URL(target, window.location.href);
  const here = new URLSearchParams(window.location.search);
  for (const k of ["lang", "panel"]) if (here.has(k) && !url.searchParams.has(k)) url.searchParams.set(k, here.get(k));
  return url.href;
}

function routeTo(form, target) {
  if (target === "@next") target = new URLSearchParams(window.location.search).get("next") || form.getAttribute("data-route-next-fallback") || "";
  if (!target) return;
  if (target.startsWith("?")) {
    goto(new URLSearchParams(target).get("state"));
  } else if (current.entry?.states.includes(target)) {
    goto(target);
  } else {
    navigator(keepParams(target));
  }
}

// <form data-route>: on submit, data-route-empty fields all empty → data-route-empty-target; otherwise the
// value of data-route-field is looked up (trimmed, case-insensitive) in data-routes, else data-route-default.
// A target is a state ID, "?state=…", "@next" (the ?next parameter) or a page URL.
function onRouteSubmit(event) {
  const form = event.target instanceof Element ? event.target.closest("form[data-route]") : null;
  if (!form) return;
  event.preventDefault();
  const fields = (selectors) => (selectors ? selectors.split(",").map((sel) => form.querySelector(sel.trim())).filter(Boolean) : []);
  const isEmpty = (el) => (el.type === "file" ? el.files.length === 0 : el.value.trim() === "");
  const empties = fields(form.getAttribute("data-route-empty"));
  if (empties.length && empties.every(isEmpty)) return routeTo(form, form.getAttribute("data-route-empty-target"));
  const [field] = fields(form.getAttribute("data-route-field"));
  const routes = Object.fromEntries(
    Object.entries(JSON.parse(form.getAttribute("data-routes") || "{}")).map(([k, v]) => [k.trim().toUpperCase(), v])
  );
  const key = field ? field.value.trim().toUpperCase() : "";
  routeTo(form, routes[key] ?? form.getAttribute("data-route-default"));
}

const boundRoots = new WeakSet();

export function bindNavigation(root = document.body) {
  root.querySelectorAll("[data-switch]").forEach(syncSwitch);
  // Listeners are delegated, so binding a root once is enough (and calling again must not double them).
  if (boundRoots.has(root)) return;
  boundRoots.add(root);
  root.addEventListener("submit", onRouteSubmit);

  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const toggle = target.closest("[data-switch]");
    if (toggle && root.contains(toggle)) {
      toggle.setAttribute("aria-checked", String(toggle.getAttribute("aria-checked") !== "true"));
      syncSwitch(toggle);
      return;
    }

    const focuser = target.closest("[data-focus]");
    if (focuser && root.contains(focuser)) {
      event.preventDefault();
      document.querySelector(focuser.getAttribute("data-focus"))?.focus();
      return;
    }

    const button = target.closest("[data-goto]");
    if (button && root.contains(button)) {
      // Radios and checkboxes keep their native check; other elements don't navigate on their own.
      if (button.tagName !== "INPUT") event.preventDefault();
      if (!button.closest("dialog")) lastOpener = button;
      goto(button.getAttribute("data-goto"));
      return;
    }

    const link = target.closest("a[href]");
    if (link && root.contains(link) && !isSamePageStateLink(link) && guardLeave(link, event)) return;
    if (link && root.contains(link) && isSamePageStateLink(link)) {
      const state = new URLSearchParams(link.getAttribute("href")).get("state");
      if (state) {
        event.preventDefault();
        if (!link.closest("dialog")) lastOpener = link;
        goto(state);
      }
    }
  });

  window.addEventListener("popstate", () => {
    if (current.root && current.entry) applyState(current.root, current.entry);
  });
}

function isRelative(href) {
  return href && !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href);
}

export function decorateLinks(root = document.body, search = window.location.search) {
  const params = new URLSearchParams(search);
  root.querySelectorAll("a[data-href-param]").forEach((a) => {
    const value = params.get(a.getAttribute("data-href-param"));
    if (value && isRelative(value)) a.setAttribute("href", value);
  });
  const keep = ["lang", "panel"].filter((k) => params.has(k));
  if (!keep.length) return;
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!isRelative(href) || href.startsWith("?")) return;
    const url = new URL(href, window.location.href);
    for (const k of keep) if (!url.searchParams.has(k)) url.searchParams.set(k, params.get(k));
    a.setAttribute("href", url.href);
  });
}

export function isPanelHidden(search = window.location.search) {
  const value = new URLSearchParams(search).get("panel");
  try {
    if (value === "0") sessionStorage.setItem(PANEL_KEY, "0");
    if (value === "1") sessionStorage.removeItem(PANEL_KEY);
    if (value !== null) return value === "0";
    return sessionStorage.getItem(PANEL_KEY) === "0";
  } catch {
    return value === "0";
  }
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    node.setAttribute(k, v === true ? "" : String(v));
  }
  for (const child of [].concat(children)) {
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function stateLinks(states, active) {
  return el(
    "ul",
    { class: "flex flex-wrap gap-1" },
    states.map((s) =>
      el("li", {}, [
        el(
          "a",
          {
            href: `?state=${s}`,
            "aria-current": s === active ? "true" : null,
            "data-active": s === active ? true : null,
            class:
              "inline-flex min-h-6 items-center rounded-md border border-border-strong px-2 py-0.5 font-mono text-xs text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-active:border-primary-700 data-active:bg-primary-700 data-active:text-fg-inverse"
          },
          s
        )
      ])
    )
  );
}

export function renderPanel(entry, { state, unknown } = resolveState(entry)) {
  document.getElementById("prototype-panel")?.remove();

  const heading = (key) => el("h2", { class: "text-xs font-semibold text-fg-muted", "data-i18n": key });
  const langButton = (lang) =>
    el("button", {
      type: "button",
      "data-set-lang": lang,
      class:
        "min-h-6 rounded-md border border-border-strong px-2 text-xs text-fg hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
      "data-i18n": `common.language.${lang}`
    });

  const body = el("div", { class: "flex w-72 max-w-full flex-col gap-3 p-3" }, [
    el("p", {
      class: "rounded-md bg-warning-100 px-2 py-1 text-xs font-medium text-fg",
      "data-i18n": "prototype.panel.notProduct"
    }),
    unknown
      ? el("p", {
          role: "alert",
          class: "rounded-md bg-danger-50 px-2 py-1 text-xs text-danger-700",
          "data-i18n": "prototype.panel.unknownState",
          "data-i18n-vars": JSON.stringify({ state: unknown })
        })
      : "",
    el("dl", { class: "flex flex-col gap-1 text-xs text-fg" }, [
      el("div", { class: "flex gap-2" }, [
        el("dt", { class: "font-semibold", "data-i18n": "prototype.panel.stories" }),
        el("dd", {}, entry.stories.join(", "))
      ]),
      el("div", { class: "flex gap-2" }, [
        el("dt", { class: "font-semibold", "data-i18n": "prototype.panel.requirements" }),
        el("dd", {}, entry.requirements.join(", "))
      ])
    ]),
    el("section", { "data-panel-group": "states", class: "flex flex-col gap-1" }, [
      heading("prototype.panel.states"),
      stateLinks(entry.states, state)
    ]),
    entry.simulate?.length
      ? el("section", { "data-panel-group": "simulate", class: "flex flex-col gap-1" }, [
          heading("prototype.panel.simulate"),
          stateLinks(entry.simulate, state)
        ])
      : "",
    el("section", { class: "flex flex-wrap items-center gap-1" }, [
      heading("prototype.panel.language"),
      langButton("es"),
      langButton("en")
    ]),
    el("a", {
      href: "?panel=0",
      "data-panel-hide": true,
      class: "text-xs text-primary-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
      "data-i18n": "prototype.panel.hide"
    })
  ]);

  const panel = el(
    "aside",
    {
      id: "prototype-panel",
      "data-prototype-panel": true,
      "aria-labelledby": "prototype-panel-title",
      class:
        "fixed top-2 left-1/2 z-50 max-h-96 max-w-72 -translate-x-1/2 overflow-auto rounded-lg border border-border-strong bg-surface-raised text-fg shadow-lg print:hidden lg:top-auto lg:right-2 lg:bottom-2 lg:left-auto lg:translate-x-0"
    },
    [
      el("details", {}, [
        el("summary", {
          id: "prototype-panel-title",
          class:
            "cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          "data-i18n": "prototype.panel.title"
        }),
        body
      ])
    ]
  );

  panel.addEventListener("click", (event) => {
    const hide = event.target.closest?.("[data-panel-hide]");
    if (hide) {
      event.preventDefault();
      isPanelHidden("?panel=0");
      panel.remove();
    }
  });

  document.body.append(panel);
  return panel;
}

function syncPanel(state) {
  const panel = document.getElementById("prototype-panel");
  if (!panel) return;
  panel.querySelectorAll("a[href^='?state=']").forEach((a) => {
    const s = new URLSearchParams(a.getAttribute("href")).get("state");
    if (s === state) {
      a.setAttribute("aria-current", "true");
      a.setAttribute("data-active", "");
    } else {
      a.removeAttribute("aria-current");
      a.removeAttribute("data-active");
    }
  });
}
