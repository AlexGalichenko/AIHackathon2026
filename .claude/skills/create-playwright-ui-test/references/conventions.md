# Playwright Test Conventions

Standard structures and patterns to use when no existing tests are found in the project, or as a reference for consistent code generation.

## File Layout

```
tests/
  auth/
    login.spec.ts
    logout.spec.ts
  checkout/
    cart.spec.ts
    payment.spec.ts
  playwright.config.ts
```

Or flat for smaller projects:

```
tests/
  login.spec.ts
  checkout.spec.ts
  playwright.config.ts
```

## Standard Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/starting-path');
  });

  test('happy path description', async ({ page }) => {
    // Setup
    // ...

    // Actions
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assertions
    await expect(page).toHaveURL('/expected-path');
    await expect(page.getByRole('heading', { name: 'Success' })).toBeVisible();
  });

  test('error case description', async ({ page }) => {
    // ...
  });
});
```

## Common Locator Patterns

```typescript
// Buttons
page.getByRole('button', { name: 'Submit' })
page.getByRole('button', { name: /submit/i })  // case-insensitive

// Text inputs
page.getByLabel('Email')
page.getByPlaceholder('Enter your email')
page.getByRole('textbox', { name: 'Email' })

// Links
page.getByRole('link', { name: 'Sign in' })

// Checkboxes / radio
page.getByRole('checkbox', { name: 'Remember me' })
page.getByRole('radio', { name: 'Option A' })

// Select / combobox
page.getByRole('combobox', { name: 'Country' })

// Headings
page.getByRole('heading', { name: 'Dashboard' })

// Any visible text
page.getByText('Welcome back')

// Test ID (data-testid attribute)
page.getByTestId('submit-button')

// Scoped to a region
page.getByRole('region', { name: 'Checkout' }).getByRole('button', { name: 'Pay' })
```

## Common Assertion Patterns

```typescript
// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/.*dashboard/);

// Page title
await expect(page).toHaveTitle('Dashboard – MyApp');

// Element visibility
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByRole('dialog')).toBeVisible();
await expect(page.getByText('Error')).not.toBeVisible();

// Element text content
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByTestId('total')).toHaveText('$42.00');
await expect(page.getByRole('status')).toContainText('saved');

// Input value
await expect(page.getByLabel('Email')).toHaveValue('user@example.com');

// Element count
await expect(page.getByRole('listitem')).toHaveCount(3);

// Element state
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
await expect(page.getByRole('checkbox')).toBeChecked();

// Attribute
await expect(page.getByRole('img', { name: 'Avatar' })).toHaveAttribute('src', /profile/);
```

## Authentication Setup

When tests require a logged-in user, use `storageState` to avoid repeating login in every test:

```typescript
// In playwright.config.ts
export default defineConfig({
  use: {
    storageState: 'playwright/.auth/user.json',
  },
});

// In a setup file (auth.setup.ts)
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

If `storageState` infrastructure doesn't exist, inline login in `test.beforeEach` instead.

## Waiting Strategies

Playwright auto-waits for most actions. Avoid explicit `waitForTimeout`. Use these instead:

```typescript
// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for element to appear
await page.waitForSelector('[data-testid="result"]');

// Wait for network idle (after form submit)
await page.waitForLoadState('networkidle');

// Wait for a specific response
await page.waitForResponse(resp => resp.url().includes('/api/submit'));
```

## Test Data

- Use static test data for deterministic tests
- Prefer environment variables for credentials: `process.env.TEST_EMAIL`
- Do not hardcode production credentials in test files
