// Shared helpers for the static checks over public/prototype/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../public/prototype");

export function listFiles(ext) {
  return fs
    .readdirSync(ROOT, { recursive: true })
    .map((p) => p.split(path.sep).join("/"))
    .filter((p) => p.endsWith(ext))
    .sort();
}

export function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

export function readJson(rel) {
  return JSON.parse(read(rel));
}

export function parseHtml(rel) {
  return new DOMParser().parseFromString(read(rel), "text/html");
}

export function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? flattenKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
}
