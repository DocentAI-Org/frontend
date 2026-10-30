import { defineConfig, devices } from "@playwright/test";

/**
 * App E2E tests (research R7). By default they run against the typed mock backend; with
 * E2E_TARGET=integration they run against the real local stack (backend + Supabase) and an app
 * already started with `npm run dev`.
 */
const integration = process.env.E2E_TARGET === "integration";
const MOCK = "http://127.0.0.1:8010";
const APP_PORT = integration ? 3000 : 3100;

export default defineConfig({
  testDir: "tests/app/e2e",
  fullyParallel: false,
  // One mock backend with shared state: tests reset it and run one at a time.
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: { baseURL: `http://localhost:${APP_PORT}` },
  webServer: integration
    ? undefined
    : [
        {
          command: "node tests/app/mock-api/server.ts",
          url: `${MOCK}/__test/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000
        },
        {
          command: `npx next dev --port ${APP_PORT}`,
          url: `http://localhost:${APP_PORT}/entrar`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: MOCK,
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "mock-publishable-key",
            API_BASE_URL: MOCK,
            PSEUDONYM_EMAIL_DOMAIN: "students.docentai.invalid"
          }
        }
      ],
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
      }
    }
  ]
});
