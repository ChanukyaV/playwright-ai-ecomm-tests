# SDET Interview Prep – testing types explained with ShopLab

Every type of testing from "Types of Software Testing – SDET Interview Preparation, Session 1",
shown with a small, runnable example against the ShopLab e-commerce app in this repo
(`platform/` = the app, `pages/` = page objects reused here).

The folders are numbered as a **sequence of enhancements**: each step widens the scope of what is
tested. Start at 01 and read down – each file has a comment at the top explaining *what* the testing
type is and *when to use it*.

## The sequence

| # | Folder | Type | Scope added in this step | Use it when |
|---|---|---|---|---|
| 01 | [01-unit](01-unit/cart-store.unit.spec.ts) | **Unit** | One function (`cart-store.ts`), no browser/network | Every code change – fastest feedback |
| 02 | [02-integration](02-integration/cart-integration.spec.ts) | **Integration** | Real catalogue + cart-store; API + UI agree | Parts are built separately and must fit |
| 03 | [03-api](03-api/shoplab-api.spec.ts) | **Interface / API** | HTTP only: status → contract → negative → chained calls | Backend rules, faster/stabler than UI |
| 04 | [04-system](04-system/shoplab-system.spec.ts) | **System** | Whole app through the browser, feature by feature | Before release, in a test environment |
| 05 | [05-e2e](05-e2e/purchase-journey.e2e.spec.ts) | **End-to-End** | One complete user journey, no shortcuts | Critical business flows (few, slow) |
| 06 | [06-acceptance](06-acceptance/cart.acceptance.spec.ts) | **Acceptance (UAT)** | Business criteria in Given/When/Then | Sign-off by product owner / customer |
| 07 | [07-smoke-sanity-regression](07-smoke-sanity-regression) | **Smoke / Sanity / Regression** | Same tests, selected by tag | Smoke: every deploy · Sanity: after a fix · Regression: every change |
| 08 | [08-performance](08-performance) | **Performance** (load, stress, spike, volume, scalability) | Speed & capacity (+ k6 spike script) | Before big traffic (sales, launches) |
| 09 | [09-security](09-security/security.spec.ts) | **Security** | Attacker's view: bad input, leaks | Always – especially for APIs |
| 10 | [10-usability-accessibility](10-usability-accessibility/usability-accessibility.spec.ts) | **Usability & Accessibility** | Keyboard, screen-reader names, feedback | UI changes; legal/inclusion requirements |
| 11 | [11-reliability-recovery](11-reliability-recovery/reliability.spec.ts) | **Reliability & Recovery** | Simulated 500s, network loss, slow network | Payments, anything that must not lose data |
| 12 | [12-compatibility](12-compatibility/cross-browser.spec.ts) | **Compatibility** | Same tests on Chrome / Firefox / Safari / mobile | Public-facing sites |
| 13 | [13-installation-portability](13-installation-portability/portability.spec.ts) | **Installation & Portability** | Docker recipe, no hard-coded hosts, any environment | New environments, containers, cloud moves |
| 14 | [14-localization](14-localization/localization.spec.ts) | **Localization** | de-DE / hi-IN locales, currency, unicode input | Selling in more than one country |

## Smoke vs Sanity vs Regression (same suite, different tags)

```powershell
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @smoke        # 3 fast checks after a deploy
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @sanity       # one fixed area, deep
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --grep @regression   # everything that must keep working
```

## Run

From the repo root (`playwright-ai-ecomm-tests`):

```powershell
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --project=chromium     # folders 01-11, 13, 14
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" 03-api                 # one folder
npx playwright test -c "sdet-interview-prep/Ep1 - types-of-testing" --project=compat-chrome --project=compat-mobile   # folder 12
npx playwright install firefox webkit                             # one-off, needed for compat-firefox / compat-webkit
k6 run -e PEAK=5 "sdet-interview-prep/Ep1 - types-of-testing/08-performance/shoplab-spike.js"   # k6 spike (use PEAK=100 for a real one)
```

- Target app: `activeEnvironment` in [../../config.json](../../config.json). Override with `TEST_ENV=integration` or `BASE_URL=http://localhost:3000`.
- ShopLab has a single global cart on the server, so tests run **one at a time** and reset the cart before/after.

## Known defects documented by the tests

Tests using `test.fail(true, reason)` describe the *correct* behaviour that ShopLab does not have yet.
They show as expected failures now, and break (as a prompt to remove the marker) once the defect is fixed.

| Test | Defect found |
|---|---|
| 09-security | Negative quantity accepted (cart total goes negative) |
| 09-security | Non-numeric quantity accepted |
| 09-security | Malformed JSON returns 500 instead of 400 |
| 09-security | Quantity above stock accepted |
| 09-security | `X-Powered-By: Next.js` header leaks the stack |
| 14-localization | No localization: price is always `$` |

Note: the volume test in `08-performance` adds quantity 1,000,000, which relies on the missing stock limit above.

## Interview one-liners

- **Smoke vs Sanity:** smoke = broad & shallow on a new build; sanity = narrow & deep after a fix.
- **Retest vs Regression:** retest re-checks the fixed defect; regression checks nothing else broke.
- **Integration vs E2E:** integration = a few connected parts; E2E = the whole user journey.
- **System vs Acceptance:** system asks "did we build it right?"; acceptance asks "did we build the right thing?".
- **Load vs Stress vs Spike:** expected traffic vs beyond the limit vs a sudden burst.
- **Test pyramid:** many unit → fewer API/integration → few E2E.
