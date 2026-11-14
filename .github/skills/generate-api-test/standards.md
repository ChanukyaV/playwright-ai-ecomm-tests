# API Test Framework Standards

Authoritative rules for API tests in this repo (Playwright `request` fixture + TypeScript). Derived from `tests/api/shoplab-api.spec.ts`, `tests/ui/api-to-ui-cart.spec.ts`, and `api/booker-client.ts`. Follow these over anything older code does differently.

## 1. Project layout

| What | Where |
|---|---|
| ShopLab API specs | `tests/api/<resource>.spec.ts` (currently `shoplab-api.spec.ts`) |
| Typed clients for external APIs | `api/<name>-client.ts` (for example `api/booker-client.ts`) |
| Test data builders | `api/fixtures.ts` |
| Manual test case docs | `tests/manual-test-cases.md` |
| Environments | `config.json`, selected by `TEST_ENV`; wired into `playwright.config.ts` as `baseURL` |
| API source of truth (routes, status codes, error messages) | `platform/src/app/api/**/route.ts` |

- File names are kebab-case; specs end in `.spec.ts`.
- Add to an existing spec file when the resource already has one.

## 2. Test IDs and titles

- Format: `API-NN: Title Case Description`, with a two-digit number. Add the condition in parentheses when the same endpoint has several variants (`API-05: Add Item To Cart (Valid)`, `API-06: Add Item To Cart (Invalid Product)`).
- Find the next free number by scanning **both** `tests/api/*.spec.ts` and `tests/manual-test-cases.md` for `API-NN` and taking the highest plus one.
- If the user is automating an existing manual case, reuse its ID and title.
- IDs are unique across the repo and never reused.

## 3. Manual test case sync

Every automated test has a matching entry in `tests/manual-test-cases.md` under "API Manual Test Cases". If the ID is new, append it in exactly this format, matching the existing API entries:

```md
### API-NN: Title Case Description
- Steps:
1. Send METHOD /api/path with <body>.
- Expected Results:
1. Response status is NNN.
1. Response body is <body or shape>.
```

## 4. Which API style to use

- **ShopLab API (`/api/...`)**: call the `request` fixture inline with a **relative path** (`request.get('/api/products')`). `baseURL` comes from `config.json` via `playwright.config.ts`. No client class.
- **External API (for example restful-booker)**: use a typed client in `api/<name>-client.ts`, following `BookerClient`:
  - A class that takes `baseUrl` and an `APIRequestContext`.
  - Typed request/response interfaces exported from the file.
  - One method per endpoint, with explicit return types.
  - Shared error handling for non-OK responses (`parseJson<T>`).
  - Builders for test payloads go in `api/fixtures.ts`, produce unique values (timestamp suffix), and accept `Partial<T>` overrides.
- **Never hardcode the ShopLab base URL** in a spec or call; it always comes from `baseURL`. An external API has no `baseURL`, so define its host once as a single `const` at the top of the spec, overridable by an environment variable (`process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com'`). Credentials for external APIs are kept in the client, never inline in specs.

## 5. Spec rules

- Imports: `import { expect, test } from '@playwright/test';`
- Group tests in `test.describe('ShopLab API', ...)` (or `'<Service> API'` for external services). Use a nested `test.describe('<Resource> endpoints', ...)` for a group that shares state or hooks.
- Test title is `'API-NN: Title Case Description'`.
- Use only the `request` fixture. Do not create your own `APIRequestContext` unless a client needs a different base URL.
- Name the result of the call `response`. When a setup call is needed first, name it `addResponse`, `updateResponse`, `cartResponse`, and so on.
- **Every call is asserted**, including setup and cleanup calls (`expect(addResponse.status()).toBe(201)`).
- **Assertion order:** status code first, then body.
- Body assertions:
  - Exact message or error objects: `await expect(response.json()).resolves.toEqual({ error: 'Product not found' })`
  - Partial match for objects with extra fields: `await expect(response.json()).resolves.toMatchObject({ product: { id: 'p1' }, quantity: 2 })`
  - Shape of a collection: loop the items and use `expect.objectContaining({ id: expect.any(String), price: expect.any(Number), ... })`
  - Array length: `toHaveLength(n)`. Absence: `expect(items).not.toContainEqual(expect.objectContaining(...))`
- Check the exact error strings against `platform/src/app/api/**/route.ts`; do not guess them.
- Do not use `console.log`, `waitForTimeout`, or arbitrary sleeps.
- Keep one scenario per test. A test may make several calls when they are needed to set up or verify the one behavior (add, then update, then read back).

## 6. HTTP conventions in this API

Always confirm against the route handler, but this is how ShopLab behaves today:

| Case | Status | Body |
|---|---|---|
| Read OK | `200` | JSON data |
| Created (`POST /api/cart`) | `201` | `{ product, quantity }` |
| Unknown product | `404` | `{ "error": "Product not found" }` |
| Missing cart item | `404` | `{ "error": "Item not found in cart" }` |
| Clear cart | `200` | `{ "message": "Cart cleared" }` |
| Remove item | `200` | `{ "message": "Item removed" }` |
| Chat, Gemini unavailable | `503` | `{ "error": "Failed to connect to Gemini..." }` |

Product IDs are `p1`–`p100` (`GET /api/products` returns all; `?page=&pageSize=&category=&q=` returns `{ items, page, pageSize, total, totalPages }`; `GET /api/categories` lists the 7 categories) (source: `platform/src/lib/products.ts`). `p1` is $79.99 and `p2` is $129.99; re-check the source before asserting prices or totals.

## 7. State and cleanup

- **The cart is server-side shared state.** Any test that reads or writes `/api/cart` must:
  1. Start clean: `await request.delete('/api/cart')` and assert `200` (in `test.beforeEach`).
  2. Clean up afterwards with the same call (in `test.afterEach`, or a `try/finally` for a single test).
  3. Sit in a `test.describe` with `test.describe.configure({ mode: 'serial' })`.
- For external APIs that create data (a booking), delete what the test created in `afterEach`/`finally`, using the ID returned by the create call.
- Tests must pass when run alone, in any order, and when repeated.
- Preconditions that depend on an external service (AI chat needs Gemini) use `test.skip(condition, 'reason')` after the call, with a clear reason, as in `API-13` and `API-14`. Do not use a bare `test.skip()`.

## 8. Things never to do

- Hardcoded base URLs, tokens, or passwords in specs.
- Guessing status codes or error messages instead of reading the route handler.
- Unasserted setup or cleanup calls.
- `test.only`, `test.skip` without a reason, `console.log` left behind.
- Tests that depend on another test's data or leave state behind.
- Editing `playwright.config.ts`, `config.json`, or CI workflows as part of generating a test.

## 9. Spec templates

ShopLab endpoint test (inline `request`):

```ts
import { expect, test } from '@playwright/test';

test.describe('ShopLab API', () => {
  test.describe('Cart endpoints', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ request }) => {
      const response = await request.delete('/api/cart');
      expect(response.status()).toBe(200);
    });

    test.afterEach(async ({ request }) => {
      const response = await request.delete('/api/cart');
      expect(response.status()).toBe(200);
    });

    test('API-NN: Update Cart Item Quantity', async ({ request }) => {
      const addResponse = await request.post('/api/cart', {
        data: { productId: 'p1', quantity: 2 },
      });
      expect(addResponse.status()).toBe(201);

      const response = await request.patch('/api/cart/p1', {
        data: { quantity: 1 },
      });

      expect(response.status()).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        product: { id: 'p1' },
        quantity: 1,
      });
    });
  });
});
```

Stateless read endpoint (no cart hooks needed):

```ts
test('API-NN: Get Product By Invalid ID', async ({ request }) => {
  const response = await request.get('/api/products/does-not-exist');

  expect(response.status()).toBe(404);
  await expect(response.json()).resolves.toEqual({ error: 'Product not found' });
});
```

External API via typed client:

```ts
import { expect, test } from '@playwright/test';
import { BookerClient } from '../../api/booker-client';
import { buildBooking } from '../../api/fixtures';

const BOOKER_BASE_URL = process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com';

test.describe('Booker API', () => {
  test('API-NN: Create Booking', async ({ request }) => {
    const client = new BookerClient(BOOKER_BASE_URL, request);
    const token = await client.createToken();
    const booking = buildBooking();

    const created = await client.createBooking(booking);
    try {
      expect(created.bookingid).toBeGreaterThan(0);
      expect(created.booking).toMatchObject(booking);
    } finally {
      await client.deleteBooking(created.bookingid, token);
    }
  });
});
```

## 10. Definition of done (report this checklist to the user)

- [ ] Endpoint, request, and expected response came from the user or the route handler, nothing guessed
- [ ] Test ID is the next free one (or reuses the manual case ID) and the title is Title Case
- [ ] Manual test case added or already present in `tests/manual-test-cases.md`
- [ ] Relative paths for ShopLab; typed client and a single base-URL constant for external APIs
- [ ] Every call asserted (setup and cleanup too); status checked before body
- [ ] Error messages match the route handler exactly
- [ ] Cart/state cleaned up before and after (if touched), serial mode set
- [ ] Type-check passes
- [ ] Test passes alone and 3 times in a row (`--repeat-each=3`)
