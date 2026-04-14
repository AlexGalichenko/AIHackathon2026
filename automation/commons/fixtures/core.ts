import { test as base, BrowserContext, APIRequestContext, request as playwrightRequest } from "@playwright/test";

// ---------------------------------------------------------------------------
// Token resolution
// Supports two flows per https://docs.inventree.org/en/stable/api/#authentication:
//   1. API_TOKEN env var — use directly
//   2. API_USERNAME + API_PASSWORD — POST to /api/user/token/ with Basic auth
// ---------------------------------------------------------------------------

let cachedToken: string | null = null;

async function resolveToken(baseUrl: string): Promise<string> {
  if (cachedToken) return cachedToken;

  const token = process.env.API_TOKEN;
  if (token) {
    cachedToken = token;
    return cachedToken;
  }

  const username = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "No API credentials found. Set API_TOKEN or both API_USERNAME and API_PASSWORD in your .env file."
    );
  }

  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  const ctx = await playwrightRequest.newContext();
  const resp = await ctx.get(`${baseUrl}/api/user/token/`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  });

  if (!resp.ok()) {
    await ctx.dispose();
    throw new Error(
      `Failed to obtain API token: ${resp.status()} ${resp.statusText()}`
    );
  }

  cachedToken = (await resp.json()).token as string;
  await ctx.dispose();
  return cachedToken;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Fixtures {
  context: BrowserContext;
  apiRequest: APIRequestContext;
}

export const test = base.extend<Fixtures>({
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

  apiRequest: async ({}, use) => {
    const baseUrl = process.env.BASE_URL ?? "http://localhost:8000";
    const token = await resolveToken(baseUrl);

    const ctx = await playwrightRequest.newContext({
      baseURL: baseUrl,
      extraHTTPHeaders: {
        Authorization: `Token ${token}`,
      },
    });

    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from "@playwright/test";
