import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getByRole, getByText } from "@testing-library/dom";
import {
  PANEL_KEY,
  applyState,
  bindNavigation,
  decorateLinks,
  isPanelHidden,
  renderPanel,
  resolveState,
  setNavigator
} from "../../../public/prototype/assets/js/state.js";

const entry = {
  path: "student/chat.html",
  stories: ["US-01"],
  requirements: ["S1", "S2"],
  states: ["default", "tutor-writing", "answer", "failed"],
  simulate: ["failed"]
};

const markup = `
  <p id="always">Siempre</p>
  <p id="def" data-state="default">Por defecto</p>
  <p id="writing" data-state="tutor-writing" data-advance="answer">Escribiendo</p>
  <p id="answer" data-state="answer failed">Respuesta</p>
  <button id="go" data-goto="failed">Fallar</button>
  <a id="rel" href="courses.html">Cursos</a>
  <a id="ext" href="https://example.org/x">Fuera</a>
  <a id="same" href="?state=answer">Ver respuesta</a>
`;

function setUrl(search) {
  window.history.replaceState(null, "", `/prototype/student/chat.html${search}`);
}

function mockReducedMotion(matches) {
  window.matchMedia = vi.fn().mockReturnValue({ matches, addEventListener() {}, removeEventListener() {} });
}

