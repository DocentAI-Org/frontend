// Generates src/lib/api/schema.d.ts from the pinned backend contract (Constitution VI).
//   node scripts/api-types.mjs          regenerate
//   node scripts/api-types.mjs --check  fail if the committed file is stale
// openapi-typescript runs through npx with pinned versions: it needs TypeScript 5, while the
// app uses TypeScript 6/7, and it is only a generator.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CONTRACT = "specs/015-pedagogy-criteria/contracts/backend-openapi.json";
const OUTPUT = "src/lib/api/schema.d.ts";
const GENERATOR = ["-y", "-p", "openapi-typescript@7.13.0", "-p", "typescript@5.9.3"];

function generate(target) {
  const args = [...GENERATOR, "openapi-typescript", CONTRACT, "-o", target];
  // On Windows npx is npx.cmd, which Node only runs through cmd.exe.
  const [command, argv] = process.platform === "win32" ? ["cmd.exe", ["/d", "/s", "/c", "npx", ...args]] : ["npx", args];
  execFileSync(command, argv, { stdio: ["ignore", "ignore", "inherit"] });
}

if (process.argv.includes("--check")) {
  const dir = mkdtempSync(join(tmpdir(), "api-types-"));
  try {
    const fresh = join(dir, "schema.d.ts");
    generate(fresh);
    if (readFileSync(fresh, "utf8") !== readFileSync(OUTPUT, "utf8")) {
      console.error(`${OUTPUT} is stale: run \`npm run api:types\` and commit it.`);
      process.exit(1);
    }
    console.log(`${OUTPUT} is up to date.`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
} else {
  generate(OUTPUT);
  console.log(`Wrote ${OUTPUT}`);
}
