# UI Test Framework Standards

Authoritative rules for UI tests in this repo (Playwright + TypeScript + Page Object Model). Derived from `AUTOMATION_STRUCTURE.md` and the cleanest existing tests (`tests/ui/api-to-ui-cart.spec.ts`, `pages/cart.page.ts`). Some older files deviate (hardcoded URLs, `waitForTimeout`, `waitForNavigation`, try/catch-swallowing helpers). Do not copy those patterns into new code.

## 1. Project layout

| What | Where |
|---|---|
| Page objects | `pages/<name>.page.ts` |
| Reusable UI components (navbar, etc.) | `pages/components/<name>.page.ts` |
| UI specs | `tests/ui/<feature>.spec.ts` |
| Manual test case docs | `tests/manual-test-cases.md` |
| Environments | `config.json`, selected by `TEST_ENV`; wired into `playwright.config.ts` as `baseURL` |
| App under test (source of truth for locators and data) | `platform/src` |

- File names are kebab-case. Page object files end in `.page.ts`; specs end in `.spec.ts`.
- Class names are PascalCase and end in `Page` (for example `CartPage`), except small component classes (for example `CartItem`, `ProductCard`), which live in the same file as the page that owns them.
- One spec file per feature area (for example `cart.spec.ts`, `search.spec.ts`). Add to an existing spec file when the feature already has one.

## 2. Test IDs and titles

- Format: `UI-NN: Title Case Description`, with a two-digit number (`UI-21: Invalid Product Detail URL Returns 404 Page`).
- Find the next free number by scanning **both** `tests/ui/*.spec.ts` and `tests/manual-test-cases.md` for `UI-NN` and taking the highest plus one.
- If the user is automating an existing manual case, reuse its ID and title.
- IDs are unique across the repo and never reused.

## 3. Manual test case sync

Every automated test has a matching entry in `tests/manual-test-cases.md` under "UI Manual Test Cases". If the ID is new, append it in exactly this format:

```md
### UI-NN: Title Case Description
- Steps:
1. Step one.
1. Step two.
- Expected Results:
1. Expected result one.
1. Expected result two.
```

Steps and expected results in the manual case are plain user language, and match the `// comments` in the spec.

## 4. Page objects

- Extend `BasePage` (`pages/base.page.ts`). Constructor signature: `constructor(page: Page, baseUrl?: string)` calling `super(page, baseUrl)`.
- Pages that show the navbar expose `readonly navbar: Navbar`.
- Declare every locator as a `readonly` field of type `Locator`, assigned in the constructor. Selectors live **only** in page objects, never in specs.
- Repeating UI items (cards, rows) are modeled as a small class that wraps a root `Locator` and scopes child locators to it (see `ProductCard`, `CartItem`). Expose a `getXByIndex(index)` method on the page.
- Methods are `async`, have explicit return types, and use these name prefixes:
  - `navigate()` / `navigateToX(id)`: go to the page and wait for a page-specific element (`await this.heading.waitFor()`).
  - `clickX()`, `searchProduct(keyword)`: user actions.
  - `getX()`: return trimmed text as `string` (`(await this.x.textContent())?.trim() ?? ''`).
  - `isXVisible()`: return `boolean` using `locator.isVisible()` (it does not throw, so no try/catch).
- **No `expect()` in page objects.** Assertions belong in specs. Expose locators (`readonly`) so specs can use web-first assertions on them.
- Do not swallow errors with empty `try/catch`.
- Use relative paths with `this.navigateTo('/cart')`. Never write a full URL in a page object (except the existing default in `BasePage`).

### Locator priority (highest first)

1. `page.getByTestId('...')`: preferred. Look up the value in `platform/src`.
2. `getByRole('button', { name: '...' })`
3. `getByLabel` / `getByPlaceholder`
4. `getByText`, only for static, user-visible copy
5. CSS/XPath: last resort, and only when the app has no test id. Add a short comment explaining why. If a stable `data-testid` is missing, tell the user it should be added to `platform/src` rather than writing a brittle selector.

Scope with `locator.getByTestId(...)` or `.filter()` rather than `.nth()` chains or long CSS paths.

## 4a. Page object template

```ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Navbar } from './components/navbar.page';

export class ExamplePage extends BasePage {
  readonly navbar: Navbar;
  readonly heading: Locator;
  readonly submitButton: Locator;
  readonly items: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.navbar = new Navbar(page, baseUrl);
    this.heading = page.getByTestId('example-title');
    this.submitButton = page.getByTestId('example-submit');
    this.items = page.getByTestId('example-items').getByTestId('example-item');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/example');
    await this.heading.waitFor();
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async getItemByIndex(index: number): Promise<ExampleItem> {
    return new ExampleItem(this.items.nth(index));
  }
}

export class ExampleItem {
  readonly name: Locator;
  readonly removeButton: Locator;

  constructor(root: Locator) {
    this.name = root.getByTestId('example-item-name');
    this.removeButton = root.getByTestId('example-item-remove');
  }

  async clickRemove(): Promise<void> {
    await this.removeButton.click();
  }
}
```

## 5. Specs

