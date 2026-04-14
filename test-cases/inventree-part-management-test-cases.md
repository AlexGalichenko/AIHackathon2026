# Manual Test Cases — InvenTree Part Management

**Source**: `https://github.com/inventree/InvenTree/tree/master/docs/docs/part`
**Generated**: 2026-04-14
**Total cases**: 60

---

## Summary Table

| Test ID | Title | Priority |
|---------|-------|----------|
| TC-PART-001 | Create part via web interface (happy path) | Critical |
| TC-PART-002 | Attempt part creation without permissions | Critical |
| TC-PART-003 | Submit part creation form with missing required fields | High |
| TC-PART-004 | Import parts from file via wizard | High |
| TC-PART-005 | Create part with initial stock enabled | Medium |
| TC-PART-006 | Supplier options only visible for purchaseable parts | Medium |
| TC-PART-007 | Locked part cannot be deleted | High |
| TC-PART-008 | Mark part as inactive | Medium |
| TC-VIEW-001 | View part details section | High |
| TC-VIEW-002 | Variants tab visible only for template parts | High |
| TC-VIEW-003 | BOM tab visible only for assembly parts | High |
| TC-VIEW-004 | Allocations tab visible for component or salable parts | High |
| TC-VIEW-005 | Suppliers and Purchase Orders tabs visible for purchaseable parts | High |
| TC-VIEW-006 | Test Templates tab visible only for testable parts | High |
| TC-VIEW-007 | Used In tab visible only for component parts | Medium |
| TC-VIEW-008 | Export stock data from stock tab | Medium |
| TC-VIEW-009 | Upload file attachment to part | Medium |
| TC-VIEW-010 | Add notes with markdown formatting | Low |
| TC-VIEW-011 | Navigate part categories via breadcrumb | Low |
| TC-REV-001 | Create a revision of an existing part | High |
| TC-REV-002 | Prevent self-referencing revision (circular reference) | High |
| TC-REV-003 | Prevent duplicate revision numbers on same part | High |
| TC-REV-004 | Template parts cannot have revisions | Medium |
| TC-REV-005 | Navigate between revisions using dropdown selector | Medium |
| TC-REV-006 | Original part data unaffected after creating revision | High |
| TC-TMPL-001 | Enable template status on a part | High |
| TC-TMPL-002 | Create a variant from a template part | High |
| TC-TMPL-003 | Variant cannot be created on non-template part | High |
| TC-TMPL-004 | Serial numbers unique across template and all variants | Critical |
| TC-TMPL-005 | Template stock count aggregates all variant stock | High |
| TC-TRACK-001 | Mark part as trackable | High |
| TC-TRACK-002 | Trackable stock item requires batch or serial number | Critical |
| TC-TRACK-003 | Create trackable stock item without serial/batch — rejected | Critical |
| TC-TRACK-004 | Serial number entry with single value | Medium |
| TC-TRACK-005 | Serial number entry with comma-separated values | Medium |
| TC-TRACK-006 | Serial number entry with range notation | Medium |
| TC-TRACK-007 | Serial number auto-increment with tilde (~) | Medium |
| TC-TRACK-008 | Serial number open-ended + notation | Medium |
| TC-VIRT-001 | Create a virtual part | High |
| TC-VIRT-002 | Stock UI elements hidden for virtual part | High |
| TC-VIRT-003 | Add virtual part to Bill of Materials | High |
| TC-VIRT-004 | Virtual part cost included in BOM cost calculation | High |
| TC-VIRT-005 | Attempt to create stock item for virtual part | Critical |
| TC-PRICE-001 | View pricing tab for a part | Medium |
| TC-PRICE-002 | Add internal price break | Medium |
| TC-PRICE-003 | Set manual price override | Medium |
| TC-PRICE-004 | View purchase history pricing for purchaseable part | Medium |
| TC-PRICE-005 | Purchase history not shown for non-purchaseable part | Medium |
| TC-PRICE-006 | BOM pricing incomplete when some items lack pricing data | High |
| TC-PRICE-007 | Manually refresh pricing data | Low |
| TC-STKT-001 | Stock history tab hidden when feature disabled | High |
| TC-STKT-002 | Generate manual stocktake entry | High |
| TC-STKT-003 | Generate stocktake report filtered by part | Medium |
| TC-STKT-004 | Generate stocktake report with no filter returns all records | Medium |
| TC-TEST-001 | Create test template for a testable part | High |
| TC-TEST-002 | Test key auto-generated from test name | High |
| TC-TEST-003 | Duplicate test template name rejected | High |
| TC-TEST-004 | Disable test template preserves historical test results | High |
| TC-TEST-005 | Delete test template removes all associated results | Critical |
| TC-NOTIF-001 | Subscribe to part and receive low stock notification | High |
| TC-NOTIF-002 | Category subscription cascades to subcategories and parts | Medium |
| TC-NOTIF-003 | Delete notifications individually and in bulk | Low |

