import { defineConfig, devices } from "@playwright/test";

/**
 * Demo deployment E2E: the app with DEMO_MODE=on, which answers its API and Auth calls in process
 * from sample data (tests/app/mock-api/demo.ts). No mock server or backend.
 */
const APP_PORT = 3200;

export default defineConfig({
  testDir: "tests/app/demo",
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: { baseURL: `http://localhost:${APP_PORT}` },
  webServer: {
    command: `npx next dev --port ${APP_PORT}`,
    url: `http://localhost:${APP_PORT}/sign-in`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { DEMO_MODE: "on" }
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, locale: "es-ES" }
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
        viewport: { width: 390, height: 844 },
        locale: "es-ES",
        isMobile: true,
        hasTouch: true
      }
    }
  ]
});
