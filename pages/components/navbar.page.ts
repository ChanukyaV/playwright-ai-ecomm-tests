import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class Navbar extends BasePage {
  readonly shopLabLogo: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly chatLink: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.shopLabLogo = page.locator('nav').locator('a').filter({ hasText: 'ShopLab' }).first();
    this.productsLink = page.locator('nav').locator('a:has-text("Products")');
    this.cartLink = page.locator('nav').locator('a:has-text("Cart")');
    this.chatLink = page.locator('nav').locator('a:has-text("AI Chat")');
  }

  async clickShopLabLogo(): Promise<void> {
    await this.shopLabLogo.click();
    await this.page.waitForNavigation();
  }

  async clickProductsLink(): Promise<void> {
    await this.productsLink.click();
    await this.page.waitForNavigation();
  }

  async clickCartLink(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForNavigation();
  }

  async clickChatLink(): Promise<void> {
    await this.chatLink.click();
    await this.page.waitForNavigation();
  }

  async isProductsLinkActive(): Promise<boolean> {
    const productsNav = this.page.locator('nav').locator('a:has-text("Products")');
    return await productsNav.evaluate((el) => {
      return el.classList.contains('active') || el.getAttribute('href') === '/products';
    });
  }

  async isCartLinkActive(): Promise<boolean> {
    const cartNav = this.page.locator('nav').locator('a:has-text("Cart")');
    return await cartNav.evaluate((el) => {
      return el.classList.contains('active') || el.getAttribute('href') === '/cart';
    });
  }

  async isChatLinkActive(): Promise<boolean> {
    const chatNav = this.page.locator('nav').locator('a:has-text("AI Chat")');
    return await chatNav.evaluate((el) => {
      return el.classList.contains('active') || el.getAttribute('href') === '/chat';
    });
  }
}
