---
name: generate-api-tests
description: This skill should be used when the user asks to "generate API tests from OAS spec", "create API test cases from schema", "generate API automation scripts", "write playwright tests for an API", "create test cases for REST endpoints", "generate API test plan from OpenAPI", "create CRUD test cases for API", "automate API testing from swagger", or wants to produce manual test cases and/or executable automation scripts from an OpenAPI/Swagger YAML or JSON schema file.
argument-hint: "Provide the path to the OAS spec file (e.g. ./data-source/oas-spec.yaml) and optionally specify which endpoints or tags to focus on."
version: 0.2.0
---

# Generate API Tests from OAS Specification

Parse an OpenAPI 3.x (or Swagger 2.0) specification, analyse the endpoints and schemas, then produce:
1. **Manual API test cases** in the project's standard markdown format
2. **Executable Playwright TypeScript automation scripts** targeting `automation/api/`

## Overview

This skill bridges an API contract (OAS spec) and runnable test coverage. It derives test scenarios directly from the schema — field constraints, required flags, enum values, response codes, and relational references — so the output is grounded in the actual contract rather than guesswork.

---

## Workflow

### Step 1: Gather Input

Accept the spec in one of these forms:
- **File path** (preferred): read the YAML/JSON file with the Read tool. Default path: `./data-source/oas-spec.yaml`
- **Pasted content**: inline YAML/JSON provided by the user
- **URL**: fetch with WebFetch and parse

If the user specifies a subset (e.g. "only the Parts endpoints", "tag: part"), restrict analysis to those paths/tags. Otherwise process all paths.

Also read existing project files to understand conventions:
- `playwright.config.ts` — base URL, project config
- `automation/commons/fixtures/core.ts` — extended test fixture
- Any existing `automation/api/*.spec.ts` files — follow the same patterns

After reading, confirm: "Loaded OAS spec — version `<info.version>`, `<N>` paths found. Analysing…"

---

### Step 2: Parse the Spec

For each relevant path + HTTP method, extract:

**Endpoint metadata**
- Path (e.g. `/api/part/`)
- Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- `operationId`
- Security requirements (auth schemes)
- Tags

**Parameters**
- Path parameters (name, type, required)
- Query parameters (name, type, default, enum values, description)
- Pagination parameters (`limit`, `offset` or `page`)
- Filter parameters (boolean flags, integer IDs, string patterns)
- Search parameter

**Request body** (for POST/PUT/PATCH)
- Resolve `$ref` to the schema component
- For each property record: name, type, format, maxLength, minLength, minimum, maximum, enum, nullable, readOnly, writeOnly, required vs optional

**Responses**
- Success codes and their response schema
- Error codes defined (400, 401, 403, 404, 409, etc.)

**Schema components** — resolve all `$ref` pointers so you work with fully expanded schemas.

---

### Step 3: Derive Test Scenarios

For each endpoint, systematically derive scenarios. Group by **area** (use the first tag or a logical name like `PART`, `PCAT`).

#### CRUD Operations

| Method | Scenarios to derive |
|--------|-------------------|
| `GET` list | Happy path (200 + paginated body), empty result set, unauthenticated (401) |
| `GET` detail | Valid ID (200), non-existent ID (404), unauthenticated (401) |
| `POST` | All required fields → 201 + created resource, missing each required field → 400, unauthenticated → 401 |
| `PUT` | Full update with valid payload → 200, non-existent ID → 404, read-only field in payload → ignored or 400 |
| `PATCH` | Partial update one field → 200 with updated value, non-existent ID → 404 |
| `DELETE` | Valid ID → 204, non-existent ID → 404, unauthenticated → 401 |

#### Filtering and Pagination

For each query filter parameter:
- Filter that matches existing data → 200, non-empty results
- Filter that matches nothing → 200, empty list (`count: 0`)
- Invalid type for filter (e.g. string where integer expected) → 400

For pagination:
- `limit=1` → returns exactly 1 result, `next` link present if more exist
- `offset` beyond total count → 200, empty results
- `limit` + `offset` combination → correct page window
- Negative `limit` or `offset` → 400

For ordering:
- Each `ordering` enum value (ascending and descending) → 200
- Invalid ordering value → 400

#### Search

- `search=<term matching known data>` → 200, results contain the term
- `search=<term matching nothing>` → 200, `count: 0`
- `search` with special characters → 200, no server error

#### Field-Level Validation

