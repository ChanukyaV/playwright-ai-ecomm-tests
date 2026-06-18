# Playwright AI E-commerce Tests

Automated end-to-end testing for e-commerce platforms using Playwright and AI-powered tools.

## Overview

This project contains automated test suites for e-commerce websites (Amazon) and REST APIs, organized using the **Page Object Model (POM)** pattern with TypeScript. Tests are written using the Playwright testing framework and developed with assistance from Playwright MCP and GitHub Copilot.

## Features

- **Product Search**: Search for products on Amazon and verify result listings
- **Product Validation**: Validate product details on the product page
- **Cart**: Add products to the cart and verify cart state
- **Wishlist**: Add products to the wishlist and verify wishlist state
- **API Testing**: REST API tests against the Booker (restful-booker) API
- **Cross-browser Support**: Tests can run on Chromium, Firefox, and WebKit browsers

## Prerequisites

- Node.js 16+ installed
- npm package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ChanukyaV/playwright-ai-ecomm-tests.git
cd playwright-ai-ecomm-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm test

# Run a single test file
npx playwright test tests/cart/add-to-cart.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with verbose output
npx playwright test --reporter=line

# Open Playwright UI mode (interactive test runner)
npx playwright test --ui
```

## Project Structure

```
playwright-ai-ecomm-tests/
├── pages/                          # Page Object Model classes
│   ├── home.page.ts                # Entry point — Amazon homepage
│   ├── search/
│   │   └── search-results.page.ts  # Search results page
│   ├── product/
│   │   └── product.page.ts         # Product detail page
│   ├── cart/
│   │   └── cart.page.ts            # Shopping cart page
│   └── wishlist/
│       └── wishlist.page.ts        # Wishlist page
│
├── tests/                          # Test specs
│   ├── search/
│   │   └── product-search.spec.ts  # Search functionality tests
│   ├── product/
│   │   └── validate-details.spec.ts # Product details validation
│   ├── cart/
│   │   └── add-to-cart.spec.ts     # Add-to-cart flow tests
│   ├── wishlist/
│   │   └── add-to-wishlist.spec.ts # Wishlist flow tests
│   └── api/
│       └── booking.spec.ts         # REST API tests (Booker API)
│
└── api/                            # API client layer
    ├── booker-client.ts            # Typed Booker API client
    └── fixtures.ts                 # Playwright fixtures for API tests
```

### Page Object Chain

Page objects form a navigation chain mirroring the user flow:

```
HomePage → SearchResultsPage → ProductPage → CartPage
                                           └→ WishlistPage
```

Each page object's action methods return the next page object in the flow, enforcing correct sequencing at the type level.

### Key Conventions

- **Selectors in `elements`**: Each page class exposes a readonly `elements` object of locator factory functions (`() => this.page.locator(...)`).
- **Assertions in tests**: Page objects handle navigation and actions; `expect()` calls stay in spec files.
- **Base URL passed explicitly**: `homePage.navigate(baseUrl)` receives the base URL as a parameter, making cross-domain tests explicit.

### Target Sites

- **UI tests**: Amazon (`amazon.com` / `amazon.in`) — selectors are tied to Amazon's live DOM
- **API tests**: restful-booker API

## Tools Used

- **Playwright**: Cross-browser automation testing framework
- **TypeScript**: Type-safe test and page object code
- **Playwright MCP**: For DOM element inspection and locator discovery
- **GitHub Copilot**: AI-powered code generation and testing assistance

## Author

**ChanukyaV** <mail2chanu@gmail.com>

## License

ISC

## Repository

https://github.com/ChanukyaV/playwright-ai-ecomm-tests

---

*Created with Playwright MCP and GitHub Copilot*