---

## Part Creation (PART)

### TC-PART-001 — Create part via web interface (happy path)

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Part Management |

**Preconditions**
- User is logged in with "create" permission for the Part permission group
- The Parts view is accessible

**Steps**
1. Navigate to the Parts section
2. Click the "Add Parts" dropdown menu
3. Select the option to create a new part manually
4. Fill in all required fields: Name, Category, and other required attributes
5. Click Submit

**Expected Result**
The part is created successfully. The browser redirects to the new part's detail page displaying the entered information.

---

### TC-PART-002 — Attempt part creation without permissions

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Part Management / Permissions |

**Preconditions**
- User is logged in but does NOT have "create" permission for the Part permission group

**Steps**
1. Navigate to the Parts section
2. Attempt to click or locate the "Add Parts" button

**Expected Result**
The "Add Parts" button is either not visible or clicking it results in an access-denied error. No part creation form is opened.

---

### TC-PART-003 — Submit part creation form with missing required fields

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Management / Validation |

**Preconditions**
- User is logged in with "create" permission for the Part permission group
- The part creation form is open

**Steps**
1. Open the part creation form via "Add Parts" dropdown
2. Leave the required "Name" field empty
3. Click Submit

**Expected Result**
The form displays a validation error indicating required fields are missing. The form is not submitted and no part is created.

---

### TC-PART-004 — Import parts from file via wizard

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Management / Import |

**Preconditions**
- User is logged in with appropriate import permissions
- A valid import file (CSV or supported format) is available

**Steps**
1. Navigate to the Parts section
2. Click the "Add Parts" dropdown menu
3. Select "Import from File"
4. Upload the import file in the wizard
5. Map the required fields as prompted
6. Complete and submit the wizard

**Expected Result**
The wizard completes successfully. Parts from the file are imported into the system and visible in the Parts list.

---

### TC-PART-005 — Create part with initial stock enabled

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Management / Stock |

**Preconditions**
- User is logged in with part create permissions
- The "Create Initial Stock" system setting is enabled

**Steps**
1. Open the part creation form
2. Scroll to the "Initial Stock" section
3. Check the "Create Initial Stock" checkbox
4. Enter an initial quantity (e.g., 100)
5. Submit the form

**Expected Result**
The part is created and the specified initial stock quantity is reflected in the Stock tab of the new part's detail page.

---

### TC-PART-006 — Supplier options only visible for purchaseable parts

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Management / Supplier |

**Preconditions**
- User is logged in with part create permissions

**Steps**
1. Open the part creation form
2. Ensure the "Purchaseable" checkbox is unchecked
3. Observe whether the Supplier Options section is visible
4. Check the "Purchaseable" checkbox
5. Observe whether the Supplier Options section appears

**Expected Result**
Supplier Options section is hidden when "Purchaseable" is unchecked. After checking "Purchaseable", the Supplier Options section appears, allowing manufacturer and supplier information to be entered.

---

### TC-PART-007 — Locked part cannot be deleted

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Management / Locked |

**Preconditions**
- A part with "Locked" status exists in the system
- User has admin/delete permissions

