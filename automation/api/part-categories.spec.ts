import { APIRequestContext } from "@playwright/test";
import { test, expect } from "@core";

const MISSING_ID = 999999;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createCategory(
  apiRequest: APIRequestContext,
  overrides: Record<string, unknown> = {}
): Promise<{ pk: number; [key: string]: unknown }> {
  const resp = await apiRequest.post("/api/part/category/", {
    data: { name: `Fixture Category ${Math.random().toString(36).slice(2, 9)}`, description: "Created by test fixture", ...overrides },
  });
  expect(resp.status()).toBe(201);
  return resp.json();
}

async function deleteCategory(apiRequest: APIRequestContext, pk: number): Promise<void> {
  await apiRequest.delete(`/api/part/category/${pk}/`);
}

// ---------------------------------------------------------------------------
// Part Categories — CRUD
// ---------------------------------------------------------------------------

test.describe("Part Categories — CRUD", () => {
  test("TC-PCAT-001 list categories returns paginated response", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 10 } });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty("count");
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("TC-PCAT-002 create category with required field name returns 201", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", { data: { name: "Test Electronics" } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.name).toBe("Test Electronics");
    expect(body).toHaveProperty("pk");
    expect(body).toHaveProperty("level");
    expect(body).toHaveProperty("pathstring");

    await deleteCategory(apiRequest, body.pk);
  });

  test("TC-PCAT-003 create category without name returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", { data: { description: "No name given" } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("name");
  });

  test("TC-PCAT-004 retrieve category by valid ID returns 200", async ({ apiRequest }) => {
    const cat = await createCategory(apiRequest);
    const resp = await apiRequest.get(`/api/part/category/${cat.pk}/`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.pk).toBe(cat.pk);
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("pathstring");

    await deleteCategory(apiRequest, cat.pk);
  });

  test("TC-PCAT-005 retrieve category by non-existent ID returns 404", async ({ apiRequest }) => {
    const resp = await apiRequest.get(`/api/part/category/${MISSING_ID}/`);
    expect(resp.status()).toBe(404);
  });

  test("TC-PCAT-006 partial update category with PATCH returns 200", async ({ apiRequest }) => {
    const cat = await createCategory(apiRequest);
    const resp = await apiRequest.patch(`/api/part/category/${cat.pk}/`, {
      data: { description: "Updated description" },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.description).toBe("Updated description");
    expect(body.name).toBe(cat.name);

    await deleteCategory(apiRequest, cat.pk);
  });

  test("TC-PCAT-007 delete category by valid ID returns 204", async ({ apiRequest }) => {
    const cat = await createCategory(apiRequest);
    const deleteResp = await apiRequest.delete(`/api/part/category/${cat.pk}/`);
    expect(deleteResp.status()).toBe(204);

    const getResp = await apiRequest.get(`/api/part/category/${cat.pk}/`);
    expect(getResp.status()).toBe(404);
  });

  test("TC-PCAT-015 delete non-existent category returns 404", async ({ apiRequest }) => {
    const resp = await apiRequest.delete(`/api/part/category/${MISSING_ID}/`);
    expect(resp.status()).toBe(404);
  });

  test("TC-PCAT-016 full update category with PUT returns 200", async ({ apiRequest }) => {
    const cat = await createCategory(apiRequest);
    const resp = await apiRequest.put(`/api/part/category/${cat.pk}/`, {
      data: { name: "Updated Category Name" },
    });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).name).toBe("Updated Category Name");

    await deleteCategory(apiRequest, cat.pk);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Auth (uses bare request fixture — no token)
// ---------------------------------------------------------------------------

test.describe("Part Categories — Auth", () => {
  test("TC-PCAT-008 unauthenticated GET returns 401", async ({ request }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const resp = await request.get(`${baseUrl}/api/part/category/`, { params: { limit: 1 } });
    expect(resp.status()).toBe(401);
  });

  test("TC-PCAT-017 unauthenticated POST returns 401", async ({ request }) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const resp = await request.post(`${baseUrl}/api/part/category/`, { data: { name: "Unauth Category" } });
    expect(resp.status()).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Pagination
// ---------------------------------------------------------------------------

test.describe("Part Categories — Pagination", () => {
  test("TC-PCAT-018 limit=1 returns at most one result", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 1, offset: 0 } });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).results.length).toBeLessThanOrEqual(1);
  });

  test("TC-PCAT-019 offset beyond count returns empty list", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 10, offset: 999999 } });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Filtering
// ---------------------------------------------------------------------------

