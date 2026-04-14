import { test, expect } from '@core';

test.describe('UI Tests', () => {
    test('should load the homepage', async ({ page }) => {
        await page.goto('https://demo.inventree.org/');
        const title = await page.title();
        expect(title).toBe('InvenTree Demo Server');
    });
});