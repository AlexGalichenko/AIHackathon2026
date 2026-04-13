---
name: create-test-cases-from-docs
description: This skill should be used when the user asks to "create test cases from docs", "generate manual test cases", "parse markdown and create tests", "convert documentation to test cases", "write test cases from markdown", "create QA test cases", "generate test plan from docs", "analyze docs and create tests", "create test cases from this GitHub link", "generate tests from GitHub wiki", or wants to derive manual test cases from markdown documentation files or a GitHub URL.
argument-hint: "Provide a GitHub URL, file path, or paste markdown content to analyze for test case generation."
version: 0.1.0
---

# Markdown to Manual Test Cases

Parse markdown documentation files, analyze their content for testable behaviors, and produce structured manual test cases in markdown format.

## Overview

This skill extracts testable requirements, features, and behaviors from markdown docs and transforms them into actionable manual test cases. Each test case is self-contained with clear steps and expected results.

## Workflow

### Step 1: Gather Input

Accept input in one of these forms:
- A **GitHub URL** (see "GitHub URL Traversal" below)
- A file path or glob pattern: read each file with the Read tool
- Pasted markdown content provided inline by the user
- A directory: use Glob to find all `*.md` files recursively

If no input is specified, ask the user which docs to analyze.

#### GitHub URL Traversal

When the input is a GitHub URL, convert it to a raw content URL and recursively discover all linked markdown pages before fetching content.

**Supported URL patterns:**

| Input URL form | What to do |
|----------------|------------|
| `https://github.com/<owner>/<repo>/blob/<branch>/<path>.md` | Single file — fetch raw content directly |
| `https://github.com/<owner>/<repo>/tree/<branch>/<dir>` | Directory — list contents via GitHub API, collect all `.md` files |
| `https://github.com/<owner>/<repo>/wiki` | Wiki root — fetch sidebar/index to discover all wiki pages |
| `https://github.com/<owner>/<repo>/wiki/<Page-Name>` | Single wiki page — fetch it, then discover linked pages |
| `https://github.com/<owner>/<repo>` | Repo root — look for `README.md` and a `docs/` directory |

**Converting to raw URLs:**

- `github.com/<owner>/<repo>/blob/<branch>/<path>` → `raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`
- GitHub Wiki pages: `github.com/<owner>/<repo>/wiki/<Page>` → fetch via `WebFetch` (renders markdown from the wiki)

**Traversal algorithm:**

1. Fetch the starting URL with `WebFetch`
2. Extract all internal markdown links from the page:
   - Relative links: `[text](./other-page.md)`, `[text](../section/page.md)`
   - Absolute links pointing to the same repo/wiki
   - Wiki sidebar links (`_Sidebar.md`)
3. Resolve each link relative to the current page's base URL
4. Deduplicate URLs (track visited set to avoid cycles)
5. Fetch each discovered page recursively
6. Stop traversal at external links (different domain or repo) and non-markdown files

**Depth limit:** Traverse up to **3 levels deep** by default. If the user specifies a depth (e.g., "only top-level pages"), honor that.

**Rate limiting:** Fetch pages sequentially, not in parallel bursts, to avoid hitting GitHub's rate limits.

**Error handling:** If a page returns 404 or fails to fetch, log a warning ("Could not fetch `<url>` — skipping") and continue with the remaining pages.

After traversal, report to the user: "Found N markdown pages. Analyzing…" before proceeding to Step 2.

### Step 2: Parse and Analyze the Docs

For each document, extract:

**Features and behaviors** — anything described as what the system does, supports, or allows.

**Requirements and constraints** — rules, limits, validations, permissions ("must", "should", "only", "cannot", "requires").

**User flows** — step-by-step processes described in the doc.

**Edge cases and error conditions** — what happens on invalid input, missing data, boundary values, or failure states.

**Configuration and states** — different modes, settings, or states the system can be in.

Build a mental map: group findings by feature area before writing tests.

### Step 3: Derive Test Cases

For each testable item identified:

1. Assign a **Test ID** using the pattern `TC-<AREA>-<NNN>` (e.g., `TC-AUTH-001`)
2. Assign **Priority**: `Critical`, `High`, `Medium`, or `Low`
   - Critical: core happy paths and security/data-integrity scenarios
   - High: important features and common error handling
   - Medium: secondary flows and edge cases
   - Low: cosmetic behavior, rarely-used options
3. Write **Preconditions** — what must be true before the test starts
4. Write **Steps** — numbered, imperative, one action per step
5. Write **Expected Result** — observable, verifiable outcome (not internal state)

See `references/test-case-format.md` for format details and worked examples.

### Step 4: Produce Output

Output the test cases as a markdown document:

```markdown
# Manual Test Cases — <Document or Feature Name>

**Source**: `<file path, GitHub URL, or "inline content">`
**Generated**: <today's date>
**Total cases**: <N>

---

## <Feature Area>

### TC-<AREA>-001 — <Short Test Title>

| Field | Value |
|-------|-------|
| Priority | Critical / High / Medium / Low |
| Component | <Component or module name> |

**Preconditions**
- <Precondition 1>
- <Precondition 2>

**Steps**
1. <Action>
2. <Action>
3. <Action>

**Expected Result**
<Clear, observable outcome>

---
```

Group test cases by feature area with `##` headings. Include a summary table at the top listing all test IDs, titles, and priorities.

### Step 5: Ask to Save

After generating the test cases, ask the user whether to save the output to a file. If yes, default to `test-cases/<source-filename>-test-cases.md` (create the `test-cases/` directory if needed).

## Coverage Heuristics

When analyzing a doc, ensure coverage of:

| Doc Content | Test Types to Generate |
|-------------|----------------------|
| Feature description | Happy path, basic negative |
| Validation rules | Boundary values, invalid input, missing required fields |
| Permission/role rules | Authorized access, unauthorized access |
| Multi-step user flows | Full flow, flow interrupted at each step |
| Configuration options | Each option exercised, invalid value |
| Error messages described | Condition that triggers each error |
| API / data contract | Valid request, malformed request, missing fields |
| State transitions | Each valid transition, invalid transition attempt |

## Completeness Check

Before outputting, verify:
- [ ] Every major feature in the doc has at least one test case
- [ ] Every validation rule has at least one negative test
- [ ] Every error condition mentioned has a test that triggers it
- [ ] No test step says "verify the system works" — steps are specific and observable
- [ ] Expected results describe user-visible output, not internal behavior

## Additional Resources

- **`references/test-case-format.md`** — Full format spec, priority guidance, worked examples, and anti-patterns to avoid