test.describe("Part Categories — Filtering", () => {
  test("TC-PCAT-009 filter top_level=true returns root categories only", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 50, top_level: true } });
    expect(resp.status()).toBe(200);
    for (const cat of (await resp.json()).results) {
      expect(cat.parent).toBeNull();
    }
  });

  test("TC-PCAT-010 filter by parent ID returns child categories", async ({ apiRequest }) => {
    const parent = await createCategory(apiRequest, { name: "Parent Cat" });
    const child = await createCategory(apiRequest, { name: "Child Cat", parent: parent.pk });

    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 50, parent: parent.pk } });
    expect(resp.status()).toBe(200);
    const results = (await resp.json()).results as Array<{ pk: number; parent: number }>;
    expect(results.map((c) => c.pk)).toContain(child.pk);
    for (const cat of results) {
      expect(cat.parent).toBe(parent.pk);
    }

    await deleteCategory(apiRequest, child.pk as number);
    await deleteCategory(apiRequest, parent.pk);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Ordering
// ---------------------------------------------------------------------------

test.describe("Part Categories — Ordering", () => {
  const VALID_ORDERINGS = ["name", "-name", "pathstring", "-pathstring", "level", "-level", "part_count", "-part_count"];

  for (const ordering of VALID_ORDERINGS) {
    test(`TC-PCAT-020 ordering=${ordering} returns 200`, async ({ apiRequest }) => {
      const resp = await apiRequest.get("/api/part/category/", { params: { limit: 5, ordering } });
      expect(resp.status()).toBe(200);
    });
  }

  test("TC-PCAT-021 ordering by invalid field returns 200 (API silently ignores unknown ordering)", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 10, ordering: "not_a_valid_field" } });
    expect(resp.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Search
// ---------------------------------------------------------------------------

test.describe("Part Categories — Search", () => {
  test("TC-PCAT-011 search with non-matching term returns empty list", async ({ apiRequest }) => {
    const resp = await apiRequest.get("/api/part/category/", { params: { limit: 10, search: "zzz_no_match_xyzxyz_99999" } });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).count).toBe(0);
  });

  test("TC-PCAT-022 search by created category name returns result", async ({ apiRequest }) => {
    const cat = await createCategory(apiRequest, { name: "Searchable Category XYZ" });

    const resp = await apiRequest.get("/api/part/category/", {
      params: { limit: 10, search: "Searchable Category XYZ" },
    });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).results.map((c: { pk: number }) => c.pk)).toContain(cat.pk);

    await deleteCategory(apiRequest, cat.pk);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Field Validation
// ---------------------------------------------------------------------------

test.describe("Part Categories — Field Validation", () => {
  const NAME_CASES: Array<[string, string, number]> = [
    ["name at max length (100 chars)", "x".repeat(100), 201],
    ["name over max length (101 chars)", "x".repeat(101), 400],
  ];

  for (const [label, name, expectedStatus] of NAME_CASES) {
    test(`TC-PCAT-012 ${label} → ${expectedStatus}`, async ({ apiRequest }) => {
      const resp = await apiRequest.post("/api/part/category/", { data: { name } });
      expect(resp.status()).toBe(expectedStatus);
      if (expectedStatus === 201) {
        await deleteCategory(apiRequest, (await resp.json()).pk);
      }
    });
  }

  test("TC-PCAT-023 description over max length (251 chars) returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", {
      data: { name: "Valid Name", description: "d".repeat(251) },
    });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("description");
  });

  test("TC-PCAT-024 parent=null accepted when nullable", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", { data: { name: "Root Category", parent: null } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.parent).toBeNull();
    await deleteCategory(apiRequest, body.pk);
  });

  test("TC-PCAT-025 read-only field pk in POST body is ignored", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", { data: { name: "PK Override Cat", pk: 99999 } });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.pk).not.toBe(99999);
    await deleteCategory(apiRequest, body.pk);
  });
});

// ---------------------------------------------------------------------------
// Part Categories — Relational Integrity
// ---------------------------------------------------------------------------

test.describe("Part Categories — Relational Integrity", () => {
  test("TC-PCAT-013 parent set to non-existent ID returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", { data: { name: "Orphan Category", parent: MISSING_ID } });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("parent");
  });

  test("TC-PCAT-014 create child category with valid parent ID", async ({ apiRequest }) => {
    const parent = await createCategory(apiRequest, { name: "Parent for Integrity Test" });

    const resp = await apiRequest.post("/api/part/category/", {
      data: { name: "Child Category", parent: parent.pk },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.parent).toBe(parent.pk);
    expect(body.level).toBeGreaterThan(0);
    expect(body.pathstring).toContain(parent.name as string);

    await deleteCategory(apiRequest, body.pk);
    await deleteCategory(apiRequest, parent.pk);
  });

  test("TC-PCAT-026 default_location set to non-existent ID returns 400", async ({ apiRequest }) => {
    const resp = await apiRequest.post("/api/part/category/", {
      data: { name: "Bad Location Category", default_location: MISSING_ID },
    });
    expect(resp.status()).toBe(400);
    expect(await resp.json()).toHaveProperty("default_location");
  });
});