**Steps**
1. Navigate to the locked part's detail page
2. Open the actions menu
3. Attempt to find or click the "Delete Part" option

**Expected Result**
The delete action is either absent or disabled. Attempting to delete returns an error stating the part is locked and cannot be deleted.

---

### TC-PART-008 — Mark part as inactive

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Management / Lifecycle |

**Preconditions**
- An active part exists
- User has edit permissions

**Steps**
1. Navigate to the part's detail page
2. Open the part edit form
3. Uncheck the "Active" toggle
4. Save the changes

**Expected Result**
The part is marked as inactive. It remains visible in the database but is restricted from many actions (e.g., cannot be added to new orders). The part detail page reflects the inactive status.

---

## Part Views (VIEW)

### TC-VIEW-001 — View part details section

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views |

**Preconditions**
- A part with IPN, name, description, revision, keywords, and external link is configured

**Steps**
1. Navigate to the part's detail page
2. Click "Show Part Details" toggle button

**Expected Result**
The details section expands and displays: Internal Part Number (IPN), Name, Description, Revision, Keywords, External Link, Creation Date, and Units.

---

### TC-VIEW-002 — Variants tab visible only for template parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views / Tabs |

**Preconditions**
- A standard (non-template) part exists
- A template part exists

**Steps**
1. Navigate to the standard part's detail page
2. Observe the available tabs
3. Navigate to the template part's detail page
4. Observe the available tabs

**Expected Result**
The "Variants" tab is absent on the standard part. The "Variants" tab is present and accessible on the template part.

---

### TC-VIEW-003 — BOM tab visible only for assembly parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views / Tabs |

**Preconditions**
- A non-assembly part exists
- An assembly part exists

**Steps**
1. Navigate to the non-assembly part's detail page
2. Check for a "Bill of Materials" tab
3. Navigate to the assembly part's detail page
4. Check for a "Bill of Materials" tab

**Expected Result**
The BOM tab is not present on non-assembly parts. The BOM tab is present on assembly parts.

---

### TC-VIEW-004 — Allocations tab visible for component or salable parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views / Tabs |

**Preconditions**
- A part marked as "Component" or "Salable" exists
- A part that is neither Component nor Salable exists

**Steps**
1. Navigate to the component/salable part's detail page
2. Verify the "Allocations" tab is present
3. Navigate to the non-component, non-salable part's detail page
4. Verify the "Allocations" tab is absent

**Expected Result**
The Allocations tab appears only on parts flagged as Component or Salable.

---

### TC-VIEW-005 — Suppliers and Purchase Orders tabs visible for purchaseable parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views / Tabs |

**Preconditions**
- A "Purchaseable" part and a non-purchaseable part exist

**Steps**
1. Navigate to the non-purchaseable part's detail page
2. Verify "Suppliers" and "Purchase Orders" tabs are absent
3. Navigate to the purchaseable part's detail page
4. Verify "Suppliers" and "Purchase Orders" tabs are present

**Expected Result**
Supplier-related tabs appear only for parts flagged as Purchaseable.

---

### TC-VIEW-006 — Test Templates tab visible only for testable parts

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Views / Tabs |

**Preconditions**
- A "Testable" part and a non-testable part exist

**Steps**
1. Navigate to the non-testable part and verify "Test Templates" tab is absent
2. Navigate to the testable part and verify "Test Templates" tab is present

**Expected Result**
Test Templates tab is only visible on parts marked as Testable.

---

### TC-VIEW-007 — Used In tab visible only for component parts

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Views / Tabs |

**Preconditions**
- A part marked as "Component" and a non-component part exist

**Steps**
1. Navigate to the non-component part's detail page
2. Verify "Used In" tab is absent
3. Navigate to the component part's detail page
4. Verify "Used In" tab is present

**Expected Result**
"Used In" tab appears only on parts flagged as Component.

---

### TC-VIEW-008 — Export stock data from stock tab

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Views / Stock |

**Preconditions**
- A part with existing stock items is available

**Steps**
1. Navigate to the part's detail page
2. Click the "Stock" tab
3. Click the export dialog/button
4. Select export format and confirm

