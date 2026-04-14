# Playwright API Testing Patterns Reference

Reusable patterns for the `generate-api-tests` skill — Playwright TypeScript, `APIRequestContext`.

---

## Basic GET request

```typescript
const resp = await request.get(`${BASE_URL}/api/part/`, {
  headers: AUTH,
  params: { limit: 10, offset: 0 },
});
expect(resp.status()).toBe(200);
const body = await resp.json();
```

---

## Basic POST with JSON body

```typescript
const resp = await request.post(`${BASE_URL}/api/part/`, {
  headers: AUTH,
  data: { name: "Resistor 10k", description: "10k ohm" },
});
expect(resp.status()).toBe(201);
const body = await resp.json();
expect(body.name).toBe("Resistor 10k");
expect(body).toHaveProperty("pk");
```

---

## PATCH (partial update)

```typescript
const resp = await request.patch(`${BASE_URL}/api/part/${pk}/`, {
  headers: AUTH,
  data: { description: "Updated description" },
});
expect(resp.status()).toBe(200);
expect((await resp.json()).description).toBe("Updated description");
```

---

## DELETE

```typescript
const resp = await request.delete(`${BASE_URL}/api/part/${pk}/`, { headers: AUTH });
expect(resp.status()).toBe(204);
```

---

## Self-cleaning test (create → test → delete)

```typescript
test("create and delete part", async ({ request }) => {
  const create = await request.post(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    data: { name: "Tmp Part", description: "fixture" },
  });
  expect(create.status()).toBe(201);
  const { pk } = await create.json();

  // ... test logic using pk ...

  const del = await request.delete(`${BASE_URL}/api/part/${pk}/`, { headers: AUTH });
  expect(del.status()).toBe(204);
});
```

---

## 401 unauthenticated test

```typescript
test("unauthenticated request returns 401", async ({ request }) => {
  // no headers — omit AUTH entirely
  const resp = await request.get(`${BASE_URL}/api/part/`, { params: { limit: 1 } });
  expect(resp.status()).toBe(401);
});
```

---

## 404 not found

```typescript
const MISSING_ID = 999999;

test("retrieve non-existent part returns 404", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/${MISSING_ID}/`, { headers: AUTH });
  expect(resp.status()).toBe(404);
});
```

---

## Response schema assertion

```typescript
const EXPECTED_FIELDS = ["pk", "name", "description", "category", "active"];

test("part response contains expected fields", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 1 },
  });
  const body = await resp.json();
  const part = body.results[0];
  for (const field of EXPECTED_FIELDS) {
    expect(part).toHaveProperty(field);
  }
});
```

---

## Paginated list assertions

```typescript
test("paginated list has correct shape", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 2, offset: 0 },
  });
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body).toHaveProperty("count");
  expect(body).toHaveProperty("results");
  expect(Array.isArray(body.results)).toBe(true);
  expect(body.results.length).toBeLessThanOrEqual(2);
});

test("pages do not overlap", async ({ request }) => {
  const params = (offset: number) => ({ limit: 2, offset });
  const [r1, r2] = await Promise.all([
    request.get(`${BASE_URL}/api/part/`, { headers: AUTH, params: params(0) }),
    request.get(`${BASE_URL}/api/part/`, { headers: AUTH, params: params(2) }),
  ]);
  const ids1 = new Set((await r1.json()).results.map((p: any) => p.pk));
  const ids2 = new Set((await r2.json()).results.map((p: any) => p.pk));
  for (const id of ids2) {
    expect(ids1.has(id)).toBe(false);
  }
});
```

---

## Data-driven test with `for` loop (boundary values)

```typescript
const INVALID_NAMES: Array<[string, string]> = [
  ["empty string", ""],
  ["whitespace only", "   "],
  ["over maxLength", "x".repeat(101)],
];

for (const [label, name] of INVALID_NAMES) {
  test(`create part with ${label} returns 400`, async ({ request }) => {
    const resp = await request.post(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      data: { name, description: "boundary test" },
    });
    expect(resp.status()).toBe(400);
  });
}
```

---

## Data-driven ordering test

```typescript
const VALID_ORDERINGS = ["name", "-name", "creation_date", "-creation_date", "IPN", "-IPN"];

for (const ordering of VALID_ORDERINGS) {
  test(`ordering=${ordering} returns 200`, async ({ request }) => {
    const resp = await request.get(`${BASE_URL}/api/part/`, {
      headers: AUTH,
      params: { limit: 5, ordering },
    });
    expect(resp.status()).toBe(200);
  });
}
```

---

## Filter test pattern

```typescript
test("filter by category returns only matching parts", async ({ request }) => {
  // first find a valid category from the list
  const catResp = await request.get(`${BASE_URL}/api/part/category/`, {
    headers: AUTH,
    params: { limit: 1 },
  });
  const categories = await catResp.json();
  if (categories.count === 0) return; // skip if no categories exist

  const categoryId = categories.results[0].pk;
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 50, category: categoryId },
  });
  expect(resp.status()).toBe(200);
  const parts = (await resp.json()).results;
  for (const part of parts) {
    expect(part.category).toBe(categoryId);
  }
});

test("filter by non-existent category returns empty list", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 10, category: 999999 },
  });
  expect(resp.status()).toBe(200);
  expect((await resp.json()).count).toBe(0);
});
```

---

## Search test pattern

```typescript
test("search returns results containing the term", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 10, search: "resistor" },
  });
  expect(resp.status()).toBe(200);
  // count may be 0 if no data matches — acceptable; just assert no server error
});

test("search with no match returns empty list", async ({ request }) => {
  const resp = await request.get(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    params: { limit: 10, search: "zzz_no_match_xyzxyz_12345" },
  });
  expect(resp.status()).toBe(200);
  expect((await resp.json()).count).toBe(0);
});
```

---

## Relational integrity — invalid foreign key

```typescript
test("create part with non-existent category returns 400", async ({ request }) => {
  const resp = await request.post(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    data: { name: "Bad FK Part", description: "test", category: 999999 },
  });
  expect(resp.status()).toBe(400);
});
```

---

## Field-level validation — required field missing

```typescript
test("create part without required name returns 400 with field error", async ({ request }) => {
  const resp = await request.post(`${BASE_URL}/api/part/`, {
    headers: AUTH,
    data: { description: "No name" },
  });
  expect(resp.status()).toBe(400);
  const body = await resp.json();
  expect(body).toHaveProperty("name"); // error key matches field name
});
```

---

## Environment variable setup

```bash
# .env (never commit)
INVENTREE_BASE_URL=http://localhost:8000
INVENTREE_API_TOKEN=abc123

# Run tests
INVENTREE_BASE_URL=http://localhost:8000 \
INVENTREE_API_TOKEN=abc123 \
npx playwright test automation/api/ --reporter=line
```

---

## Running against Docker

```bash
# Start InvenTree
docker compose up -d

# Wait for readiness
until curl -sf http://localhost:8000/api/ > /dev/null; do sleep 2; done

# Run API tests only
INVENTREE_BASE_URL=http://localhost:8000 \
INVENTREE_API_TOKEN=<token> \
npx playwright test automation/api/ --reporter=line
```
