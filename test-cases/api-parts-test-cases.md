# API Test Cases — Parts and Part Categories

**Source**: `./data-source/oas-spec.yaml`
**Generated**: 2026-04-14
**Total cases**: 62

---

## Test Case Summary

| ID | Title | Priority | Area |
|----|-------|----------|------|
| TC-PART-001 | List parts returns paginated response | Critical | Parts CRUD |
| TC-PART-002 | Create part with required field name | Critical | Parts CRUD |
| TC-PART-003 | Create part without name returns 400 | Critical | Parts CRUD |
| TC-PART-004 | Retrieve part by valid ID returns 200 | Critical | Parts CRUD |
| TC-PART-005 | Retrieve part by non-existent ID returns 404 | Critical | Parts CRUD |
| TC-PART-006 | Full update part with PUT returns 200 | High | Parts CRUD |
| TC-PART-007 | Partial update part with PATCH returns 200 | High | Parts CRUD |
| TC-PART-008 | Delete part by valid ID returns 204 | Critical | Parts CRUD |
| TC-PART-009 | Delete non-existent part returns 404 | High | Parts CRUD |
| TC-PART-010 | Unauthenticated GET returns 401 | Critical | Parts Auth |
| TC-PART-011 | Unauthenticated POST returns 401 | Critical | Parts Auth |
| TC-PART-012 | Unauthenticated DELETE returns 401 | Critical | Parts Auth |
| TC-PART-013 | limit=1 returns exactly one result | High | Parts Pagination |
| TC-PART-014 | offset beyond total count returns empty list | Medium | Parts Pagination |
| TC-PART-015 | limit and offset together return non-overlapping pages | Medium | Parts Pagination |
| TC-PART-016 | Filter by active=true returns only active parts | High | Parts Filtering |
| TC-PART-017 | Filter by valid category ID returns matching parts | High | Parts Filtering |
| TC-PART-018 | Filter by non-existent category returns empty list | Medium | Parts Filtering |
| TC-PART-019 | Filter purchaseable=true returns purchaseable parts | Medium | Parts Filtering |
| TC-PART-020 | Ordering by name ascending returns 200 | Medium | Parts Ordering |
| TC-PART-021 | Ordering by creation_date descending returns 200 | Medium | Parts Ordering |
| TC-PART-022 | Ordering by invalid field returns 400 | Medium | Parts Ordering |
| TC-PART-023 | Search by part name returns matching results | High | Parts Search |
| TC-PART-024 | Search with non-matching term returns empty list | Medium | Parts Search |
| TC-PART-025 | Search with special characters returns 200 | Low | Parts Search |
| TC-PART-026 | name at max length (100 chars) is accepted | Medium | Parts Field Validation |
| TC-PART-027 | name over max length (101 chars) returns 400 | Medium | Parts Field Validation |
| TC-PART-028 | description over max length (251 chars) returns 400 | Medium | Parts Field Validation |
| TC-PART-029 | units over max length (21 chars) returns 400 | Medium | Parts Field Validation |
| TC-PART-030 | default_expiry=0 (minimum boundary) is accepted | Medium | Parts Field Validation |
| TC-PART-031 | default_expiry=-1 (below minimum) returns 400 | Medium | Parts Field Validation |
| TC-PART-032 | category=null accepted when nullable | Medium | Parts Field Validation |
| TC-PART-033 | Read-only field pk in POST body is ignored | Low | Parts Field Validation |
| TC-PART-034 | category set to valid category ID is accepted | High | Parts Relational Integrity |
| TC-PART-035 | category set to non-existent ID returns 400 | High | Parts Relational Integrity |
| TC-PART-036 | default_location set to non-existent ID returns 400 | Medium | Parts Relational Integrity |
| TC-PART-037 | variant_of set to non-existent part ID returns 400 | Medium | Parts Relational Integrity |
| TC-PCAT-001 | List categories returns paginated response | Critical | Part Categories CRUD |
| TC-PCAT-002 | Create category with required field name | Critical | Part Categories CRUD |
| TC-PCAT-003 | Create category without name returns 400 | Critical | Part Categories CRUD |
| TC-PCAT-004 | Retrieve category by valid ID returns 200 | Critical | Part Categories CRUD |
| TC-PCAT-005 | Retrieve category by non-existent ID returns 404 | Critical | Part Categories CRUD |
| TC-PCAT-006 | Partial update category with PATCH returns 200 | High | Part Categories CRUD |
| TC-PCAT-007 | Delete category by valid ID returns 204 | Critical | Part Categories CRUD |
| TC-PCAT-008 | Unauthenticated GET categories returns 401 | Critical | Part Categories Auth |
| TC-PCAT-009 | Filter by top_level=true returns root categories | High | Part Categories Filtering |
| TC-PCAT-010 | Filter by parent ID returns child categories only | High | Part Categories Filtering |
| TC-PCAT-011 | Search by category name returns matching results | High | Part Categories Search |
| TC-PCAT-012 | name over max length (101 chars) returns 400 | Medium | Part Categories Validation |
| TC-PCAT-013 | parent set to non-existent ID returns 400 | High | Part Categories Relational Integrity |
| TC-PCAT-014 | Create child category with valid parent ID | High | Part Categories Relational Integrity |
| TC-PCAT-015 | Delete non-existent category returns 404 | High | Part Categories CRUD |
| TC-PCAT-016 | Full update category with PUT returns 200 | High | Part Categories CRUD |
| TC-PCAT-017 | Unauthenticated POST returns 401 | Critical | Part Categories Auth |
| TC-PCAT-018 | limit=1 returns at most one result | High | Part Categories Pagination |
| TC-PCAT-019 | offset beyond count returns empty list | Medium | Part Categories Pagination |
| TC-PCAT-020 | Ordering by valid fields returns 200 | Medium | Part Categories Ordering |
| TC-PCAT-021 | Ordering by invalid field returns 200 | Medium | Part Categories Ordering |
| TC-PCAT-022 | Search by created category name returns result | High | Part Categories Search |
| TC-PCAT-023 | description over max length (251 chars) returns 400 | Medium | Part Categories Validation |
| TC-PCAT-024 | parent=null accepted when nullable | Medium | Part Categories Validation |
| TC-PCAT-025 | Read-only field pk in POST body is ignored | Low | Part Categories Validation |
| TC-PCAT-026 | default_location set to non-existent ID returns 400 | Medium | Part Categories Relational Integrity |