**Expected Result**
A file (CSV or specified format) containing the part's stock data is downloaded successfully.

---

### TC-VIEW-009 — Upload file attachment to part

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Views / Attachments |

**Preconditions**
- User is logged in with edit permissions
- A file to upload (e.g., a datasheet PDF) is available

**Steps**
1. Navigate to the part's detail page
2. Click the "Attachments" tab
3. Click the upload button
4. Select a file and confirm the upload

**Expected Result**
The uploaded file appears in the Attachments tab with its filename listed.

---

### TC-VIEW-010 — Add notes with markdown formatting

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | Part Views / Notes |

**Preconditions**
- User is logged in with edit permissions

**Steps**
1. Navigate to the part's detail page
2. Click the "Notes" tab
3. Enter text with markdown formatting (e.g., `## Heading`, `**bold**`, `- list item`)
4. Save the notes

**Expected Result**
The notes are saved and the markdown is rendered correctly (headings, bold text, list items displayed as formatted HTML).

---

### TC-VIEW-011 — Navigate part categories via breadcrumb

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | Part Views / Navigation |

**Preconditions**
- A part assigned to a nested category (e.g., Electronics > Resistors) exists

**Steps**
1. Navigate to the part's detail page
2. Observe the category breadcrumb at the top of the page
3. Click on a parent category in the breadcrumb

**Expected Result**
The breadcrumb displays the full category path. Clicking a category navigates to that category's part list.

---

## Part Revisions (REV)

### TC-REV-001 — Create a revision of an existing part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Revisions |

**Preconditions**
- A part exists (non-template type)
- Revision feature is enabled in global settings
- User has create/edit permissions

**Steps**
1. Navigate to the part's detail page
2. Open the actions menu and select "Duplicate Part"
3. Set the "Revision Of" field to the original part
4. Assign a unique revision string (e.g., "B")
5. Submit the form

**Expected Result**
A new part is created with the "Revision Of" field set to the original part and the specified revision code. The new revision is listed in the revision dropdown on both parts.

---

### TC-REV-002 — Prevent self-referencing revision (circular reference)

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Revisions / Validation |

**Preconditions**
- A part exists
- Revision feature is enabled

**Steps**
1. Navigate to the part's edit form
2. Set the "Revision Of" field to the same part being edited
3. Attempt to save

**Expected Result**
The system returns a validation error preventing the save. The part cannot reference itself as a revision.

---

### TC-REV-003 — Prevent duplicate revision numbers on the same part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Revisions / Validation |

**Preconditions**
- A part with an existing revision "B" exists (original part has revision "B")
- Revision feature is enabled

**Steps**
1. Attempt to create another revision of the same original part
2. Set the "Revision" field to "B" (same as existing)
3. Submit the form

**Expected Result**
The system returns a validation error stating the revision number already exists for this part. The duplicate revision is not created.

---

### TC-REV-004 — Template parts cannot have revisions

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Revisions / Constraints |

**Preconditions**
- A template part exists
- Revision feature is enabled

**Steps**
1. Navigate to the template part's detail page
2. Open "Duplicate Part" and attempt to set "Revision Of" to the template part

**Expected Result**
The system rejects the revision creation with an error indicating that template parts cannot have revisions.

---

### TC-REV-005 — Navigate between revisions using dropdown selector

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Part Revisions / Navigation |

**Preconditions**
- An original part with at least two revisions (B and C) exists

**Steps**
1. Navigate to the original part's detail page
2. Locate the revision dropdown selector
3. Select revision "B" from the dropdown
4. Select revision "C" from the dropdown

**Expected Result**
The dropdown lists all available revisions. Selecting each revision navigates to that revision's detail page.

---

### TC-REV-006 — Original part data unaffected after creating revision

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Revisions |

**Preconditions**
- An original part with stock items, build orders, or purchase orders exists

**Steps**
1. Note the original part's stock items, build orders, and purchase orders
2. Create a new revision of this part (duplicate with Revision Of set)
3. Return to the original part's detail page
4. Check stock items, build orders, and purchase orders

