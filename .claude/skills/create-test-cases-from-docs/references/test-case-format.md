# Test Case Format Reference

Detailed format specification, priority guidance, worked examples, and anti-patterns for the `md-to-test-cases` skill.

---

## Full Test Case Template

```markdown
### TC-<AREA>-<NNN> — <Short imperative title>

| Field | Value |
|-------|-------|
| Priority | Critical \| High \| Medium \| Low |
| Component | <Component, page, module, or API endpoint> |
| Test Type | Positive \| Negative \| Boundary \| Edge Case |

**Preconditions**
- <State that must exist before starting>
- <Data or accounts that must be set up>
- (write "None" if there are no preconditions)

**Steps**
1. <Single, concrete action — what to click, enter, call, or observe>
2. <Next action>
3. <Continue until the scenario is complete>

**Expected Result**
<One or more sentences describing the observable, verifiable outcome the tester should see.
Do NOT describe internal state — describe what appears in the UI, response body, log, etc.>

**Notes** *(optional)*
<Clarifications, related test IDs, known issues, or test data hints>
```

---

## Priority Definitions

| Priority | When to Use | Examples |
|----------|-------------|---------|
| **Critical** | System cannot be used without this working; data loss or security risk if broken | Login, checkout, data save, auth checks |
| **High** | Important feature; broken state significantly degrades UX | Search, filtering, form submission, error recovery |
| **Medium** | Secondary or less-traveled path; failure is noticeable but not blocking | Pagination, sorting, optional fields, settings |
| **Low** | Cosmetic, edge-of-edge-case, rarely-used option | Tooltip text, theme toggle, keyboard shortcut |

---

## Test ID Convention

Format: `TC-<AREA>-<NNN>`

- `AREA`: 2–5 uppercase letters abbreviating the feature area (e.g., `AUTH`, `CART`, `API`, `USER`, `DASH`, `SRCH`)
- `NNN`: zero-padded sequential number within that area (`001`, `002`, …)

Examples:
- `TC-AUTH-001` — First authentication test
- `TC-CART-003` — Third shopping cart test
- `TC-API-012` — Twelfth API test

---

## Worked Examples

### Example 1 — Positive (Happy Path)

Source doc excerpt:
> Users can log in with their email and password. On success they are redirected to the dashboard.

```markdown
### TC-AUTH-001 — Successful login with valid credentials

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Login page |
| Test Type | Positive |

**Preconditions**
- A registered user account exists with email `test@example.com` and password `ValidPass1!`
- User is not currently logged in

**Steps**
1. Navigate to `/login`
2. Enter `test@example.com` in the Email field
3. Enter `ValidPass1!` in the Password field
4. Click the **Log In** button

**Expected Result**
The user is redirected to `/dashboard`. The dashboard page loads and displays the user's name in the top navigation bar.
```

---

### Example 2 — Negative (Validation)

Source doc excerpt:
> The password field requires at least 8 characters. If the password is too short, an inline error "Password must be at least 8 characters" is shown.

```markdown
### TC-AUTH-003 — Login rejected when password is too short

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Login page |
| Test Type | Negative |

**Preconditions**
- User is on the `/login` page

**Steps**
1. Enter any valid email address in the Email field
2. Enter `abc` (3 characters) in the Password field
3. Click the **Log In** button

**Expected Result**
The form does not submit. An inline error message "Password must be at least 8 characters" appears below the Password field. The user remains on `/login`.
```

---

### Example 3 — Boundary Value

Source doc excerpt:
> Usernames must be between 3 and 20 characters.

```markdown
### TC-USER-007 — Username accepted at minimum boundary (3 characters)

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Registration form |
| Test Type | Boundary |

**Preconditions**
- User is on the `/register` page

**Steps**
1. Enter `abc` (exactly 3 characters) in the Username field
2. Fill in all other required fields with valid values
3. Click **Create Account**

**Expected Result**
The account is created successfully. The user sees a success confirmation or is redirected to the onboarding page.

**Notes**
Companion tests: TC-USER-008 (2-char username rejected), TC-USER-009 (20-char accepted), TC-USER-010 (21-char rejected)
```

---

### Example 4 — Permission / Role

Source doc excerpt:
> Only admin users can delete other accounts. Regular users see the Delete button grayed out.

```markdown
### TC-USER-015 — Non-admin user cannot delete another account

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | User management |
| Test Type | Negative |

**Preconditions**
- Two accounts exist: one regular user (`user@example.com`) and one target account
- The regular user is logged in

**Steps**
1. Navigate to the User Management page
2. Locate the target account in the list
3. Observe the Delete button state
4. Attempt to click the Delete button (or the grayed-out area)

**Expected Result**
The Delete button is visually disabled (grayed out). No click event fires. No confirmation dialog appears. The target account is not deleted.
```

---

## Summary Table Template

Include this at the top of the output document:

```markdown
## Test Case Summary

| ID | Title | Priority | Area |
|----|-------|----------|------|
| TC-AUTH-001 | Successful login with valid credentials | Critical | Authentication |
| TC-AUTH-002 | Login fails with incorrect password | High | Authentication |
| TC-AUTH-003 | Login rejected when password is too short | High | Authentication |
| TC-USER-007 | Username accepted at minimum boundary | Medium | Registration |
```

---

## Anti-Patterns to Avoid

### Vague expected results

❌ **Bad:**
> The system works correctly.

✅ **Good:**
> The page displays a green toast notification: "Settings saved." The new value appears in the profile section immediately.

---

### Steps that bundle multiple actions

❌ **Bad:**
> 1. Fill in the form and submit it.

✅ **Good:**
> 1. Enter `John` in the First Name field.
> 2. Enter `Doe` in the Last Name field.
> 3. Click the **Save** button.

---

### Preconditions buried in steps

❌ **Bad:**
> 1. Create a new account.
> 2. Log in as that account.
> 3. Navigate to Settings.

✅ **Good:**
> **Preconditions:** A registered account exists with email `user@example.com` and password `TestPass1!`
>
> **Steps:**
> 1. Log in as `user@example.com`
> 2. Navigate to Settings

---

### Internal-state expected results

❌ **Bad:**
> The `is_verified` flag is set to `true` in the database.

✅ **Good:**
> The user receives a confirmation email. The account status on the profile page shows "Verified".

---

### Missing negative tests

If the doc says "X is required", generate **both**:
- Positive: X provided → success
- Negative: X omitted → descriptive error shown

---

## Mapping Doc Signals to Test Types

| Doc Signal | Test Types to Generate |
|------------|----------------------|
| "must", "required" | Positive (provided) + Negative (omitted/invalid) |
| "cannot", "not allowed" | Negative (attempt blocked) + Positive (allowed case) |
| "between N and M" | Boundary at N, N-1, M, M+1 |
| "only [role] can" | Authorized access + Unauthorized access |
| "shows error when" | Negative triggering that error |
| "redirects to" | Positive flow completion |
| "supports [options]" | One test per option |
| "if [condition], then [result]" | Condition true + Condition false |
