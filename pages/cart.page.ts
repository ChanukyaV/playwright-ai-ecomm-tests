import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Navbar } from './components/navbar.page';

export class CartPage extends BasePage {
  readonly navbar: Navbar;
  readonly heading: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingLink: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;

  constructor(page: Page, baseUrl?: string) {
    super(page, baseUrl);
    this.navbar = new Navbar(page, baseUrl);
    this.heading = page.locator('h1:has-text("Shopping Cart")');
    this.emptyCartMessage = page.locator('text=Your cart is empty');
    this.continueShoppingLink = page.locator('a:has-text("Continue Shopping")');
    this.cartItems = page.locator('main').locator('> div').filter({ has: page.locator('button') }).locator('> div').nth(0);
    this.checkoutButton = page.locator('button:has-text("Checkout")');
    this.clearCartButton = page.locator('button:has-text("Clear Cart")');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async isEmptyCartMessageDisplayed(): Promise<boolean> {
    try {
      return await this.emptyCartMessage.isVisible();
    } catch {
      return false;
    }
  }

  async getCartItemsCount(): Promise<number> {
    try {
      // Get all product rows in cart
      const items = this.page.locator('main').locator('div').filter({ hasText: /\$\d+\.\d+/ });
      return await items.count();
    } catch {
      return 0;
    }
  }

  async getCartItemByIndex(index: number): Promise<CartItem> {
    const itemElement = this.page
      .locator('main')
      .locator('> div')
      .filter({ has: this.page.locator('button') })
      .locator('> div')
      .nth(index);
    return new CartItem(this.page, itemElement, this.baseUrl);
  }

  async getCartTotal(): Promise<string> {
    try {
      const totalText = await this.page.locator('text=Total:').locator('+ div, + span').textContent();
      return totalText || '';
    } catch {
      return '';
    }
  }

  async clickContinueShopping(): Promise<void> {
    await this.continueShoppingLink.click();
    await this.page.waitForNavigation();
  }

  async clickCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForTimeout(500);
  }

  async clickClearCart(): Promise<void> {
    await this.clearCartButton.click();
    await this.page.waitForTimeout(300);
  }

  async isCheckoutButtonVisible(): Promise<boolean> {
    try {
      return await this.checkoutButton.isVisible();
    } catch {
      return false;
    }
  }

  async getCheckoutButtonText(): Promise<string> {
    try {
      return await this.checkoutButton.textContent() || '';
    } catch {
      return '';
    }
  }

  async isSuccessMessageDisplayed(): Promise<boolean> {
    try {
      return await this.page.locator('text=Order Placed Successfully').isVisible();
    } catch {
      return false;
    }
  }
}

export class CartItem {
  private page: Page;
  private itemElement: Locator;
  private baseUrl: string;

  readonly productName: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly subtotal: Locator;
  readonly increaseButton: Locator;
  readonly decreaseButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, itemElement: Locator, baseUrl: string) {
    this.page = page;
    this.itemElement = itemElement;
    this.baseUrl = baseUrl;
    this.productName = itemElement.locator('h3, a, div').first();
    this.price = itemElement.locator('div:has-text("$")').first();
    this.quantity = itemElement.locator('input[type="number"], div:has-text("Qty")');
    this.subtotal = itemElement.locator('div:has-text("Subtotal")').or(itemElement.locator('div').filter({ hasText: /\$\d+\.\d+/ }).last());
    this.increaseButton = itemElement.locator('button:has-text("+"), button[aria-label*="increase" i]');
    this.decreaseButton = itemElement.locator('button:has-text("-"), button[aria-label*="decrease" i]');
    this.removeButton = itemElement.locator('button:has-text("Remove")');
  }

  async getProductName(): Promise<string> {
    return await this.productName.textContent() || '';
  }

  async getPrice(): Promise<string> {
    const priceText = await this.price.textContent() || '';
    return priceText.trim();
  }

  async getQuantity(): Promise<string> {
    const qtyText = await this.quantity.textContent() || '';
    return qtyText.trim();
  }

  async getSubtotal(): Promise<string> {
    const subtotalText = await this.subtotal.textContent() || '';
    return subtotalText.trim();
  }

  async clickIncrease(): Promise<void> {
    await this.increaseButton.click();
    await this.page.waitForTimeout(200);
  }

  async clickDecrease(): Promise<void> {
    await this.decreaseButton.click();
    await this.page.waitForTimeout(200);
  }

  async clickRemove(): Promise<void> {
    await this.removeButton.click();
    await this.page.waitForTimeout(300);
  }

  async isIncreaseButtonVisible(): Promise<boolean> {
    return await this.increaseButton.isVisible();
  }

  async isDecreaseButtonVisible(): Promise<boolean> {
    return await this.decreaseButton.isVisible();
  }

  async isRemoveButtonVisible(): Promise<boolean> {
    return await this.removeButton.isVisible();
  }
}