beforeEach(() => {
  document.body.innerHTML = markup;
  sessionStorage.clear();
  mockReducedMotion(false);
  setUrl("");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("resolveState", () => {
  it("defaults to default", () => {
    expect(resolveState(entry, "")).toEqual({ state: "default", unknown: null });
  });

  it("falls back to default for an unknown state and reports it", () => {
    expect(resolveState(entry, "?state=nope")).toEqual({ state: "default", unknown: "nope" });
  });
});

describe("applyState", () => {
  it("shows only elements whose data-state includes the current state", () => {
    setUrl("?state=answer");
    applyState(document.body, entry);
    expect(document.getElementById("always").hidden).toBe(false);
    expect(document.getElementById("def").hidden).toBe(true);
    expect(document.getElementById("answer").hidden).toBe(false);
  });

  it("supports space-separated state lists", () => {
    setUrl("?state=failed");
    applyState(document.body, entry);
    expect(document.getElementById("answer").hidden).toBe(false);
  });

  it("advances after 1200 ms", () => {
    vi.useFakeTimers();
    setUrl("?state=tutor-writing");
    applyState(document.body, entry);
    expect(document.getElementById("writing").hidden).toBe(false);
    vi.advanceTimersByTime(1199);
    expect(document.getElementById("answer").hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(document.getElementById("answer").hidden).toBe(false);
    expect(new URL(window.location.href).searchParams.get("state")).toBe("answer");
  });

  it("advances immediately with reduced motion", () => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    setUrl("?state=tutor-writing");
    applyState(document.body, entry);
    vi.advanceTimersByTime(0);
    expect(document.getElementById("answer").hidden).toBe(false);
  });
});

describe("bindNavigation", () => {
  it("switches state on data-goto and pushes the URL", () => {
    applyState(document.body, entry);
    bindNavigation(document.body);
    const before = window.history.length;
    document.getElementById("go").click();
    expect(new URL(window.location.href).searchParams.get("state")).toBe("failed");
    expect(window.history.length).toBe(before + 1);
    expect(document.getElementById("answer").hidden).toBe(false);
  });

  it("handles same-page ?state= links without reloading", () => {
    applyState(document.body, entry);
    bindNavigation(document.body);
    document.getElementById("same").click();
    expect(new URL(window.location.href).searchParams.get("state")).toBe("answer");
    expect(document.getElementById("answer").hidden).toBe(false);
  });

  it("re-applies the state on popstate", () => {
    applyState(document.body, entry);
    bindNavigation(document.body);
    setUrl("?state=answer");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(document.getElementById("answer").hidden).toBe(false);
  });
});

describe("decorateLinks", () => {
  it("appends the current lang and panel to relative links only", () => {
    setUrl("?lang=en&panel=0");
    decorateLinks(document.body);
    const rel = new URL(document.getElementById("rel").href);
    expect(rel.searchParams.get("lang")).toBe("en");
    expect(rel.searchParams.get("panel")).toBe("0");
    expect(document.getElementById("ext").getAttribute("href")).toBe("https://example.org/x");
  });
});

describe("panel", () => {
  it("is hidden with ?panel=0 and remembers it for the session", () => {
    expect(isPanelHidden("?panel=0")).toBe(true);
    expect(sessionStorage.getItem(PANEL_KEY)).toBe("0");
    expect(isPanelHidden("")).toBe(true);
    expect(isPanelHidden("?panel=1")).toBe(false);
    expect(sessionStorage.getItem(PANEL_KEY)).toBeNull();
  });

  it("lists the states as links, the simulate group, stories and requirements", () => {
    setUrl("?state=answer");
    const panel = renderPanel(entry, { state: "answer", unknown: null });
    expect(panel.querySelector('[data-i18n="prototype.panel.notProduct"]')).toBeTruthy();
    const current = getByRole(panel, "link", { name: "answer" });
    expect(current.getAttribute("aria-current")).toBe("true");
    expect(panel.querySelector('[data-panel-group="simulate"] a[href="?state=failed"]')).toBeTruthy();
    expect(getByText(panel, "US-01")).toBeTruthy();
    expect(getByText(panel, "S1, S2")).toBeTruthy();
  });

  it("shows a warning for an unknown state", () => {
    const panel = renderPanel(entry, { state: "default", unknown: "nope" });
    const warning = panel.querySelector('[data-i18n="prototype.panel.unknownState"]');
    expect(warning).toBeTruthy();
    expect(JSON.parse(warning.getAttribute("data-i18n-vars"))).toEqual({ state: "nope" });
  });
});

describe("modal dialogs", () => {
  const dialogEntry = { ...entry, states: ["default", "dialog"] };

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="opener" data-goto="dialog">Abrir</button>
      <dialog id="dlg" data-modal data-state="dialog" data-close-state="default">
        <button id="inside">Cerrar</button>
      </dialog>`;
    HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
    HTMLDialogElement.prototype.close ??= function () { this.open = false; this.dispatchEvent(new Event("close")); };
  });

  it("opens a visible data-modal dialog with showModal()", () => {
    const spy = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    setUrl("?state=dialog");
    applyState(document.body, dialogEntry);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(document.getElementById("dlg").open).toBe(true);
    spy.mockRestore();
  });

  it("stays on the target state when a button inside the dialog changes state, even if close fires later", async () => {
    document.getElementById("dlg").insertAdjacentHTML("beforeend", '<button id="go-other" data-goto="other">Otro</button>');
    const e = { ...dialogEntry, states: ["default", "dialog", "other"] };
    const realClose = HTMLDialogElement.prototype.close;
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
      setTimeout(() => this.dispatchEvent(new Event("close")), 0);
    };
    setUrl("?state=dialog");
    applyState(document.body, e);
    bindNavigation(document.body);
    document.getElementById("go-other").click();
    await new Promise((r) => setTimeout(r, 5));
    expect(new URL(window.location.href).searchParams.get("state")).toBe("other");
    HTMLDialogElement.prototype.close = realClose;
  });

  it("goes to data-close-state when the dialog closes and returns focus to the opener", () => {
    applyState(document.body, dialogEntry);
    bindNavigation(document.body);
    const opener = document.getElementById("opener");
    opener.focus();
    opener.click();
    const dlg = document.getElementById("dlg");
    expect(dlg.open).toBe(true);
    dlg.close();
    expect(new URL(window.location.href).searchParams.get("state")).toBe("default");
    expect(document.activeElement).toBe(opener);
  });
});

describe("data-focus", () => {
  it("moves focus to the target element", () => {
    document.body.innerHTML = '<button id="b" data-focus="#field">Reformular</button><textarea id="field"></textarea>';
    applyState(document.body, entry);
    bindNavigation(document.body);
    document.getElementById("b").click();
    expect(document.activeElement).toBe(document.getElementById("field"));
  });
});

describe("non-dismissible dialogs", () => {
  it("blocks Esc (cancel) when data-dismissible=false", () => {
    document.body.innerHTML = `<dialog id="d" data-modal data-dismissible="false" data-state="dialog" data-close-state="default"></dialog>`;
    HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
    setUrl("?state=dialog");
    applyState(document.body, { ...entry, states: ["default", "dialog"] });
    const cancel = new Event("cancel", { cancelable: true });
    document.getElementById("d").dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });
});

describe("switches", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-switch-scope>
        <button id="sw" type="button" role="switch" aria-checked="true" data-switch>Incluir</button>
        <span id="on" data-switch-on>Incluido</span>
        <span id="off" data-switch-off>Excluido</span>
      </div>`;
    applyState(document.body, entry);
    bindNavigation(document.body);
  });

  it("shows the 'on' content initially when checked", () => {
    expect(document.getElementById("on").hidden).toBe(false);
    expect(document.getElementById("off").hidden).toBe(true);
  });

  it("flips aria-checked and the content on click", () => {
    document.getElementById("sw").click();
    expect(document.getElementById("sw").getAttribute("aria-checked")).toBe("false");
    expect(document.getElementById("on").hidden).toBe(true);
    expect(document.getElementById("off").hidden).toBe(false);
  });
});

