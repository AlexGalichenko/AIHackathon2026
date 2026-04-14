---
name: run-manual-tests
description: This skill should be used when the user asks to "run test cases", "execute manual tests", "run TC-XXX-NNN", "execute this test case", "run tests by ID", "run tests by name", "execute markdown tests", "play back manual tests", "run the test suite", or wants to execute one or more markdown test cases from the test-cases/ directory against a live application using a real browser, producing a video recording and a human-readable report.
argument-hint: "One or more test case IDs (e.g. TC-PERM-001 TC-PERM-002), a name fragment (e.g. 'Add Parts'), or 'all' to run every test case found."
version: 0.1.0
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(find:*) Bash(ls:*) Bash(mkdir:*) Bash(date:*)
---

# Run Manual Tests

Execute one or more markdown test cases from the `test-cases/` directory against a live application using playwright-cli. Record a video for each test, assess pass/fail from browser state, and produce a structured human-readable report.

## Overview

This skill is a manual-test runner. It reads test cases from markdown, drives a real browser step-by-step, judges outcomes against each expected result, and emits a report with verdicts and video paths. It does NOT generate Playwright `.spec.ts` files — it executes the test interactively.

---

## Workflow

### Step 1: Resolve Test Cases to Run

Parse the arguments to determine which test cases to execute:

- **ID list** — e.g. `TC-PERM-001 TC-PERM-002` — match exactly by ID
- **Name fragment** — e.g. `"Add Parts"` — case-insensitive substring match on the title
- **`all`** — run every test case found in `test-cases/`

#### 1a. Find test case files

```bash
find test-cases/ -name "*.md" | sort
```

#### 1b. Parse each file

For each `.md` file, scan for test case blocks matching this pattern:

```
### TC-XXXX-NNN — <Title>
```

Extract for each test case:
- **ID** — e.g. `TC-PERM-001`
- **Title** — full text after the em dash
- **Priority** — from the metadata table (`| Priority | ... |`)
- **Preconditions** — bullet list under `**Preconditions**`
- **Steps** — numbered list under `**Steps**`
- **Expected Result** — paragraph under `**Expected Result**`

#### 1c. Filter by arguments

Apply the ID/name/all filter. If no matches are found, report it clearly and stop.

Print the resolved list before proceeding:

```
Found 2 test case(s) to run:
  • TC-PERM-001 — Add Parts menu hidden for user without create permission
  • TC-PERM-002 — Add Parts menu visible for user with create permission
```

---

### Step 2: Prepare Output Directory

Create a timestamped output directory to hold artifacts for this run:

```bash
mkdir -p test-results/run-<YYYYMMDD-HHMMSS>
```

All videos, screenshots, and the report for this run go into that directory.

---

### Step 3: Execute Each Test Case

Run test cases **sequentially**. For each test case:

#### 3a. Announce the test

Print to the user:

```
▶ Running TC-PERM-001 — Add Parts menu hidden for user without create permission
```

#### 3b. Open a fresh browser session and start video

Use a named session matching the test ID to avoid cross-test contamination:

```bash
npx playwright-cli -s=<TC-ID> open <starting-url>
npx playwright-cli -s=<TC-ID> video-start test-results/run-<timestamp>/<TC-ID>.webm
```

**Determining the starting URL:**
1. Check if any precondition or step mentions a URL explicitly
2. Check the existing test files (`automation/ui/*.spec.ts`) for the base URL pattern
3. If still unknown, ask the user before proceeding — never guess

#### 3c. Execute preconditions

Read the preconditions and handle setup steps:

- **Login required** — if a precondition mentions "logged in" or "user account":
  - Check for a saved auth state file matching the required role (e.g. `test-results/auth-reader.json`)
  - If found: `npx playwright-cli -s=<TC-ID> state-load test-results/auth-reader.json`
  - If not found: perform login interactively (see [Login Handling](#login-handling))
- **Application state** — if a precondition says "setting is enabled/disabled" or "form is open", navigate or configure the app to reach that state before step 1
- Take a snapshot after preconditions to confirm the starting state

#### 3d. Execute each step

For each numbered step in the test case:

1. **Take a snapshot** to see the current DOM
2. **Interpret the step** — translate the plain-English instruction into a playwright-cli action:
   - "Navigate to X view" → `npx playwright-cli -s=<TC-ID> goto <url>`
   - "Click the X button/link" → identify element by label/role in snapshot → `npx playwright-cli -s=<TC-ID> click <ref>`
   - "Fill X with Y" → `npx playwright-cli -s=<TC-ID> fill <ref> "Y"`
   - "Observe / inspect / check" → `npx playwright-cli -s=<TC-ID> snapshot` (no interaction, just observe)
   - "Check / uncheck checkbox" → `npx playwright-cli -s=<TC-ID> check/uncheck <ref>`
   - "Select option" → `npx playwright-cli -s=<TC-ID> select <ref> "value"`
3. **Execute the action** using the ref from the snapshot
4. **After state-changing actions**, take a new snapshot and record the resulting state
5. **Add a chapter marker** to the video after each step:
   ```bash
   npx playwright-cli -s=<TC-ID> video-chapter "Step N: <step description>"
   ```
6. **Capture a screenshot** at key transitions:
   ```bash
   npx playwright-cli -s=<TC-ID> screenshot --filename=test-results/run-<timestamp>/<TC-ID>-step<N>.png
   ```

If a step action **fails** (element not found, navigation error, unexpected dialog):
- Record the failure, take a screenshot, note the error
- Continue to the next step if possible, or mark the test as BLOCKED and skip remaining steps

#### 3e. Verify the Expected Result

After all steps complete, assess whether the Expected Result is satisfied:

1. Take a final snapshot
2. For each observable claim in the Expected Result, check it against the snapshot or DOM:
   - **Element visible** → look for it by role/text in snapshot
   - **Element not visible** → confirm it's absent from snapshot
   - **URL change** → check current page URL in snapshot header
   - **Text content** → `npx playwright-cli -s=<TC-ID> eval "document.body.innerText"` or snapshot
   - **Form error** → look for error/alert roles in snapshot
3. Evaluate overall verdict:
   - **PASS** — all claims in the Expected Result are confirmed
   - **FAIL** — one or more claims are not met; record which ones and why
   - **BLOCKED** — a step could not be executed (prerequisite not met, element not found)

#### 3f. Stop video and close session

```bash
npx playwright-cli -s=<TC-ID> video-stop
npx playwright-cli -s=<TC-ID> close
```

#### 3g. Record result

Store for the report:
- Test ID, title, verdict (PASS / FAIL / BLOCKED)
- Step-by-step notes (what was observed at each step)
- Failure reason (if FAIL/BLOCKED)
- Video path: `test-results/run-<timestamp>/<TC-ID>.webm`
- Screenshot paths

---

### Step 4: Generate the Report

After all test cases have run, generate a markdown report at:

```
test-results/run-<timestamp>/report.md
```

#### Report format

```markdown
# Test Execution Report

**Date**: 2026-04-14 09:30:00
**Run ID**: run-20260414-093000
**Tests run**: 2  |  ✅ Passed: 1  |  ❌ Failed: 1  |  ⚠️ Blocked: 0

---

## Summary

| ID | Title | Priority | Verdict | Video |
|----|-------|----------|---------|-------|
| TC-PERM-001 | Add Parts menu hidden for user without create permission | Critical | ✅ PASS | [video](TC-PERM-001.webm) |
| TC-PERM-002 | Add Parts menu visible for user with create permission | Critical | ❌ FAIL | [video](TC-PERM-002.webm) |

---

## TC-PERM-001 — ✅ PASS

**Title**: Add Parts menu hidden for user without create permission
**Priority**: Critical
**Video**: [TC-PERM-001.webm](TC-PERM-001.webm)

### Steps

| # | Description | Result | Notes |
|---|-------------|--------|-------|
| P | Log in as reader/readonly | ✅ | Logged in successfully as Ronald Reader |
| 1 | Navigate to the Parts view | ✅ | Navigated to /web/part/category/index/parts |
| 2 | Observe the toolbar/controls above the parts table | ✅ | Toolbar visible, no Add Parts button present |

### Expected Result

> The *Add Parts* dropdown menu is not visible anywhere above the parts table.

**Verdict**: ✅ PASS — `action-menu-add-parts` button was not found in the DOM for the reader user.

---

## TC-PERM-002 — ❌ FAIL

**Title**: Add Parts menu visible for user with create permission
**Priority**: Critical
**Video**: [TC-PERM-002.webm](TC-PERM-002.webm)

### Steps

| # | Description | Result | Notes |
|---|-------------|--------|-------|
| P | Log in as allaccess/nolimits | ✅ | Logged in successfully as Ally Access |
| 1 | Navigate to the Parts view | ✅ | Navigated to /web/part/category/index/parts |
| 2 | Observe the toolbar/controls above the parts table | ❌ | Expected Add Parts button but it was not visible within timeout |

### Expected Result

> The *Add Parts* dropdown menu is displayed above the parts table and is clickable.

**Verdict**: ❌ FAIL — `action-menu-add-parts` button was not found. Possible cause: page still loading or user session not applied correctly.

---

*Generated by run-manual-tests skill*
```

#### Printing the report to the user

After writing the file, also **print the full report inline** in the conversation so the user sees results immediately without opening a file.

---

### Login Handling

When a precondition requires a logged-in user, infer the credentials from context:

| Precondition text | User to use | Credentials |
|-------------------|-------------|-------------|
| "does NOT have create permission" / "read-only" / "reader" | `reader` | `readonly` |
| "HAS create permission" / "allaccess" / "all permissions" | `allaccess` | `nolimits` |
| "engineer" / "parts only" | `engineer` | `partsonly` |
| "admin" / "superuser" | `admin` | `inventree` |

For apps without known credentials, ask the user before proceeding.

After a successful login, save auth state for reuse within the same run:

```bash
npx playwright-cli -s=<TC-ID> state-save test-results/run-<timestamp>/auth-<role>.json
```

Subsequent tests requiring the same role can load this state instead of re-logging in.

---

## Pass/Fail Rules

| Situation | Verdict |
|-----------|---------|
| All expected result claims confirmed in final snapshot | PASS |
| Any expected result claim not confirmed | FAIL — note which claim failed and what was observed instead |
| Step action fails (element not found) and subsequent steps cannot proceed | BLOCKED |
| Expected result involves something unobservable (e.g. email sent, visual screenshot diff) | BLOCKED — add note "manual verification required" |
| Precondition cannot be satisfied (e.g. plugin not installed) | BLOCKED — skip test with explanation |

---

## Error Handling

| Problem | Resolution |
|---------|------------|
| Test case ID not found | Report which IDs were not matched and list available IDs |
| Starting URL unknown | Ask the user before opening the browser |
| Login credentials unknown | Ask the user |
| Element not found in snapshot | Try `npx playwright-cli snapshot --depth=8` or expand a parent element; if still not found, mark step as FAIL |
| App shows error page / 500 | Screenshot, mark test BLOCKED |
| Video file not created | Note in report; continue |
| Browser crash | Close session, mark remaining steps BLOCKED, continue to next test |
