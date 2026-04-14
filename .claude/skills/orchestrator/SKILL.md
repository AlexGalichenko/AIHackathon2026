---
name: orchestrator
description: Master orchestrator that runs named test pipelines end-to-end. Use when the user says "run the api pipeline", "run the ui pipeline", "run the manual pipeline", "run the sync pipeline", "run the fix pipeline", or asks to execute a full test workflow from start to finish.
argument-hint: "Name a pipeline: 'api', 'ui', 'manual', 'sync', or 'fix'. Optionally add scope (e.g. 'api parts.spec.ts', 'manual TC-PERM-001', 'sync ./data-source/oas-spec.yaml')."
version: 0.1.0
allowed-tools: Bash(npx:*) Bash(git:*) Bash(playwright-cli:*) Bash(find:*) Bash(ls:*) Bash(mkdir:*) Bash(date:*)
---

# Orchestrator — Test Pipelines

Run named end-to-end test pipelines by chaining skills in a fixed order. Each pipeline has defined stages; conditional stages only execute when their trigger condition is met.

---

## Pipelines

### Pipeline: `api`
**Trigger**: user says "api pipeline", "full api test cycle", "from spec to running tests"

```
Stage 1  generate-api-tests      Parse OAS spec → manual test cases + automation scripts
Stage 2  run-api-tests           Run generated tests and capture results
Stage 3  fix-api-tests           [CONDITIONAL] Only if stage 2 has failures
Stage 4  review                  Review all changed/generated files
Stage 5  commit                  [CONDITIONAL] Only if user confirms after review
```

**Default spec path**: `./data-source/oas-spec.yaml`

---

### Pipeline: `sync`
**Trigger**: user says "sync pipeline", "spec changed update tests", "sync and run"

```
Stage 1  sync-tests-from-spec    Diff spec vs last commit → append tests for changed endpoints only
Stage 2  run-api-tests           Run only the newly added TC IDs
Stage 3  fix-api-tests           [CONDITIONAL] Only if stage 2 has failures
Stage 4  review                  Review appended test cases and automation
Stage 5  commit                  [CONDITIONAL] Only if user confirms after review
```

**Default spec path**: `./data-source/oas-spec.yaml`

---

### Pipeline: `ui`
**Trigger**: user says "ui pipeline", "full ui test cycle", "docs to playwright tests"

```
Stage 1  create-manual-ui-test     Parse docs or GitHub URL → markdown test cases in test-cases/
Stage 2  create-playwright-ui-test Convert each generated test case → Playwright .spec.ts
Stage 3  fix-ui-tests              [CONDITIONAL] Only if stage 2 tests fail on first run
Stage 4  review                    Review generated test files
Stage 5  commit                    [CONDITIONAL] Only if user confirms after review
```

**Required argument**: docs source — a file path, glob, or GitHub URL.

---

### Pipeline: `manual`
**Trigger**: user says "manual pipeline", "run manual tests", "execute test cases"

```
Stage 1  run-manual-tests    Drive browser through markdown test cases, record video, produce report
```

No commit stage — manual test runs are read-only.

**Required argument**: test IDs (e.g. `TC-PERM-001`), a name fragment, or `all`.

---

### Pipeline: `fix`
**Trigger**: user says "fix pipeline", "fix and commit", "repair failing tests"

```
Stage 1  run-api-tests     Run full suite to establish baseline failure list
Stage 2  fix-api-tests     [CONDITIONAL] Only if api test failures found in stage 1
Stage 3  fix-ui-tests      [CONDITIONAL] Only if ui test failures found (run ui tests first if needed)
Stage 4  review            Review all changes made by the fix stages
Stage 5  commit            [CONDITIONAL] Only if user confirms after review
```

---

## Workflow

### Step 1: Identify the Pipeline

Read the user's request and match it to one of the five pipelines above. If no pipeline name is given, infer from keywords:

