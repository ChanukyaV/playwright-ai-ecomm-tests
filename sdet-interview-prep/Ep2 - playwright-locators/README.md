# SDET Interview Prep – Playwright Locators (Ep 2)

Based on the cheat-sheet "Playwright Locators – Interview Highlights & Examples".
Each concept has a small runnable example. Most run twice: against a **sample UI** (the Login + Products
page from the cheat-sheet, rendered offline by [support/sample-ui.ts](support/sample-ui.ts)) and against the
real **ShopLab** app in this repo (ShopLab has no login form or `<label>`/`alt`/`title` markup to practise on).

> **Key takeaway:** prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`, …) for stable, readable,
> maintainable tests; use `locator()` with CSS/XPath only when needed.

## Locator strategies – [01-locator-strategies](01-locator-strategies)

| Locator | Finds by | Example | File |
|---|---|---|---|
| `getByRole()` | ARIA role + accessible name | `getByRole('button', { name: 'Login' })` | [01](01-locator-strategies/01-get-by-role.spec.ts) |
| `getByText()` | Visible text (substring unless `exact: true`) | `getByText('iPhone', { exact: false })` | [02](01-locator-strategies/02-get-by-text.spec.ts) |
| `getByLabel()` | `<label>` of a form control | `getByLabel('Email')` | [03](01-locator-strategies/03-get-by-label-and-placeholder.spec.ts) |
| `getByPlaceholder()` | Placeholder text | `getByPlaceholder('Enter your password')` | [03](01-locator-strategies/03-get-by-label-and-placeholder.spec.ts) |
| `getByAltText()` | `alt` attribute (images) | `getByAltText('Wireless headphones')` | [04](01-locator-strategies/04-get-by-alt-text-and-title.spec.ts) |
| `getByTitle()` | `title` attribute | `getByTitle('Shipping info for iPhone 16')` | [04](01-locator-strategies/04-get-by-alt-text-and-title.spec.ts) |
| `getByTestId()` | `data-testid` | `getByTestId('product-card')` | [05](01-locator-strategies/05-get-by-test-id-and-locator.spec.ts) |
| `locator()` | CSS, XPath, `text=` … | `locator('[data-product-id="p5"]')` | [05](01-locator-strategies/05-get-by-test-id-and-locator.spec.ts) |

Preference order: `getByRole` > `getByLabel` > `getByText` > `getByPlaceholder` > `getByAltText`/`getByTitle` > `getByTestId` > `locator()`.

## Key concepts – [02-key-concepts](02-key-concepts)

| Concept | What it means | File |
|---|---|---|
| `first()`, `last()`, `nth(i)` | Pick one of several matches (`nth` is zero-based) | [01](02-key-concepts/01-first-last-nth.spec.ts) |
| `filter()` | Narrow down with `hasText` / `hasNotText` / `has` / `hasNot` | [02](02-key-concepts/02-filter-has-hastext.spec.ts) |
| Chaining | Search inside a parent (`product → button`) | [03](02-key-concepts/03-chaining.spec.ts) |
| Strict mode | An action on a locator matching 2+ elements throws | [04](02-key-concepts/04-strict-mode.spec.ts) |
| Auto-waiting | Waits for attached, visible, stable, enabled, receives events | [05](02-key-concepts/05-auto-waiting.spec.ts) |
| Locator vs ElementHandle | Locator re-resolves; a handle goes stale | [06](02-key-concepts/06-locator-vs-elementhandle.spec.ts) |

## Run

From the repo root:

```powershell
npx playwright test -c "sdet-interview-prep/Ep2 - playwright-locators"                          # everything
npx playwright test -c "sdet-interview-prep/Ep2 - playwright-locators" 02-key-concepts          # one folder
npx playwright test -c "sdet-interview-prep/Ep2 - playwright-locators" 04-strict-mode --headed  # one file, watch it
```

Target app: `activeEnvironment` in [../../config.json](../../config.json); override with `TEST_ENV=integration` or `BASE_URL=http://localhost:3000`.
ShopLab has one global cart, so tests run one at a time and reset the cart before/after.

## Common interview questions – quick answers

1. **What are Playwright locators and their types?** A locator is a lazy, re-evaluated description of how to find an element. Types: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`, and the generic `locator()` (CSS/XPath).
2. **`getByRole()` vs `getByText()`?** `getByRole` = role + accessible name ("a *button* called Login") and doubles as an accessibility check. `getByText` = any element showing that text (heading, button, paragraph…), so it is broader and more likely to be ambiguous. → [01](01-locator-strategies/01-get-by-role.spec.ts), [02](01-locator-strategies/02-get-by-text.spec.ts)
3. **How do you handle multiple matching elements?** Make the locator more specific (parent chaining, `filter()`, `exact: true`); only if order is truly what matters use `first()` / `nth()` / `last()`. → [01](02-key-concepts/01-first-last-nth.spec.ts)
4. **What is a strict mode violation?** Playwright throws when an *action* locator resolves to more than one element, so a test never clicks the wrong one silently. → [04](02-key-concepts/04-strict-mode.spec.ts)
5. **How do you use `filter()`, `has` and `hasText`?** `hasText` keeps elements containing text; `has` keeps elements containing a child matching another locator. → [02](02-key-concepts/02-filter-has-hastext.spec.ts)
6. **How does auto-waiting work?** Before each action Playwright retries actionability checks (attached, visible, stable, enabled, receives events) until the timeout; web-first assertions retry too. No `sleep()`. → [05](02-key-concepts/05-auto-waiting.spec.ts)
7. **Locator vs ElementHandle?** A Locator re-resolves the element on every use; an ElementHandle points to one DOM node and becomes stale if the page re-renders. Use Locators. → [06](02-key-concepts/06-locator-vs-elementhandle.spec.ts)
