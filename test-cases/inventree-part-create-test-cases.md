# Manual Test Cases — Creating a Part

**Source**: `https://github.com/inventree/InvenTree/blob/master/docs/docs/part/create.md`
**Generated**: 2026-04-13
**Total cases**: 15

---

## Test Case Summary

| ID | Title | Priority | Area |
|----|-------|----------|------|
| TC-PERM-001 | Add Parts menu hidden for user without create permission | Critical | Permissions |
| TC-PERM-002 | Add Parts menu visible for user with create permission | Critical | Permissions |
| TC-PCRT-001 | Create part successfully with all required fields | Critical | Part Creation |
| TC-PCRT-002 | Form submission blocked when required fields have errors | High | Part Creation |
| TC-PCRT-003 | Browser redirected to new part detail page after creation | High | Part Creation |
| TC-STCK-001 | Initial Stock section hidden when setting is disabled | Medium | Initial Stock |
| TC-STCK-002 | Initial Stock section shown when setting is enabled | Medium | Initial Stock |
| TC-STCK-003 | Initial stock created for new part when checkbox is checked | High | Initial Stock |
| TC-SUPL-001 | Supplier options not shown when part is not Purchaseable | Medium | Supplier Options |
| TC-SUPL-002 | Supplier options shown when part is marked as Purchaseable | High | Supplier Options |
| TC-SUPL-003 | Supplier and manufacturer fields appear when Add Supplier Data is checked | High | Supplier Options |
| TC-FIMP-001 | Import from File opens the data import wizard | High | File Import |
| TC-SIMP-001 | Import from Supplier unavailable without a supplier plugin installed | High | Supplier Import |
| TC-SIMP-002 | Import Part button present in Part Category view with plugin installed | High | Supplier Import |
| TC-SIMP-003 | Import supplier part for an existing part via the supplier panel | High | Supplier Import |

---

## Permissions

### TC-PERM-001 — Add Parts menu hidden for user without create permission

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Parts view — Add Parts menu |
| Test Type | Negative |

**Preconditions**
- A user account exists that does NOT have "create" permission on the *Part* permission group
- The user is logged in

**Steps**
1. Navigate to the *Parts* view in the InvenTree web interface
2. Observe the toolbar/controls above the parts table

**Expected Result**
The *Add Parts* dropdown menu is not visible anywhere above the parts table. No button or control for adding parts is present for this user.

---

### TC-PERM-002 — Add Parts menu visible for user with create permission

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Parts view — Add Parts menu |
| Test Type | Positive |

**Preconditions**
- A user account exists that HAS "create" permission on the *Part* permission group
- The user is logged in

**Steps**
1. Navigate to the *Parts* view in the InvenTree web interface
2. Observe the toolbar/controls above the parts table

**Expected Result**
The *Add Parts* dropdown menu is displayed above the parts table and is clickable.

---

## Part Creation

### TC-PCRT-001 — Create part successfully with all required fields

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Create Part form |
| Test Type | Positive |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The user is on the *Parts* view

**Steps**
1. Click the *Add Parts* dropdown menu
2. Select *Create Part* from the menu
3. Verify the part creation form opens
4. Fill in all required fields with valid values
5. Click *Submit*

**Expected Result**
The form is submitted without errors. The browser redirects to the newly created part's detail page. The part detail page displays the values entered in the form.

---

### TC-PCRT-002 — Form submission blocked when required fields have errors

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Create Part form |
| Test Type | Negative |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The Create Part form is open

**Steps**
1. Leave at least one required field empty or enter an invalid value
2. Click *Submit*

**Expected Result**
The form does not submit. One or more inline error messages are displayed next to the invalid or missing fields. The user remains on the Create Part form.

---

### TC-PCRT-003 — Browser redirected to new part detail page after creation

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Create Part form |
| Test Type | Positive |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The Create Part form has been filled in with valid required values

**Steps**
1. Click *Submit* on the Create Part form
2. Observe the browser URL and page content after submission

