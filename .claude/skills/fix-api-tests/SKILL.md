---
name: fix-api-tests
description: This skill should be used when the user asks to "fix api tests", "repair failing api tests", "debug api test failures", "my api tests are broken", "api tests are failing", "fix automation issues in api tests", "why are my api tests failing", or wants to diagnose and repair broken Playwright API test files in `automation/api/`.
argument-hint: "Optionally specify a test file (e.g. parts.spec.ts) or a test ID (e.g. TC-PART-003) to focus on. If omitted, all api tests are analysed."
version: 0.1.0
allowed-tools: Bash(npx:*) Bash(grep:*) Bash(cat:*)
---

# Fix API Tests

Diagnose and repair failing or broken Playwright TypeScript API tests in `automation/api/`. Work from evidence — run the tests, read the output, understand the cause, then fix it with a minimal targeted change.

---

## Workflow

### Step 1: Understand the Scope

Read the user's request to determine scope:
- **Specific test file** (e.g. `parts.spec.ts`) → focus only on that file
- **Specific test ID** (e.g. `TC-PART-003`) → locate and fix only that case
- **No scope given** → analyse all files under `automation/api/`

---

### Step 2: Read Key Project Files

Before running anything, read these files to understand current conventions:

1. `playwright.config.ts` — base URL config, reporters, retries, projects
2. `automation/commons/fixtures/core.ts` — `apiRequest` fixture, token resolution, `BASE_URL` env var name
3. Every target `automation/api/*.spec.ts` file — imports, fixture usage, helper functions

Record:
- The env var name used for the base URL (e.g. `BASE_URL`, `INVENTREE_BASE_URL`)
- The env var name(s) used for auth (`API_TOKEN`, `API_USERNAME`/`API_PASSWORD`)
- Whether tests use `apiRequest` (from `@core`) or `request` (raw Playwright)
- Whether `baseURL` is set in `playwright.config.ts` or constructed per-test

---

### Step 3: Run the Tests and Capture Output

Run the target tests and capture all output:

```bash
npx playwright test automation/api/ --reporter=line 2>&1
```

If focusing on a single file:
```bash
npx playwright test automation/api/parts.spec.ts --reporter=line 2>&1
```

If the tests cannot even start (e.g. TypeScript compile error), run:
```bash
npx tsc --noEmit 2>&1
```

Save the full output — you will need error messages, status codes, and stack traces.

---

### Step 4: Triage Failures

Categorise each failure into one of these buckets before deciding on a fix:

#### A — Environment / Configuration
Symptoms:
- `Error: No API credentials found` — missing env vars
- `connect ECONNREFUSED` — server not running or wrong base URL
- `401 Unauthorized` on ALL tests — token not set or expired
- TypeScript errors mentioning unknown fixture or import

Checks:
- Does `.env` exist? Does it contain `BASE_URL`, `API_TOKEN` (or `API_USERNAME`/`API_PASSWORD`)?
- Is `playwright.config.ts` loading `.env` via `dotenv`?
- Does the import in the spec file match the actual export in `@core`?

#### B — Assertion Mismatch
Symptoms:
- `expect(received).toBe(expected)` — wrong status code
- `expect(received).toHaveProperty(...)` — field missing in response
- `expect(received).toHaveLength(0)` — got non-empty results

Common causes:
- API behaviour changed (different status code, renamed field, different pagination shape)
- Test assumed data exists but the database is empty
- Test assumed data does NOT exist but orphaned data from a prior run is present

#### C — Test Data / State Pollution
Symptoms:
- A test that creates data passes in isolation but fails in a full suite run
- A `createPart` helper returns 400 because a duplicate name already exists
- A 404 test returns 200 because the test created the resource but cleanup failed

Common causes:
- A previous test that creates a resource crashed before its cleanup ran
- Cleanup (`deletePart`) is at the end of the test body — if an assertion fails mid-test, cleanup is skipped

Fix pattern: move cleanup to `test.afterEach` using a shared `pkToCleanup` variable, or wrap cleanup in a try/finally.

#### D — Fixture / Import Error
Symptoms:
- `apiRequest` is undefined or not a function
- `request` fixture does not have `baseURL` set
- Import path `@core` cannot be resolved

Checks:
- Does `tsconfig.json` map `@core` → `./automation/commons/fixtures/core`?
- Does the spec file import `{ test, expect }` from `"@core"` (not `"@playwright/test"`)?
- Is `apiRequest` defined in the `Fixtures` interface in `core.ts`?

