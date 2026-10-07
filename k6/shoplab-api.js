import http from 'k6/http';
import { check, group, sleep } from 'k6';

// Base URL: BASE_URL env wins, otherwise config.json (ENV selects the environment, default activeEnvironment).
const config = JSON.parse(open('../config.json'));
const envName = __ENV.ENV || config.activeEnvironment;
const BASE_URL = (__ENV.BASE_URL || config.environments[envName].baseUrl).replace(/\/+$/, '');

const SCENARIO = __ENV.SCENARIO || 'smoke';
const PRODUCT_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const expect404 = http.expectedStatuses({ min: 200, max: 299 }, 404);

const SCENARIOS = {
  // Sanity check that every endpoint responds correctly with minimal load.
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },
  // Expected peak traffic: ramp up, hold, ramp down.
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 20 },
      { duration: '3m', target: 20 },
      { duration: '1m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  // Beyond expected capacity to find the breaking point.
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 20 },
      { duration: '2m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 150 },
      { duration: '1m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
};

const THRESHOLDS = {
  smoke: { p95: 800, p99: 1500, failRate: 0.01 },
  load: { p95: 800, p99: 1500, failRate: 0.01 },
  stress: { p95: 2000, p99: 4000, failRate: 0.05 },
};

if (!SCENARIOS[SCENARIO]) {
  throw new Error(`Unknown SCENARIO "${SCENARIO}". Use one of: ${Object.keys(SCENARIOS).join(', ')}`);
}

const limits = THRESHOLDS[SCENARIO];

export const options = {
  scenarios: { [SCENARIO]: SCENARIOS[SCENARIO] },
  thresholds: {
    http_req_failed: [`rate<${limits.failRate}`],
    http_req_duration: [`p(95)<${limits.p95}`, `p(99)<${limits.p99}`],
    checks: ['rate>0.99'],
    'http_req_duration{name:GET /api/products}': [`p(95)<${limits.p95}`],
    'http_req_duration{name:GET /api/products/:id}': [`p(95)<${limits.p95}`],
    'http_req_duration{name:GET /api/cart}': [`p(95)<${limits.p95}`],
    'http_req_duration{name:POST /api/cart}': [`p(95)<${limits.p95}`],
    'http_req_duration{name:PATCH /api/cart/:id}': [`p(95)<${limits.p95}`],
    'http_req_duration{name:DELETE /api/cart/:id}': [`p(95)<${limits.p95}`],
  },
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function think(min, max) {
  if (SCENARIO !== 'smoke') sleep(min + Math.random() * (max - min));
}

function api(method, path, name, body, params = {}) {
  const url = `${BASE_URL}${path}`;
  const options = { ...params, tags: { name: `${method} ${name}` }, headers: JSON_HEADERS };
  return http.request(method, url, body === undefined ? null : JSON.stringify(body), options);
}

export default function () {
  // The cart is a single server-side store shared by all users, so cart checks tolerate concurrent changes.
  const productId = pick(PRODUCT_IDS);

  group('browse catalog', () => {
    const list = api('GET', '/api/products', '/api/products');
    check(list, {
      'products: status 200': (r) => r.status === 200,
      'products: 8 items': (r) => r.json().length === 8,
      'products: item has id and price': (r) => {
        const first = r.json()[0];
        return typeof first.id === 'string' && typeof first.price === 'number';
      },
    });
    think(1, 3);

    const detail = api('GET', `/api/products/${productId}`, '/api/products/:id');
    check(detail, {
      'product: status 200': (r) => r.status === 200,
      'product: matching id': (r) => r.json().id === productId,
    });

    const missing = api('GET', '/api/products/does-not-exist', '/api/products/:id', undefined, {
      responseCallback: expect404,
    });
    check(missing, {
      'missing product: status 404': (r) => r.status === 404,
      'missing product: error message': (r) => r.json().error === 'Product not found',
    });
    think(1, 3);
  });

  group('cart flow', () => {
    const add = api('POST', '/api/cart', '/api/cart', { productId, quantity: 2 });
    check(add, {
      'add to cart: status 201': (r) => r.status === 201,
      'add to cart: matching product': (r) => r.json().product.id === productId,
    });

    const invalidAdd = api('POST', '/api/cart', '/api/cart', { productId: 'bad-id', quantity: 1 }, {
      responseCallback: expect404,
    });
    check(invalidAdd, { 'add invalid product: status 404': (r) => r.status === 404 });
    think(1, 2);

    const cart = api('GET', '/api/cart', '/api/cart');
    check(cart, {
      'get cart: status 200': (r) => r.status === 200,
      'get cart: has items array and total': (r) =>
        Array.isArray(r.json().items) && typeof r.json().total === 'number',
    });
    think(1, 2);

    // Another VU may have cleared or removed the item, so 404 is tolerated here.
    const update = api('PATCH', `/api/cart/${productId}`, '/api/cart/:id', { quantity: 1 }, {
      responseCallback: expect404,
    });
    check(update, { 'update cart item: status 200 or 404': (r) => r.status === 200 || r.status === 404 });
    think(1, 2);

    const remove = api('DELETE', `/api/cart/${productId}`, '/api/cart/:id', undefined, {
      responseCallback: expect404,
    });
    check(remove, { 'remove cart item: status 200 or 404': (r) => r.status === 200 || r.status === 404 });
  });

  think(1, 3);
}

// Empties the shared cart after the run so test data does not linger.
export function teardown() {
  const res = http.del(`${BASE_URL}/api/cart`, null, { tags: { name: 'DELETE /api/cart' } });
  check(res, { 'teardown: cart cleared': (r) => r.status === 200 });
}
