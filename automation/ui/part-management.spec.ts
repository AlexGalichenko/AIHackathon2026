import { test, expect } from '@core';

const BASE_URL = 'https://demo.inventree.org';
const PARTS_URL = `${BASE_URL}/web/part/category/index/parts`;
const LOGIN_URL = `${BASE_URL}/web/login`;

test.describe('Part Management', () => {
    test('TC-PART-001 — Create part via web interface (happy path)', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);

        await test.step('Step 1: Log in with create permission', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
            await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Navigate to the Parts section', async () => {
            await page.goto(PARTS_URL);
        });

        await test.step('Step 3: Click the "Add Parts" dropdown menu', async () => {
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
        });

        await test.step('Step 4: Select the option to create a new part manually', async () => {
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
        });

        await test.step('Step 5: Fill in the required Name field and submit', async () => {
            const partName = `TC-PART-001-${Date.now()}`;
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(partName);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        // --- Assertions ---
        await expect(page).toHaveURL(/\/web\/part\/\d+\/details/);
    });

    test('TC-PART-002 — Attempt part creation without permissions', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);

        await test.step('Step 1: Log in as a user without create permission', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('reader');
            await page.getByRole('textbox', { name: 'login-password' }).fill('readonly');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Navigate to the Parts section', async () => {
            await page.goto(PARTS_URL);
        });

        // --- Assertions ---
        // The "Add Parts" button must not be visible for a user without create permission
        await expect(page.getByRole('button', { name: 'action-menu-add-parts' })).not.toBeVisible();
    });

    test('TC-PART-003 — Submit part creation form with missing required fields', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);

        await test.step('Step 1: Log in with create permission', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
            await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Navigate to Parts and open the part creation form', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
        });

        await test.step('Step 3: Leave the required "Name" field empty and click Submit', async () => {
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        await expect(page.getByRole('alert', { name: 'Form Error' })).toBeVisible();
        await expect(page.getByText('This field is required.')).toBeVisible();
    });

    test('TC-PART-006 — Supplier options only visible for purchaseable parts', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);

        await test.step('Step 1: Log in with create permission', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
            await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Open the part creation form', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
        });

        await test.step('Step 3: Ensure the "Purchaseable" checkbox is unchecked', async () => {
            const purchaseableSwitch = page.getByRole('switch', { name: 'boolean-field-purchaseable' });
            if (await purchaseableSwitch.isChecked()) {
                await purchaseableSwitch.uncheck();
            }
        });

        // --- Assertions ---
        await expect(page.getByText('Supplier Options')).not.toBeVisible();

        await test.step('Step 4: Check the "Purchaseable" checkbox', async () => {
            await page.getByRole('switch', { name: 'boolean-field-purchaseable' }).check();
        });

        await expect(page.getByText('Supplier Options')).toBeVisible();

        await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('TC-PART-007 — Locked part cannot be deleted', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        let partUrl: string;

        await test.step('Step 1: Log in with admin/delete permissions', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
            await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Create a part and lock it', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            const partName = `TC-PART-007-${Date.now()}`;
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(partName);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
            partUrl = page.url();

            // Lock the part via edit form
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
            await page.getByRole('switch', { name: 'boolean-field-locked' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        await test.step('Step 3: Navigate to the locked part and attempt to delete', async () => {
            await page.goto(partUrl);
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
        });

        // --- Assertions ---
        // Delete action should be absent or disabled for a locked part
        const deleteMenuItem = page.getByRole('menuitem', { name: 'action-menu-part-actions-delete' });
        const isDeleteVisible = await deleteMenuItem.isVisible().catch(() => false);
        if (isDeleteVisible) {
            await expect(deleteMenuItem).toBeDisabled();
        } else {
            await expect(deleteMenuItem).not.toBeVisible();
        }
    });

    test('TC-PART-008 — Mark part as inactive', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);

        await test.step('Step 1: Log in with edit permissions', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
            await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Create a test part to mark as inactive', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            const partName = `TC-PART-008-${Date.now()}`;
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(partName);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 3: Open the part edit form', async () => {
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
        });

        await test.step('Step 4: Uncheck the "Active" toggle and save', async () => {
            await page.getByRole('switch', { name: 'boolean-field-active' }).uncheck();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        // Re-open edit form to confirm the Active switch is now unchecked
        await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
        await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
        await expect(page.getByRole('switch', { name: 'boolean-field-active' })).not.toBeChecked();
        await page.getByRole('button', { name: 'Cancel' }).click();
    });
});

