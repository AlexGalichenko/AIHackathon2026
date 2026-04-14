import { test, expect } from '@core';

test.describe('Permissions', () => {
    test('TC-PERM-001 — Add Parts menu hidden for user without create permission', async ({ page }) => {
        // --- Preconditions / Setup ---
        await page.goto('https://demo.inventree.org/web/login');

        await test.step('Step 1: Log in as a user without create permission', async () => {
            await page.getByRole('textbox', { name: 'login-username' }).fill('reader');
            await page.getByRole('textbox', { name: 'login-password' }).fill('readonly');
            await page.getByRole('button', { name: 'Log In' }).click();
            await page.waitForURL('**/web/home');
        });

        await test.step('Step 2: Navigate to the Parts view', async () => {
            await page.getByRole('link', { name: 'Parts' }).click();
            await page.waitForURL('**/web/part/**');
        });

        // --- Assertions ---
        // The Add Parts dropdown must not be visible for a user without create permission
        await expect(page.getByRole('button', { name: 'action-menu-add-parts' })).not.toBeVisible();
    });
});