---

## Parts CRUD

### TC-PART-001 — List parts returns paginated response

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/` |
| Test Type | Positive |

**Preconditions**
- InvenTree instance is running and accessible at `{{BASE_URL}}`
- `INVENTREE_API_TOKEN` env var is set for an admin user

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}` and query param `limit=10`
2. Observe the HTTP response status code
3. Inspect the response body

**Expected Result**
HTTP `200`. Response body is a JSON object containing `count` (integer), `results` (array), and optionally `next`/`previous` pagination links.

---

### TC-PART-002 — Create part with required field name

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/` |
| Test Type | Positive |

**Preconditions**
- InvenTree instance is running at `{{BASE_URL}}`
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Test Resistor", "description": "10k ohm resistor" }`
3. Observe the HTTP response status code
4. Inspect the response body

**Expected Result**
HTTP `201`. Response body contains `pk` (integer), `name: "Test Resistor"`, and `description: "10k ohm resistor"`.

**Notes**
Delete the created part (`pk`) after verifying to avoid data pollution.

---

### TC-PART-003 — Create part without name returns 400

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "description": "No name provided" }`
3. Observe the HTTP response status code
4. Inspect the response body

**Expected Result**
HTTP `400`. Response body contains a `name` key with a non-empty error message (e.g., `"This field is required."`).

---

### TC-PART-004 — Retrieve part by valid ID returns 200

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/{id}/` |
| Test Type | Positive |

