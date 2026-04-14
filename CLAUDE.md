# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Node.js hackathon project with Playwright test automation. TypeScript, Node16 module resolution.

GitHub: https://github.com/AlexGalichenko/AIHackathon2026

## Commands

```bash
npx playwright test          # run all tests
npx playwright test --ui     # open Playwright UI mode
npx playwright show-report   # open HTML report
```

## Project Structure

```
automation/
  commons/
    fixtures/core.ts          # base test fixture (extends Playwright test, prints aria snapshot on failure)
    reporters/ConsoleReporter.ts
  ui/test.spec.ts
  api/test.spec.ts
playwright.config.ts          # Playwright config: chromium, HTML + JUnit + Console reporters
tsconfig.json                 # TypeScript: Node16, strict, path alias @core -> automation/commons/fixtures/core
```

## TypeScript

- `module` and `moduleResolution`: `Node16`
- Path alias: `@core` → `./automation/commons/fixtures/core`
- Types: `node`

## Test Fixtures

Import the extended `test` and `expect` from `@core` (not directly from `@playwright/test`) to get the context fixture that prints the accessibility tree on test failure.

```ts
import { test, expect } from "@core";
```
