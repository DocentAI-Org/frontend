import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";

const eslintConfig = [
  {
    // Playwright output folders are generated.
    ignores: [".next/**", "node_modules/**", "test-results/**", "playwright-report/**", "blob-report/**"]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    // eslint-config-next sets react.version to "detect", which makes eslint-plugin-react call
    // context.getFilename(), removed in ESLint 10. Pinning the version avoids that code path.
    settings: { react: { version: "19.3" } }
  },
  sonarjs.configs.recommended,
  {
    rules: {
      // House style: conditional JSX reads better inline, and union types stay where they are used.
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/use-type-alias": "off"
    }
  },
  {
    // Generated from the backend contract (npm run api:types).
    files: ["src/lib/api/schema.d.ts"],
    rules: { "sonarjs/class-name": "off" }
  },
  {
    // Test code: Playwright specs register tests through helpers, mock handlers mirror the backend's
    // branching, and the mock backend runs on localhost with throwaway ids and patterns.
    files: ["tests/**"],
    rules: {
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-clear-text-protocols": "off",
      "sonarjs/no-empty-test-file": "off",
      "sonarjs/pseudo-random": "off",
      "sonarjs/super-linear-regex": "off"
    }
  }
];

export default eslintConfig;