describe("data-checked-in", () => {
  const e2 = { ...entry, states: ["default", "hints-only"] };

  beforeEach(() => {
    document.body.innerHTML = `
      <input type="radio" name="p" id="r1" data-checked-in="default" />
      <input type="radio" name="p" id="r2" data-checked-in="hints-only" data-goto="hints-only" />`;
  });

  it("checks the radio that belongs to the current state", () => {
    setUrl("?state=hints-only");
    applyState(document.body, e2);
    expect(document.getElementById("r2").checked).toBe(true);
    expect(document.getElementById("r1").checked).toBe(false);
  });

  it("does not block the native check when a radio has data-goto", () => {
    applyState(document.body, e2);
    bindNavigation(document.body);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.getElementById("r2").dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(new URL(window.location.href).searchParams.get("state")).toBe("hints-only");
  });
});

describe("leave guard", () => {
  const e3 = { ...entry, states: ["default", "hints-only", "unsaved"] };

  beforeEach(() => {
    document.body.innerHTML = `
      <nav><a id="away" href="/prototype/teacher/courses.html">Mis cursos</a></nav>
      <main data-leave-guard="hints-only" data-leave-state="unsaved"><a id="local" href="?state=default">x</a></main>
      <dialog data-state="unsaved"><a id="leave" data-leave-link href="#">Salir sin guardar</a></dialog>`;
  });

  it("stops navigation in a guarded state and opens the leave state with the target kept", () => {
    setUrl("?state=hints-only");
    applyState(document.body, e3);
    bindNavigation(document.body);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.getElementById("away").dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(new URL(window.location.href).searchParams.get("state")).toBe("unsaved");
    expect(document.getElementById("leave").getAttribute("href")).toBe("/prototype/teacher/courses.html");
  });

  it("does not interfere in other states", () => {
    applyState(document.body, e3);
    bindNavigation(document.body);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.getElementById("away").dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });
});

describe("form routing", () => {
  const e4 = { ...entry, states: ["default", "confirm", "invalid-code", "validation-error"] };
  let navigated;

  beforeEach(() => {
    navigated = null;
    setNavigator((url) => (navigated = url));
    document.body.innerHTML = `
      <form id="f" data-route data-route-field="#code" data-route-default="invalid-code"
            data-routes='{"ALG-7K3P":"confirm","ALG-HOME":"courses.html"}'
            data-route-empty="#code" data-route-empty-target="validation-error">
        <input id="code" /><button type="submit">Continuar</button>
      </form>`;
    applyState(document.body, e4);
    bindNavigation(document.body);
  });

  const submit = (value) => {
    document.getElementById("code").value = value;
    document.getElementById("f").requestSubmit();
  };

  it("goes to the state mapped to the field value (case-insensitive, trimmed)", () => {
    submit("  alg-7k3p ");
    expect(new URL(window.location.href).searchParams.get("state")).toBe("confirm");
  });

  it("uses the default target when nothing matches", () => {
    submit("XYZ-0000");
    expect(new URL(window.location.href).searchParams.get("state")).toBe("invalid-code");
  });

  it("goes to the empty target when the required fields are empty", () => {
    submit("");
    expect(new URL(window.location.href).searchParams.get("state")).toBe("validation-error");
  });

  it("navigates to a page target, keeping lang and panel", () => {
    setUrl("?lang=en&panel=0");
    submit("ALG-HOME");
    const url = new URL(navigated);
    expect(url.pathname).toBe("/prototype/student/courses.html");
    expect(url.searchParams.get("lang")).toBe("en");
    expect(url.searchParams.get("panel")).toBe("0");
  });

  it("resolves @next from the ?next parameter", () => {
    document.getElementById("f").setAttribute("data-route-default", "@next");
    setUrl("?state=default&next=chat.html%3Fstate%3Danswer");
    submit("anything");
    expect(new URL(navigated).pathname).toBe("/prototype/student/chat.html");
    expect(new URL(navigated).searchParams.get("state")).toBe("answer");
  });
});

