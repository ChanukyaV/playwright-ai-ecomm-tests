import { APIRequestContext, Page, expect } from '@playwright/test';

/*
 * The "Sample UI" from the cheat-sheet image: a Login form + a Products list.
 * ShopLab has no login page, and no <label>, alt text or title attributes to practise on,
 * so these examples render this small page with page.setContent() - no network needed.
 * The same locator ideas are also shown against the real ShopLab app in the other examples.
 */
const SAMPLE_UI = `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Sample UI</title></head>
<body>
  <section id="login">
    <h2>Login</h2>
    <form onsubmit="event.preventDefault(); document.getElementById('login-status').textContent = 'Welcome back!'">
      <label for="email">Email</label>
      <input id="email" type="email" placeholder="Enter your email">

      <label for="password">Password</label>
      <input id="password" type="password" placeholder="Enter your password">

      <label><input type="checkbox"> Remember me</label>

      <button type="submit">Login</button>
      <p id="login-status" role="status"></p>
    </form>
  </section>

  <section id="products-section">
    <h2>Products</h2>
    <button id="refresh" type="button">Refresh products</button>
    <div id="products"></div>
    <p id="cart-status" role="status"></p>
  </section>

  <section id="payment">
    <h2>Payment</h2>
    <!-- Disabled for 1 second: shows Playwright auto-waiting for "enabled" -->
    <button id="pay" type="button" disabled>Pay now</button>
    <p id="pay-status" role="status"></p>
  </section>

  <script>
    const items = [
      { name: 'iPhone 16', price: '$999', alt: 'iPhone 16 front view', id: 'iphone' },
      { name: 'Headphones', price: '$199', alt: 'Wireless headphones', id: 'headphones' },
    ];

    function renderProducts() {
      document.getElementById('products').innerHTML = items.map((p) => \`
        <article class="product-card" data-testid="product-card" id="\${p.id}">
          <img alt="\${p.alt}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">
          <h3>\${p.name}</h3>
          <p class="price">\${p.price}</p>
          <button type="button" title="Shipping info for \${p.name}" class="info">i</button>
          <button type="button" class="add">Add to Cart</button>
        </article>\`).join('');
      document.querySelectorAll('.add').forEach((btn) => btn.addEventListener('click', () => {
        const name = btn.closest('.product-card').querySelector('h3').textContent;
        document.getElementById('cart-status').textContent = name + ' added to cart';
      }));
    }

    renderProducts();
    document.getElementById('refresh').addEventListener('click', renderProducts);

    setTimeout(() => { document.getElementById('pay').disabled = false; }, 1000);
    document.getElementById('pay').addEventListener('click', () => {
      document.getElementById('pay-status').textContent = 'Payment complete';
    });
  </script>
</body>
</html>`;

export async function loadSampleUi(page: Page) {
  await page.setContent(SAMPLE_UI);
}

// ShopLab helper: every ShopLab example starts from an empty cart.
export async function resetCart(request: APIRequestContext) {
  const res = await request.delete('/api/cart');
  expect(res.status()).toBe(200);
}