**Expected Result**
The browser navigates away from the form and loads the detail page for the newly created part. The URL reflects the new part (e.g., contains the part's ID). The part's name and attributes entered during creation are visible on the page.

---

## Initial Stock

### TC-STCK-001 — Initial Stock section hidden when setting is disabled

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Create Part form — Initial Stock section |
| Test Type | Negative |

**Preconditions**
- The *Create Initial Stock* global setting is **disabled**
- The Create Part form is open

**Steps**
1. Inspect the Create Part form for an Initial Stock section or a *Create Initial Stock* checkbox

**Expected Result**
No Initial Stock section or *Create Initial Stock* checkbox is visible in the form.

---

### TC-STCK-002 — Initial Stock section shown when setting is enabled

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Create Part form — Initial Stock section |
| Test Type | Positive |

**Preconditions**
- The *Create Initial Stock* global setting is **enabled**
- The Create Part form is open

**Steps**
1. Inspect the Create Part form for an Initial Stock section

**Expected Result**
An Initial Stock section is visible in the Create Part form, containing at minimum a *Create Initial Stock* checkbox.

---

### TC-STCK-003 — Initial stock created for new part when checkbox is checked

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Create Part form — Initial Stock section |
| Test Type | Positive |

**Preconditions**
- The *Create Initial Stock* global setting is **enabled**
- The Create Part form is open

**Steps**
1. Fill in all required part fields with valid values
2. Locate the Initial Stock section and check the *Create Initial Stock* checkbox
3. Enter a valid initial stock quantity in the quantity field
4. Click *Submit*

**Expected Result**
The part is created and the browser redirects to the new part detail page. The stock section of the part detail page shows the initial stock quantity that was entered during creation.

---

## Supplier Options

### TC-SUPL-001 — Supplier options not shown when part is not Purchaseable

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Create Part form — Supplier Options |
| Test Type | Negative |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The Create Part form is open

**Steps**
1. Ensure the *Purchaseable* checkbox/toggle is **unchecked** in the form
2. Observe the form for a supplier options section

**Expected Result**
No supplier options section is displayed in the form. There is no *Add Supplier Data* option or supplier/manufacturer fields visible.

---

### TC-SUPL-002 — Supplier options shown when part is marked as Purchaseable

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Create Part form — Supplier Options |
| Test Type | Positive |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The Create Part form is open

**Steps**
1. Check the *Purchaseable* checkbox/toggle in the form
2. Observe the form for a supplier options section

**Expected Result**
A supplier options section becomes visible in the form, including at minimum an *Add Supplier Data* checkbox/option.

---

### TC-SUPL-003 — Supplier and manufacturer fields appear when Add Supplier Data is checked

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Create Part form — Supplier Options |
| Test Type | Positive |

**Preconditions**
- The Create Part form is open
- The *Purchaseable* option is checked so that the supplier options section is visible

**Steps**
1. Check the *Add Supplier Data* checkbox in the supplier options section
2. Observe the form for additional supplier/manufacturer fields

**Expected Result**
Additional input fields for supplier part information and manufacturer part information become visible in the form.

---

## File Import

### TC-FIMP-001 — Import from File opens the data import wizard

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Parts view — Import from File |
| Test Type | Positive |

**Preconditions**
- The logged-in user has "create" permission on the *Part* permission group
- The user is on the *Parts* view

**Steps**
1. Click the *Add Parts* dropdown menu
2. Select *Import from File* from the menu

**Expected Result**
The data import wizard opens, displaying the first step of the import process. The wizard presents controls to select or upload an external file.

---

## Supplier Import

### TC-SIMP-001 — Import from Supplier unavailable without a supplier plugin installed

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Category view — Import Part |
| Test Type | Negative |

**Preconditions**
- No supplier mixin plugin is installed in the InvenTree instance
- The logged-in user has appropriate permissions

**Steps**
1. Navigate to a *Part Category* view
2. Look for an *Import Part* button or any supplier import option

**Expected Result**
No *Import Part* button or supplier import option is visible or available. The feature is absent without the required plugin.

---

### TC-SIMP-002 — Import Part button present in Part Category view with plugin installed

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Category view — Import Part |
| Test Type | Positive |

**Preconditions**
- A supplier mixin plugin is installed
- The plugin has been configured with the supplier company setting (and any required API tokens)
- The logged-in user has appropriate permissions
- The user is on a *Part Category* view

**Steps**
1. Locate the *Import Part* button in the Part Category view
2. Click the *Import Part* button
3. Follow the wizard: confirm the category, select parameters, and optionally create initial stock

**Expected Result**
The Import Part wizard opens. The user is able to progress through the steps (confirm category → select parameters → create initial stock). After completing the wizard, the new part appears in the part category.

**Notes**
Also verify that parts, supplier parts, and manufacturer parts are all created automatically as described.

---

### TC-SIMP-003 — Import supplier part for an existing part via the supplier panel

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part detail — Supplier panel |
| Test Type | Positive |

**Preconditions**
- A part already exists in the system
- A supplier mixin plugin is installed and configured
- The logged-in user has appropriate permissions
- The user is on the detail page of the existing part

**Steps**
1. Navigate to the *Supplier* panel/tab on the part detail page
2. Click the *Import supplier part* button
3. Follow any prompts or wizard steps to complete the import

**Expected Result**
The supplier part (and its corresponding manufacturer part) is imported and associated with the existing part. The supplier panel updates to show the newly imported supplier part entry.
