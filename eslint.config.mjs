import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    // .agents/ holds third-party agent skills (vendored via skills-lock.json, incl. minified bundles),
    // not project code. Playwright output folders are generated.
    ignores: [".next/**", "node_modules/**", ".agents/**", "test-results/**", "playwright-report/**", "blob-report/**"]
  },
  ...nextVitals,
  ...nextTypescript,
  {
    // eslint-config-next sets react.version to "detect", which makes eslint-plugin-react call
    // context.getFilename(), removed in ESLint 10. Pinning the version avoids that code path.
    settings: { react: { version: "19.3" } }
  }
];

export default eslintConfig;
