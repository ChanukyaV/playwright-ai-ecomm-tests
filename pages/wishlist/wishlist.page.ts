import { Page } from '@playwright/test';

export class WishlistPage {
  constructor(private readonly page: Page) {}

  readonly elements = {
    pageRoot: () => this.page.locator('body'),
    wishlistItems: () => this.page.locator('[data-component-type="s-search-result"]'),
  };

  get currentPage(): Page {
    return this.page;
  }
}