describe("data-invalid-in", () => {
  it("sets aria-invalid only in the listed states", () => {
    document.body.innerHTML = '<input id="i" data-invalid-in="invalid-code" />';
    const e5 = { ...entry, states: ["default", "invalid-code"] };
    setUrl("?state=invalid-code");
    applyState(document.body, e5);
    expect(document.getElementById("i").getAttribute("aria-invalid")).toBe("true");
    setUrl("");
    applyState(document.body, e5);
    expect(document.getElementById("i").hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("data-close-state=@back", () => {
  it("goes back in history when the dialog closes", () => {
    document.body.innerHTML = `<dialog id="b" data-modal data-state="sheet" data-close-state="@back"></dialog>`;
    HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    setUrl("?state=sheet");
    applyState(document.body, { ...entry, states: ["default", "sheet"] });
    const dlg = document.getElementById("b");
    dlg.open = false;
    dlg.dispatchEvent(new Event("close"));
    expect(back).toHaveBeenCalledTimes(1);
    back.mockRestore();
  });
});

describe("data-mirror", () => {
  it("shows the typed value, or keeps the existing text when the field is empty", () => {
    document.body.innerHTML = `
      <textarea id="steps"></textarea>
      <p id="out" data-mirror="#steps" data-state="review">Ejemplo</p>`;
    const e6 = { ...entry, states: ["default", "review"] };
    setUrl("?state=review");
    applyState(document.body, e6);
    expect(document.getElementById("out").textContent).toBe("Ejemplo");
    document.getElementById("steps").value = "x = 2";
    applyState(document.body, e6);
    expect(document.getElementById("out").textContent).toBe("x = 2");
  });
});

describe("data-href-param", () => {
  it("takes the link target from a query parameter when present", () => {
    document.body.innerHTML = '<a id="home" href="../student/courses.html" data-href-param="home">Inicio</a>';
    setUrl("?home=../admin/users.html");
    decorateLinks(document.body);
    expect(document.getElementById("home").getAttribute("href")).toBe("../admin/users.html");
  });

  it("keeps the default target otherwise", () => {
    document.body.innerHTML = '<a id="home" href="../student/courses.html" data-href-param="home">Inicio</a>';
    setUrl("");
    decorateLinks(document.body);
    expect(document.getElementById("home").getAttribute("href")).toBe("../student/courses.html");
  });
});

describe("session dismissal", () => {
  const e7 = { ...entry, states: ["default", "repeated"] };

  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = `
      <section id="notice" data-state="repeated" data-dismissible-key="pattern-sign">
        <button id="dismiss" data-dismiss="pattern-sign">Ahora no</button>
      </section>`;
  });

  it("hides the element and remembers it for the session", () => {
    setUrl("?state=repeated");
    applyState(document.body, e7);
    bindNavigation(document.body);
    expect(document.getElementById("notice").hidden).toBe(false);
    document.getElementById("dismiss").click();
    expect(document.getElementById("notice").hidden).toBe(true);
    applyState(document.body, e7);
    expect(document.getElementById("notice").hidden).toBe(true);
  });

  it("stays hidden on a later page load in the same session", () => {
    sessionStorage.setItem("docentai.prototype.dismissed.pattern-sign", "1");
    setUrl("?state=repeated");
    applyState(document.body, e7);
    expect(document.getElementById("notice").hidden).toBe(true);
  });
});
