---
name: create-playwright-ui-test
description: This skill should be used when the user asks to "create a playwright test from a test case", "automate this test case", "convert manual test to playwright", "implement this test case in playwright", "generate playwright test from markdown", "write a test for this", "turn this test case into code", "implement this manual test", or wants to translate a human-readable markdown test case into a Playwright TypeScript test by exploring the live application.
argument-hint: "Provide the markdown test case content, a file path to the test case, or a test case ID. Optionally include the app URL if not in the test case."
version: 0.1.0
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(find:*) Bash(ls:*)
---

# Create Playwright Test from Manual Test Case

Parse a human-readable markdown test case, explore the live application with playwright-cli to collect real locators, study existing tests for project conventions, and produce a ready-to-run Playwright TypeScript test file.

## Overview

This skill bridges manual QA test cases and automated Playwright tests. It uses live browser exploration to find accurate, semantic locators rather than guessing, and mirrors existing test patterns so the generated code fits seamlessly into the project.

## Workflow

### Step 1: Gather Input

Accept the test case in one of these forms:
- **Inline markdown** — test case content pasted directly into the prompt
- **File path** — read the `.md` file with the Read tool
- **Test case ID** — search `test-cases/` directory for a matching file

Extract from the test case:
- **Title** — becomes the `test('...')` description
- **Preconditions** — determine setup steps and the starting URL
- **Steps** — each numbered action to automate
- **Expected Result** — what to assert at the end (and optionally after key steps)

If the starting URL cannot be determined from the test case, ask the user.

### Step 2: Study Existing Tests

Search the project for existing Playwright test files to learn conventions:

```bash
find . -name "*.spec.ts" -o -name "*.spec.js" -o -name "*.test.ts" -o -name "*.test.js" | head -20
```

Read up to 3 representative existing test files. Extract and follow:
- Import style (`import { test, expect } from '@playwright/test'` vs path aliases)
- File naming convention (`feature-name.spec.ts`, `FeatureName.spec.ts`, etc.)
- Directory structure (e.g., `tests/`, `e2e/`, `src/__tests__/`)
- Use of `test.describe` blocks, `test.beforeEach`, fixtures, or page objects
- Assertion patterns (`toBeVisible`, `toHaveText`, `toHaveURL`, etc.)
- Any shared helpers or utilities imported from `test-utils`, `fixtures`, etc.

If no existing tests exist, use standard Playwright conventions (see `references/conventions.md`).

### Step 3: Explore the Application

Open a playwright-cli session and navigate through each step of the test case to collect real locators.

#### 3a. Start session and navigate to the starting URL

```bash
playwright-cli open <url-from-preconditions>
playwright-cli snapshot
```

#### 3b. Walk through each test step

For each step in the test case:

1. **Take a snapshot** to see the current state and available element refs
2. **Identify the target element** — find it by its visible label, role, or description in the snapshot
3. **Collect the best locator** using this priority order:
   - `getByRole` (preferred — most resilient)
   - `getByLabel` / `getByPlaceholder` / `getByText`
   - `getByTestId` (if `data-testid` attributes are present)
   - CSS selector as last resort
4. **Execute the action** using the ref from the snapshot (`playwright-cli click e7`, etc.)
5. **Note the generated code** output by playwright-cli — it contains the exact Playwright API call
6. **After state-changing actions** (click, fill+submit, navigation), take another snapshot to confirm the transition

For locators not visible in the snapshot, use eval to inspect attributes:

```bash
playwright-cli eval "el => el.getAttribute('data-testid')" e7
playwright-cli eval "el => el.id" e7
playwright-cli eval "el => el.getAttribute('aria-label')" e7
```

#### 3c. Verify expected results

Navigate to or interact with the UI to confirm what the expected result looks like in the DOM — specifically, what element or text is present/absent/changed so you can write a precise assertion.

```bash
# After the final action, check what's visible to assert
playwright-cli snapshot
```

#### 3d. Close the session

```bash
playwright-cli close
```

### Step 4: Build the Locator Map

Before writing the test, compile a map of every action and its locator:

| Step | Action | Locator | playwright-cli generated code |
|------|--------|---------|-------------------------------|
| 1    | Navigate | — | `await page.goto('...')` |
| 2    | Fill email | `page.getByRole('textbox', { name: 'Email' })` | `await page.getByRole(...).fill(...)` |
| 3    | Click submit | `page.getByRole('button', { name: 'Submit' })` | `await page.getByRole(...).click()` |

Use the playwright-cli generated code as the canonical source — it reflects what the browser actually saw.

### Step 5: Generate the Test File

Compose the Playwright test using the collected locators and existing project conventions.

**Structure:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('<Feature or Component Name>', () => {
  test('<test title from test case>', async ({ page }) => {
    // --- Preconditions / Setup ---
    await page.goto('<starting url>');

    // --- Steps ---
    await test.step('Step 1: <description from test case step>', async () => {
      await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
    });

    await test.step('Step 2: <description from test case step>', async () => {
      await page.getByRole('button', { name: 'Submit' }).click();
    });

    // --- Assertions ---
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Welcome')).toBeVisible();
  });
});
```

**Rules:**
- Wrap every test case step in `test.step('<Step N: description>', async () => { ... })` — use the exact step description from the test case as the label
- `test.step` blocks improve traceability in reports and allow steps to be reused or nested in higher-level helpers
- One comment per logical group (setup, each major step, assertions) — not one per line
- Use the exact locator code generated by playwright-cli, not refs (`e7`)
- Match the assertion to the **Expected Result** from the test case — make it observable and specific
- If preconditions require auth, add `test.beforeEach` or reference `storageState` per existing conventions
- If the test case has multiple expected results at intermediate steps, add inline assertions after those steps inside the relevant `test.step`
- Keep the test self-contained — no shared mutable state unless the project uses fixtures

See `references/conventions.md` for assertion patterns and common test structures.

### Step 6: Determine Output Location

Based on existing test file locations and naming:
- Mirror the directory structure (`tests/auth/login.spec.ts`, `e2e/checkout.spec.ts`, etc.)
- Derive filename from the test area/component name in the test case ID (e.g., `TC-AUTH-001` → `auth.spec.ts` or `login.spec.ts`)
- If no pattern exists, default to `tests/<feature-name>.spec.ts`

Ask the user to confirm the output path before writing, unless it is unambiguous.

### Step 7: Write the File

Write the generated test to the confirmed path. If the file already exists, append the new `test()` block inside the appropriate `test.describe` block rather than overwriting.

After writing, report:
- File path written
- Test name
- Number of steps automated
- Any manual steps or assertions that could not be automated (e.g., visual checks, email verification) — list these as `// TODO:` comments in the file

## Locator Quality Rules

Always prefer locators in this order:

1. **`getByRole`** — ties to ARIA semantics, survives CSS refactors
2. **`getByLabel`** — for form inputs associated with a `<label>`
3. **`getByPlaceholder`** — for inputs with placeholder text when no label exists
4. **`getByText`** — for non-interactive elements (headings, paragraphs, error messages)
5. **`getByTestId`** — when `data-testid` / `data-test-id` is present
6. **CSS selector** — only when no semantic locator works; document why

Never use:
- XPath
- Auto-generated class names (`.css-1x2y3z`)
- nth-child selectors when content-based locators exist
- Hardcoded element refs from playwright-cli (`e7`) — these are session-specific

## Error Handling

| Problem | Resolution |
|---------|------------|
| Cannot find element in snapshot | Try `playwright-cli snapshot --depth=8` or `playwright-cli snapshot e<parent>` to expand |
| Step is ambiguous | Ask user to clarify before exploring |
| App requires login | Check for existing `storageState` or `auth.json`; if not found, ask user for credentials |
| Expected result is visual (screenshot diff) | Write `// TODO: add visual assertion` comment and note it in the report |
| URL not in test case | Ask user before proceeding |

## Additional Resources

- **`references/conventions.md`** — Standard Playwright test structures, assertion patterns, and file layout when no existing tests are found
