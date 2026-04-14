import { test as base, BrowserContext } from "@playwright/test";

export const test = base.extend<{ context: BrowserContext }>({
  context: async ({ context }, use, testInfo) => {
    await use(context);

    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`--- page tree ---`);
      for (const page of context.pages()) {
        console.log(`Page: ${page.url()}`);
        console.log(await page.ariaSnapshot());
      }
    }
  },
});

export { expect } from "@playwright/test";