**Expected Result**
All stock items, build orders, and purchase orders on the original part remain unchanged after the revision was created.

---

## Part Templates and Variants (TMPL)

### TC-TMPL-001 — Enable template status on a part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Templates |

**Preconditions**
- A standard part exists
- User has edit permissions

**Steps**
1. Navigate to the part's detail page
2. Go to the "Details" tab
3. Locate the "Template" switch in the part options on the right side
4. Toggle the switch to active (green/rightward)
5. Save the changes

**Expected Result**
The part is now marked as a template. The "Variants" tab becomes visible on the part detail page.

---

### TC-TMPL-002 — Create a variant from a template part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Templates / Variants |

**Preconditions**
- A template part exists

**Steps**
1. Navigate to the template part's detail page
2. Click the "Variants" tab
3. Click "New Variant"
4. Fill in the Duplicate Part form with a unique name and attributes
5. Submit the form

**Expected Result**
The new variant is created and listed under the template's Variants tab. The variant part detail page shows it as a variant of the template.

---

### TC-TMPL-003 — Variant cannot be created on non-template part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Templates / Validation |

**Preconditions**
- A standard (non-template) part exists

**Steps**
1. Navigate to the non-template part's detail page
2. Check if a "Variants" tab is present

**Expected Result**
The "Variants" tab is not displayed. There is no option to create variants for non-template parts.

---

### TC-TMPL-004 — Serial numbers unique across template and all variants

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Part Templates / Serial Numbers |

**Preconditions**
- A template part "Widget" with variants "Widget-01" and "Widget-02" exists
- Both are trackable parts

**Steps**
1. Create a stock item for "Widget-01" with serial number "SN-001"
2. Attempt to create a stock item for "Widget-02" with the same serial number "SN-001"

**Expected Result**
The second stock item creation is rejected with a validation error indicating the serial number is already in use within the template/variant group.

---

### TC-TMPL-005 — Template stock count aggregates all variant stock

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Part Templates / Stock |

**Preconditions**
- A template part with 2 variants exists
- Variant A has 10 units in stock; Variant B has 5 units in stock

**Steps**
1. Navigate to the template part's detail page
2. Check the Stock tab or the stock quantity displayed

**Expected Result**
The template part shows a total stock quantity of 15 (aggregating stock from both variants).

---

## Trackable Parts (TRACK)

### TC-TRACK-001 — Mark part as trackable

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Trackable Parts |

**Preconditions**
- A standard part exists
- User has edit permissions

**Steps**
1. Navigate to the part's edit form
2. Check the "Trackable" checkbox/toggle
3. Save the changes

**Expected Result**
The part is saved as trackable. Subsequent stock items created for this part will require a batch number or serial number.

---

### TC-TRACK-002 — Trackable stock item requires batch or serial number

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Trackable Parts / Stock |

**Preconditions**
- A trackable part exists

**Steps**
1. Navigate to the trackable part's detail page
2. Go to the Stock tab and create a new stock item
3. Fill in the quantity but leave both batch number and serial number fields empty
4. Attempt to save

**Expected Result**
The form returns a validation error stating that a batch number or serial number is required for trackable parts. The stock item is not created.

---

### TC-TRACK-003 — Create trackable stock item with serial number succeeds

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Trackable Parts / Stock |

**Preconditions**
- A trackable part exists

**Steps**
1. Navigate to the trackable part's stock creation form
2. Enter a quantity of 1
3. Enter a serial number (e.g., "SN-100")
4. Submit the form

**Expected Result**
The stock item is created successfully with the assigned serial number visible in the Stock tab.

---

### TC-TRACK-004 — Serial number entry with single value

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Trackable Parts / Serial Numbers |

**Preconditions**
- A trackable part exists

**Steps**
1. Open the stock creation form for the trackable part
2. Enter `1` in the serial number field
3. Submit

**Expected Result**
A single stock item is created with serial number `1`.

---

### TC-TRACK-005 — Serial number entry with comma-separated values

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Trackable Parts / Serial Numbers |

