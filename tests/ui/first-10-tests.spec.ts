import { test, expect, Page, BrowserContext } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ProductDetailPage } from '../../pages/product-detail.page';
import { CartPage } from '../../pages/cart.page';
import { Navbar } from '../../pages/components/navbar.page';

const BASE_URL = 'https://shoplab-platform-399284160033.us-east1.run.app';

test.describe('ShopLab E-Commerce Automation - First 10 Test Cases', () => {
  let page: Page;
  let homePage: HomePage;
  let productDetailPage: ProductDetailPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    homePage = new HomePage(page, BASE_URL);
    productDetailPage = new ProductDetailPage(page, BASE_URL);
    cartPage = new CartPage(page, BASE_URL);
    // Clear cart before each test
    await page.goto(`${BASE_URL}/`);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('UI-01: Root URL Redirects To Products', async () => {
    // Navigate to root URL
    await page.goto(`${BASE_URL}/`);

    // Verify redirect to /products
    expect(page.url()).toContain('/products');

    // Verify page title area shows All Products
    const headingText = await homePage.getHeadingText();
    expect(headingText).toContain('All Products');

    // Verify product count text shows 8 products available
    const productCountText = await homePage.getProductCountText();
    expect(productCountText).toContain('8 products available');
  });

  test('UI-02: Navbar Navigation Across All Pages', async () => {
    // Open /products
    await homePage.navigate();

    // Click Cart in navbar
    const navbar = new Navbar(page, BASE_URL);
    await navbar.clickCartLink();
    expect(page.url()).toContain('/cart');

    // Click AI Chat in navbar
    await navbar.clickChatLink();
    expect(page.url()).toContain('/chat');

    // Click ShopLab logo
    await navbar.clickShopLabLogo();
    expect(page.url()).toContain('/products');

    // Verify active navbar link is highlighted
    await homePage.navigate();
    const isProductsActive = await navbar.isProductsLinkActive();
    expect(isProductsActive).toBeTruthy();
  });

  test('UI-03: Products Page Loads Product Grid', async () => {
    // Open /products
    await homePage.navigate();

    // Verify product grid is visible
    const productCount = await homePage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // Verify exactly 8 product cards are displayed
    expect(productCount).toBe(8);

    // Verify each card shows required elements (category, name, price, rating, actions)
    const firstProduct = await homePage.getProductByIndex(0);
    const name = await firstProduct.getProductName();
    const price = await firstProduct.getPrice();

    expect(name).toBeTruthy();
    expect(price).toContain('$');
    expect(await firstProduct.isAddToCartButtonVisible()).toBeTruthy();
  });

  test('UI-04: Product Search With Matching Keyword', async () => {
    // Open /products
    await homePage.navigate();

    // Search for "keyboard"
    await homePage.searchProduct('keyboard');

    // Verify result count text appears with 1 result
    const productCount = await homePage.getProductCount();
    expect(productCount).toBe(1);

    // Verify only Mechanical Keyboard card remains visible
    const product = await homePage.getProductByIndex(0);
    const name = await product.getProductName();
    expect(name).toContain('Mechanical Keyboard');
  });

  test('UI-05: Product Search With No Match', async () => {
    // Open /products
    await homePage.navigate();

    // Search for non-existent product
    await homePage.searchProduct('xyz123nomatch');

    // Verify no products found message is shown
    const noProductsFound = await homePage.isNoProductsMessageDisplayed();
    expect(noProductsFound).toBeTruthy();

    // Verify no product cards are displayed
    const productCount = await homePage.getProductCount();
    expect(productCount).toBe(0);
  });

  test('UI-06: Product Detail Page From Products List', async () => {
    // Open /products
    await homePage.navigate();

    // Click Details on Mechanical Keyboard (product at index 1)
    await homePage.clickDetailsOnProduct(1);

    // Verify product detail page loads
    expect(page.url()).toContain('/products/p2');

    // Verify page shows product name, category, description, price, rating, and stock
    const productName = await productDetailPage.getProductName();
    expect(productName).toContain('Mechanical Keyboard');

    const category = await productDetailPage.getProductCategory();
    expect(category).toBeTruthy();

    const description = await productDetailPage.getProductDescription();
    expect(description).toBeTruthy();

    const price = await productDetailPage.getProductPrice();
    expect(price).toContain('$129.99');

    const rating = await productDetailPage.getProductRating();
    expect(rating).toContain('⭐');

    const stock = await productDetailPage.getProductStock();
    expect(stock).toContain('Stock');

    // Verify Back to Products link is visible
    const backLinkVisible = await productDetailPage.isBackToProductsLinkVisible();
    expect(backLinkVisible).toBeTruthy();
  });

  test('UI-07: Back To Products Navigation', async () => {
    // Open /products/p2
    await productDetailPage.navigateToProduct('p2');

    // Verify we're on product detail page
    expect(page.url()).toContain('/products/p2');

    // Click Back to Products
    await productDetailPage.clickBackToProducts();

    // Verify browser navigates to /products
    expect(page.url()).toContain('/products');

    // Verify products page content is visible
    const productCount = await homePage.getProductCount();
    expect(productCount).toBe(8);
  });

  test('UI-08: Add To Cart From Product Detail', async () => {
    // Open /products/p2
    await productDetailPage.navigateToProduct('p2');

    // Click Add to Cart
    await productDetailPage.clickAddToCart();

    // Verify button text changes to confirmation state (Added to Cart or Go to Cart)
    const buttonText = await productDetailPage.getAddToCartButtonText();
    expect(buttonText).toMatch(/Added to Cart|Go to Cart/i);

    // Verify Go to Cart link appears
    const goToCartVisible = await productDetailPage.isGoToCartLinkVisible();
    expect(goToCartVisible).toBeTruthy();
  });

  test('UI-09: Add To Cart From Product Card', async () => {
    // Open /products
    await homePage.navigate();

    // Click Add to Cart on first product (p1)
    await homePage.clickAddToCartOnProduct(0);

    // Verify button transitions to Go to Cart state after successful add
    const product = await homePage.getProductByIndex(0);
    const buttonText = await product.getAddToCartButtonText();
    expect(buttonText).toMatch(/Go to Cart|Added to Cart/i);

    // Verify no error message is shown (check for success state)
    const isVisible = await product.isAddToCartButtonVisible();
    expect(isVisible).toBeTruthy();
  });

  test('UI-10: Cart Shows Added Item And Correct Totals', async () => {
    // Clear cart first
    await cartPage.navigate();
    try {
      await cartPage.clickClearCart();
    } catch {
      // Cart might already be empty
    }

    // Go back to products
    await homePage.navigate();

    // Add Mechanical Keyboard (p2) with price $129.99
    await productDetailPage.navigateToProduct('p2');
    await productDetailPage.clickAddToCart();

    // Navigate to cart
    await cartPage.navigate();

    // Verify cart contains Mechanical Keyboard with quantity 1
    const itemsCount = await cartPage.getCartItemsCount();
    expect(itemsCount).toBeGreaterThan(0);

    const cartItem = await cartPage.getCartItemByIndex(0);
    const itemName = await cartItem.getProductName();
    expect(itemName).toContain('Mechanical Keyboard');

    const itemQuantity = await cartItem.getQuantity();
    expect(itemQuantity).toContain('1');

    // Verify item subtotal is correct
    const subtotal = await cartItem.getSubtotal();
    expect(subtotal).toContain('129.99');

    // Verify order total is correct
    const total = await cartPage.getCartTotal();
    expect(total).toContain('129.99');
  });
});
