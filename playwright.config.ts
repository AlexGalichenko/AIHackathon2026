import { defineConfig, devices, ReporterDescription } from "@playwright/test";

const reporter: ReporterDescription[] = [
  ["html", { outputFolder: "report", open: "never" }],
  ["junit", { outputFile: "report/results.xml" }],
  ["./automation/commons/reporters/ConsoleReporter.ts"],
]

export default defineConfig({
  testDir: "./automation",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
