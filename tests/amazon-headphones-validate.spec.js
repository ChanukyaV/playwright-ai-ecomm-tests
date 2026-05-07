import { test, expect } from '@playwright/test';

test('Search for headphones on Amazon.in and validate product page details', async ({ page }) => {
  // 1. Open Amazon.in
  await page.goto('https://www.amazon.in');

  // 2. Search for headphones
  await page.fill('#twotabsearchtextbox', 'headphones');
  await page.click('#nav-search-submit-button');

  // 3. Wait for search results to load
  await page.waitForSelector('[data-component-type="s-search-result"]');

  // 4. Open the first product from search results
  // Get the href and navigate directly to avoid new-tab handling issues
  const firstProductLink = page
    .locator('[data-component-type="s-search-result"] h2 a')
    .first();
  const productHref = await firstProductLink.getAttribute('href');
  await page.goto(`https://www.amazon.in${productHref}`);

  // 5. Validate product title is visible
  // span#productTitle is the main product title heading on every Amazon product page
  const productTitle = page.locator('span#productTitle');
  await expect(productTitle).toBeVisible();
  await expect(productTitle).not.toBeEmpty();

  // 6. Validate product price is displayed
  // #corePriceDisplay_desktop_feature_div holds the primary price block on the product page
  const priceBlock = page.locator('#corePriceDisplay_desktop_feature_div');
  await expect(priceBlock).toBeVisible();

  // 7. Validate Buy Now button is present
  // #buy-now-button is Amazon's standard Buy Now CTA on product pages
  const buyNowButton = page.locator('#buy-now-button');
  await expect(buyNowButton).toBeVisible();
  await expect(buyNowButton).toBeEnabled();
});
