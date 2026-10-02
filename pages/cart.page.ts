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
    this.heading = page.getByTestId('cart-title');
    this.emptyCartMessage = page.getByTestId('empty-cart');
    this.continueShoppingLink = page.getByTestId('continue-shopping');
    this.cartItems = page.getByTestId('cart-items').getByTestId('cart-item');
    this.checkoutButton = page.getByTestId('checkout-btn');
    this.clearCartButton = page.getByTestId('clear-cart-btn');
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
      return await this.cartItems.count();
    } catch {
      return 0;
    }
  }

  async getCartItemByIndex(index: number): Promise<CartItem> {
    const itemElement = this.cartItems.nth(index);
    return new CartItem(this.page, itemElement, this.baseUrl);
  }

  async getCartTotal(): Promise<string> {
    try {
      const totalText = await this.page.getByTestId('cart-total').textContent();
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
    this.productName = itemElement.getByTestId('cart-item-name');
    this.price = itemElement.getByTestId('cart-item-price');
    this.quantity = itemElement.getByTestId('item-quantity');
    this.subtotal = itemElement.getByTestId('cart-item-subtotal');
    this.increaseButton = itemElement.getByTestId('quantity-increase');
    this.decreaseButton = itemElement.getByTestId('quantity-decrease');
    this.removeButton = itemElement.getByTestId('remove-item-btn');
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