| Keywords | Pipeline |
|----------|----------|
| "spec", "oas", "generate api", "api tests from spec" | `api` |
| "spec changed", "sync", "update tests" | `sync` |
| "docs", "github", "ui tests", "playwright from docs" | `ui` |
| "manual", "markdown tests", "run TC-" | `manual` |
| "fix", "broken", "failing" | `fix` |

If still ambiguous, ask:
> "Which pipeline should I run? Options: **api** (spec→tests→run), **sync** (spec diff→append tests→run), **ui** (docs→manual cases→playwright), **manual** (run markdown test cases), **fix** (run→fix→commit)."

---

### Step 2: Collect Required Arguments

Before starting, verify required arguments are present:

| Pipeline | Required | Default if missing |
|----------|----------|--------------------|
| `api` | spec file path | `./data-source/oas-spec.yaml` |
| `sync` | spec file path | `./data-source/oas-spec.yaml` |
| `ui` | docs source (URL or path) | ask user |
| `manual` | test IDs or "all" | ask user |
| `fix` | scope (optional) | all tests |

If a required argument has no default, ask the user before starting.

---

### Step 3: Announce the Plan

Print the pipeline plan before executing any stage:

```
Pipeline: <name>
─────────────────────────────────────
  Stage 1  <skill>   <brief description>
  Stage 2  <skill>   <brief description>
  Stage 3  <skill>   [CONDITIONAL] <condition>
  Stage 4  review
  Stage 5  commit    [requires confirmation]
─────────────────────────────────────
Starting stage 1...
```

---

### Step 4: Execute Each Stage

Run stages sequentially. After each stage:

#### On success → proceed to next stage
Print:
```
✅ Stage N complete — <one-line summary of output>
```

#### On conditional stage → evaluate trigger
- `fix-api-tests`: only run if the previous `run-api-tests` reported ≥1 failure
- `fix-ui-tests`: only run if UI tests failed
- `commit`: only run after asking the user "Commit these changes? (yes/no)"

If a conditional stage is skipped, print:
```
⏭  Stage N skipped — <reason, e.g. "no test failures">
```

#### On hard failure → stop the pipeline
Hard failures (server unreachable, missing credentials, file not found) cannot be fixed by downstream skills. Stop and explain:
```
❌ Pipeline stopped at stage N: <skill>
   Reason: <what went wrong>
   Action needed: <what the user must do to unblock>
```

---

### Step 5: Final Summary

After the last stage (or a stop), print:

```
Pipeline: <name> — COMPLETE / STOPPED
─────────────────────────────────────
  ✅ Stage 1  generate-api-tests   42 cases, 2 files
  ✅ Stage 2  run-api-tests        42/42 passed
  ⏭  Stage 3  fix-api-tests        skipped (no failures)
  ✅ Stage 4  review               no critical issues
  ✅ Stage 5  commit               feat(api-tests): add generated tests

Files produced:
  test-cases/api-parts-test-cases.md
  automation/api/parts.spec.ts
  automation/api/part-categories.spec.ts
```

---

## Context Passing Between Stages

Carry outputs forward to keep each stage informed:

| From stage | Output to carry | To stage |
|------------|----------------|----------|
| `generate-api-tests` | list of generated TC IDs | `run-api-tests` (use as `--grep` scope) |
| `sync-tests-from-spec` | list of new TC IDs | `run-api-tests` (run new tests only) |
| `run-api-tests` | list of failing test IDs | `fix-api-tests` (pass as scope) |
| `create-manual-ui-test` | list of generated test case IDs | `create-playwright-ui-test` (one per ID) |
| Any creation stage | list of new/modified file paths | `review` and `commit` |

---

## Rules

- **Always announce the plan** before executing any stage.
- **Never auto-commit** — always ask the user before the commit stage.
- **Never delete tests** — if a fix skill would delete a test, stop and flag it.
- **Respect conditional logic** — do not run fix stages when there are no failures.
- **One stage at a time** — complete each stage fully before starting the next.
- **Stop on hard failures** — do not skip over unresolvable errors.
