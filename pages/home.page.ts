import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Navbar } from './components/navbar.page';

export class HomePage extends BasePage {
  readonly navbar: Navbar;
  readonly searchBox: Locator;
  readonly heading: Locator;
  readonly productCountText: Locator;
  readonly productCards: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.navbar = new Navbar(page, baseUrl);
    this.searchBox = page.locator('searchbox');
    this.heading = page.locator('h1:has-text("All Products")');
    this.productCountText = page.locator('text=products available');
    this.productCards = page.locator('main').locator('> div > div').filter({ has: page.locator('button:has-text("Add to Cart")') });
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/products');
    await this.page.waitForLoadState('networkidle');
  }

  async searchProduct(keyword: string): Promise<void> {
    await this.searchBox.fill(keyword);
    await this.page.waitForTimeout(500); // Wait for search to complete
  }

  async getProductCount(): Promise<number> {
    const cards = await this.productCards.count();
    return cards;
  }

  async getProductCountText(): Promise<string> {
    return await this.productCountText.textContent() || '';
  }

  async isNoProductsMessageDisplayed(): Promise<boolean> {
    try {
      const noProductsText = await this.page.locator('text=No products found').isVisible();
      return noProductsText;
    } catch {
      return false;
    }
  }

  async getProductByIndex(index: number): Promise<ProductCard> {
    const cardElement = this.productCards.nth(index);
    return new ProductCard(this.page, cardElement, this.baseUrl);
  }

  async clickAddToCartOnProduct(productIndex: number): Promise<void> {
    const product = await this.getProductByIndex(productIndex);
    await product.clickAddToCart();
  }

  async clickDetailsOnProduct(productIndex: number): Promise<void> {
    const product = await this.getProductByIndex(productIndex);
    await product.clickDetails();
  }

  async getHeadingText(): Promise<string> {
    return await this.heading.textContent() || '';
  }
}

export class ProductCard {
  private page: Page;
  private cardElement: Locator;
  private baseUrl: string;

  readonly addToCartButton: Locator;
  readonly detailsLink: Locator;
  readonly productName: Locator;
  readonly price: Locator;

  constructor(page: Page, cardElement: Locator, baseUrl: string) {
    this.page = page;
    this.cardElement = cardElement;
    this.baseUrl = baseUrl;
    this.addToCartButton = cardElement.locator('button:has-text("Add to Cart"), button:has-text("Go to Cart")');
    this.detailsLink = cardElement.locator('a:has-text("Details")');
    this.productName = cardElement.locator('h3');
    this.price = cardElement.locator('div').filter({ hasText: '$' }).first();
  }

  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.page.waitForTimeout(300);
  }

  async clickDetails(): Promise<void> {
    await this.detailsLink.click();
    await this.page.waitForNavigation();
  }

  async getProductName(): Promise<string> {
    return await this.productName.textContent() || '';
  }

  async getPrice(): Promise<string> {
    const priceText = await this.price.textContent() || '';
    return priceText.trim();
  }

  async isAddToCartButtonVisible(): Promise<boolean> {
    return await this.addToCartButton.isVisible();
  }

  async getAddToCartButtonText(): Promise<string> {
    return await this.addToCartButton.textContent() || '';
  }
}
