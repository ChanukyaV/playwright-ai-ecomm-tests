# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies and browsers (first time setup)
npm install
npx playwright install

# Run all tests
npm test

# Run a single test file
npx playwright test tests/search/search.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run with a specific reporter
npx playwright test --reporter=line

# Open the HTML report after a test run
npx playwright show-report
```

## Architecture

This project uses the **Page Object Model (POM)** pattern with **feature-based folders**.

- Pages are organized by feature under `pages/` (`search/`, `product/`, `cart/`, `wishlist/`)
- Tests are organized by feature under `tests/` (`search/`, `product/`, `cart/`, `wishlist/`)
- There is no `playwright.config.ts` — Playwright runs with defaults (Chromium, headless)

### Page chain

Pages form a navigational chain matching the user journey; each action method returns the next page object:

```
HomePage → SearchResultsPage → ProductPage → CartPage
HomePage → SearchResultsPage → ProductPage → WishlistPage
```

- `HomePage` — navigates to a base URL and submits a search query
- `SearchResultsPage` — waits for results, opens the first product by constructing its full URL from `baseUrl + href`
- `ProductPage` — exposes product details locators (title, price, Buy Now) and actions for cart/wishlist
- `CartPage` — holds a reference to `page` for URL/title assertions in tests
- `WishlistPage` — holds a reference to `page` for wishlist-related assertions in tests

Each page class exposes an `elements` object of locator factories (arrow functions returning locators) and async action methods. Tests keep `SEARCH_KEYWORD` and `BASE_URL` as top-level constants so search input is easy to change. **Assertions always stay in the test file**, not in page objects.

### Tests

| File | Target | Flow |
|------|--------|------|
| `tests/search/search.spec.ts` | amazon.com | Search by keyword → verify results contain keyword |
| `tests/product/product-details.spec.ts` | amazon.in | Search by keyword → open first product → validate title/price/Buy Now |
| `tests/cart/cart.spec.ts` | amazon.in | Search by keyword → open first product → add to cart → assert cart URL/title |
| `tests/wishlist/wishlist.spec.ts` | amazon.in | Search by keyword → open first product → add to wishlist → assert item visibility |

All tests target live Amazon pages and depend on network access. They are end-to-end only — no mocking.
