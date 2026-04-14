---
name: review
description: This skill should be used when the user invokes "/review", asks to "review changes", "review current diff", "analyze my changes", "review the code", "check my changes", "review before commit", "what's wrong with my changes", or wants a structured code review of all uncommitted changes in the working tree.
argument-hint: "Optionally specify a path or file to restrict the review scope (e.g. automation/api/parts.spec.ts). If omitted, all changed files are reviewed."
version: 0.1.0
allowed-tools: Bash(git:*) Bash(npx:*)
---

# Review Current Changes

Perform a structured review of all uncommitted changes (staged + unstaged) in the working tree. Analyze each changed file for correctness, quality, consistency, and project-specific conventions. Produce a prioritized findings report.

---

## Workflow

### Step 1: Gather the Diff

Run both to capture all changes:

```bash
git diff HEAD          # unstaged changes against last commit
git diff --cached      # staged changes
git diff HEAD --stat   # summary of changed files
```

If a path argument was given, append `-- <path>` to each command to restrict scope.

If there are no changes at all, report:

> No uncommitted changes found. Working tree is clean.

Also collect context:

```bash
git log --oneline -3   # recent commit history for context
git status --short     # full status overview
```

---

### Step 2: Read Changed Files

For each file in the diff, read its **full current content** (not just the diff lines). Understanding the surrounding code is necessary to catch issues the diff alone would miss.

Also read any files that are **directly related** to the changed files:
- Changed `automation/api/*.spec.ts` → also read `automation/commons/fixtures/core.ts` and `playwright.config.ts`
- Changed `test-cases/*.md` → also read the corresponding `automation/api/*.spec.ts` to check alignment
- Changed `data-source/oas-spec.yaml` → also read both spec files and both test case files

---

### Step 3: Review Each Changed File

Apply the checks below. Flag each finding with a severity:

- 🔴 **Critical** — will cause test failures or data loss; must fix before commit
- 🟠 **High** — likely to cause intermittent failures or incorrect coverage
- 🟡 **Medium** — code smell, minor correctness issue, or missing best practice
- 🔵 **Info** — observation, suggestion, or spec/implementation divergence to be aware of

---

#### Checks for `automation/api/*.spec.ts`

**Imports**
- [ ] Imports `{ test, expect }` from `"@core"`, not from `"@playwright/test"` — the `apiRequest` fixture only exists in `@core`
- [ ] No browser-specific fixtures (`page`, `context`) used in API-only tests

**Test naming**
- [ ] Every test title includes its TC ID (e.g. `TC-PART-038 ...`)
- [ ] TC IDs are unique — no duplicates across the file
- [ ] TC IDs continue sequentially from the highest existing ID without gaps

**Test isolation — hardcoded names**
- [ ] `createPart` / `createCategory` helper calls with a fixed string name (e.g. `"Fixture Part"`, `"Test Resistor"`) — these cause duplicate-name 400s when tests run in parallel or after a failed cleanup. All created resource names must include a random suffix: `Math.random().toString(36).slice(2, 9)`
- [ ] PUT/PATCH tests that rename a resource must also use a unique target name

**Cleanup correctness (InvenTree rules)**
- [ ] Tests that create a Part must deactivate it (`PATCH active: false`) before deleting — direct DELETE on an active part returns 400
- [ ] Cleanup at end of test body (not in `afterEach`) must be wrapped in `try/finally` so it runs even when an earlier assertion fails
- [ ] `deleteCategory` does not need deactivation — categories can be deleted directly

**Assertions**
- [ ] Status code assertions match known InvenTree behavior:
  - Active Part DELETE → must deactivate first; direct DELETE → 400
  - Invalid ordering param → 200 (API ignores it, does not return 400)
  - Unknown category ID filter → 200 (API ignores it, does not return 400)
  - Invalid IPN string value → 200 (API ignores it, does not return 400)
- [ ] Response body assertions reference correct field names (`pk`, not `id`)
- [ ] Tests for 401 use the raw `request` fixture (no auth headers), not `apiRequest`
- [ ] Tests for 401 construct the full URL manually (`${process.env.BASE_URL}/api/...`) since `request` does not inherit `baseURL`

**Data-driven tests**
- [ ] `for` loops over test arrays are used for boundary values and enum/ordering fields
- [ ] Each parameterised case has a meaningful label in its test title

**New describe blocks**
- [ ] New describe block names do not duplicate existing ones in the same file

---

#### Checks for `test-cases/*.md`

**Sync with automation**
- [ ] Every TC ID in the summary table has a corresponding test in `automation/api/*.spec.ts`
- [ ] Every test in `automation/api/*.spec.ts` with a TC ID has a corresponding row in the summary table
- [ ] `**Total cases**` count matches the actual number of TC IDs in the summary table

**Test case quality**
- [ ] Each test case has: Priority, Component, Test Type, Preconditions, Steps, Expected Result
- [ ] Expected result specifies the exact HTTP status code and key response field(s)
- [ ] Preconditions mention auth requirements

**Spec divergences**
- [ ] Any test case that documents behavior differing from the OAS spec includes a `**Notes**` section with a ⚠ warning

---

#### Checks for `data-source/oas-spec.yaml`

**Breaking changes**
- [ ] Parameter type changes (e.g. `string` → `number`) — flag as potentially breaking for existing clients
- [ ] Required field additions — flag as breaking for existing POST/PUT clients
- [ ] Removed fields or paths — flag stale tests that may need removal

**Consistency**
- [ ] New parameters have `description` fields
- [ ] New schemas define `required` arrays where appropriate

---

#### Checks for `automation/commons/fixtures/core.ts`

- [ ] `resp.json()` is called **before** `ctx.dispose()` — calling it after disposes the response and throws
- [ ] Token caching (`cachedToken`) is still in place — prevents redundant auth requests per worker
- [ ] `resolveToken` supports both `API_TOKEN` direct and `API_USERNAME`/`API_PASSWORD` flows
- [ ] `apiRequest` fixture sets `baseURL` so tests can use relative paths

---

### Step 4: Produce the Report

Structure the output as follows:

```
## Review Summary

Changed files: <N>
Findings: <X> critical, <Y> high, <Z> medium, <W> info

---

## <filename>

### 🔴 Critical

- <finding>: <explanation and location e.g. line 42>
  Fix: <what to do>

### 🟠 High

- <finding>: ...

### 🟡 Medium

- <finding>: ...

### 🔵 Info

- <finding>: ...

### ✅ Looks good

- <list of checks that passed>

---

## Overall verdict

READY TO COMMIT / NEEDS FIXES

<1–2 sentence summary>
```

If a file has **no findings**, write `✅ No issues found` under its heading.

---

### Step 5: Offer Next Steps

Based on findings, suggest the appropriate next action:

| Verdict | Suggestion |
|---------|-----------|
| No critical/high findings | "Changes look good. Run `/run-api-tests` to verify, then `/commit`." |
| Critical or high findings | "Fix the issues above before committing. Run `/fix-api-tests` if test failures are involved." |
| Spec divergences only | "Consider raising the spec/implementation gaps with the API team. Safe to commit as-is." |
| New tests added | "Run the new tests with: `npx playwright test --grep \"TC-PART-03[89]\" --reporter=line`" |

---

## Rules

- **Never modify files** during a review — only read and report.
- **Cite line numbers** when calling out a specific issue.
- **Be concise** — one bullet per finding, actionable fix included.
- **Do not report style preferences** (formatting, naming style) as high/critical — reserve those severities for correctness issues.
