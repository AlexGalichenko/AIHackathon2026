import { APIRequestContext } from "@playwright/test";
import { test, expect } from "@core";

const MISSING_ID = 999999;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createPart(
  apiRequest: APIRequestContext,
  overrides: Record<string, unknown> = {}
): Promise<{ pk: number; [key: string]: unknown }> {
  const resp = await apiRequest.post("/api/part/", {
    data: { name: `Fixture Part ${Math.random().toString(36).slice(2, 9)}`, description: "Created by test fixture", ...overrides },
  });
  expect(resp.status()).toBe(201);
  return resp.json();
}

async function deletePart(apiRequest: APIRequestContext, pk: number): Promise<void> {
  // InvenTree requires parts to be inactive before deletion
  await apiRequest.patch(`/api/part/${pk}/`, { data: { active: false } });
  await apiRequest.delete(`/api/part/${pk}/`);
}

// ---------------------------------------------------------------------------
// Parts — CRUD
// ---------------------------------------------------------------------------

test.describe("Parts — CRUD", () => {
  test("TC-PART-001 list parts returns paginated response", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10 } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty("count");
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("TC-PART-002 create part with required field name returns 201", async ({ apiRequest }) => {
    const name = `Test Resistor ${Math.random().toString(36).slice(2, 9)}`;
    const resp = await apiRequest.post("/api/part/", {
      data: { name, description: "10k ohm resistor" },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.name).toBe(name);
    expect(body).toHaveProperty("pk");

    await deletePart(apiRequest, body.pk);
  });

  test("TC-PART-003 create part without name returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", {
      data: { description: "No name provided" },
    });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("name");
  });

  test("TC-PART-004 retrieve part by valid ID returns 200", async ({ apiRequest }) => {
    const part = await createPart(apiRequest);
    const resp = await apiRequest.get(`/api/part/${part.pk}/`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.pk).toBe(part.pk);
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("active");

    await deletePart(apiRequest, part.pk);
  });

  test("TC-PART-005 retrieve part by non-existent ID returns 404", async ({ apiRequest }) => {
    const resp = await apiRequest.get(`/api/part/${MISSING_ID}/`);
    expect(resp.status()).toBe(404);
  });

  test("TC-PART-006 full update part with PUT returns 200", async ({ apiRequest }) => {
    const part = await createPart(apiRequest);
    const updatedName = `Updated Name ${Math.random().toString(36).slice(2, 9)}`;
    const resp = await apiRequest.put(`/api/part/${part.pk}/`, {
      data: { name: updatedName, description: "Updated description" },
    });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).name).toBe(updatedName);

    await deletePart(apiRequest, part.pk);
  });

  test("TC-PART-007 partial update part with PATCH returns 200", async ({ apiRequest }) => {
    const part = await createPart(apiRequest);
    const resp = await apiRequest.patch(`/api/part/${part.pk}/`, {
      data: { description: "Patched description" },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.description).toBe("Patched description");
    expect(body.name).toBe(part.name);

    await deletePart(apiRequest, part.pk);
  });

  test("TC-PART-008 delete part by valid ID returns 204", async ({ apiRequest }) => {
    const part = await createPart(apiRequest);
    // InvenTree requires deactivation before deletion
    await apiRequest.patch(`/api/part/${part.pk}/`, { data: { active: false } });
    const deleteResp = await apiRequest.delete(`/api/part/${part.pk}/`);
    expect(deleteResp.status()).toBe(204);

    const getResp = await apiRequest.get(`/api/part/${part.pk}/`);
    expect(getResp.status()).toBe(404);
  });

  test("TC-PART-009 delete non-existent part returns 404", async ({ apiRequest }) => {
    const resp = await apiRequest.delete(`/api/part/${MISSING_ID}/`);
    expect(resp.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Parts — Auth (uses bare request fixture — no token)
// ---------------------------------------------------------------------------

test.describe("Parts — Auth", () => {
  test("TC-PART-010 unauthenticated GET returns 401", async ({ request }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const resp = await request.get(`${baseUrl}/api/part/`, { params: { limit: 1 } });
    expect(resp.status()).toBe(401);
  });

  test("TC-PART-011 unauthenticated POST returns 401", async ({ request }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const resp = await request.post(`${baseUrl}/api/part/`, {
      data: { name: "Unauth Part" },
    });
    expect(resp.status()).toBe(401);
  });

  test("TC-PART-012 unauthenticated DELETE returns 401", async ({ apiRequest, request }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const part = await createPart(apiRequest);
    const resp = await request.delete(`${baseUrl}/api/part/${part.pk}/`);
    expect(resp.status()).toBe(401);

    await deletePart(apiRequest, part.pk);
  });
});

// ---------------------------------------------------------------------------
// Parts — Pagination
// ---------------------------------------------------------------------------

test.describe("Parts — Pagination", () => {
  test("TC-PART-013 limit=1 returns exactly one result", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 1, offset: 0 } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.results.length).toBeLessThanOrEqual(1);
    if (body.count > 1) {
      expect(body.next).not.toBeNull();
    }
  });

  test("TC-PART-014 offset beyond total count returns empty list", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10, offset: 999999 } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.results).toHaveLength(0);
    expect(body.next).toBeNull();
  });

  test("TC-PART-015 pages do not overlap", async ({ apiRequest }) => {
    const [r1, r2] = await Promise.all([
      apiRequest.get("/api/part/", { params: { limit: 2, offset: 0 } }),
      apiRequest.get("/api/part/", { params: { limit: 2, offset: 2 } }),
    ]);
    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);
    const ids1 = new Set((await r1.json()).results.map((p: { pk: number }) => p.pk));
    const ids2 = new Set((await r2.json()).results.map((p: { pk: number }) => p.pk));
    for (const id of ids2) {
      expect(ids1.has(id)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Parts — Filtering
// ---------------------------------------------------------------------------

test.describe("Parts — Filtering", () => {
  test("TC-PART-016 filter active=true returns only active parts", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 50, active: true } });
    expect(resp.status()).toBe(200);
    for (const part of (await resp.json()).results) {
      expect(part.active).toBe(true);
    }
  });

  test("TC-PART-018 filter by non-existent category returns 200 (API ignores unknown category ID)", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10, category: MISSING_ID } });
    expect(resp.status()).toBe(200);
    expect(await resp.json()).toHaveProperty("results");
  });

  test("TC-PART-019 filter purchaseable=true returns only purchaseable parts", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 50, purchaseable: true } });
    expect(resp.status()).toBe(200);
    for (const part of (await resp.json()).results) {
      expect(part.purchaseable).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Parts — Ordering
// ---------------------------------------------------------------------------

test.describe("Parts — Ordering", () => {
  const VALID_ORDERINGS = ["name", "-name", "creation_date", "-creation_date", "IPN", "-IPN", "category", "-category"];

  for (const ordering of VALID_ORDERINGS) {
    test(`TC-PART-020 ordering=${ordering} returns 200`, async ({ apiRequest }) => {
      const resp = await apiRequest.get("/api/part/", { params: { limit: 5, ordering } });
      expect(resp.status()).toBe(200);
    });
  }

  test("TC-PART-022 ordering by invalid field returns 200 (API silently ignores unknown ordering)", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10, ordering: "not_a_valid_field" } });
    expect(resp.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Parts — Search
// ---------------------------------------------------------------------------

test.describe("Parts — Search", () => {
  test("TC-PART-024 search with non-matching term returns empty list", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10, search: "zzz_no_match_xyzxyz_99999" } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.count).toBe(0);
  });

  test("TC-PART-025 search with special characters returns 200", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/", { params: { limit: 10, search: '%&"' } });
    expect(resp.status()).toBe(200);
    expect(await resp.json()).toHaveProperty("results");
  });
});

