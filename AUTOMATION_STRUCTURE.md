# Test Automation Structure

## Overview
This directory contains automated tests for the ShopLab e-commerce application using Playwright with the Page Object Model (POM) pattern.

## Project Structure

```
pages/                          # Page Object Models
├── base.page.ts               # Base class for all pages
├── home.page.ts               # HomePage (Products listing page)
├── product-detail.page.ts     # Product detail page
├── cart.page.ts               # Shopping cart page
└── components/
    └── navbar.page.ts         # Navigation bar component

tests/
├── manual-test-cases.md       # Manual test cases documentation
└── automated/
    └── first-10-tests.spec.ts # Automated test specs (UI-01 to UI-10)
```

## Page Objects

### BasePage (base.page.ts)
Base class that all page objects inherit from. Provides common functionality:
- Page navigation
- URL retrieval
- Page title retrieval
- Base URL management

### HomePage (home.page.ts)
Represents the products listing page (/products)
- **Methods:**
  - `navigate()` - Navigate to products page
  - `searchProduct(keyword)` - Search for products
  - `getProductCount()` - Get number of displayed products
  - `getProductCountText()` - Get the product count text
  - `isNoProductsMessageDisplayed()` - Check if no products message shows
  - `getProductByIndex(index)` - Get product card by index
  - `clickAddToCartOnProduct(index)` - Add product to cart
  - `clickDetailsOnProduct(index)` - Open product details

**ProductCard Class** - Represents individual product cards
- **Methods:**
  - `getProductName()` - Get product name
  - `getPrice()` - Get product price
  - `clickAddToCart()` - Click add to cart button
  - `clickDetails()` - Navigate to product details
  - `getAddToCartButtonText()` - Get button text

### ProductDetailPage (product-detail.page.ts)
Represents individual product detail pages (/products/:id)
- **Methods:**
  - `navigateToProduct(productId)` - Navigate to specific product
  - `getProductName()` - Get product name
  - `getProductCategory()` - Get product category
  - `getProductDescription()` - Get product description
  - `getProductPrice()` - Get product price
  - `getProductRating()` - Get product rating
  - `getProductStock()` - Get stock information
  - `clickAddToCart()` - Add to cart
  - `clickBackToProducts()` - Navigate back
  - `isGoToCartLinkVisible()` - Check if Go to Cart link is visible

### CartPage (cart.page.ts)
Represents the shopping cart page (/cart)
- **Methods:**
  - `navigate()` - Navigate to cart page
  - `isEmptyCartMessageDisplayed()` - Check if cart is empty
  - `getCartItemsCount()` - Get number of items in cart
  - `getCartItemByIndex(index)` - Get specific cart item
  - `getCartTotal()` - Get cart total
  - `clickContinueShopping()` - Continue shopping action
  - `clickCheckout()` - Proceed to checkout
  - `clickClearCart()` - Clear entire cart

**CartItem Class** - Represents items in the cart
- **Methods:**
  - `getProductName()` - Get item name
  - `getPrice()` - Get item price
  - `getQuantity()` - Get item quantity
  - `getSubtotal()` - Get item subtotal
  - `clickIncrease()` - Increase quantity
  - `clickDecrease()` - Decrease quantity
  - `clickRemove()` - Remove item from cart

### Navbar (components/navbar.page.ts)
Represents the navigation bar component
- **Methods:**
  - `clickShopLabLogo()` - Click on ShopLab logo
  - `clickProductsLink()` - Navigate to products
  - `clickCartLink()` - Navigate to cart
  - `clickChatLink()` - Navigate to chat
  - `isProductsLinkActive()` - Check if Products link is active
  - `isCartLinkActive()` - Check if Cart link is active
  - `isChatLinkActive()` - Check if Chat link is active

## Automated Test Cases (UI-01 to UI-10)

### File: tests/automated/first-10-tests.spec.ts

#### UI-01: Root URL Redirects To Products
- Verifies root URL redirects to `/products`
- Checks heading displays "All Products"
- Validates product count shows "8 products available"

#### UI-02: Navbar Navigation Across All Pages
- Tests navigation between Products, Cart, and AI Chat
- Verifies ShopLab logo navigation
- Checks active navbar link highlighting

#### UI-03: Products Page Loads Product Grid
- Verifies product grid displays
- Confirms exactly 8 product cards are shown
- Validates each card has required elements (name, price, buttons)

#### UI-04: Product Search With Matching Keyword
- Tests search functionality with "keyboard" keyword
- Verifies only 1 result displays
- Confirms correct product (Mechanical Keyboard) is shown

#### UI-05: Product Search With No Match
- Tests search with non-existent product (xyz123nomatch)
- Verifies "No products found" message displays
- Confirms no product cards are shown

#### UI-06: Product Detail Page From Products List
- Clicks Details on Mechanical Keyboard
- Verifies all product information displays correctly
- Confirms Back to Products link is visible

#### UI-07: Back To Products Navigation
- Opens product detail page
- Clicks Back to Products
- Verifies navigation back to products page

#### UI-08: Add To Cart From Product Detail
- Opens product detail page
- Clicks Add to Cart
- Verifies button state changes and Go to Cart link appears

#### UI-09: Add To Cart From Product Card
- Opens products page
- Clicks Add to Cart on first product
- Verifies button transitions to Go to Cart state

#### UI-10: Cart Shows Added Item And Correct Totals
- Adds Mechanical Keyboard to cart
- Navigates to cart
- Verifies item displays with correct quantity and price
- Validates cart total is correct ($129.99)

## Running the Tests

### Install Dependencies
```bash
npm install
npx playwright install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx playwright test tests/automated/first-10-tests.spec.ts
```

### Run Tests in Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Run Tests with Verbose Output
```bash
npx playwright test --reporter=list
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Open Playwright UI
```bash
npx playwright test --ui
```

## Key Features

1. **Page Object Model (POM)**
   - Each page has its own class
   - Reusable methods for page interactions
   - Centralized selector management
   - Easy to maintain and update selectors

2. **Component-based Organization**
   - Navbar is separated into a component
   - Easy to reuse across multiple page objects
   - Consistent navigation testing

3. **Fluent API**
   - Methods return appropriate page objects
   - Enables method chaining for cleaner tests
   - Natural test flow

4. **Wait Strategies**
   - Proper waits for network idle
   - Wait for navigation
   - Wait for element visibility
   - Timeout handling with try-catch

5. **Error Handling**
   - Graceful handling of optional elements
   - Try-catch blocks for non-critical checks
   - Clear error messages

## Best Practices Implemented

1. ✅ All selectors are in page objects
2. ✅ Tests contain only business logic
3. ✅ Assertions are in test files
4. ✅ Reusable methods for common actions
5. ✅ Clear and descriptive method names
6. ✅ Proper wait strategies
7. ✅ Base URL passed explicitly
8. ✅ Clean test organization by feature

## Notes

- All tests use the configured base URL from `config.json`
- Cart is cleared before each test to ensure clean state
- Tests use proper wait strategies to handle dynamic content
- Product IDs used: p1, p2, p3, p4, p5, p6, p7, p8
- Search functionality is tested with both matching and non-matching keywords