**Preconditions**
- A trackable part exists

**Steps**
1. Open the stock creation form for the trackable part
2. Set quantity to 3
3. Enter `1,3,5` in the serial number field
4. Submit

**Expected Result**
Three stock items are created with serial numbers 1, 3, and 5 respectively.

---

### TC-TRACK-006 — Serial number entry with range notation

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Trackable Parts / Serial Numbers |

**Preconditions**
- A trackable part exists

**Steps**
1. Open the stock creation form for the trackable part
2. Set quantity to 5
3. Enter `1-5` in the serial number field
4. Submit

**Expected Result**
Five stock items are created with serial numbers 1, 2, 3, 4, and 5.

---

### TC-TRACK-007 — Serial number auto-increment with tilde (~)

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Trackable Parts / Serial Numbers |

**Preconditions**
- A trackable part exists with at least one existing serial number (e.g., last used was 5)

**Steps**
1. Open the stock creation form for the trackable part
2. Enter `~` in the serial number field
3. Submit

**Expected Result**
A stock item is created with the next sequential serial number (e.g., 6).

---

### TC-TRACK-008 — Serial number open-ended + notation

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Trackable Parts / Serial Numbers |

**Preconditions**
- A trackable part exists

**Steps**
1. Open the stock creation form for the trackable part
2. Set quantity to 3
3. Enter `4+` in the serial number field
4. Submit

**Expected Result**
Three stock items are created with serial numbers starting at 4 and incrementing (4, 5, 6).

---

## Virtual Parts (VIRT)

### TC-VIRT-001 — Create a virtual part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Virtual Parts |

**Preconditions**
- User has part create permissions

**Steps**
1. Open the part creation form
2. Check the "Virtual" checkbox/toggle
3. Enter the required fields (name, category)
4. Submit

**Expected Result**
The part is created as virtual. Its detail page shows the virtual designation and stock-related UI elements (e.g., stock quantity) are hidden.

---

### TC-VIRT-002 — Stock UI elements hidden for virtual part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Virtual Parts / UI |

**Preconditions**
- A virtual part exists

**Steps**
1. Navigate to the virtual part's detail page
2. Look for stock quantity indicators, stock creation buttons, and the Stock tab contents

**Expected Result**
Stock-related UI elements are not displayed (or the stock tab shows a message indicating this is a virtual part). No option to create stock items is available.

---

### TC-VIRT-003 — Add virtual part to Bill of Materials

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Virtual Parts / BOM |

**Preconditions**
- An assembly part exists with a BOM
- A virtual part exists

**Steps**
1. Navigate to the assembly part's BOM tab
2. Add the virtual part as a BOM line item
3. Save

**Expected Result**
The virtual part appears in the Bill of Materials as a sub-component.

---

### TC-VIRT-004 — Virtual part cost included in BOM cost calculation

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Virtual Parts / Pricing |

**Preconditions**
- An assembly part has a BOM that includes a virtual part with a defined cost
- Other BOM components also have defined costs

**Steps**
1. Navigate to the assembly part's Pricing tab
2. View BOM pricing breakdown

**Expected Result**
The virtual part's cost is included in the total BOM cost. The overall cost includes contributions from the virtual part.

---

### TC-VIRT-005 — Attempt to create stock item for virtual part

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Virtual Parts / Constraints |

**Preconditions**
- A virtual part exists

**Steps**
1. Navigate to the virtual part's detail page
2. Attempt to create a new stock item (via API or any available UI element)

**Expected Result**
The operation is rejected. Virtual parts cannot have stock items. An appropriate error message or disabled UI state prevents the action.

---

## Pricing (PRICE)

### TC-PRICE-001 — View pricing tab for a part

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Pricing |

**Preconditions**
- A part exists with some pricing information (internal pricing or supplier pricing)

**Steps**
1. Navigate to the part's detail page
2. Click the "Pricing" tab

**Expected Result**
The Pricing tab displays an overview section with price ranges converted to the default currency. Available pricing sections (internal, purchase history, BOM pricing) are shown based on the part's configuration.

