# AIHackathon2026 — Node of the Rings

AI-assisted test automation framework built for the QAHub AI Hackathon 2026. Targets the **InvenTree Parts module** — an open-source inventory management system.

Built with **Claude Code + Playwright + TypeScript**. The framework demonstrates a dark factory approach to quality engineering: from a plain-English spec or an API schema, the agent generates, executes, fixes, and commits tests — lights out, no manual stitching required.

---

## Prerequisites

- Node.js 18+
- npm
- A running InvenTree instance (or use `https://demo.inventree.org`)

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` and fill in your InvenTree credentials:

```bash
BASE_URL
API_USERNAME
API_PASSWORD
```

---

## Project Structure

```
AIHackathon2026/
├── automation/
│   ├── commons/
│   │   ├── fixtures/core.ts          # Extended test fixture — prints aria snapshot on failure
│   │   └── reporters/ConsoleReporter.ts  # Step-level console reporter
│   ├── api/
│   │   ├── parts.spec.ts             # 37 API tests — /api/part/
│   │   └── part-categories.spec.ts   # 30 API tests — /api/part/category/
│   └── ui/
│       ├── test.spec.ts              # Homepage smoke test
│       └── permissions.spec.ts       # TC-PERM-001 — role-based UI access
├── test-cases/
│   ├── api-parts-test-cases.md       # 50 API manual test cases (TC-PART + TC-PCAT)
│   └── inventree-part-management-test-cases.md  # 60 UI manual test cases
├── data-source/
│   └── oas-spec.yaml                 # OpenAPI 3.0.3 spec — InvenTree API v479
├── .claude/
│   ├── settings.json                 # Orchestrator as default agent, bypassPermissions
│   └── skills/                       # All AI skills (see below)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Running Tests

### Direct test execution

```bash
# All tests
npx playwright test

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# Playwright UI mode
npx playwright test --ui

# Open HTML report
npx playwright show-report
```

### Pipeline scripts

```bash
# Run full API test suite with line reporter
npm run pipeline:api

# Run full UI test suite with line reporter
npm run pipeline:ui

# Run all tests (baseline for fix pipeline)
npm run pipeline:fix

# Run only API tests (fix pipeline)
npm run pipeline:fix:api

# Run only UI tests (fix pipeline)
npm run pipeline:fix:ui
```

---

## AI-Powered Pipelines

The framework ships with an **orchestrator agent** that chains skills into five named end-to-end pipelines. Invoke them via Claude Code:

### `api` pipeline — OAS spec → tests → verify → commit
```
generate-api-tests → run-api-tests → fix-api-tests* → review → commit*
```
Parses the OAS spec, produces manual test cases and Playwright automation scripts, runs them, fixes failures, reviews the diff, and commits. `*` = conditional on failures / user confirmation.

```
/orchestrator api ./data-source/oas-spec.yaml
```

### `sync` pipeline — spec changed → append tests → verify
```
sync-tests-from-spec → run-api-tests (new TCs only) → fix-api-tests* → review → commit*
```
Diffs the spec against the last git commit, appends tests only for changed endpoints without touching existing coverage.

```
/orchestrator sync ./data-source/oas-spec.yaml
```

### `ui` pipeline — docs → manual cases → Playwright → verify
```
create-manual-ui-test → create-playwright-ui-test → fix-ui-tests* → review → commit*
```
Ingests documentation or a GitHub URL, generates structured manual test cases, then converts them to runnable Playwright tests using live browser exploration.

```
/orchestrator ui https://docs.inventree.org/en/stable/part/
```

### `manual` pipeline — execute specs without any code
```
run-manual-tests
```
Takes plain-English markdown test cases and executes them directly in a real browser — no automation code required, no generation step. Records a video with chapter markers and produces a structured pass/fail report.

```
/orchestrator manual TC-PERM-001
/orchestrator manual all
```

### `fix` pipeline — diagnose → repair → commit
```
run-api-tests → fix-api-tests* → fix-ui-tests* → review → commit*
```
Establishes a failure baseline, diagnoses and repairs broken tests, reviews all changes before committing.

```
/orchestrator fix
```

---

## Test Coverage

### API — `automation/api/`

| File | Tests | Covers |
|------|-------|--------|
| `parts.spec.ts` | 37 | CRUD, Auth, Pagination, Filtering, Ordering, Search, Field Validation, Relational Integrity |
| `part-categories.spec.ts` | 30 | CRUD, Auth, Pagination, Filtering, Ordering, Search, Field Validation, Relational Integrity |

### UI — `automation/ui/`

| File | Tests | Covers |
|------|-------|--------|
| `test.spec.ts` | 1 | Homepage smoke |
| `permissions.spec.ts` | 1 | TC-PERM-001 — Add Parts hidden for read-only user |

### Manual test cases — `test-cases/`

| File | Cases | Covers |
|------|-------|--------|
| `api-parts-test-cases.md` | 50 | TC-PART-001–037, TC-PCAT-001–014 |
| `inventree-part-management-test-cases.md` | 60 | Part Creation, Detail View, Revisions, Templates, Trackable, Virtual, Pricing, Stocktake, Test Templates, Notifications |

---

## Available Skills

| Skill | What it does |
|-------|-------------|
| `orchestrator` | Chains skills into named pipelines (api / sync / ui / manual / fix) |
| `generate-api-tests` | OAS spec → manual test cases + Playwright automation scripts |
| `sync-tests-from-spec` | Spec diff → append incremental tests for changed endpoints only |
| `run-api-tests` | Execute `automation/api/` tests, report results |
| `fix-api-tests` | Diagnose and repair failing API tests |
| `create-manual-ui-test` | Docs / GitHub URL → structured markdown test cases |
| `create-playwright-ui-test` | Markdown test case → Playwright `.spec.ts` via live browser exploration |
| `run-manual-tests` | Execute markdown test cases in a real browser — no code required |
| `fix-ui-tests` | Diagnose and repair failing UI tests |
| `review` | Structured code review of all uncommitted changes |
| `commit` | Stage and commit with conventional commit message |
| `playwright-cli` | Low-level browser automation used by other skills |

---

## Writing Tests

Import `test` and `expect` from `@core` (not from `@playwright/test`) to get the extended fixture that prints the full accessibility tree on failure:

```ts
import { test, expect } from "@core";

test("example", async ({ page }) => {
  await page.goto("https://demo.inventree.org");
  await expect(page).toHaveTitle("InvenTree Demo Server");
});
```

For API tests, use the `apiRequest` fixture — it injects a pre-authenticated `APIRequestContext` with `baseURL` set:

```ts
import { test, expect } from "@core";

test("list parts", async ({ apiRequest }) => {
  const resp = await apiRequest.get("/api/part/", { params: { limit: 10 } });
  expect(resp.status()).toBe(200);
});
```

---

## Reporters

| Reporter | Output |
|----------|--------|
| HTML | `report/index.html` |
| JUnit | `report/results.xml` |
| Console | Terminal — step-level pass/fail tree per test |

## CI

- `forbidOnly` enabled — prevents accidental `test.only` merges
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, auto locally
- Trace: on first retry
