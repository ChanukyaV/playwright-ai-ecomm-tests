import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Navbar } from './components/navbar.page';

export class ProductDetailPage extends BasePage {
  readonly navbar: Navbar;
  readonly backToProductsLink: Locator;
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly productRating: Locator;
  readonly productStock: Locator;
  readonly addToCartButton: Locator;
  readonly goToCartLink: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.navbar = new Navbar(page, baseUrl);
    this.backToProductsLink = page.locator('a:has-text("← Back to Products")');
    this.productName = page.locator('main').locator('h1');
    this.productCategory = page.locator('main').locator('> div').locator('> div').nth(1).locator('> div').first();
    this.productDescription = page.locator('main').locator('p').first();
    this.productPrice = page.locator('main').locator('div:has-text("$")').first();
    this.productRating = page.locator('main').locator('text=/⭐.*\\//');
    this.productStock = page.locator('main').locator('text=In Stock').or(page.locator('text=available'));
    this.addToCartButton = page.locator('main').locator('button:has-text("Add to Cart"), button:has-text("Added to Cart")');
    this.goToCartLink = page.locator('a:has-text("Go to Cart")');
  }

  async navigateToProduct(productId: string): Promise<void> {
    await this.navigateTo(`/products/${productId}`);
    await this.page.waitForLoadState('networkidle');
  }

  async getProductName(): Promise<string> {
    return await this.productName.textContent() || '';
  }

  async getProductCategory(): Promise<string> {
    return await this.productCategory.textContent() || '';
  }

  async getProductDescription(): Promise<string> {
    return await this.productDescription.textContent() || '';
  }

  async getProductPrice(): Promise<string> {
    const priceText = await this.productPrice.textContent() || '';
    return priceText.trim();
  }

  async getProductRating(): Promise<string> {
    return await this.productRating.textContent() || '';
  }

  async getProductStock(): Promise<string> {
    return await this.productStock.textContent() || '';
  }

  async clickAddToCart(): Promise<void> {
    await this.addToCartButton.click();
    await this.page.waitForTimeout(300);
  }

  async getAddToCartButtonText(): Promise<string> {
    return await this.addToCartButton.textContent() || '';
  }

  async isGoToCartLinkVisible(): Promise<boolean> {
    try {
      return await this.goToCartLink.isVisible();
    } catch {
      return false;
    }
  }

  async clickBackToProducts(): Promise<void> {
    await this.backToProductsLink.click();
    await this.page.waitForNavigation();
  }

  async clickGoToCart(): Promise<void> {
    await this.goToCartLink.click();
    await this.page.waitForNavigation();
  }

  async isBackToProductsLinkVisible(): Promise<boolean> {
    return await this.backToProductsLink.isVisible();
  }
}