| Constraint | Scenarios |
|-----------|-----------|
| `required: true` | Omit field → 400 with field error |
| `maxLength: N` | Value of length N → accepted; length N+1 → 400 |
| `nullable: false` | Send `null` → 400 |
| `nullable: true` | Send `null` → accepted |
| `readOnly: true` | Include in POST/PUT → field ignored or 400 |
| `enum` values | Each valid enum value → accepted; value outside enum → 400 |
| `type: integer` | Send string → 400 |
| `format: date` | Invalid date string → 400 |

#### Relational Integrity

For fields that reference another resource by integer ID:
- Valid existing ID → accepted
- Non-existent ID → 400 or 404
- `null` when nullable → accepted
- `null` when non-nullable → 400

#### Edge Cases and Security

- Unauthenticated request (no auth header) → 401
- Invalid token → 401 or 403
- Insufficient permission → 403
- Empty string for required string fields → 400
- String exceeding maxLength → 400
- Duplicate creation (unique constraint) → 400 or 409
- Malformed JSON body → 400

---

### Step 4: Write Manual Test Cases

Format all derived scenarios as markdown test cases following the project standard.

```markdown
# API Test Cases — <Feature Name>

**Source**: `<spec file path>`
**Generated**: <today's date>
**Total cases**: <N>

---

## Test Case Summary

| ID | Title | Priority | Area |
|----|-------|----------|------|
| TC-PART-001 | ... | Critical | Parts CRUD |

---

## <Area Name>

### TC-<AREA>-<NNN> — <Short imperative title>

| Field | Value |
|-------|-------|
| Priority | Critical / High / Medium / Low |
| Component | <endpoint + method, e.g. `POST /api/part/`> |
| Test Type | Positive / Negative / Boundary / Edge Case |

**Preconditions**
- InvenTree instance is running and accessible at `{{BASE_URL}}`
- <auth state — e.g. "API token for admin user is set in INVENTREE_API_TOKEN env var">
- <any data that must pre-exist>

**Steps**
1. Send `<METHOD> {{BASE_URL}}<path>` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "<field>": "<value>", ... }`
3. Observe the HTTP response status code
4. Inspect the response body

**Expected Result**
HTTP `<code>`. Response body contains `<specific field/value>`.
```

**Priority assignment:**
- **Critical**: auth checks, create with required fields, retrieve/delete by ID
- **High**: missing required field validation, pagination, key filters, update operations
- **Medium**: optional field validation, boundary values, search, ordering
- **Low**: unusual edge cases, rarely-used filter combinations

Save to: `test-cases/api-<tag-or-feature>-test-cases.md`

---

### Step 5: Generate Playwright TypeScript Automation Scripts

Generate tests using Playwright's `APIRequestContext`. All files go in `automation/api/`.

#### Project layout to create

```
automation/api/
  parts.spec.ts           # tests for /api/part/ and /api/part/{id}/
  part-categories.spec.ts # tests for /api/part/category/ and /api/part/category/{id}/
```

Shared fixtures and helpers live in `automation/commons/fixtures/core.ts` (already exists — read it before writing tests).

#### Import convention

For API-only tests (no browser), import directly from `@playwright/test`. The `@core` fixture extends `BrowserContext` and is not needed for pure API tests:

```typescript
import { test, expect } from "@playwright/test";
```

#### Auth and base URL

Use environment variables — never hardcode credentials:

```typescript
const BASE_URL = process.env.INVENTREE_BASE_URL ?? "http://localhost:8000";
const TOKEN = process.env.INVENTREE_API_TOKEN ?? "";
const AUTH = { Authorization: `Token ${TOKEN}` };
```

#### Self-cleaning test data

Use `test.afterEach` or a teardown helper to delete resources created during a test:

```typescript
test("create part with required fields", async ({ request }) => {
  const resp = await request.post(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    data: { name: "Resistor 10k", description: "10k ohm" },
  });
  expect(resp.status()).toBe(201);
  const body = await resp.json();
  expect(body).toMatchObject({ name: "Resistor 10k" });
  expect(body).toHaveProperty("pk");

  // cleanup
  await request.delete(`${BASE_URL}/api/part/${body.pk}/`, { headers: AUTH });
});
```

#### Full file template

```typescript
import { test, expect } from "@playwright/test";

const BASE_URL = process.env.INVENTREE_BASE_URL ?? "http://localhost:8000";
const TOKEN = process.env.INVENTREE_API_TOKEN ?? "";
const AUTH = { Authorization: `Token ${TOKEN}` };
const MISSING_ID = 999999;