**Preconditions**
- At least one part exists in the system with known `pk`
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/{{EXISTING_PART_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code
3. Inspect the response body

**Expected Result**
HTTP `200`. Response body contains `pk` matching `{{EXISTING_PART_ID}}`, `name` (non-empty string), `description`, and `active`.

---

### TC-PART-005 — Retrieve part by non-existent ID returns 404

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/{id}/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Part with `id=999999` does not exist

**Steps**
1. Send `GET {{BASE_URL}}/api/part/999999/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `404`.

---

### TC-PART-006 — Full update part with PUT returns 200

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `PUT /api/part/{id}/` |
| Test Type | Positive |

**Preconditions**
- A part with known `pk` exists
- Token auth is available

**Steps**
1. Send `PUT {{BASE_URL}}/api/part/{{PART_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to a full valid Part payload with `name` set to `"Updated Name"`
3. Observe the HTTP response status code
4. Inspect the response body

**Expected Result**
HTTP `200`. Response body contains `name: "Updated Name"` and the updated `pk` unchanged.

---

### TC-PART-007 — Partial update part with PATCH returns 200

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `PATCH /api/part/{id}/` |
| Test Type | Positive |

**Preconditions**
- A part with known `pk` exists
- Token auth is available

**Steps**
1. Send `PATCH {{BASE_URL}}/api/part/{{PART_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "description": "Patched description" }`
3. Observe the HTTP response status code
4. Inspect the response body

**Expected Result**
HTTP `200`. Response body contains `description: "Patched description"`. All other fields remain unchanged.

---

### TC-PART-008 — Delete part by valid ID returns 204

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `DELETE /api/part/{id}/` |
| Test Type | Positive |

**Preconditions**
- A part with known `pk` exists and has no stock or dependents
- Token auth is available

**Steps**
1. Send `DELETE {{BASE_URL}}/api/part/{{PART_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `204`. Response body is empty. Subsequent `GET /api/part/{{PART_ID}}/` returns `404`.

---

### TC-PART-009 — Delete non-existent part returns 404

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `DELETE /api/part/{id}/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Part with `id=999999` does not exist

**Steps**
1. Send `DELETE {{BASE_URL}}/api/part/999999/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `404`.

---

## Parts Auth

### TC-PART-010 — Unauthenticated GET returns 401

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/` |
| Test Type | Negative |

**Preconditions**
- No `Authorization` header is sent

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with `limit=1` and **no** `Authorization` header
2. Observe the HTTP response status code

**Expected Result**
HTTP `401`. Response body indicates authentication is required.

---

### TC-PART-011 — Unauthenticated POST returns 401

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/` |
| Test Type | Negative |

**Preconditions**
- No `Authorization` header is sent

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with body `{ "name": "Unauth Part" }` and **no** `Authorization` header
2. Observe the HTTP response status code

**Expected Result**
HTTP `401`. No part is created.

---

### TC-PART-012 — Unauthenticated DELETE returns 401

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `DELETE /api/part/{id}/` |
| Test Type | Negative |

**Preconditions**
- A part with known `pk` exists
- No `Authorization` header is sent

**Steps**
1. Send `DELETE {{BASE_URL}}/api/part/{{PART_ID}}/` with **no** `Authorization` header
2. Observe the HTTP response status code

**Expected Result**
HTTP `401`. The part is not deleted.

---

## Parts Pagination

### TC-PART-013 — limit=1 returns exactly one result

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/` — pagination |
| Test Type | Positive |

**Preconditions**
- At least 2 parts exist in the system
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=1&offset=0` and header `Authorization: Token {{TOKEN}}`
2. Observe the response body

**Expected Result**
HTTP `200`. `results` array contains exactly 1 item. `count` reflects the total number of parts (greater than 1). `next` link is present.

---

### TC-PART-014 — offset beyond total count returns empty list

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — pagination |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&offset=999999` and header `Authorization: Token {{TOKEN}}`
2. Observe the response body

**Expected Result**
HTTP `200`. `results` array is empty (`[]`). `count` reflects the actual total. `next` is `null`.

---

### TC-PART-015 — limit and offset together return non-overlapping pages

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — pagination |
| Test Type | Positive |

**Preconditions**
- At least 4 parts exist in the system
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with `limit=2&offset=0`
2. Record the `pk` values from the `results` array (page 1)
3. Send `GET {{BASE_URL}}/api/part/` with `limit=2&offset=2`
4. Record the `pk` values from the `results` array (page 2)

**Expected Result**
Both responses return HTTP `200`. No `pk` values appear in both pages. Each page contains at most 2 results.

---

## Parts Filtering

### TC-PART-016 — Filter by active=true returns only active parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/` — filter: active |
| Test Type | Positive |

**Preconditions**
- At least one active part exists
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=50&active=true` and header `Authorization: Token {{TOKEN}}`
2. Inspect all items in `results`

**Expected Result**
HTTP `200`. Every item in `results` has `active: true`.

---

### TC-PART-017 — Filter by valid category ID returns matching parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/` — filter: category |
| Test Type | Positive |

**Preconditions**
- At least one category with a known `pk` exists and has parts assigned to it
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=50&category={{CATEGORY_ID}}` and header `Authorization: Token {{TOKEN}}`
2. Inspect all items in `results`

**Expected Result**
HTTP `200`. Every item in `results` has `category` equal to `{{CATEGORY_ID}}`.

---

### TC-PART-018 — Filter by non-existent category returns empty list

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — filter: category |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Category `999999` does not exist

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&category=999999` and header `Authorization: Token {{TOKEN}}`
2. Inspect the response body

**Expected Result**
HTTP `200`. `count: 0` and `results: []`.

---

### TC-PART-019 — Filter purchaseable=true returns purchaseable parts

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — filter: purchaseable |
| Test Type | Positive |

**Preconditions**
- At least one part has `purchaseable: true`
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=50&purchaseable=true` and header `Authorization: Token {{TOKEN}}`
2. Inspect all items in `results`

**Expected Result**
HTTP `200`. Every item in `results` has `purchaseable: true`.

---

## Parts Ordering

### TC-PART-020 — Ordering by name ascending returns 200

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — ordering |
| Test Type | Positive |

**Preconditions**
- At least 2 parts exist
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&ordering=name` and header `Authorization: Token {{TOKEN}}`
2. Inspect the `results` array

**Expected Result**
HTTP `200`. Results are returned in ascending alphabetical order by `name`.

---

### TC-PART-021 — Ordering by creation_date descending returns 200

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — ordering |
| Test Type | Positive |

**Preconditions**
- At least 2 parts exist
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&ordering=-creation_date` and header `Authorization: Token {{TOKEN}}`
2. Inspect the `results` array

**Expected Result**
HTTP `200`. Results are returned in descending order by `creation_date` (newest first).

---

### TC-PART-022 — Ordering by invalid field returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — ordering |
| Test Type | Negative |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&ordering=not_a_valid_field` and header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains an error indicating the ordering value is invalid.

---

## Parts Search

### TC-PART-023 — Search by part name returns matching results

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/` — search |
| Test Type | Positive |

**Preconditions**
- At least one part with name containing "resistor" (case-insensitive) exists
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=20&search=resistor` and header `Authorization: Token {{TOKEN}}`
2. Inspect the `results` array

**Expected Result**
HTTP `200`. `count` is at least 1. All items in `results` have `name` or other indexed fields matching the search term.

---

### TC-PART-024 — Search with non-matching term returns empty list

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/` — search |
| Test Type | Negative |

**Preconditions**
- No part exists with the term "zzz_no_match_xyzxyz_99999" in any indexed field
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&search=zzz_no_match_xyzxyz_99999` and header `Authorization: Token {{TOKEN}}`
2. Inspect the response body

**Expected Result**
HTTP `200`. `count: 0` and `results: []`.

---

### TC-PART-025 — Search with special characters returns 200

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | `GET /api/part/` — search |
| Test Type | Edge Case |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/` with query params `limit=10&search=%25%26%22` (URL-encoded `%&"`) and header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `200`. No server error (no 500). Response body is a valid paginated JSON object.

---

## Parts Field Validation

### TC-PART-026 — name at max length (100 chars) is accepted

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: name |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "<100-character string>" }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `201`. Part is created with the 100-character name intact.

**Notes**
Delete the created part after verifying. Companion: TC-PART-027.

---

### TC-PART-027 — name over max length (101 chars) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: name |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "<101-character string>" }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `name` key with an error indicating the value is too long.

---

### TC-PART-028 — description over max length (251 chars) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: description |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Valid Name", "description": "<251-character string>" }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `description` key with a max-length error.

---

### TC-PART-029 — units over max length (21 chars) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: units |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Valid Name", "units": "123456789012345678901" }` (21 chars)
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `units` key with a max-length error.

---

### TC-PART-030 — default_expiry=0 (minimum boundary) is accepted

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: default_expiry |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Expiry Test Part", "default_expiry": 0 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `201`. Response body contains `default_expiry: 0`.

**Notes**
Delete the created part after verifying.

---

### TC-PART-031 — default_expiry=-1 (below minimum) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: default_expiry |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Expiry Test Part", "default_expiry": -1 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `default_expiry` key with a minimum-value error.

---

### TC-PART-032 — category=null accepted when field is nullable

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — field: category |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Uncategorized Part", "category": null }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `201`. Response body has `category: null`.

**Notes**
Delete the created part after verifying.

---

### TC-PART-033 — Read-only field pk in POST body is ignored

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | `POST /api/part/` — field: pk |
| Test Type | Edge Case |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "PK Override Test", "pk": 99999 }`
3. Observe the HTTP response status code and the returned `pk`

**Expected Result**
HTTP `201`. The `pk` in the response is a server-assigned integer, not `99999`.

**Notes**
Delete the created part after verifying.

---

## Parts Relational Integrity

### TC-PART-034 — category set to valid category ID is accepted

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `POST /api/part/` — relational field: category |
| Test Type | Positive |

**Preconditions**
- A category with known `pk` exists
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Categorized Part", "category": {{CATEGORY_ID}} }`
3. Observe the HTTP response status code and `category` in the response body

**Expected Result**
HTTP `201`. Response body has `category: {{CATEGORY_ID}}`.

**Notes**
Delete the created part after verifying.

---

### TC-PART-035 — category set to non-existent ID returns 400

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `POST /api/part/` — relational field: category |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Category `999999` does not exist

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Bad Category Part", "category": 999999 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `category` key with an error indicating the object does not exist.

---

### TC-PART-036 — default_location set to non-existent ID returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — relational field: default_location |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Stock location `999999` does not exist

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Bad Location Part", "default_location": 999999 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `default_location` key with an error.

---

### TC-PART-037 — variant_of set to non-existent part ID returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/` — relational field: variant_of |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Part `999999` does not exist

**Steps**
1. Send `POST {{BASE_URL}}/api/part/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Bad Variant Part", "variant_of": 999999 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `variant_of` key with an error indicating the referenced part does not exist.

---

## Part Categories CRUD

### TC-PCAT-001 — List categories returns paginated response

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/category/` |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}` and query param `limit=10`
2. Observe the HTTP response status code and body

**Expected Result**
HTTP `200`. Response body is a JSON object with `count`, `results` (array), and optional `next`/`previous` links.

---

### TC-PCAT-002 — Create category with required field name

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/category/` |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Test Electronics" }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `201`. Response body contains `pk` (integer), `name: "Test Electronics"`, `level` (integer), and `pathstring` (string).

**Notes**
Delete the created category after verifying.

---

### TC-PCAT-003 — Create category without name returns 400

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/category/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "description": "No name given" }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `400`. Response body contains a `name` key with an error message.

