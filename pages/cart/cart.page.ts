import { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  readonly elements = {
    pageRoot: () => this.page.locator('body'),
  };

  get currentPage(): Page {
    return this.page;
  }
}