---

### TC-PRICE-002 — Add internal price break

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Pricing / Internal |

**Preconditions**
- A part exists
- User has edit permissions

**Steps**
1. Navigate to the part's Pricing tab
2. Locate the "Internal Pricing" section
3. Add a new price break with a quantity (e.g., 10) and price (e.g., 5.00)
4. Save

**Expected Result**
The internal price break is saved and displayed in the Internal Pricing section with the specified quantity and price.

---

### TC-PRICE-003 — Set manual price override

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Pricing / Override |

**Preconditions**
- A part exists with existing pricing data

**Steps**
1. Navigate to the part's Pricing tab
2. Enable the override option
3. Enter a minimum and maximum price
4. Save

**Expected Result**
The manual override values are saved. The pricing overview reflects the overridden minimum and maximum values, independent of supplier or calculated pricing.

---

### TC-PRICE-004 — View purchase history pricing for purchaseable part

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Pricing / Purchase History |

**Preconditions**
- A purchaseable part with completed purchase orders exists

**Steps**
1. Navigate to the purchaseable part's Pricing tab
2. Locate the "Purchase History" section

**Expected Result**
The purchase history section displays historical pricing data derived from completed purchase orders.

---

### TC-PRICE-005 — Purchase history not shown for non-purchaseable part

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Pricing / Purchase History |

**Preconditions**
- A non-purchaseable part exists

**Steps**
1. Navigate to the non-purchaseable part's Pricing tab

**Expected Result**
No "Purchase History" section is displayed. The pricing tab only shows applicable pricing sources.

---

### TC-PRICE-006 — BOM pricing incomplete when some items lack pricing data

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Pricing / BOM |

**Preconditions**
- An assembly part has a BOM with 3 components
- 2 components have pricing data; 1 component has no pricing data

**Steps**
1. Navigate to the assembly part's Pricing tab
2. View the BOM pricing section

**Expected Result**
The BOM pricing section displays an incomplete pricing indicator or warning. The total BOM cost is either shown as a range or flagged as incomplete due to missing pricing on one component.

---

### TC-PRICE-007 — Manually refresh pricing data

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | Pricing |

**Preconditions**
- A part with pricing data exists

**Steps**
1. Navigate to the part's Pricing tab
2. Click the "Refresh" button

**Expected Result**
Pricing data is recalculated and the display updates to reflect the latest available pricing information.

---

## Stocktake (STKT)

### TC-STKT-001 — Stock history tab hidden when feature disabled

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Stocktake / Settings |

**Preconditions**
- The "Enable Stock History" user setting is disabled

**Steps**
1. Navigate to any part's detail page
2. Check for a "Stock History" tab

**Expected Result**
The Stock History tab is not displayed.

---

### TC-STKT-002 — Generate manual stocktake entry

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Stocktake |

**Preconditions**
- STOCKTAKE_ENABLE setting is active
- "Enable Stock History" user setting is enabled
- A part with stock items exists

**Steps**
1. Navigate to the part's detail page
2. Click the "Stock History" tab
3. Click the "Generate Stocktake Entry" button
4. Confirm the action

**Expected Result**
The system schedules and processes the stocktake generation. After processing completes, a new entry appears in the Stock History tab showing the current date, stock item count, total quantity, and value range.

---

### TC-STKT-003 — Generate stocktake report filtered by part

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Stocktake / Reports |

**Preconditions**
- Stocktake feature is enabled
- At least one stocktake entry exists

**Steps**
1. Navigate to the stocktake report dashboard widget
2. Set the "Part" filter to a specific part
3. Click generate/download report

**Expected Result**
A CSV file is downloaded containing stocktake data only for the specified part.

---

### TC-STKT-004 — Generate stocktake report with no filter returns all records

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Stocktake / Reports |

**Preconditions**
- Stocktake feature is enabled
- Multiple stocktake entries exist for different parts

**Steps**
1. Navigate to the stocktake report dashboard widget
2. Leave all filter parameters blank
3. Click generate/download report

**Expected Result**
A CSV file is downloaded containing stocktake data for all parts in the database.