---

### TC-PCAT-004 — Retrieve category by valid ID returns 200

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/category/{id}/` |
| Test Type | Positive |

**Preconditions**
- At least one category exists with known `pk`
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/{{CATEGORY_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code and body

**Expected Result**
HTTP `200`. Response body contains `pk: {{CATEGORY_ID}}`, `name`, `level`, and `pathstring`.

---

### TC-PCAT-005 — Retrieve category by non-existent ID returns 404

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/category/{id}/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Category `999999` does not exist

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/999999/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `404`.

---

### TC-PCAT-006 — Partial update category with PATCH returns 200

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `PATCH /api/part/category/{id}/` |
| Test Type | Positive |

**Preconditions**
- A category with known `pk` exists
- Token auth is available

**Steps**
1. Send `PATCH {{BASE_URL}}/api/part/category/{{CATEGORY_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "description": "Updated description" }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `200`. Response body contains `description: "Updated description"`. The `name` and `pk` remain unchanged.

---

### TC-PCAT-007 — Delete category by valid ID returns 204

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `DELETE /api/part/category/{id}/` |
| Test Type | Positive |

**Preconditions**
- A category with known `pk` exists with no parts assigned
- Token auth is available

**Steps**
1. Send `DELETE {{BASE_URL}}/api/part/category/{{CATEGORY_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `204`. Response body is empty. Subsequent `GET /api/part/category/{{CATEGORY_ID}}/` returns `404`.

---

## Part Categories Auth

### TC-PCAT-008 — Unauthenticated GET categories returns 401

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `GET /api/part/category/` |
| Test Type | Negative |

**Preconditions**
- No `Authorization` header is sent

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query `limit=1` and **no** `Authorization` header
2. Observe the HTTP response status code

**Expected Result**
HTTP `401`.

---

## Part Categories Filtering

### TC-PCAT-009 — Filter by top_level=true returns root categories

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/category/` — filter: top_level |
| Test Type | Positive |

**Preconditions**
- At least one root-level category (no parent) exists
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=50&top_level=true` and header `Authorization: Token {{TOKEN}}`
2. Inspect all items in `results`

**Expected Result**
HTTP `200`. Every item in `results` has `parent: null`.

---

### TC-PCAT-010 — Filter by parent ID returns child categories only

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/category/` — filter: parent |
| Test Type | Positive |

**Preconditions**
- A parent category with known `pk` exists and has at least one child category
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=50&parent={{PARENT_CATEGORY_ID}}` and header `Authorization: Token {{TOKEN}}`
2. Inspect all items in `results`

**Expected Result**
HTTP `200`. Every item in `results` has `parent: {{PARENT_CATEGORY_ID}}`.

---

## Part Categories Search

### TC-PCAT-011 — Search by category name returns matching results

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/category/` — search |
| Test Type | Positive |

**Preconditions**
- At least one category exists with "electronics" in its name or description
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=20&search=electronics` and header `Authorization: Token {{TOKEN}}`
2. Inspect the response

**Expected Result**
HTTP `200`. At least one result is returned. All results have "electronics" present in `name`, `description`, or `pathstring`.

---

## Part Categories Validation

### TC-PCAT-012 — name over max length (101 chars) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/category/` — field: name |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "<101-character string>" }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `name` key with a max-length error.