test.describe('Part Views — Tab Visibility', () => {
    test('TC-VIEW-002 — Variants tab visible only for template parts', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a standard (non-template) part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-VIEW-002-std-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Observe available tabs on the standard part', async () => {
            // Standard part does not have the "Variants" tab
        });

        // --- Assertions: Variants tab absent on standard part ---
        await expect(page.getByRole('tab', { name: 'Variants' })).not.toBeVisible();

        await test.step('Step 3: Enable "Is Template" on the part via edit form', async () => {
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
            await page.getByRole('switch', { name: 'boolean-field-is_template' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        await test.step('Step 4: Observe available tabs on the template part', async () => {
            // Template part should now show the "Variants" tab
        });

        // --- Assertions: Variants tab present on template part ---
        await expect(page.getByRole('tab', { name: 'Variants' })).toBeVisible();
    });

    test('TC-VIEW-006 — Test Templates tab visible only for testable parts', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a standard (non-testable) part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-VIEW-006-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        // --- Assertions: Test Templates tab absent on non-testable part ---
        await expect(page.getByRole('tab', { name: 'Test Templates' })).not.toBeVisible();

        await test.step('Step 2: Enable "Testable" on the part via edit form', async () => {
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
            await page.getByRole('switch', { name: 'boolean-field-testable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions: Test Templates tab present on testable part ---
        await expect(page.getByRole('tab', { name: 'Test Templates' })).toBeVisible();
    });
});

test.describe('Part Templates and Variants', () => {
    test('TC-TMPL-001 — Enable template status on a part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Navigate to a standard part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TMPL-001-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Go to the "Details" tab and locate the Template switch', async () => {
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
        });

        await test.step('Step 3: Toggle the "Is Template" switch to active and save', async () => {
            await page.getByRole('switch', { name: 'boolean-field-is_template' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        await expect(page.getByRole('tab', { name: 'Variants' })).toBeVisible();
    });

    test('TC-TMPL-003 — Variant cannot be created on non-template part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Navigate to a non-template part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TMPL-003-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Check if a "Variants" tab is present', async () => {
            // Non-template parts do not show the Variants tab
        });

        // --- Assertions ---
        await expect(page.getByRole('tab', { name: 'Variants' })).not.toBeVisible();
    });
});

test.describe('Trackable Parts', () => {
    test('TC-TRACK-001 — Mark part as trackable', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Navigate to the part edit form', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TRACK-001-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
            await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
        });

        await test.step('Step 2: Check the "Trackable" checkbox/toggle and save', async () => {
            await page.getByRole('switch', { name: 'boolean-field-trackable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        // Re-open edit form to confirm Trackable is now enabled
        await page.getByRole('button', { name: 'action-menu-part-actions' }).click();
        await page.getByRole('menuitem', { name: 'action-menu-part-actions-edit' }).click();
        await expect(page.getByRole('switch', { name: 'boolean-field-trackable' })).toBeChecked();
        await page.getByRole('button', { name: 'Cancel' }).click();
    });

    test('TC-TRACK-003 — Create trackable stock item with serial number succeeds', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a trackable part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TRACK-003-${Date.now()}`);
            await page.getByRole('switch', { name: 'boolean-field-trackable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Navigate to the Stock tab and create a new stock item', async () => {
            await page.getByLabel('panel-tabs-part').getByRole('tab', { name: 'Stock', exact: true }).click();
            await page.getByRole('button', { name: 'action-button-add-stock-item' }).click();
        });

        await test.step('Step 3: Enter a quantity of 1 and a serial number, then submit', async () => {
            await page.getByRole('textbox', { name: 'number-field-quantity' }).fill('1');
            await page.getByRole('textbox', { name: 'text-field-serial_numbers' }).fill('SN-100');
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/stock\/item\/\d+\/details/);
        });

        // --- Assertions ---
        await expect(page).toHaveURL(/\/web\/stock\/item\/\d+\/details/);
    });
});

test.describe('Virtual Parts', () => {
    test('TC-VIRT-001 — Create a virtual part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Open the part creation form', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
        });

        await test.step('Step 2: Check the "Virtual" checkbox and enter the required fields', async () => {
            await page.getByRole('switch', { name: 'boolean-field-virtual' }).check();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-VIRT-001-${Date.now()}`);
        });

        await test.step('Step 3: Submit the form', async () => {
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        // --- Assertions ---
        await expect(page.getByText('Virtual Part')).toBeVisible();
    });

    test('TC-VIRT-002 — Stock UI elements hidden for virtual part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a virtual part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('switch', { name: 'boolean-field-virtual' }).check();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-VIRT-002-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Look for stock quantity indicators, stock creation buttons, and the Stock tab', async () => {
            // Virtual parts do not have a Stock tab
        });

        // --- Assertions ---
        await expect(page.getByRole('tab', { name: 'Stock', exact: true })).not.toBeVisible();
    });

    test('TC-VIRT-005 — Attempt to create stock item for virtual part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Navigate to the virtual part detail page', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('switch', { name: 'boolean-field-virtual' }).check();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-VIRT-005-${Date.now()}`);
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Attempt to create a new stock item via available UI', async () => {
            // The Stock tab is absent on virtual parts — no stock creation is possible from the UI
        });

        // --- Assertions ---
        // Stock tab is absent — virtual parts cannot have stock items created from the UI
        await expect(page.getByRole('tab', { name: 'Stock', exact: true })).not.toBeVisible();
        // The "Add Stock Item" action button is also not available
        await expect(page.getByRole('button', { name: 'action-button-add-stock-item' })).not.toBeVisible();
    });
});

test.describe('Test Templates', () => {
    test('TC-TEST-001 — Create test template for a testable part', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a testable part', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TEST-001-${Date.now()}`);
            await page.getByRole('switch', { name: 'boolean-field-testable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
        });

        await test.step('Step 2: Click the "Test Templates" tab', async () => {
            await page.getByRole('tab', { name: 'Test Templates' }).click();
        });

        await test.step('Step 3: Click "Add Test Template"', async () => {
            await page.getByRole('button', { name: 'action-button-add-test-' }).click();
        });

        await test.step('Step 4: Enter a test name and set Required flag, then submit', async () => {
            await page.getByRole('textbox', { name: 'text-field-test_name' }).fill('Firmware Version');
            await page.getByRole('switch', { name: 'boolean-field-required' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        await expect(page.getByText('Firmware Version')).toBeVisible();
    });

    test('TC-TEST-002 — Test key auto-generated from test name', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a testable part and open the Add Test Template form', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TEST-002-${Date.now()}`);
            await page.getByRole('switch', { name: 'boolean-field-testable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
            await page.getByRole('tab', { name: 'Test Templates' }).click();
            await page.getByRole('button', { name: 'action-button-add-test-' }).click();
        });

        await test.step('Step 2: Enter the test name "Firmware Version"', async () => {
            await page.getByRole('textbox', { name: 'text-field-test_name' }).fill('Firmware Version');
        });

        await test.step('Step 3: Submit and observe the auto-generated Test Key in the list', async () => {
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        // After creation, the test template list shows the auto-generated key "firmwareversion"
        await expect(page.getByText('firmwareversion')).toBeVisible();
    });

    test('TC-TEST-003 — Duplicate test template name rejected', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto(LOGIN_URL);
        await page.getByRole('textbox', { name: 'login-username' }).fill('allaccess');
        await page.getByRole('textbox', { name: 'login-password' }).fill('nolimits');
        await page.getByRole('button', { name: 'Log In' }).click();
        await page.waitForURL('**/web/home');

        await test.step('Step 1: Create a testable part with an existing test template "Continuity Check"', async () => {
            await page.goto(PARTS_URL);
            await page.getByRole('button', { name: 'action-menu-add-parts' }).click();
            await page.getByRole('menuitem', { name: 'action-menu-add-parts-create-' }).click();
            await page.getByRole('textbox', { name: 'text-field-name' }).fill(`TC-TEST-003-${Date.now()}`);
            await page.getByRole('switch', { name: 'boolean-field-testable' }).check();
            await page.getByRole('button', { name: 'Submit' }).click();
            await page.waitForURL(/\/web\/part\/\d+\/details/);
            await page.getByRole('tab', { name: 'Test Templates' }).click();
            await page.getByRole('button', { name: 'action-button-add-test-' }).click();
            await page.getByRole('textbox', { name: 'text-field-test_name' }).fill('Continuity Check');
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        await test.step('Step 2: Open the "Add Test Template" form for the same part again', async () => {
            await page.getByRole('button', { name: 'action-button-add-test-' }).click();
        });

        await test.step('Step 3: Enter "Continuity Check" as the test name and submit', async () => {
            await page.getByRole('textbox', { name: 'text-field-test_name' }).fill('Continuity Check');
            await page.getByRole('button', { name: 'Submit' }).click();
        });

        // --- Assertions ---
        await expect(page.getByRole('alert', { name: 'Form Error' })).toBeVisible();
    });
});
