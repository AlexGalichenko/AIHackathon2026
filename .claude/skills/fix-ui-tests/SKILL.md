---
name: fix-ui-tests
description: This skill should be used when the user asks to "fix ui tests", "repair failing ui tests", "debug ui test failures", "my ui tests are broken", "ui tests are failing", "fix automation issues in ui tests", "why are my ui tests failing", "locator not found in ui test", "ui test is flaky", or wants to diagnose and repair broken Playwright browser-based test files in `automation/ui/`.
argument-hint: "Optionally specify a test file (e.g. permissions.spec.ts) or a test ID (e.g. TC-PERM-001). If omitted, all ui tests are analysed."
version: 0.1.0
allowed-tools: Bash(npx:*) Bash(playwright-cli:*)
---

# Fix UI Tests

Diagnose and repair failing or broken Playwright browser-based tests in `automation/ui/`. Work from evidence — run the tests, read the failure output and aria snapshot, understand the cause, then fix it with a minimal targeted change.

---

## Workflow

### Step 1: Understand the Scope

Parse the user's request:
- **Specific test file** (e.g. `permissions.spec.ts`) → focus only on that file
- **Specific test ID** (e.g. `TC-PERM-001`) → locate and fix only that case
- **No scope given** → analyse all files under `automation/ui/`

---

### Step 2: Read Key Project Files

Before running anything, read:

1. `playwright.config.ts` — projects config, retries, `use.trace`
2. `automation/commons/fixtures/core.ts` — the `context` fixture (prints aria snapshot on failure); note it does NOT handle browser auth/login, only API token
3. Every target `automation/ui/*.spec.ts` file — imports, login patterns, locator styles, `test.step` usage

Record:
- The base URL used (hardcoded in `page.goto(...)` or from env)
- The login credentials used per test (some tests use `reader`/`readonly`, others may use `allaccess`/`nolimits`)
- Whether tests use `waitForURL`, `waitForSelector`, or `waitForLoadState` after navigation

---

### Step 3: Run the Tests and Capture Output

Run the target tests and capture all output, including the aria snapshot the `context` fixture prints on failure:

```bash
npx playwright test automation/ui/ --reporter=line 2>&1
```

If focusing on a single file:
```bash
npx playwright test automation/ui/permissions.spec.ts --reporter=line 2>&1
```

If tests cannot start (TypeScript compile error):
```bash
npx tsc --noEmit 2>&1
```

**The aria snapshot printed by the `context` fixture on failure is the primary debugging tool.** It shows the live state of the page at the moment of failure — read it carefully to understand what was actually rendered.

---

### Step 4: Triage Failures

Categorise each failure before deciding on a fix:

#### A — Import / Fixture Error
Symptoms:
- `Cannot find module '@core'` — path alias not configured
- `apiRequest is not a function` or fixture not found
- TypeScript error at the import line

Checks:
- Does `tsconfig.json` have `paths: { "@core": ["./automation/commons/fixtures/core"] }`?
- Does the spec file import `{ test, expect }` from `"@core"` (not `"@playwright/test"`)?
- Is the `context` fixture exported from `core.ts`?

#### B — Locator Not Found
Symptoms:
- `locator.fill: Error: strict mode violation` — too many matches
- `locator.click: Timeout 30000ms exceeded` — element not found or not visible
- `expect(locator).toBeVisible` timeout — element not in DOM or hidden
- Aria snapshot shows a different UI than the locator expects

Common causes:
- The application UI changed (renamed button/link, restructured page)
- A role, name, or label used in `getByRole`/`getByLabel` no longer matches
- The page hasn't finished loading when the locator is evaluated

Fix strategy:
1. Read the **aria snapshot from the failure output** — it shows exactly what was on the page
2. If insufficient, open playwright-cli and navigate to the page to explore live state:
   ```bash
   playwright-cli open <url>
   playwright-cli snapshot
   ```
3. Find the correct semantic locator for the target element
4. Update the locator in the test using the priority order:
   - `getByRole` (preferred)
   - `getByLabel` / `getByPlaceholder` / `getByText`
   - `getByTestId` (if `data-testid` present)
   - CSS selector as last resort

#### C — Navigation / Timing Failure
Symptoms:
- `page.waitForURL: Timeout exceeded` — URL pattern did not match
- `page.goto: net::ERR_...` — URL unreachable
- Assertion fails immediately after a click before the page updates

