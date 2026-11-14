import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('ShopLab UI - Pagination And Category Filter', () => {
  test('UI-22: Products Are Paginated 12 Per Page', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products
    await homePage.navigate();

    // Verify 12 product cards, the summary and the pagination state
    await expect(homePage.productNames).toHaveCount(12);
    await expect(homePage.paginationSummary).toHaveText('Showing 1–12 of 100 products');
    await expect(homePage.pageButton(1)).toHaveAttribute('aria-current', 'page');
    await expect(homePage.previousButton).toBeDisabled();
  });

  test('UI-23: Navigate Between Pages With Next And Previous', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products
    await homePage.navigate();
    const firstNameOnPage1 = await homePage.productNames.first().textContent();

    // Click Next
    await homePage.clickNextPage();

    // Verify page 2 is shown with different products
    await expect(homePage.pageButton(2)).toHaveAttribute('aria-current', 'page');
    await expect(homePage.paginationSummary).toHaveText('Showing 13–24 of 100 products');
    await expect(homePage.productNames.first()).not.toHaveText(firstNameOnPage1 ?? '');

    // Click Previous
    await homePage.clickPreviousPage();

    // Verify page 1 is shown again
    await expect(homePage.pageButton(1)).toHaveAttribute('aria-current', 'page');
    await expect(homePage.productNames.first()).toHaveText(firstNameOnPage1 ?? '');
  });

  test('UI-24: Last Page Shows The Remaining Products', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products
    await homePage.navigate();

    // Click page 9 in the pagination bar
    await homePage.clickPage(9);

    // Verify only the remaining 4 products are shown and Next is disabled
    await expect(homePage.productNames).toHaveCount(4);
    await expect(homePage.paginationSummary).toHaveText('Showing 97–100 of 100 products');
    await expect(homePage.nextButton).toBeDisabled();
  });

  test('UI-25: Filter Products By Category', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products
    await homePage.navigate();

    // Click the Audio category chip
    await homePage.clickCategory('Audio');

    // Verify only Audio products are listed
    await expect(homePage.categoryChip('Audio')).toHaveAttribute('aria-pressed', 'true');
    await expect(homePage.paginationSummary).toHaveText('Showing 1–12 of 14 products');
    await expect(page.getByTestId('product-grid').getByTestId('product-category')).toHaveText(
      Array(12).fill('Audio'),
    );
  });

  test('UI-26: Changing Filter Resets To Page 1', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products and go to page 3
    await homePage.navigate();
    await homePage.clickNextPage();
    await homePage.clickNextPage();
    await expect(homePage.pageButton(3)).toHaveAttribute('aria-current', 'page');

    // Click the Gaming category chip
    await homePage.clickCategory('Gaming');

    // Verify page 1 of the Gaming results is shown
    await expect(homePage.paginationSummary).toHaveText('Showing 1–12 of 14 products');
    await expect(homePage.pageButton(1)).toHaveAttribute('aria-current', 'page');
  });

  test('UI-27: Page Size Selector Changes Products Per Page', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products
    await homePage.navigate();

    // Select 24 in the Per page dropdown
    await homePage.selectPageSize(24);

    // Verify 24 cards and 5 pages
    await expect(homePage.productNames).toHaveCount(24);
    await expect(homePage.paginationSummary).toHaveText('Showing 1–24 of 100 products');
    await expect(homePage.pageButton(5)).toBeVisible();
    await expect(homePage.pageButton(6)).toHaveCount(0);
  });

  test('UI-28: Pagination State Is Kept In The URL', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open /products?category=Computing&page=2
    await homePage.navigateWithQuery('category=Computing&page=2');

    // Verify Computing is selected and page 2 shows the remaining 6 products
    await expect(homePage.categoryChip('Computing')).toHaveAttribute('aria-pressed', 'true');
    await expect(homePage.pageButton(2)).toHaveAttribute('aria-current', 'page');
    await expect(homePage.paginationSummary).toHaveText('Showing 13–18 of 18 products');
  });
});