---

## Part Categories Relational Integrity

### TC-PCAT-013 — parent set to non-existent ID returns 400

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `POST /api/part/category/` — relational field: parent |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Category `999999` does not exist

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Child Category", "parent": 999999 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `parent` key with an error indicating the object does not exist.

---

### TC-PCAT-014 — Create child category with valid parent ID

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `POST /api/part/category/` — relational field: parent |
| Test Type | Positive |

**Preconditions**
- A parent category with known `pk` exists
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Sub-Electronics", "parent": {{PARENT_CATEGORY_ID}} }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `201`. Response body contains `parent: {{PARENT_CATEGORY_ID}}` and `level` greater than 0. The `pathstring` includes the parent's name.

**Notes**
Delete the created child category after verifying.

---

### TC-PCAT-015 — Delete non-existent category returns 404

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `DELETE /api/part/category/{id}/` |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Category `999999` does not exist

**Steps**
1. Send `DELETE {{BASE_URL}}/api/part/category/999999/` with header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `404`.

---

### TC-PCAT-016 — Full update category with PUT returns 200

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `PUT /api/part/category/{id}/` |
| Test Type | Positive |

**Preconditions**
- A category with known `pk` exists
- Token auth is available

**Steps**
1. Send `PUT {{BASE_URL}}/api/part/category/{{CATEGORY_ID}}/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Updated Category Name" }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `200`. Response body contains `name: "Updated Category Name"`.

**Notes**
Delete the category after verifying.

---

### TC-PCAT-017 — Unauthenticated POST returns 401

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | `POST /api/part/category/` |
| Test Type | Negative |

**Preconditions**
- No `Authorization` header is sent

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with body `{ "name": "Unauth Category" }` and **no** `Authorization` header
2. Observe the HTTP response status code

**Expected Result**
HTTP `401`. No category is created.

---

## Part Categories Pagination

### TC-PCAT-018 — limit=1 returns at most one result

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/category/` — pagination |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=1&offset=0` and header `Authorization: Token {{TOKEN}}`
2. Observe the `results` array length

**Expected Result**
HTTP `200`. `results` contains at most 1 item.

---

### TC-PCAT-019 — offset beyond count returns empty list

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/category/` — pagination |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=10&offset=999999` and header `Authorization: Token {{TOKEN}}`
2. Observe the response body

**Expected Result**
HTTP `200`. `results` array is empty (`[]`).

---

## Part Categories Ordering

### TC-PCAT-020 — Ordering by valid fields returns 200

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/category/` — ordering |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. For each value in `[name, -name, pathstring, -pathstring, level, -level, part_count, -part_count]`:
   Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=5&ordering=<value>` and header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code for each request

**Expected Result**
HTTP `200` for every valid ordering value.

---

### TC-PCAT-021 — Ordering by invalid field returns 200

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `GET /api/part/category/` — ordering |
| Test Type | Negative |

**Preconditions**
- Token auth is available

**Steps**
1. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=10&ordering=not_a_valid_field` and header `Authorization: Token {{TOKEN}}`
2. Observe the HTTP response status code

