# AIHackathon2026

Playwright test automation framework built for the AI Hackathon 2026. TypeScript, Node16 module resolution, Chromium browser.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api

# Open Playwright UI mode
npx playwright test --ui

# Open HTML report after a run
npx playwright show-report
```

## Project Structure

```
automation/
  commons/
    fixtures/core.ts          # Extended test fixture — prints aria snapshot on failure
    reporters/ConsoleReporter.ts  # Custom reporter showing step-level results
  ui/test.spec.ts             # UI test suite
  api/test.spec.ts            # API test suite
playwright.config.ts          # Config: Chromium, HTML + JUnit + Console reporters
tsconfig.json                 # TypeScript: Node16, strict mode
```

## Writing Tests

Import `test` and `expect` from `@core` (not directly from `@playwright/test`) to get the extended fixture that prints the accessibility tree on failure:

```ts
import { test, expect } from "@core";

test("example", async ({ page }) => {
  await page.goto("https://example.com");
  await expect(page).toHaveTitle("Example Domain");
});
```

## Reporters

On each test run, three reports are generated:

| Reporter | Output |
|----------|--------|
| HTML | `report/index.html` |
| JUnit | `report/results.xml` |
| Console | Printed to terminal with step-level pass/fail |

## CI

- `forbidOnly` is enabled in CI to prevent accidental `test.only`
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, auto locally
