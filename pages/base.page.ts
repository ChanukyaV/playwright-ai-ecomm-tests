import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page, baseUrl: string = 'https://shoplab-platform-399284160033.us-east1.run.app') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async waitForNavigation(navigationFn: () => Promise<void>): Promise<void> {
    await Promise.all([this.page.waitForNavigation(), navigationFn()]);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }
}
