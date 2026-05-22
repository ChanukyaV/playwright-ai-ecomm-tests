import { Page } from '@playwright/test';
import { CartPage } from './cart.page';

export class ProductPage {
  constructor(private readonly page: Page) {}

  readonly elements = {
    productTitle: () => this.page.locator('span#productTitle'),
    priceBlock: () => this.page.locator('#corePriceDisplay_desktop_feature_div'),
    buyNowButton: () => this.page.locator('#buy-now-button'),
    addToCartButton: () => this.page.locator('#add-to-cart-button'),
  };

  async addToCart(): Promise<CartPage> {
    await this.elements.addToCartButton().waitFor({ state: 'visible' });
    await this.elements.addToCartButton().click();

    return new CartPage(this.page);
  }
}
