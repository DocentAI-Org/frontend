import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  },
  test: {
    environment: "jsdom",
    include: ["tests/prototype/unit/**/*.test.js", "tests/app/unit/**/*.test.{ts,tsx}"]
  }
});
