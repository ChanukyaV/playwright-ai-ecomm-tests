import { Page } from '@playwright/test';
import { SearchResultsPage } from './search-results.page';

export class HomePage {
  constructor(private readonly page: Page) {}

  readonly elements = {
    searchInput: () => this.page.locator('#twotabsearchtextbox'),
    searchButton: () => this.page.locator('#nav-search-submit-button'),
  };

  async navigate(baseUrl: string): Promise<HomePage> {
    await this.page.goto(baseUrl);
    return this;
  }

  async search(product: string): Promise<SearchResultsPage> {
    await this.elements.searchInput().fill(product);
    await this.elements.searchButton().click();

    return new SearchResultsPage(this.page);
  }
}