**Expected Result**
HTTP `200`. API silently ignores unknown ordering values.

---

## Part Categories Search (extended)

### TC-PCAT-022 — Search by created category name returns result

| Field | Value |
|-------|-------|
| Priority | High |
| Component | `GET /api/part/category/` — search |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Create a category named `"Searchable Category XYZ"` via `POST /api/part/category/`
2. Send `GET {{BASE_URL}}/api/part/category/` with query params `limit=10&search=Searchable+Category+XYZ` and header `Authorization: Token {{TOKEN}}`
3. Inspect the `results` array
4. Delete the created category

**Expected Result**
HTTP `200`. The created category's `pk` appears in `results`.

---

## Part Categories Validation (extended)

### TC-PCAT-023 — description over max length (251 chars) returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/category/` — field: description |
| Test Type | Boundary |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Valid Name", "description": "<251-character string>" }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `description` key with a max-length error.

---

### TC-PCAT-024 — parent=null accepted when nullable

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/category/` — field: parent |
| Test Type | Positive |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Root Category", "parent": null }`
3. Observe the HTTP response status code and body

**Expected Result**
HTTP `201`. Response body has `parent: null`.

**Notes**
Delete the created category after verifying.

---

### TC-PCAT-025 — Read-only field pk in POST body is ignored

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | `POST /api/part/category/` — field: pk |
| Test Type | Edge Case |

**Preconditions**
- Token auth is available

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "PK Override Cat", "pk": 99999 }`
3. Observe the HTTP response status code and returned `pk`

**Expected Result**
HTTP `201`. The `pk` in the response is server-assigned, not `99999`.

**Notes**
Delete the created category after verifying.

---

## Part Categories Relational Integrity (extended)

### TC-PCAT-026 — default_location set to non-existent ID returns 400

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | `POST /api/part/category/` — relational field: default_location |
| Test Type | Negative |

**Preconditions**
- Token auth is available
- Stock location `999999` does not exist

**Steps**
1. Send `POST {{BASE_URL}}/api/part/category/` with header `Authorization: Token {{TOKEN}}`
2. Set request body to: `{ "name": "Bad Location Category", "default_location": 999999 }`
3. Observe the HTTP response status code

**Expected Result**
HTTP `400`. Response body contains a `default_location` key with an error.