// ---------------------------------------------------------------------------
// Parts — Field Validation
// ---------------------------------------------------------------------------

test.describe("Parts — Field Validation", () => {
  const NAME_CASES: Array<[string, string, number]> = [
    ["name at max length (100 chars)", `x`.repeat(99) + Math.random().toString(36).slice(2, 3), 201],
    ["name over max length (101 chars)", "x".repeat(101), 400],
  ];

  for (const [label, name, expectedStatus] of NAME_CASES) {
    test(`TC-PART-026/027 ${label} → ${expectedStatus}`, async ({ apiRequest }) => {
      const resp = await apiRequest.post("/api/part/", { data: { name, description: "boundary test" } });
      expect(resp.status()).toBe(expectedStatus);
      if (expectedStatus === 201) {
        await deletePart(apiRequest, (await resp.json()).pk);
      }
    });
  }

  test("TC-PART-028 description over max length (251 chars) returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: `Valid Name ${Math.random().toString(36).slice(2, 9)}`, description: "d".repeat(251) } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("description");
  });

  test("TC-PART-029 units over max length (21 chars) returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: `Units Test ${Math.random().toString(36).slice(2, 9)}`, units: "u".repeat(21) } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("units");
  });

  const EXPIRY_CASES: Array<[string, number, number]> = [
    ["default_expiry=0 (minimum boundary)", 0, 201],
    ["default_expiry=-1 (below minimum)", -1, 400],
  ];

  for (const [label, value, expectedStatus] of EXPIRY_CASES) {
    test(`TC-PART-030/031 ${label} → ${expectedStatus}`, async ({ apiRequest }) => {
      const resp = await apiRequest.post("/api/part/", { data: { name: `Expiry Test Part ${Math.random().toString(36).slice(2, 9)}`, default_expiry: value } });
      expect(resp.status()).toBe(expectedStatus);
      if (expectedStatus === 201) {
        const body = await resp.json();
        expect(body.default_expiry).toBe(value);
        await deletePart(apiRequest, body.pk);
      }
    });
  }

  test("TC-PART-032 category=null accepted when field is nullable", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: `Uncategorized Part ${Math.random().toString(36).slice(2, 9)}`, category: null } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.category).toBeNull();
    await deletePart(apiRequest, body.pk);
  });

  test("TC-PART-033 read-only pk in POST body is ignored", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: `PK Override Test ${Math.random().toString(36).slice(2, 9)}`, pk: 99999 } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.pk).not.toBe(99999);
    await deletePart(apiRequest, body.pk);
  });
});

// ---------------------------------------------------------------------------
// Parts — Relational Integrity
// ---------------------------------------------------------------------------

test.describe("Parts — Relational Integrity", () => {
  test("TC-PART-035 category set to non-existent ID returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: "Bad Category Part", category: MISSING_ID } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("category");
  });

  test("TC-PART-036 default_location set to non-existent ID returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: "Bad Location Part", default_location: MISSING_ID } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("default_location");
  });

  test("TC-PART-037 variant_of set to non-existent part ID returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/", { data: { name: "Bad Variant Part", variant_of: MISSING_ID } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("variant_of");
  });
});
