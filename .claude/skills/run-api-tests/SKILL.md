---
name: run-api-tests
description: This skill should be used when the user asks to "run api tests", "execute api tests", "run the api test suite", "run all api tests", "run parts tests", "run part-categories tests", "run a specific api test", "run TC-PART-001", or wants to execute Playwright API tests under `automation/api/` and see results.
argument-hint: "Optionally specify a file (e.g. parts.spec.ts), a test ID (e.g. TC-PART-003), or a describe block name (e.g. 'Parts — CRUD'). If omitted, all api tests are run."
version: 0.1.0
allowed-tools: Bash(npx:*)
---

# Run API Tests

Execute Playwright API tests under `automation/api/` and present results clearly. Support targeting a single file, a specific test by ID/title, or the full suite.

---

## Workflow

### Step 1: Determine Scope

Parse the user's request:

| User says | Command to run |
|-----------|---------------|
| No scope / "all api tests" | `npx playwright test automation/api/` |
| File name e.g. `parts.spec.ts` | `npx playwright test automation/api/parts.spec.ts` |
| Test ID e.g. `TC-PART-003` | `npx playwright test automation/api/ --grep "TC-PART-003"` |
| Describe block e.g. `Parts — CRUD` | `npx playwright test automation/api/ --grep "Parts — CRUD"` |
| Keyword e.g. "pagination tests" | `npx playwright test automation/api/ --grep "Pagination"` |

---

### Step 2: Run

Always use the `line` reporter for compact terminal output:

```bash
npx playwright test <scope> --reporter=line 2>&1
```

Examples:

```bash
# Full api suite
npx playwright test automation/api/ --reporter=line 2>&1

# Single file
npx playwright test automation/api/parts.spec.ts --reporter=line 2>&1

# Single test by ID
npx playwright test automation/api/ --grep "TC-PART-003" --reporter=line 2>&1

# Single describe block
npx playwright test automation/api/ --grep "Parts — CRUD" --reporter=line 2>&1
```

---

### Step 3: Parse and Present Results

After the run completes, extract from the output:

- Total tests run
- Passed count
- Failed count
- Skipped count
- Total duration

Then present a summary table of **failed tests** (if any):

```
Results: 34 passed, 2 failed, 0 skipped  (12.4s)

Failed tests:
  ✗ TC-PART-022 ordering by invalid field returns 400
      automation/api/parts.spec.ts:227
      Error: expect(received).toBe(expected)
        Expected: 400
        Received: 200

  ✗ TC-PCAT-008 delete non-existent category returns 404
      automation/api/part-categories.spec.ts:89
      Error: expect(received).toBe(expected)
        Expected: 404
        Received: 400
```

If all tests pass:

```
Results: 34 passed, 0 failed  (11.8s)

All API tests passed.
```

---

### Step 4: Offer Next Steps

If there are failures, offer:

> To fix these failures, ask me to `/fix-api-tests` or say "fix the failing api tests".

If the run could not start (e.g. ECONNREFUSED, missing credentials), diagnose the environment issue:

| Error | Likely cause | What to tell the user |
|-------|-------------|----------------------|
| `connect ECONNREFUSED` | Server not running | Start the InvenTree server or check `BASE_URL` in `.env` |
| `No API credentials found` | Missing `.env` vars | Set `API_TOKEN` or `API_USERNAME`/`API_PASSWORD` in `.env` |
| `Cannot find module '@core'` | Path alias not resolved | Check `tsconfig.json` paths config |
| TypeScript compile error | Type error in spec file | Run `npx tsc --noEmit` and share the output |

---

## Environment Prerequisites

Tests require these env vars (loaded from `.env` via dotenv in `playwright.config.ts`):

```bash
BASE_URL=http://localhost:8000          # InvenTree instance URL
API_TOKEN=<your-token>                  # Option 1: direct token
# --- OR ---
API_USERNAME=<username>                 # Option 2: username + password
API_PASSWORD=<password>                 #   (token fetched automatically)
```

If the user asks how to set these up, show them the above.