Common causes:
- URL pattern in `waitForURL('**/web/home')` no longer matches the actual redirect URL
- The app is slow to respond and needs a longer timeout
- A `click()` triggers navigation but `waitForURL` fires before the navigation begins

Fix strategy:
- Check the actual URL the app navigates to after the action (read from aria snapshot or failure message)
- Update the glob pattern in `waitForURL` to match the actual URL
- If a race condition, add `await page.waitForLoadState('networkidle')` after the click

#### D — Assertion Mismatch
Symptoms:
- `expect(locator).toBeVisible` fails — element exists but the visibility state changed
- `expect(locator).not.toBeVisible` fails — element is now visible when test expects it hidden
- `expect(title).toBe(...)` fails — page title changed

Common causes:
- UI behaviour changed (a button that was hidden is now shown, or vice versa)
- Page title or text content changed
- Test logged in as wrong user type (insufficient or excessive permissions)

Fix strategy:
- If the app changed its behaviour, update the assertion to match the current expected state
- If the test uses the wrong user credentials, update to the correct user
- Do NOT just flip `toBeVisible` to `not.toBeVisible` without understanding why the element changed

#### E — Auth / Login Failure
Symptoms:
- `waitForURL('**/web/home')` timeout after clicking Log In
- Error message visible in aria snapshot (e.g. "Invalid credentials")
- Test lands on the login page instead of home

Common causes:
- Credentials changed on the demo server
- Login form locators changed (username/password field names changed)
- Login button locator no longer matches

Fix strategy:
1. Open playwright-cli and navigate to the login page to verify:
   ```bash
   playwright-cli open https://demo.inventree.org/web/login
   playwright-cli snapshot
   ```
2. Check the current `name` attribute of the username and password fields in the snapshot
3. Update the `getByRole('textbox', { name: '...' })` locators if they changed
4. Verify the credentials against the demo server documentation

---

### Step 5: Fix

Apply the minimum targeted change. Do not refactor unrelated code.

#### Key patterns for this project

**Login pattern** (standard for InvenTree demo):
```typescript
await page.goto('https://demo.inventree.org/web/login');
await page.getByRole('textbox', { name: 'login-username' }).fill('reader');
await page.getByRole('textbox', { name: 'login-password' }).fill('readonly');
await page.getByRole('button', { name: 'Log In' }).click();
await page.waitForURL('**/web/home');
```

**Navigation + wait pattern**:
```typescript
await page.getByRole('link', { name: 'Parts' }).click();
await page.waitForURL('**/web/part/**');
```

**Visibility assertion**:
```typescript
await expect(page.getByRole('button', { name: 'action-menu-add-parts' })).not.toBeVisible();
```

**Using `test.step` for structured steps** (follow existing pattern in the file):
```typescript
await test.step('Step 1: Log in', async () => {
  // ...
});
```

**Aria snapshot as live debug** — when a locator fails, the `context` fixture in `core.ts` automatically prints the aria snapshot of all open pages. Read it to understand:
- What elements are actually present
- What roles and names they have
- Whether the page loaded at all

---

### Step 6: Verify

After applying fixes, re-run the tests:

```bash
npx playwright test automation/ui/ --reporter=line 2>&1
```

- All target tests pass → done
- Failures remain → return to Step 4 for each remaining failure
- New failures appeared → investigate if the fix introduced a regression

---

### Step 7: Report

```
Fixed:
  <N> test(s) repaired

Root causes:
  - <Category A/B/C/D/E>: <brief description of what was wrong and what changed>

Files modified:
  - automation/ui/permissions.spec.ts  (<N> changes)

Still failing (requires manual action):
  - <test ID>: <reason — e.g. "application not reachable", "credentials changed on demo server">
```

---

## Rules

- **Never hardcode passwords** in tests — use the demo credentials already in use (`reader`/`readonly`, `allaccess`/`nolimits`), or env vars.
- **Never change an assertion just to make a test green** without understanding why the UI state changed.
- **Never delete tests** to fix failures — fix or `test.skip('reason')`.
- **Always use semantic locators** (`getByRole`, `getByLabel`, `getByText`) over CSS selectors or XPath.
- **Always re-run after fixing** before reporting success.
- **Keep diffs minimal** — fix only the broken line(s).
- **Read the aria snapshot first** before opening playwright-cli — it is often enough to identify the fix without a live browser session.
