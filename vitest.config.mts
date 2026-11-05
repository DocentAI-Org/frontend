import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  },
  test: {
    environment: "jsdom",
    // One jsdom per worker instead of per file; each file still runs in its own context.
    pool: "vmThreads",
    include: ["tests/prototype/unit/**/*.test.js", "tests/app/unit/**/*.test.{ts,tsx}"]
  }
});