---

## Test Templates (TEST)

### TC-TEST-001 — Create test template for a testable part

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Test Templates |

**Preconditions**
- A testable part exists (marked as "Testable")
- User has edit permissions

**Steps**
1. Navigate to the testable part's detail page
2. Click the "Test Templates" tab
3. Click "Add Test Template"
4. Enter a test name (e.g., "Firmware Version"), optional description
5. Set "Required" flag and submit

**Expected Result**
The test template is created and listed in the Test Templates tab. The auto-generated Test Key is shown (e.g., "firmwareversion").

---

### TC-TEST-002 — Test key auto-generated from test name

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Test Templates / Key Generation |

**Preconditions**
- A testable part exists

**Steps**
1. Open the "Add Test Template" form
2. Enter the test name "Firmware Version"
3. Observe the auto-generated Test Key field

**Expected Result**
The Test Key field auto-populates with `firmwareversion` (lowercase, spaces removed, alphanumeric only).

---

### TC-TEST-003 — Duplicate test template name rejected

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Test Templates / Validation |

**Preconditions**
- A testable part has an existing test template named "Continuity Check"

**Steps**
1. Open the "Add Test Template" form for the same part
2. Enter "Continuity Check" as the test name
3. Submit

**Expected Result**
The form returns a validation error stating the test name already exists for this part/variant set. The duplicate template is not created.

---

### TC-TEST-004 — Disable test template preserves historical test results

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Test Templates |

**Preconditions**
- A testable part has a test template with existing test results on stock items

**Steps**
1. Navigate to the test template
2. Edit the template and uncheck the "Enabled" toggle
3. Save

**Expected Result**
The test template is marked as disabled. All previously recorded test results linked to this template remain intact and visible on the associated stock items.

---

### TC-TEST-005 — Delete test template removes all associated results

| Field | Value |
|-------|-------|
| Priority | Critical |
| Component | Test Templates / Data Integrity |

**Preconditions**
- A testable part has a test template with existing test results on multiple stock items

**Steps**
1. Navigate to the test template in the Test Templates tab
2. Click the delete button for the template
3. Confirm the deletion

**Expected Result**
The test template is deleted. All test results previously linked to this template are also removed from associated stock items.

---

## Notifications (NOTIF)

### TC-NOTIF-001 — Subscribe to part and receive low stock notification

| Field | Value |
|-------|-------|
| Priority | High |
| Component | Notifications |

**Preconditions**
- User has a valid email address configured in their account
- Email notifications are enabled in user settings
- Email server is configured in the system

**Steps**
1. Navigate to a part's detail page
2. Click the subscription toggle icon to subscribe to this part
3. Reduce the part's stock below its minimum stock threshold

**Expected Result**
The user receives a low stock alert notification. The notification appears in the UI header and the notification flyout panel. An email notification is also sent to the user's configured email address.

---

### TC-NOTIF-002 — Category subscription cascades to subcategories and parts

| Field | Value |
|-------|-------|
| Priority | Medium |
| Component | Notifications / Subscriptions |

**Preconditions**
- A category "Electronics" with subcategory "Resistors" exists
- The subcategory "Resistors" contains at least one part

**Steps**
1. Navigate to the "Electronics" category
2. Click the subscription toggle to subscribe to this category
3. Trigger a low stock event on a part in "Resistors" subcategory

**Expected Result**
The user receives a notification for the part in the subcategory, confirming that the category subscription cascaded to subcategories and their parts.

---

### TC-NOTIF-003 — Delete notifications individually and in bulk

| Field | Value |
|-------|-------|
| Priority | Low |
| Component | Notifications / Management |

**Preconditions**
- The user has at least 3 notifications in their notification inbox

**Steps**
1. Open the notification flyout or inbox
2. Click the delete button on a single notification
3. Verify it is removed
4. Select multiple notifications using bulk selection
5. Click the bulk delete button

**Expected Result**
The individually deleted notification is removed immediately. The bulk-selected notifications are all removed at once. The remaining notifications are still visible.