test.describe("Parts — CRUD", () => {
  test("TC-PART-001 list parts returns paginated response", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      params: { limit: 10 },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty("count");
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("TC-PART-002 create part with required fields returns 201", async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      data: { name: "Test Part", description: "Created by test" },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.name).toBe("Test Part");

    await request.delete(`${BASE_URL}/api/part/${body.pk}/`, { headers: AUTH });
  });

  test("TC-PART-003 create part without name returns 400", async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      data: { description: "No name given" },
    });
    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body).toHaveProperty("name");
  });

  test("TC-PART-004 retrieve non-existent part returns 404", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/${MISSING_ID}/`, { headers: AUTH });
    expect(resp.status()).toBe(404);
  });

  test("TC-PART-005 unauthenticated list request returns 401", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, { params: { limit: 1 } });
    expect(resp.status()).toBe(401);
  });
});

test.describe("Parts — Pagination", () => {
  test("TC-PART-010 limit=1 returns exactly one result", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      params: { limit: 1 },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.results.length).toBeLessThanOrEqual(1);
  });

  test("TC-PART-011 offset beyond count returns empty results", async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      params: { limit: 10, offset: 99999 },
    });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).results).toHaveLength(0);
  });
});
```

#### Data-driven / parametrized pattern

Playwright has no native parametrize decorator — use an array and a `for` loop:

```typescript
const INVALID_NAMES = ["", " ", "x".repeat(101)];

for (const name of INVALID_NAMES) {
  test(`TC-PART-BND create part with invalid name "${name.slice(0, 20)}…" returns 400`, async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      data: { name, description: "boundary test" },
    });
    expect(resp.status()).toBe(400);
  });
}
```

#### Ordering test pattern

```typescript
const VALID_ORDERING = ["name", "-name", "creation_date", "-creation_date"];

for (const ordering of VALID_ORDERING) {
  test(`TC-PART-ORD ordering=${ordering} returns 200`, async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      params: { limit: 5, ordering },
    });
    expect(resp.status()).toBe(200);
  });
}
```

#### Coverage mapping

Generate at minimum these `test.describe` blocks:

| File | Describe block | Covers |
|------|---------------|--------|
| `parts.spec.ts` | `Parts — CRUD` | GET list, POST, GET detail, PUT, PATCH, DELETE |
| `parts.spec.ts` | `Parts — Pagination` | limit, offset, boundaries |
| `parts.spec.ts` | `Parts — Filtering` | category, active, purchaseable, has_stock, etc. |
| `parts.spec.ts` | `Parts — Search` | search term match, no match, special chars |
| `parts.spec.ts` | `Parts — Validation` | required fields, maxLength, enum, nullable, readOnly |
| `parts.spec.ts` | `Parts — Auth` | 401 on each method without token |
| `part-categories.spec.ts` | `Part Categories — CRUD` | GET list, POST, GET detail, PUT, PATCH, DELETE |
| `part-categories.spec.ts` | `Part Categories — Validation` | required fields, relational integrity |
| `part-categories.spec.ts` | `Part Categories — Auth` | 401 without token |

---

### Step 6: Write Files and Report

Write each generated file to disk. Then report:

```
Generated:
  Manual test cases  → test-cases/api-parts-test-cases.md        (<N> cases)
  Automation scripts:
    automation/api/parts.spec.ts           (<N> tests)
    automation/api/part-categories.spec.ts (<N> tests)

To run:
  export INVENTREE_BASE_URL=http://localhost:8000
  export INVENTREE_API_TOKEN=<your-token>
  npx playwright test automation/api/ --reporter=line
```

---

## Coverage Checklist

Before writing output, verify:
- [ ] Every CRUD method for each in-scope endpoint has at least one positive test
- [ ] Every required field in POST/PUT bodies has a "missing → 400" negative test
- [ ] Pagination is tested (limit, offset, boundary)
- [ ] At least one filter parameter per endpoint is tested
- [ ] Search is tested with a matching and non-matching term
- [ ] Auth is tested: unauthenticated → 401 for at least one endpoint per resource
- [ ] At least one relational field is tested with a non-existent foreign key
- [ ] Data-driven `for` loops are used for boundary values and enum/ordering fields
- [ ] Every test that creates data cleans it up after

## Additional Resources

- **`references/playwright-patterns.md`** — Reusable Playwright API testing patterns, assertion helpers, auth setup
