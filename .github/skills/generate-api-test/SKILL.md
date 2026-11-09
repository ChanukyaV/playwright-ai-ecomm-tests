---
name: generate-api-test
description: 'Generate a Playwright API test for the ShopLab REST API (or an external API such as restful-booker) that follows this repo''s framework standards (request fixture, API-NN test IDs, status + body assertions, state cleanup, typed clients). Asks the user for test steps first. Use when asked to generate, write, add, or automate an API / REST / endpoint test case.'
argument-hint: 'Optional: paste the endpoint, request, and expected response, or leave empty to be asked'
---

# Generate API Test

Turn the user's API test steps into a Playwright API test that matches this framework's standards exactly, so every team member gets the same structure and style.

All framework rules live in [standards.md](./standards.md). It is the single source of truth: read it fully before writing any code, and follow it over anything you infer from older specs in the repo.

## Workflow

### 1. Get the test steps (always first)

If the user did not already provide steps in the request, ask for them before doing anything else. Collect:

1. **Scenario title**: what is being verified.
2. **Endpoint**: HTTP method and path (for example `PATCH /api/cart/p1`).
3. **Request**: headers, body, query, and any setup calls needed first.
4. **Expected response**: status code and body (exact values or shape).
5. **Preconditions / cleanup**: required state, such as an item already in the cart (optional).

Ask one thing at a time, and only for what is missing. Do not invent expected status codes or bodies. If the user is unsure of the real behavior, read the route handler in `platform/src/app/api/**/route.ts` and confirm with the user. If the steps are ambiguous, ask. If the user gave several scenarios, generate one test per scenario.

### 2. Read the standards and the repo

1. Read [standards.md](./standards.md).
2. Read the existing API specs in `tests/api/` and the route handler for the endpoint in `platform/src/app/api/` (or `api/booker-client.ts` for restful-booker).
3. Find the next free test ID (see "Test IDs" in the standards).

### 3. Generate

1. Add the test to the matching spec in `tests/api/` (new file only for a new resource area), following the spec rules and template in the standards.
2. For an external API, add or extend a typed client in `api/` as described in the standards.
3. Add or update the manual test case in `tests/manual-test-cases.md` as described in the standards.
4. Keep changes minimal. Do not refactor unrelated files or fix pre-existing deviations.

### 4. Verify

1. Type-check the new or changed files with `npx tsc --noEmit --skipLibCheck --esModuleInterop --target ES2020 --moduleResolution node --resolveJsonModule <files>`.
2. Run only the new test: `npx playwright test <spec file> -g "<TEST-ID>"`.
3. If it fails, find out whether the test or the API is wrong. Never weaken an assertion or skip the test to make it pass. If the API behaves differently from what the user expected, stop and report the actual status and body.
4. Run it 3 times (`--repeat-each=3`) to confirm state cleanup works.

### 5. Report back

Give the user a short summary:

- Files created or changed (as links).
- The test ID and title.
- The standards checklist result (see the end of standards.md).
- Pass/fail evidence from the run.
- 2–4 suggested additional scenarios (negative, validation, edge) the user may want next. Do not generate them unless asked.
