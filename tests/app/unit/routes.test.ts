// SC-001 of 003: routes, query parameters and anchors are English for every language.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(__dirname, "../../../src");
const SPANISH_SEGMENTS = [
  "entrar", "recuperar", "acceso-denegado", "acerca", "unirse", "alumno", "profesor", "cursos",
  "consentimiento", "conversaciones", "conversacion", "ejercicio", "ejercicios", "envio", "perfil",
  "nuevo", "nuevos", "documento", "temas", "asignacion", "correcciones", "usuarios", "profesores",
  "estudiantes", "codigo", "archivo", "subir"
];
const SPANISH_PARAMS = [
  "expirada", "paso", "unido", "codigo", "validado", "excluido", "anadido", "movido", "guardado",
  "estudiante", "desde", "sinFuente", "corregida"
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? [path, ...files(path)] : [path];
  });
}

describe("English routes", () => {
  const all = files(SRC).map((path) => relative(SRC, path));

  it("has no Spanish route folder or dynamic segment", () => {
    const spanish = all.filter((path) =>
      path.split("/").some((part) => SPANISH_SEGMENTS.includes(part.replace(/^\[|\]$/g, "")))
    );
    expect(spanish).toEqual([]);
  });

  it("has no Spanish path, query parameter or anchor in the code", () => {
    const segment = SPANISH_SEGMENTS.join("|");
    const param = SPANISH_PARAMS.join("|");
    const pattern = new RegExp(
      `["'\`/](${segment})(/|["'\`?#])|[?&](${param})=|searchParams\\b[^;]*\\b(${param})\\??:|#privacidad|id="privacidad"`
    );
    const offending = all
      .filter((path) => /\.(ts|tsx)$/.test(path))
      .flatMap((path) =>
        readFileSync(join(SRC, path), "utf8")
          .split("\n")
          .map((line, index) => ({ line, at: `${path}:${index + 1}` }))
          .filter(({ line }) => pattern.test(line))
          .map(({ at, line }) => `${at} ${line.trim()}`)
      );
    expect(offending).toEqual([]);
  });
});