#### E — URL / Path Error
Symptoms:
- `404` where the test expects `200`/`201` (not a data issue — all runs fail)
- Response is HTML (nginx 404 page) instead of JSON

Common causes:
- Missing trailing slash on API path (InvenTree requires trailing slash)
- Wrong base URL — constructed from wrong env var
- `baseURL` not set in config so relative paths don't resolve

---

### Step 5: Fix

Apply fixes using the **minimum change** needed to make the test correct. Do not refactor unrelated code.

#### Fix A — Environment issues

If `.env` is missing required vars, note which vars are needed and inform the user. Do not hardcode credentials.

If `playwright.config.ts` is not calling `config()` from `dotenv`:
```typescript
import { config } from "dotenv";
config();
```

If an import is wrong, correct it:
```typescript
// wrong
import { test, expect } from "@playwright/test";
// correct — use the fixture that sets up apiRequest
import { test, expect } from "@core";
```

#### Fix B — Assertion mismatch

Read the actual response body from the test output, then update the assertion to match real API behaviour. Examples:

- If the API returns `200` instead of `204` on DELETE, update `toBe(204)` → `toBe(200)`.
- If a field is named `id` not `pk`, update `toHaveProperty("pk")` → `toHaveProperty("id")`.
- If `count` field is absent from the list response, remove that assertion or check the correct field.

Always verify the fix is correct against the spec or by reading the response carefully — don't just change the expected value to match whatever the server returned without understanding why.

#### Fix C — Test data / cleanup

Replace end-of-test cleanup with a `try/finally` block:

```typescript
test("TC-PART-002 create part with required fields returns 201", async ({ apiRequest }) => {
  const resp = await apiRequest.post("/api/part/", {
    data: { name: "Test Resistor", description: "10k ohm resistor" },
  });
  expect(resp.status()).toBe(201);
  const body = await resp.json();
  try {
    expect(body.name).toBe("Test Resistor");
    expect(body).toHaveProperty("pk");
  } finally {
    await apiRequest.delete(`/api/part/${body.pk}/`);
  }
});
```

Or extract cleanup into `test.afterEach` with a shared variable at the `describe` scope:

```typescript
test.describe("Parts — CRUD", () => {
  let createdPk: number | null = null;

  test.afterEach(async ({ apiRequest }) => {
    if (createdPk !== null) {
      await apiRequest.delete(`/api/part/${createdPk}/`);
      createdPk = null;
    }
  });

  test("create part", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: "Temp" } });
    const body = await resp.json();
    createdPk = body.pk;
    expect(resp.status()).toBe(201);
  });
});
```

#### Fix D — Fixture / import

If `apiRequest` is being used but the file imports from `@playwright/test` instead of `@core`, update the import.

If `@core` path alias is missing from `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@core": ["./automation/commons/fixtures/core"]
    }
  }
}
```

#### Fix E — URL / path

Ensure trailing slash on all InvenTree API paths:
```typescript
// wrong
await apiRequest.get("/api/part")
// correct
await apiRequest.get("/api/part/")
```

Ensure `baseURL` is set. Either in `playwright.config.ts`:
```typescript
use: {
  baseURL: process.env.BASE_URL ?? "http://localhost:8000",
}
```

Or in the `apiRequest` fixture in `core.ts` (already done — do not duplicate).

---

### Step 6: Verify

After applying fixes, re-run the tests:

```bash
npx playwright test automation/api/ --reporter=line 2>&1
```

- If all tests pass → done.
- If failures remain → return to Step 4 for each remaining failure.
- If new failures appeared → investigate whether your fix introduced a regression.

---

### Step 7: Report

After the fix run, report:

```
Fixed:
  <N> test(s) repaired

Root causes:
  - <Category A/B/C/D/E>: <brief description of what was wrong and what was changed>

Files modified:
  - automation/api/parts.spec.ts        (<N> changes)
  - automation/api/part-categories.spec.ts (<N> changes)

Still failing (requires manual action):
  - <test ID>: <reason — e.g. "server not running", "missing test data", "API changed contract">
```

If a test cannot be fixed automatically (e.g. the server is not running, or credentials are missing), clearly explain what the user needs to do.

---

## Rules

- **Never hardcode credentials or tokens** in test files.
- **Never change an expected status code just to make a test green** without understanding why the API returns a different code.
- **Never delete tests** to fix failures — fix the test or skip it with a `test.skip('reason')`.
- **Always re-run after fixing** to confirm the fix works before reporting success.
- **Keep diffs minimal** — fix the broken line(s), don't refactor the whole file.