- Imports: `import { expect, test } from '@playwright/test';` plus the page objects with relative paths (`'../../pages/cart.page'`).
- Group tests in `test.describe('ShopLab UI - <Feature>', () => { ... })`.
- Test title is `'UI-NN: Title Case Description'`.
- Use Playwright fixtures (`{ page, request }`). Do **not** create pages with `browser.newPage()` or keep `page` in a shared `let`.
- Create page objects with `new CartPage(page)`; do not pass a URL. `baseURL` and relative paths come from `config.json` through `playwright.config.ts`. **Never hardcode a URL or `BASE_URL` constant in a spec.**
- Write one `// comment` per step, mirroring the manual test case wording. Comment only what the step is; do not narrate code.
- Assertions only in specs. Use web-first (auto-retrying) assertions on locators:
  - `await expect(locator).toHaveText('...')`, `toBeVisible()`, `toHaveCount(n)`, `toContainText()`
  - `await expect(page).toHaveURL(/\/cart$/)`
  - Not `expect(await locator.textContent()).toBe(...)` and not `expect(page.url()).toContain(...)`.
- Assert exact values that the product data defines (names, prices, totals), and format money as shown in the UI (`'$259.98'`).
- Each test is independent: it sets up its own state and works when run alone or in any order.
- Use `test.step('...', async () => {})` only for long flows (more than about 6 steps) where grouping helps reports.

## 6. Waiting and timing

- **Forbidden in new code:** `page.waitForTimeout(...)`, `page.waitForNavigation(...)` (deprecated), `waitForLoadState('networkidle')` as a general fix, and arbitrary `sleep`.
- Wait by asserting the expected state (`await expect(...).toBeVisible()`), by `locator.waitFor()`, or `page.waitForURL(...)`.
- Do not raise timeouts to hide a flaky test. Find the missing condition.

## 7. Test data and state

- The ShopLab app has 100 products, `p1`–`p100`, shown 12 per page on /products (pagination test ids: `pagination`, `pagination-prev`, `pagination-next`, `pagination-page-N`, `pagination-summary`, `page-size-select`, `category-chip-<name>`). The first eight are listed below; the rest are in the source. Source of truth: `platform/src/lib/products.ts` (or `GET /api/products`). Known values: `p1` Wireless Bluetooth Headphones $79.99, `p2` Mechanical Keyboard $129.99, `p3` Ergonomic Wireless Mouse $49.99, `p4` 4K USB-C Webcam $89.99, `p5` LED Desk Lamp $39.99, `p6` Gaming Controller $59.99, `p7` Portable Power Bank 20000mAh $34.99, `p8` USB-C Hub 7-in-1 $44.99. Always re-check the source before asserting values.
- **The cart is server-side shared state.** Any test that reads or changes the cart must:
  1. Start clean: `await request.delete('/api/cart')` and assert status `200`.
  2. Clean up afterwards in `test.afterEach` or a `finally` block, with the same call.
  3. Sit in a `test.describe` with `test.describe.configure({ mode: 'serial' })`.
- Prefer seeding state through the API (`request.post('/api/cart', ...)`) rather than clicking through the UI, unless the click path is what is being tested.
- If the scenario depends on an external service (the AI chat needs Gemini), use `test.skip(condition, 'reason')` for the unmet precondition, as in `tests/api/shoplab-api.spec.ts`.

## 8. Things never to do

- Hardcoded URLs, credentials, or environment names in specs or page objects.
- Selectors or `locator(...)` calls inside specs.
- `expect()` inside page objects.
- `waitForTimeout`, `waitForNavigation`, `test.only`, `test.skip` without a reason, `console.log` debugging left behind.
- Order-dependent tests, or tests that leave cart or other server state dirty.
- Editing `playwright.config.ts`, `config.json`, or CI workflows as part of generating a test.

## 9. Spec template

```ts
import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { CartPage } from '../../pages/cart.page';

test.describe('ShopLab UI - Cart', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    const response = await request.delete('/api/cart');
    expect(response.status()).toBe(200);
  });

  test.afterEach(async ({ request }) => {
    const response = await request.delete('/api/cart');
    expect(response.status()).toBe(200);
  });

  test('UI-NN: Title Case Description', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);

    // Open /products
    await homePage.navigate();

    // Click Add to Cart on the first product
    await homePage.clickAddToCartOnProduct(0);

    // Open the cart
    await cartPage.navigate();

    // Verify the cart shows the item with the correct total
    await expect(cartPage.cartItems).toHaveCount(1);
    const cartItem = await cartPage.getCartItemByIndex(0);
    await expect(cartItem.quantity).toHaveText('1');
    await expect(page.getByTestId('cart-total')).toHaveText('$79.99');
  });
});
```

Adapt the describe name, hooks, and steps. Drop the cart hooks when the test does not touch the cart.

## 10. Definition of done (report this checklist to the user)

- [ ] Steps and expected results came from the user, nothing invented
- [ ] Test ID is the next free one (or reuses the manual case ID) and the title is Title Case
- [ ] Manual test case added or already present in `tests/manual-test-cases.md`
- [ ] Locators are `getByTestId`/role-based, verified against `platform/src`
- [ ] Selectors only in page objects; `expect()` only in specs
- [ ] No hardcoded URL, no `waitForTimeout`/`waitForNavigation`
- [ ] Web-first assertions used
- [ ] Cart/state cleaned up before and after (if touched)
- [ ] Type-check passes
- [ ] Test passes alone and 3 times in a row (`--repeat-each=3`)
