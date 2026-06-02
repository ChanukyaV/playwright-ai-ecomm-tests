import { Page } from '@playwright/test';

export class WishlistPage {
  constructor(readonly currentPage: Page) {}

  readonly elements = {
    wishlistConfirmation: () => this.currentPage.locator('#huc-v2-whats-next-continue-button, [data-action="a-alert"], .a-alert-success'),
    wishlistTitle: () => this.currentPage.locator('span#wl-list-info'),
  };
}
