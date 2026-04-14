---
name: sync-tests-from-spec
description: This skill should be used when the user asks to "sync tests from spec", "update tests from spec changes", "check spec for changes and generate tests", "add tests for spec diff", "regenerate tests from updated spec", "update test cases for changed endpoints", "spec changed, update tests", or wants to detect changes in an OAS/Swagger spec file since the last git revision and generate new manual test cases and Playwright automation only for the changed endpoints.
argument-hint: "Provide the path to the OAS spec file (e.g. ./data-source/oas-spec.yaml). If omitted, defaults to ./data-source/oas-spec.yaml."
version: 0.1.0
allowed-tools: Bash(git:*) Bash(npx:*)
---

# Sync Tests from Spec Changes

Compare the current OAS spec file against the last committed version, identify which API paths and methods changed, and generate new manual test cases and Playwright automation **only for the changed endpoints** — appending to existing files without duplicating coverage.

---

## Workflow

### Step 1: Resolve the Spec File Path

Accept the spec path from the argument. Default to `./data-source/oas-spec.yaml` if not provided.

Confirm the file exists by reading it. If it does not exist, stop and tell the user.

---

### Step 2: Check Git History for Changes

Run:

```bash
git log --oneline -5 -- <spec-file-path>
```

This shows the last 5 commits that touched the spec file. Record the most recent commit hash.

Then get the diff between the last commit and the current working tree:

```bash
git diff HEAD -- <spec-file-path>
```

If the file has staged changes only (not yet committed), use:

```bash
git diff --cached -- <spec-file-path>
```

If both are empty, try the diff between the two most recent commits:

```bash
git diff HEAD~1 HEAD -- <spec-file-path>
```

If **no diff is found at all** (file is unchanged, no history), stop and report:

> No changes detected in `<spec-file-path>` since the last revision. Tests are already up to date.

---

### Step 3: Parse the Diff — Identify Changed Endpoints

Read the full diff output. Focus on lines starting with `+` (additions) and `-` (deletions) inside the `paths:` section of the YAML.

For each changed path+method combination, classify it:

| Classification | Indicators |
|---------------|-----------|
| **Added** | New path key appears under `+` lines; the method block is entirely new |
| **Modified** | Both `+` and `-` lines exist for the same path+method — parameters, schema, or responses changed |
| **Deleted** | Path+method block appears only under `-` lines |

**Also note schema-level changes** even if the path itself wasn't added:
- New required field added to a request body schema → new negative test (missing field → 400)
- New response field → new assertion in existing positive tests
- Changed `maxLength`, `minimum`, `maximum` → new boundary tests
- New query parameter → new filter/pagination tests
- Removed field → existing tests that reference it may now be stale

Build a change summary:
```
Added paths:
  POST /api/part/attachment/
  GET  /api/part/attachment/{id}/

Modified paths:
  GET  /api/part/ — new filter param: has_pricing (boolean)
  POST /api/part/ — request body: new required field: responsible (integer)

Deleted paths:
  DELETE /api/part/attachment/bulk/

Schema changes only (no path change):
  Part schema: description maxLength changed 250 → 500
```

Present this summary to the user before proceeding.

---

### Step 4: Read Existing Test Files

Read the existing files to avoid duplicating test IDs and coverage:

1. `test-cases/api-*-test-cases.md` — find the highest existing TC ID per prefix (e.g. TC-PART-037 → next is TC-PART-038)
2. `automation/api/*.spec.ts` — find existing `test.describe` block names to know what already exists

Also re-read the full current spec (not just the diff) to get complete schema context for the changed paths.

---

### Step 5: Derive New Test Scenarios

For each **added** path+method, apply the full scenario derivation from the `generate-api-tests` skill (CRUD, auth, validation, pagination, relational integrity).

For each **modified** path, derive **only the incremental scenarios** that cover the change:

| Change type | New scenarios to derive |
|-------------|------------------------|
| New query parameter | Happy path with param, empty-result filter, invalid type for param |
| New required field in body | Missing field → 400 with field error; valid value → 201/200 |
| Changed maxLength | New boundary: at new limit → accepted; at new limit+1 → 400 |
| New response field | Assert new field present in GET response |
| New enum value | Each new enum value → 200/201 |
| Changed status code | Update existing test expectation — flag as a **fix needed** not a new test |

For **deleted** paths: do not generate new tests. Instead, list the test IDs that are now stale and should be removed.

Assign new TC IDs continuing from the highest existing ID per prefix.

---

### Step 6: Write Manual Test Cases

Append new test cases to the existing markdown file in `test-cases/`. Do **not** overwrite existing content.

**Append format:**

Add new rows to the summary table, then new sections at the bottom of the file. Update the `**Total cases**` count at the top.

```markdown
<!-- appended by sync-tests-from-spec on <date> — spec version <X> → <Y> -->

## <New Area Name>

### TC-PART-038 — <Short imperative title>

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `POST /api/part/attachment/` |
| Test Type | Positive |

**Preconditions**
...

**Steps**
1. ...

**Expected Result**
HTTP `201`. ...
```

If a new path belongs to a new resource (different prefix), create a new file `test-cases/api-<resource>-test-cases.md`.

---

### Step 7: Write Playwright Automation

Append new `test.describe` blocks to the appropriate spec file in `automation/api/`. Do **not** overwrite or modify existing tests.

Rules:
- If the changed endpoint belongs to an existing spec file topic (e.g. `/api/part/` → `parts.spec.ts`), append to that file.
- If it is a new resource with no existing spec file, create a new `automation/api/<resource>.spec.ts`.
- Use unique random name suffixes in any helper that creates resources.
- Use `try/finally` or deactivate-then-delete for parts cleanup (InvenTree requires `active: false` before DELETE).

New describe block template:

```typescript
// ---------------------------------------------------------------------------
// <Area> — <Change description> (synced from spec v<X> on <date>)
// ---------------------------------------------------------------------------

test.describe("<Resource> — <New Area>", () => {
  test("TC-PART-038 <title>", async ({ apiRequest }) => {
    // ...
    expect(resp.status()).toBe(<code>);
  });
});
```

---

### Step 8: Handle Deleted Paths

For any deleted path+method, do **not** modify existing tests automatically. Instead, report:

```
⚠ Stale tests detected — the following endpoints were removed from the spec:

  DELETE /api/part/attachment/bulk/
    → Possibly stale: TC-PART-045, TC-PART-046
    → Automation: automation/api/parts.spec.ts — "TC-PART-045 ..." (line ~180)

  Review and remove these tests manually to avoid false positives.
```

---

### Step 9: Report

After writing, report:

```
Spec diff summary:
  Added:    <N> paths
  Modified: <N> paths
  Deleted:  <N> paths (stale tests listed — manual cleanup required)

Generated:
  Manual test cases → test-cases/api-parts-test-cases.md   (+<N> cases, total <T>)
  Automation        → automation/api/parts.spec.ts          (+<N> tests)

New TC IDs: TC-PART-038 → TC-PART-<last>

To run new tests only:
  npx playwright test automation/api/ --grep "TC-PART-03[89]|TC-PART-04" --reporter=line
```

---

## Edge Cases

| Situation | Behaviour |
|-----------|-----------|
| Spec file not tracked by git yet | Report: "File has no git history. Run `/generate-api-tests` for initial generation." |
| Spec file is identical to last commit but has uncommitted edits | Use `git diff HEAD` to catch working-tree changes |
| Multiple spec files changed | Process each file separately |
| New path is for an entirely new resource | Create new test-cases file and new spec file |
| Deleted path's tests cannot be identified | List the path and ask the user to audit manually |
| Diff is very large (>50 changed paths) | Ask the user to confirm scope before generating |
