import { Page } from '@playwright/test';
import { ProductPage } from './product.page';

export class SearchResultsPage {
  constructor(private readonly page: Page) {}

  readonly elements = {
    searchResults: () => this.page.locator('[data-component-type="s-search-result"]'),
    firstProductLink: () => this.page.locator('[data-component-type="s-search-result"] h2 a').first(),
  };

  async waitForResults(): Promise<SearchResultsPage> {
    await this.elements.searchResults().first().waitFor();
    return this;
  }

  async openFirstProduct(baseUrl: string): Promise<ProductPage> {
    const productHref = await this.elements.firstProductLink().getAttribute('href');
    if (!productHref) {
      throw new Error('First product href is missing in search results.');
    }

    await this.page.goto(`${baseUrl}${productHref}`);
    return new ProductPage(this.page);
  }
}
