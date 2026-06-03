# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Install Playwright browsers (required once after npm install)
npx playwright install

# Run all tests
npm test

# Run a single test file
npx playwright test tests/cart/add-to-cart.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests with verbose output
npx playwright test --reporter=line

# Open Playwright UI mode (interactive test runner)
npx playwright test --ui
```

## Architecture

The project uses a **Page Object Model (POM)** pattern with TypeScript organized by feature. Tests in `tests/` import page classes from `pages/` — page objects are never instantiated directly in tests except for the entry point (`HomePage`).

### Folder Structure

```
pages/
  home.page.ts              (entry point, shared across features)
  search/
    search-results.page.ts
  product/
    product.page.ts
  cart/
    cart.page.ts
  wishlist/
    wishlist.page.ts

tests/
  search/
    product-search.spec.ts
  product/
    validate-details.spec.ts
  cart/
    add-to-cart.spec.ts
  wishlist/
    add-to-wishlist.spec.ts
```

Each feature has its own folder in both `pages/` and `tests/` for better organization and maintainability.

### Page Object Chain

Page objects form a navigation chain that mirrors the user flow:

```
HomePage → SearchResultsPage → ProductPage → CartPage (or WishlistPage)
```

Each page object's action methods return the next page object in the flow (e.g., `homePage.search()` returns a `SearchResultsPage`). This enforces correct sequencing at the type level and keeps tests readable.

### Key conventions

- **Selectors live in `elements`**: Each page class has a readonly `elements` object of locator factory functions (`() => this.page.locator(...)`). Tests access elements via `productPage.elements.productTitle()`.
- **Assertions belong in tests**: Page objects handle navigation and actions; `expect()` calls stay in spec files.
- **Base URL passed explicitly**: `homePage.navigate(baseUrl)` and `searchResultsPage.openFirstProduct(baseUrl)` receive the base URL as a parameter rather than reading from config, which makes cross-domain tests (amazon.com vs amazon.in) explicit.

### Target sites

Tests currently run against live Amazon pages (`amazon.com` and `amazon.in`). Selectors are tied to Amazon's live DOM — if tests break, check whether Amazon changed their page structure using Playwright MCP for DOM inspection.
