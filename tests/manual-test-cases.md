# ShopLab Manual Test Cases

## Test Scope
- Base URL: https://shoplab-platform-399284160033.us-east1.run.app/
- Active environment from config: dev
- Coverage: UI routes and public API routes under /api
- Execution mode: Manual testing (browser + API client)

## Preconditions
- Browser is available (Chrome/Edge/Firefox).
- Network access to the base URL is available.
- For API checks, use Postman/curl or browser REST client.
- For AI chat success-path tests, Ollama service must be reachable by the deployed app.

## UI Manual Test Cases

### UI-01: Root URL Redirects To Products
- Steps:
1. Open the base URL in a browser.
- Expected Results:
1. URL redirects to /products.
1. Page title area shows All Products.
1. Product count text shows 8 products available.

### UI-02: Navbar Navigation Across All Pages
- Steps:
1. Open /products.
1. Click Cart in navbar.
1. Click AI Chat in navbar.
1. Click ShopLab logo.
- Expected Results:
1. Cart click navigates to /cart.
1. AI Chat click navigates to /chat.
1. ShopLab logo navigates back to /products.
1. Active navbar link is visually highlighted for the current page.

### UI-03: Products Page Loads Product Grid
- Steps:
1. Open /products.
- Expected Results:
1. Product grid is visible.
1. Exactly 8 product cards are displayed.
1. Each card shows category, name, price, rating, Add to Cart, and Details actions.

### UI-04: Product Search With Matching Keyword
- Steps:
1. Open /products.
1. In search box, type keyboard.
- Expected Results:
1. Result count text appears with 1 result for keyboard.
1. Only Mechanical Keyboard card remains visible.

### UI-05: Product Search With No Match
- Steps:
1. Open /products.
1. In search box, type a string that does not exist, such as xyz123nomatch.
- Expected Results:
1. No products found message is shown.
1. Product cards are not displayed.

### UI-06: Product Detail Page From Products List
- Steps:
1. Open /products.
1. Click Details on Mechanical Keyboard or open /products/p2.
- Expected Results:
1. Product detail page loads.
1. Page shows product name, category, description, price, rating, and stock text.
1. Back to Products link is visible.

### UI-07: Back To Products Navigation
- Steps:
1. Open /products/p2.
1. Click Back to Products.
- Expected Results:
1. Browser navigates to /products.
1. Products page content is visible.

### UI-08: Add To Cart From Product Detail
- Steps:
1. Open /products/p2.
1. Click Add to Cart.
- Expected Results:
1. Button text changes to Added to Cart confirmation state.
1. Go to Cart link appears.

### UI-09: Add To Cart From Product Card
- Steps:
1. Open /products.
1. Click Add to Cart on any product card, for example p1.
- Expected Results:
1. Button transitions to Go to Cart state after successful add.
1. No error message is shown.

### UI-10: Cart Shows Added Item And Correct Totals
- Steps:
1. Add Mechanical Keyboard (price 129.99) from /products/p2.
1. Open /cart.
- Expected Results:
1. Cart contains Mechanical Keyboard with quantity 1.
1. Item subtotal is 129.99.
1. Order total is 129.99.

### UI-11: Increase Quantity Updates Subtotal And Total
- Steps:
1. Ensure cart has one item with quantity 1.
1. Click Increase quantity (+).
- Expected Results:
1. Quantity updates to 2.
1. Item subtotal doubles correctly.
1. Cart total updates accordingly (for p2: 259.98).

### UI-12: Decrease Quantity Updates Total
- Steps:
1. With quantity 2 in cart, click Decrease quantity (-).
- Expected Results:
1. Quantity updates to 1.
1. Subtotal and total return to single-item value.

### UI-13: Decrease To Zero Removes Item
- Steps:
1. Ensure cart has an item with quantity 1.
1. Click Decrease quantity (-).
- Expected Results:
1. Item is removed from cart.
1. Empty cart state is shown.

### UI-14: Remove Button Removes Specific Item
- Steps:
1. Add at least one item to cart.
1. Open /cart.
1. Click Remove on that item.
- Expected Results:
1. Removed item no longer appears in cart.
1. Total recalculates correctly.

### UI-15: Clear Cart Empties Entire Cart
- Steps:
1. Add two or more items to cart.
1. Open /cart.
1. Click Clear Cart.
- Expected Results:
1. Cart becomes empty.
1. Empty cart state and Continue Shopping link are shown.

### UI-16: Checkout Success State
- Steps:
1. Add at least one item to cart.
1. Open /cart.
1. Click Checkout.
- Expected Results:
1. Checkout button shows progress state briefly.
1. Success screen appears with Order Placed Successfully.
1. Continue Shopping button is shown and navigates to /products.

### UI-17: Empty Cart Continue Shopping Link
- Steps:
1. Ensure cart is empty.
1. Open /cart.
1. Click Continue Shopping.
- Expected Results:
1. User is routed to /products.

### UI-18: Chat Page Empty State
- Steps:
1. Open /chat.
- Expected Results:
1. AI Shopping Assistant heading is visible.
1. Empty helper message is displayed.
1. Send button is disabled when input is empty.

