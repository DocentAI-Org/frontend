import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getByText } from "@testing-library/dom";
import {
  LANG_KEY,
  applyI18nWith,
  formatDate,
  getLang,
  lookup,
  setLang,
  translate
} from "../../../public/prototype/assets/js/i18n.js";

const dict = {
  student: {
    chat: {
      title: "Chat del curso",
      remaining_one: "Te queda {count} mensaje hoy",
      remaining_other: "Te quedan {count} mensajes hoy",
      greeting: "Hola, {name}",
      saved: "Guardado · {date}",
      close: "Cerrar",
      placeholder: "Escribe tu pregunta"
    }
  },
  sample: { people: { lucas: "Lucas Herrera" } }
};

const enDict = {
  student: {
    chat: {
      remaining_one: "You have {count} message left today",
      remaining_other: "You have {count} messages left today"
    }
  }
};

function render(html) {
  document.body.innerHTML = html;
  return document.body;
}

describe("lookup", () => {
  it("resolves nested keys", () => {
    expect(lookup(dict, "student.chat.title")).toBe("Chat del curso");
  });

  it("returns undefined for a missing key", () => {
    expect(lookup(dict, "student.chat.nope")).toBeUndefined();
  });
});

describe("translate", () => {
  it("renders a missing key as ⟦key⟧", () => {
    expect(translate(dict, "student.chat.nope", {}, "es")).toBe("⟦student.chat.nope⟧");
  });

  it("picks _one / _other with Intl.PluralRules and fills {count}", () => {
    expect(translate(dict, "student.chat.remaining", { count: 1 }, "es")).toBe("Te queda 1 mensaje hoy");
    expect(translate(dict, "student.chat.remaining", { count: 12 }, "es")).toBe("Te quedan 12 mensajes hoy");
    expect(translate(enDict, "student.chat.remaining", { count: 1 }, "en")).toBe("You have 1 message left today");
    expect(translate(enDict, "student.chat.remaining", { count: 3 }, "en")).toBe("You have 3 messages left today");
  });

  it("fills {name} and resolves sample.* values", () => {
    expect(translate(dict, "student.chat.greeting", { vars: { name: "sample.people.lucas" } }, "es")).toBe(
      "Hola, Lucas Herrera"
    );
  });

  it("formats date: values inside vars", () => {
    expect(translate(dict, "student.chat.saved", { vars: { date: "date:2026-10-06T10:42" } }, "es")).toBe(
      "Guardado · 6 oct 2026, 10:42"
    );
  });
});

describe("formatDate", () => {
  it("formats per locale without shifting the day", () => {
    expect(formatDate("2026-10-04", "es")).toBe("4 oct 2026");
    expect(formatDate("2026-10-04", "en")).toBe("Oct 4, 2026");
  });
});

describe("applyI18nWith", () => {
  it("sets text content from data-i18n", () => {
    const root = render('<h1 data-i18n="student.chat.title"></h1>');
    applyI18nWith(root, dict, "es");
    expect(getByText(root, "Chat del curso").tagName).toBe("H1");
  });

  it("sets several attributes from data-i18n-attr", () => {
    const root = render(
      '<input data-i18n-attr="aria-label:student.chat.close;placeholder:student.chat.placeholder" />'
    );
    applyI18nWith(root, dict, "es");
    const input = root.querySelector("input");
    expect(input.getAttribute("aria-label")).toBe("Cerrar");
    expect(input.getAttribute("placeholder")).toBe("Escribe tu pregunta");
  });

  it("uses data-i18n-count and data-i18n-vars", () => {
    const root = render(
      '<p data-i18n="student.chat.remaining" data-i18n-count="12"></p>' +
        '<p data-i18n="student.chat.greeting" data-i18n-vars=\'{"name":"sample.people.lucas"}\'></p>'
    );
    applyI18nWith(root, dict, "es");
    expect(getByText(root, "Te quedan 12 mensajes hoy")).toBeTruthy();
    expect(getByText(root, "Hola, Lucas Herrera")).toBeTruthy();
  });

  it("formats data-i18n-date and data-i18n-number per locale", () => {
    const root = render('<time data-i18n-date="2026-10-04"></time><span data-i18n-number="2.4"></span>');
    applyI18nWith(root, dict, "es");
    expect(root.querySelector("time").textContent).toBe("4 oct 2026");
    expect(root.querySelector("span").textContent).toBe("2,4");
    applyI18nWith(root, dict, "en");
    expect(root.querySelector("time").textContent).toBe("Oct 4, 2026");
    expect(root.querySelector("span").textContent).toBe("2.4");
  });

  it("updates <html lang>", () => {
    const root = render("<p></p>");
    applyI18nWith(root, dict, "en");
    expect(document.documentElement.lang).toBe("en");
  });
});

describe("getLang / setLang", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/prototype/student/chat.html");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to es", () => {
    expect(getLang("")).toBe("es");
  });

  it("prefers ?lang over the stored preference", () => {
    localStorage.setItem(LANG_KEY, "es");
    expect(getLang("?lang=en")).toBe("en");
  });

  it("uses the stored preference when there is no ?lang", () => {
    localStorage.setItem(LANG_KEY, "en");
    expect(getLang("")).toBe("en");
  });

  it("ignores unsupported languages", () => {
    expect(getLang("?lang=fr")).toBe("es");
  });

  it("stores the language and puts it in the URL", () => {
    setLang("en");
    expect(localStorage.getItem(LANG_KEY)).toBe("en");
    expect(new URL(window.location.href).searchParams.get("lang")).toBe("en");
  });

  it("survives storage errors", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getLang("")).toBe("es");
    expect(() => setLang("en")).not.toThrow();
  });
});
