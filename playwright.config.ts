import { defineConfig, devices } from "@playwright/test"

const PORT = 4173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
    timezoneId: "UTC",
  },
  expect: {
    toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 },
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
      testIgnore: /contracts\.spec\.ts/,
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