### UI-19: Chat Input And Enter-To-Send Behavior
- Steps:
1. Open /chat.
1. Type a message in the chat input.
1. Press Enter.
- Expected Results:
1. User message appears in the chat history.
1. Message is submitted without needing to click Send.

### UI-20: Chat Service Unavailable Error Handling
- Steps:
1. Open /chat.
1. Send a message while backend cannot reach Ollama.
- Expected Results:
1. Error banner appears.
1. Message indicates connection failure to Ollama or chat service.
1. UI remains usable for subsequent attempts.

### UI-21: Invalid Product Detail URL Returns 404 Page
- Steps:
1. Open /products/invalid.
- Expected Results:
1. 404 page appears with not found message.
1. Navbar is still visible for recovery navigation.

## API Manual Test Cases

### API-01: Get All Products
- Endpoint: GET /api/products
- Steps:
1. Send GET request to /api/products.
- Expected Results:
1. Status is 200.
1. Response is a JSON array.
1. Array length is 8.
1. Each item contains id, name, description, price, category, emoji, color, stock, rating.

### API-02: Get Product By Valid ID
- Endpoint: GET /api/products/p1
- Steps:
1. Send GET request to /api/products/p1.
- Expected Results:
1. Status is 200.
1. Response JSON has id equal to p1.

### API-03: Get Product By Invalid ID
- Endpoint: GET /api/products/does-not-exist
- Steps:
1. Send GET request to invalid product ID.
- Expected Results:
1. Status is 404.
1. Response contains error: Product not found.

### API-04: Clear Cart
- Endpoint: DELETE /api/cart
- Steps:
1. Send DELETE request to /api/cart.
- Expected Results:
1. Status is 200.
1. Response contains message: Cart cleared.

### API-05: Add Item To Cart (Valid)
- Endpoint: POST /api/cart
- Request Body:
1. { "productId": "p1", "quantity": 2 }
- Steps:
1. Send POST request with valid product.
- Expected Results:
1. Status is 201.
1. Response contains product p1 and quantity 2.

### API-06: Add Item To Cart (Invalid Product)
- Endpoint: POST /api/cart
- Request Body:
1. { "productId": "bad-id", "quantity": 1 }
- Steps:
1. Send POST request with invalid productId.
- Expected Results:
1. Status is 404.
1. Response contains error: Product not found.

### API-07: Get Cart After Add
- Endpoint: GET /api/cart
- Steps:
1. Add p1 with quantity 2 using API-05.
1. Send GET request to /api/cart.
- Expected Results:
1. Status is 200.
1. Response includes one cart item for p1 with quantity 2.
1. Total equals 159.98.

### API-08: Update Cart Item Quantity
- Endpoint: PATCH /api/cart/p1
- Request Body:
1. { "quantity": 1 }
- Steps:
1. Ensure p1 exists in cart.
1. Send PATCH request with quantity 1.
- Expected Results:
1. Status is 200.
1. Response contains p1 with quantity 1.

### API-09: Update Cart Item To Zero Removes Item
- Endpoint: PATCH /api/cart/p1
- Request Body:
1. { "quantity": 0 }
- Steps:
1. Ensure p1 exists in cart.
1. Send PATCH request with quantity 0.
- Expected Results:
1. Status is 200.
1. Response contains message: Item removed.
1. Subsequent GET /api/cart does not include p1.

### API-10: Update Missing Cart Item
- Endpoint: PATCH /api/cart/p1
- Request Body:
1. { "quantity": 2 }
- Steps:
1. Ensure p1 is not in cart.
1. Send PATCH request.
- Expected Results:
1. Status is 404.
1. Response contains error: Item not found in cart.

### API-11: Delete Existing Cart Item
- Endpoint: DELETE /api/cart/p1
- Steps:
1. Add p1 to cart.
1. Send DELETE request to /api/cart/p1.
- Expected Results:
1. Status is 200.
1. Response contains message: Item removed.

### API-12: Delete Missing Cart Item
- Endpoint: DELETE /api/cart/p1
- Steps:
1. Ensure p1 is not in cart.
1. Send DELETE request.
- Expected Results:
1. Status is 404.
1. Response contains error: Item not found in cart.

### API-13: Chat API Error Path (Ollama Unavailable)
- Endpoint: POST /api/chat
- Request Body:
1. { "message": "hello", "history": [] }
- Steps:
1. Send POST request when Ollama is unavailable.
- Expected Results:
1. Status is 503.
1. Response contains error beginning with Failed to connect to Ollama.

### API-14: Chat API Success Path (When Ollama Is Running)
- Endpoint: POST /api/chat
- Request Body:
1. { "message": "Recommend a keyboard", "history": [] }
- Steps:
1. Ensure app can access configured Ollama endpoint and model.
1. Send POST request.
- Expected Results:
1. Status is 200.
1. Response contains reply object with role assistant and non-empty content.

## Notes From Live Validation
- Live UI exploration covered: /, /products, /products/p2, /cart, /chat, and /products/invalid.
- Live API verification observed:
1. Products endpoints and cart endpoints behaved as expected.
1. Chat endpoint currently returned 503 in this environment because Ollama was not reachable.
